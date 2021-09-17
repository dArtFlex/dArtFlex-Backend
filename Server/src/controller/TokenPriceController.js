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
  try {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenName}&tsyms=usd`);
    const usdPrice = response.data['USD'];
    console.log(usdPrice);
    const data = await knex('token_price').where('token_name', tokenName).select('*');
    if(data.length == 0) {
      await knex('token_price').insert({
        'token_name': tokenName,
        'usd_price' : usdPrice
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