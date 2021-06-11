var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('sales_detail').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get sales detail by Id, ${err}`);
  }
}

const create = async (request, response) => {
  const { type, startPrice ,endPrice , startTime, endTime, salesTokenContract, platfromFee} = request.body

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
    "start_price": startPrice,
    "end_price": endPrice,
    "start_time": startTime,
    "end_time": endTime,
    "sales_token_contract": salesTokenContract,
    "platform_fee": platfromFee
  };

  try{
    const id = await knex('sales_detail').insert(inputData).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`Data Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create sales detail, ${err}`);
  };
}

module.exports = {
  getById,
  create
}