var express = require('express');
const secrets= require('../../secrets.js')
var HttpStatusCodes = require('http-status-codes');
const knex = require('knex')(secrets.database)
const axios = require('axios');


const getETH = async (request, response) => {
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

const getBNB = async (request, response) => {
  try{
    const data = await knex('token_price').where("token_name", 'BNB').select("*");
    if(data.length == 0)
      return response.status(HttpStatusCodes.ACCEPTED).send(0);
    return response.status(HttpStatusCodes.ACCEPTED).send(data[0]['usd_price']);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get usd price`);
  }
}

const updateTokenPrice = async () => {
  const tokenNameETH = 'ETH';
  const tokenNameBNB = 'BNB';
  try {
    const responseETH = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenNameETH}&tsyms=usd`);
    const usdPriceETH = responseETH.data['USD'];
    const responseBNB = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenNameBNB}&tsyms=usd`);
    const usdPriceBNB = responseBNB.data['USD'];
    
    const dataETH = await knex('token_price').where('token_name', tokenNameETH).select('*');
    if(dataETH.length == 0) {
      await knex('token_price').insert({
        'token_name': tokenNameETH,
        'usd_price' : usdPriceETH
      });
    } else {
      await knex('token_price').where('token_name', tokenNameETH).update({'usd_price' : usdPriceETH});
    }
    const dataBNB = await knex('token_price').where('token_name', tokenNameBNB).select('*');
    if(dataBNB.length == 0) {
      await knex('token_price').insert({
        'token_name': tokenNameBNB,
        'usd_price' : usdPriceBNB
      });
    } else {
      await knex('token_price').where('token_name', tokenNameBNB).update({'usd_price' : usdPriceBNB});
    }
    return ;
  }
  catch (err) {
    return ;
  }
}



module.exports = {
  getETH,
  getBNB,
  updateTokenPrice
}