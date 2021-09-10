var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const axios = require('axios');
const requests = require('request').defaults({ encoding: null });
const {create} = require('ipfs-http-client');

const FormData = require('form-data');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)
const fs = require('fs');
const Path = require('path');




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

const getAlbumImage = async (request, response) => {
  const name = request.params.name;
  const imageData = fs.readFileSync(`./images/${name}.jpeg`);
  response.writeHead(200, {'Content-Type': 'image/jpeg'});
  return response.end(imageData,'Base64');
}

const createImage = async (request, response) => {
  const { userId } = request.body;
  const {file1 , file2} = request.files;
  const form = new FormData();
  form.append('content_image',  file1.data, file1.name);
  form.append('style_image', file2.data, file1.name);
  const authPass = 'BFZq02m1ps';
  const authUser = 'nft';
  const tmpFileName = file1.name.split('.')[0] + "_" + file2.name.split('.')[0] + "_" + new Date().getTime();
  const path = Path.resolve(__dirname, '../../images/', `${tmpFileName}.jpeg`)
  const writer = fs.createWriteStream(path)
 
  const result = await axios({
    method: "POST",
    url: 'https://api.nft.inga.technology/style_transfer?priority=0&end_scale=512', 
    data: form, 
    headers: form.getHeaders(),
    auth : {
      username: authUser,
      password: authPass
    }
  })
  
  setTimeout(async (result, writer, tmpFileName) => {
    console.log(path)
    const image = await axios({
      method: "GET",
      responseType: 'stream',
      url: `https://api.nft.inga.technology/style_transfer/result/${result.data.task_id}/image_only`,
      auth : {
        username: authUser,
        password: authPass
      }
    });
    await image.data.pipe(writer)
    
    return response.status(HttpStatusCodes.ACCEPTED).send(tmpFileName);
  },100000, result, writer, tmpFileName);
    
}

const save = async (request, response) => {
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
  createImage,
  save,
  deleteImage,
  getAlbumImage
}