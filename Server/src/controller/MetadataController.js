var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)



const getDataById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const data = await knex('metadata').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Data by Id, ${err}`);
  }
}


const createData = async (request, response) => {
  const { name, image , image_data , attribute, description } = request.body
  if (!name || !image || !image_data) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = [{
    name, 
    image,
    image_data,
    attribute,
    description
  }];

  try{
    const result = await knex('metadata').where('image', image).select("*");
    if(result.length > 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send({'message': 'image already exist'});
    const id = await knex('metadata').insert(data).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`User Data Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({'message': err});
  };
}

const updateData = async (request, response) => {

  const {id, name, image , image_data , attribute, description } = request.body
  if (!id || !name || !image || !image_data) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = [{
    name, 
    image,
    image_data,
    attribute,
    description
  }];

  try{
    await knex('metadata').where('id', id).update(data);
    response.status(HttpStatusCodes.CREATED).send(`Data Updated Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Update Data, ${err}`);
  };
}

const deleteData = async (request, response) => {
  const id = parseInt(request.params.id);
  try{
    await knex('metadata').where('id', id).del();
    response.status(HttpStatusCodes.ACCEPTED).send(`Data Deleted Successfuly`)
  }
  catch{
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Error Delete Data");
  };
}

module.exports = {
  getDataById,
  createData,
  updateData,
  deleteData,
}