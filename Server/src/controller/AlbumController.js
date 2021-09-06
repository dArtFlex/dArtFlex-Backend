var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const axios = require('axios');
const FormData = require('form-data');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)

function binEncode(data) {
  var binArray = []
  var datEncode = "";

  for (i=0; i < data.length; i++) {
      binArray.push(data[i].charCodeAt(0).toString(2)); 
  } 
  for (j=0; j < binArray.length; j++) {
      var pad = padding_left(binArray[j], '0', 8);
      datEncode += pad + ' '; 
  }
  function padding_left(s, c, n) { if (! s || ! c || s.length >= n) {
      return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
      s = c + s; } return s;
  }
  return binArray;
}

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
  const { userId } = request.body;
  const {file1 , file2} = request.files;
  const form = new FormData();
  form.append('content_image',  file1.data);
  form.append('style_image', file2.data);
  console.log(form)
  const apiUrl = 'https://api.nft.inga.technology/';
  const authPass = 'BFZq02m1ps';
  const authUser = 'nft';
  try{
    const taskId = await axios({
      method: "POST",
      url: 'https://api.nft.inga.technology/style_transfer?priority=0&end_scale=512', 
      data: form, 
      headers: form.getHeaders(),
      auth : {
        username: authUser,
        password: authPass
      }
    })
    console.log(taskId)
  }
  catch(err) {
    console.log(err)
  }
  
  // try{

  //   const result = await knex('album').where("user_id", userId).select("*");
  //   if(result.length >= 20) {
  //     return response.status(HttpStatusCodes.BAD_REQUEST).send("There are already 20 images in the Album");
  //   }
  //   const id =  await knex('album').insert({ "user_id" : userId, "image_url": imageUrl }).returning('id');
  //   response.status(HttpStatusCodes.ACCEPTED).send(id);
  // }
  // catch(err) {
  //   return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error create album, ${err}`);
  // }
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