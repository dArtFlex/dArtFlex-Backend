var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getNftHistory = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('activity').where("item_id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get NFT history, ${err}`);
  }
}

const getTradingHistory = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('activity').select('*')
      .join(
        knex('activity as activityData')
          .select('id')
          .where("from", id)
          .orWhere("to", id)
          .distinctOn("item_id")
          .orderBy("item_id")
          .orderBy("created_at", "desc")
          .as("activityData"),
        function () {
          this.on('activityData.id', '=', 'activity.id')
        }
      )
      .whereNotNull("activityData.id")
      .orderBy("activity.created_at", "desc")
      .select("*");
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Trading history, ${err}`);
  }
}

const getSoldHistory = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('activity').where("from", id).andWhere("status", "sold").select("*");
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Trading history, ${err}`);
  }
}

const getPurchasedHistory = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('activity').where("from", id).andWhere("status", "purchased").select("*");
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Trading history, ${err}`);
  }
}

module.exports = {
  getNftHistory,
  getTradingHistory,
  getSoldHistory,
  getPurchasedHistory
}