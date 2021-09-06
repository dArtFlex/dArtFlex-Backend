const { BN } = require('bn.js');
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
    const result = await knex('marketplace').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get marketplace by Id, ${err}`);
  }
}

const getByItemId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('marketplace').where("item_id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get marketplace by Id, ${err}`);
  }
}

const getAll = async (request, response) => {
  try{
    const result = await knex('marketplace').select("*")
    return response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get marketplace by Id, ${err}`);
  }
}

const checkMarket = async (request, response) => {
  try{
    const result = await knex('marketplace').select("*")
    console.log(result)
    result.map(async(market) => {
        const currentTime = getCurrentTime();
        if(currentTime >= market['end_time']) {
          const higgestBid = await knex('bid').where('market_id', market.id).andWhere('status','pending').select('*');
          if( higgestBid.length == 0 ){
            const creatorData = await knex('bid').where('market_id', market.id).andWhere('status','listed').select('*');
            await knex('bid').where('market_id', market.id).andWhere('status','listed').del();
            await knex('marketplace').where('id', market.id).del();
            await knex('activity').insert({
              'from': creatorData[0]['user_id'],
              'to': 0,
              'item_id': creatorData[0]['item_id'],
              'market_id': market.id,
              'order_id': creatorData[0]['order_id'],
              'bid_amount': creatorData[0]['bid_amount'],
              'bid_id': 0,
              'sales_token_contract': '0x',
              'status': 'unlisted'  
            }).returning('id');
          }
        }
    })
    return true;
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`checkMarket ${err}`);
  }
}

const create = async (request, response) => {
  const { type, itemId, startPrice ,endPrice , startTime, endTime, salesTokenContract, platfromFee} = request.body
  const currentMarket = await knex('marketplace').where('item_id', parseInt(itemId)).andWhere('sold', false).select("*");
  if (currentMarket.length > 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send(`Item is already in marketplace`);
    
  if(!(type == "auction" || type == "instant_buy")){
    return response.status(HttpStatusCodes.BAD_REQUEST).send(`invalid sales type`);
  }
  if(type == "auction")
  {
    if(endTime <= startTime){
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`expiratoin time is invalid`);
    }
    const _startPrice = new BN(startPrice);
    const _endPrice = new BN(endPrice);
    if(!(_endPrice.gt(_startPrice))){
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`price invalid`);
    }
  }

  const inputData = {
    "type": type,
    "item_id": itemId,
    "start_price": startPrice,
    "current_price": "0",
    "end_price": endPrice,
    "start_time": startTime,
    "end_time": endTime,
    "sales_token_contract": salesTokenContract,
    "platform_fee": platfromFee,
    "sold": false
  };

  try{
    const id = await knex('marketplace').insert(inputData).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`Data Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create marketplace, ${err}`);
  };
}

module.exports = {
  getById,
  getByItemId,
  getAll,
  create,
  checkMarket
}