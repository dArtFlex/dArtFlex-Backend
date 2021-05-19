var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const users = await knex('lazymint').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(users);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get lazyminting by Id, ${err}`);
  }
}

const create = async (request, response) => {
  const { contract, tokenId , uri , creator, royalty, signatures } = request.body
  if (!contract || !tokenId || !uri || !creator || !signatures) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    contract, 
    "tokenId" : parseInt(tokenId),
    uri,
    creator,
    royalty,
    signatures,
  };

  try{
    const id = await knex('lazymint').insert(data).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`Data Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create User, ${err}`);
  };
}

module.exports = {
  getById,
  create
}