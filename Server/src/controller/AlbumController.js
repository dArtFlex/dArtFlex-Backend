var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('album').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get by id, ${err}`);
  }
}

const getByUser = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('album').where("user_id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(result);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get by user id, ${err}`);
  }
}

const create = async (request, response) => {
  const { userId, imageUrl } = request.body
  try{
    const result = await knex('album').where("user_id", userId).select("*");
    if(result.length >= 20) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("There are already 20 images in the Album");
    }
    const id =  await knex('album').insert({ "user_id" : userId, "image_url": imageUrl }).returning('id');
    response.status(HttpStatusCodes.ACCEPTED).send(id);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error create album, ${err}`);
  }
}

const deleteImage = async (request, response) => {
  const { id } = request.body
  try{
    await knex('album').where("id", id).del();
    response.status(HttpStatusCodes.ACCEPTED).send("image removed successfully");
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error delete image from album, ${err}`);
  }
}
module.exports = {
  getById,
  getByUser,
  create,
  deleteImage
}