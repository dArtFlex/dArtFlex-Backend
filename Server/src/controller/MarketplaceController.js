var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


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

const create = async (request, response) => {
  const { type, itemId, startPrice ,endPrice , startTime, endTime, salesTokenContract, platfromFee} = request.body

  if(!(type == "auction" || type == "instant_buy")){
    return response.status(HttpStatusCodes.BAD_REQUEST).send(`invalid sales type`);
  }
  if(type == "auction")
  {
    if(endTime <= startTime){
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`expiratoin time is invalid`);
    }
  
    if(endPrice <= startPrice){
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
  create
}