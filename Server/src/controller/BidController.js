var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


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

const getByOrderId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("order_id", id).andWhereNot("status", "canceled").select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by order Id, ${err}`);
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
  
  const { orderId, itemId , userId , salesDetailId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !salesDetailId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('sales_detail').where("id", salesDetailId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("sales detail id is invalid");
  else{
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "sales_detail_id": salesDetailId,
      "bid_amount": bidAmount,
      "status": "listed"
    };
    try{
      const id = await knex('bid').insert(data).returning('id');
      response.status(HttpStatusCodes.CREATED).send(`List item Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error List Item, ${err}`);
    }
  }
}


const placeBid = async (request, response) => {
  
  const { orderId, itemId , userId , salesDetailId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !salesDetailId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('sales_detail').where("id", salesDetailId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("sales detail id is invalid");
  else{
    if(result[0].type == "instant_buy")
      if(result[0]['start_price'] != bidAmount)
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid bid amount");
    else{
      if(!(result[0]['start_price'] <= bidAmount && result[0]['end_price'] >= bidAmount))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid bid amount");
      if(!(result[0]['start_time'] <= getCurrentTime() && result[0]['end_time'] >= getCurrentTime()))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invliad bid time");
    }
      
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "bid_amount": bidAmount,
      "sales_detail_id": salesDetailId,
      "status": "pending"
    };

    const highestBid = await knex('bid').where("item_id", itemId).select('*').orderBy('bid_amount', 'DESC').limit(1);
    if(highestBid.length > 0)
      if(bidAmount <= highestBid[0]['bid_amount'])
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Bid amount is less than highest bid`);
    try{
      const id = await knex('bid').insert(data).returning('id');
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
    await knex('bid').where('id', id).update({"status": "canceled"});
    response.status(HttpStatusCodes.CREATED).send(`Withdraw bid successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error withdraw bid, ${err}`);
  };
}


module.exports = {
  getById,
  getByOrderId,
  getByUserId,
  listItem,
  placeBid,
  withdrawBid
}