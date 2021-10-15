var express = require('express');
const secrets= require('../../secrets.js')
var HttpStatusCodes = require('http-status-codes');
const knex = require('knex')(secrets.database)
const axios = require('axios');


const get = async (request, response) => {
  try{
    const data = await knex('token_price').where("token_name", 'ETH').select("*");
    if(data.length == 0)
      return response.status(HttpStatusCodes.ACCEPTED).send(0);
    return response.status(HttpStatusCodes.ACCEPTED).send(data[0]['usd_price']);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get usd price`);
  }
}

const updateTokenPrice = async () => {
  const tokenName = 'ETH';
  const tokenName1 = 'BNB'; 
  try {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenName}&tsyms=usd`);
    const response1 = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenName}&tsyms=usd`);
    const usdPrice = response.data['USD'];
    const bnbPrice = response.data['BNB'];
    const data = await knex('token_price').where('token_name', tokenName).select('*');
    const data1 = await knex('token_price').where('token_name_bnb', tokenName1).select('*');
    if(data.length == 0) {
      await knex('token_price').insert({
        'token_name': tokenName,
        'usd_price' : usdPrice,
        'token_name_bnb': tokenName1,
        'usd_price_bnb': bnbPrice
      });
    } else {
      await knex('token_price').where('token_name', tokenName).update({'usd_price' : usdPrice});
    }
    return ;
  }
  catch (err) {
    return ;
  }
}



module.exports = {
  get,
  updateTokenPrice
}