var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('item').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by Id, ${err}`);
  }
}

const getByOwner = async (request, response) => {
  const owner = request.params.wallet
  try{
    const items = await knex('item').where("owner", owner).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by owner, ${err}`);
  }
}

const getByCreator = async (request, response) => {
  const creator = request.params.wallet
  try{
    const items = await knex('item').where("creator", creator).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by creator, ${err}`);
  }
}

const create = async (request, response) => {
  const { contract, tokenId , uri , creator, owner, royalty, royaltyFee, lazymint, signatures } = request.body
  if (!contract || !tokenId || !uri || !creator || !owner) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    contract, 
    "tokenId" : tokenId,
    uri,
    creator,
    owner,
    royalty,
    'royalty_fee': royaltyFee,
    lazymint,
    signatures,
  };

  try{
    const id = await knex('item').insert(data).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`Data Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create User, ${err}`);
  };
}

const update = async (request, response) => {
  const { id, contract, tokenId , uri , creator, owner, royalty, royaltyFee, lazymint, signatures } = request.body
  if (!id || !contract || !tokenId || !uri || !creator || !owner ) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    contract, 
    "tokenId" : tokenId,
    uri,
    creator,
    owner,
    royalty,
    'royalty_fee': royaltyFee,
    lazymint,
    signatures,
  };

  try{
    await knex('item').where('id', id).update(data);
    response.status(HttpStatusCodes.CREATED).send(`Data Updated Successfuly`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error update item, ${err}`);
  };
}

module.exports = {
  getById,
  getByOwner,
  getByCreator,
  create,
  update
}