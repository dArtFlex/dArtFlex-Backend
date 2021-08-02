var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const data = await knex('hashtag').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get hashtag by Id, ${err}`);
  }
}

const getByName = async (request, response) => {
  const name = request.params.name;
  try{
    const data = await knex('hashtag').where("name", name).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get hashtag by name, ${err}`);
  }
}

const getAll = async (request, response) => {
  try{
    const data = await knex('hashtag').select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get all hashtag, ${err}`);
  }
}

const create = async (request, response) => {
  const { name } = request.body
  if (!name) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    name
  };

  try{
    const result = await knex('hashtag').where('name', name).returning('id');
    if(result.length > 0)
      return response.status(HttpStatusCodes.CREATED).send(`hashtag exisit, id: ${result[0].id}`);
    else {
      const id = await knex('hashtag').insert(data).returning('id');
      response.status(HttpStatusCodes.CREATED).send(`hashtag Added Successfuly, id: ${id}`);
    }
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create hashtag, ${err}`);
  };
}

const update = async (request, response) => {
  const { id, name } = request.body
  if (!id && !name ) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    name
  };
  try{
    await knex('hashtag').where('id', id).update(data);
    response.status(HttpStatusCodes.CREATED).send(`Hashtag Updated Successfuly`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error update hashtag, ${err}`);
  };
}

module.exports = {
  getById,
  getByName,
  getAll,
  create,
  update
}