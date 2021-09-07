var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const axios = require('axios');
const requests = require('request').defaults({ encoding: null });
const {create} = require('ipfs-http-client');

const FormData = require('form-data');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)
const fs = require('fs');
const Path = require('Path');



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
  // const id = parseInt(request.params.id)
  // try{
  //   const result = await knex('album').where("id", id).select("*")
  //   response.status(HttpStatusCodes.ACCEPTED).send(result);
  // }
  // catch(err) {
  //   return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get by id, ${err}`);
  // }

  const path = Path.resolve(__dirname, '../../images/', 'data.jpeg')
  const writer = fs.createWriteStream(path)
  const authPass = 'BFZq02m1ps';
  const authUser = 'nft';
  const response = await axios({
    method: "GET",
    responseType: 'stream',
    url: `https://api.nft.inga.technology/style_transfer/result/81ba334f-c7ae-4457-893b-ed1d8f8f2ec5/image_only`,
    auth: {
      username: authUser,
      password: authPass
    }
  })
  response.data.pipe(writer)
  
  fs.writeFileSync("data.jpeg", img);
  return response.status(HttpStatusCodes.ACCEPTED).send(image.data);
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

const createImage = async (request, response) => {
  // const { userId } = request.body;
  // const {file1 , file2} = request.files;
  // console.log(file1.data)
  // fs.writeFileSync("data1.png", file1.data);
  // const form = new FormData();
  // form.append('content_image',  file1.data, file1.name);
  // form.append('style_image', file2.data, file1.name);
  // const apiUrl = 'https://api.nft.inga.technology/';
  // const authPass = 'BFZq02m1ps';
  // const authUser = 'nft';
  
    
        // const result = await axios({
    //   method: "POST",
    //   url: 'https://api.nft.inga.technology/style_transfer?priority=0&end_scale=512', 
    //   data: form, 
    //   headers: form.getHeaders(),
    //   auth : {
    //     username: authUser,
    //     password: authPass
    //   }
    // })
    // console.log(result.data);
  //   requests.get('https://api.nft.inga.technology/style_transfer/result/81ba334f-c7ae-4457-893b-ed1d8f8f2ec5/image_only', (error, res, body) => {
  //     if (!error && res.statusCode == 200) {
  //         let imagedata = "data:" + res.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
  //         console.log(imagedata);
  //     }
  // });
    // const image = await axios({
    //   method: "GET",
    //   url: `https://api.nft.inga.technology/style_transfer/result/81ba334f-c7ae-4457-893b-ed1d8f8f2ec5/image_only`,
    //   auth : {
    //     username: authUser,
    //     password: authPass
    //   }
    // })
    // return response.status(HttpStatusCodes.ACCEPTED).send(image.data);
      // if (!error && res.statusCode == 200) {
      //   let imagedata = "data:" + res.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
      //   console.log(imagedata);
      // }
    // console.log(image.body)
    // const buffer = Buffer.from(image.data,'base64');
    // return response.status(HttpStatusCodes.ACCEPTED).send(buffer)
    // setTimeout(async (result) => {
    //   console.log(result.data);
    //   const image = await axios({
    //     method: "GET",
    //     url: `https://api.nft.inga.technology/style_transfer/result/81ba334f-c7ae-4457-893b-ed1d8f8f2ec5/image_only`,
    //     auth : {
    //       username: authUser,
    //       password: authPass
    //     }
    //   });
    //   console.log(image);
    // },1500, result);
    

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
  createImage,
  deleteImage
}