var express = require('express');
var HttpStatusCodes = require('http-status-codes');
var secrets= require('../../secrets.js')
var knex = require('knex')(secrets.database)
const BN = require('bn.js');


function getCurrentTime() {
  const d = new Date();
  const n = d.getTime();
  return n;
}
const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("id", id).andWhereNot("status", "canceled").select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by order Id, ${err}`);
  }
}

const getByMarketId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("market_id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by market Id, ${err}`);
  }
}

const getByUserId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("user_id", id).andWhereNot("status", "canceled").select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by user Id, ${err}`);
  }
}

const listItem = async (request, response) => {
  
  const { orderId, itemId , userId , marketId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !marketId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", marketId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("marketplace id invalid");
  else{
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "market_id": marketId,
      "bid_amount": bidAmount,
      "status": "listed"
    };
    try{
      const id = await knex('bid').insert(data).returning('id');
      await knex('activity').insert({
        'from': userId,
        'to': 0,
        'item_id': itemId,
        'market_id': marketId,
        'order_id': orderId,
        'bid_amount': bidAmount,
        'sales_token_contract': '0x',
        'status': 'listed'
      });
      response.status(HttpStatusCodes.CREATED).send(`List item Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error List Item, ${err}`);
    }
  }
}


const placeBid = async (request, response) => {
  
  const { orderId, itemId , userId , marketId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !marketId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", marketId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("marketplace id is invalid");
  else{
    if(result[0].sold)
      return response.status(HttpStatusCodes.BAD_REQUEST).send("item is already sold");
    else{
      const startPrice = new BN(result[0]['start_price']);
      const endPrice = new BN(result[0]['end_price']);
      const _bidAmount = new BN(bidAmount);
      if(!(startPrice.lte(_bidAmount) && endPrice.gte(_bidAmount)))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid bid amount");
      if(!(result[0]['start_time'] <= getCurrentTime() && result[0]['end_time'] >= getCurrentTime()))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invliad bid time");
    }
    
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "bid_amount": bidAmount,
      "market_id": marketId,
      "status": "pending"
    };

    const highestBid = await knex('bid').where("item_id", itemId).andWhereNot('status', 'pending').select('*').orderBy('bid_amount', 'DESC').limit(1);
    if(highestBid.length > 0)
    {
      const _highestBid = new BN(highestBid[0]['bid_amount']);
      const _bidAmount = new BN(bidAmount);
      if(_bidAmount.lte(_highestBid))
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Bid amount is less than highest bid`);
      // Withdraw previous bidder
      await knex('bid').where('id', highestBid[0]['id']).update({"status": "canceled"});
    }
    try{
      
      // Insert new bid
      const id = await knex('bid').insert(data).returning('id');
      await knex('activity').insert({
        'from': userId,
        'to': 0,
        'item_id': itemId,
        'market_id': marketId,
        'order_id': orderId,
        'bid_amount': bidAmount,
        'sales_token_contract': '0x',
        'status': 'bidded'
      });
      response.status(HttpStatusCodes.CREATED).send(`Bid Placed Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Place Bid, ${err}`);
    }
  }
}

const withdrawBid = async (request, response) => {
  
  const { id } = request.body
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  try{
    const data = await knex('bid').where('id', id).update({"status": "canceled"}).returning('*');
    console.log(data);
    
    await knex('activity').insert({
      'from': data[0]['user_id'],
      'to': 0,
      'item_id': data[0]['item_id'],
      'market_id': data[0]['market_id'],
      'order_id': data[0]['orderId'],
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'status': 'canceled'
    });
    response.status(HttpStatusCodes.CREATED).send(`Withdraw bid successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error withdraw bid, ${err}`);
  };
}

const acceptBid = async (request, response) => {
  
  const { id } = request.body
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  try{
    const data = await knex('bid').where('id', id).update({"status": "accepted"}).returning('*');
    await knex('marketplace').where('id', parseInt(data[0]['market_id'])).update({"sold": true});
    const buyer = await knex('bid').where('id', id).select("*");
    const seller = await knex('item').where('id', parseInt(buyer[0]['item_id'])).returning('*');
    await knex('item').where('id', buyer[0]['item_id']).update({'owner' : buyer[0]['user_id']});
    
    await knex('activity').insert({
      'from': seller[0]['owner'],
      'to': buyer[0]['user_id'],
      'item_id': data[0]['item_id'],
      'market_id': data[0]['market_id'],
      'order_id': data[0]['orderId'],
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'status': 'sold'
    });

    await knex('activity').insert({
      'from': buyer[0]['user_id'],
      'to': seller[0]['owner'],
      'item_id': data[0]['item_id'],
      'market_id': data[0]['market_id'],
      'order_id': data[0]['orderId'],
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'status': 'purchased'
    });

    return response.status(HttpStatusCodes.CREATED).send(`accept bid successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error accept bid, ${err}`);
  };
}

const buyNow = async (request, response) => {
  
  const { orderId, itemId , userId , marketId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !marketId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", marketId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("marketplace id is invalid");
  else{
    if(result[0].sold)
      return response.status(HttpStatusCodes.BAD_REQUEST).send("item is already sold");
    else{
      // console.log(result[0]['start_price'], result[0]['end_price'], bidAmount)
      const startPrice = new BN(result[0]['start_price']);
      const _bidAmount = new BN(bidAmount);
      if(!(startPrice.eq(_bidAmount)))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid bid amount");
    }
      
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "bid_amount": bidAmount,
      "market_id": marketId,
      "status": "accepted"
    };

    try{
      await knex('bid').insert(data);
      await knex('marketplace').where('id', parseInt(marketId)).update({"sold": true})
      response.status(HttpStatusCodes.CREATED).send(`Item successfully sold`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Buy now error, ${err}`);
    }
  }
}

module.exports = {
  getById,
  getByMarketId,
  getByUserId,
  listItem,
  placeBid,
  withdrawBid,
  acceptBid,
  buyNow
}