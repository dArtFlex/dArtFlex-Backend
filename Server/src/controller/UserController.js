var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)

// /**
//  * Auth Contoller module.
//  * @module UserController
//  */

/**
 * Get All User information from Database
 * @function getUsers
 * @param request {object} - The Request
 * @param response {object} - The Response
 * @return {object} Array of Users Object
 */
const getUsers = async (request, response) => {
  try{
    const users = await knex('users').select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(users);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get User, ${err}`);
  }
}


/**
 * Get single User information from Database by User Id
 * @function getUserById
 * @param request {object} - The Request
 * @param response {object} - The Response
 * @param request.params.id {string} - User Id
 * @return {object} Array of User Object
 */
const getUserById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const users = await knex('users').where("id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(users);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get User by Id, ${err}`);
  }
}

/**
 * Get single User information from Database by User Id
 * @function getUserByWallet
 * @param request {object} - The Request
 * @param response {object} - The Response
 * @param request.params.wallet {string} - User Wallet
 * @return {object} Array of User Object
 */
 const getUserByWallet = async (request, response) => {
  const wallet = request.params.wallet.toLowerCase( );
  try{
    const users = await knex('users').where("wallet", wallet).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(users);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get User by Id, ${err}`);
  }
}


/**
 * Create User  in User Table
 * @function creatUser
 * @param request {object} - The Request
 * @param response {object} - The Response
 * @param request.body.fullname {string} - Name of User
 * @param request.body.userid {string} - id of User
 * @param request.body.email {string} - email of User
 * @param request.body.wallet {string} - wallet address of User
 * @param request.body.overview {string} - profile of User
 * @param request.body.profile_image {string} - profile image url of User
 * @param request.body.cover_image {string} - cover image url of User
 * @return {object} Array of User Object
 */

const createUser = async (request, response) => {
  const { fullname, userid , email , wallet, overview, profile_image, cover_image } = request.body
  if (!fullname || !userid || !email || !wallet) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const user = [{
    fullname, 
    userid,
    email,
    overview,
    profile_image,
    cover_image,
    'wallet' : wallet.toLowerCase(),
  }];

  try{
    const id = await knex('users').insert(user).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`User Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create User, ${err}`);
  };
}

/**
 * Update User  in User Table by User Id
 * @function updateUser
 * @param request {object} - The Request
 * @param response {object} - The Response
 * @param request.params.id {string} - Id of User
 * @param request.body.name {string} - Name of User
 * @param request.body.email {string} - Email of User
 * @param request.body.password {string} - Password of User
 * @param request.body.role {int} - role of User
 * @return {object} Array of User Object
 */

const updateUser = async (request, response) => {

  const { id, fullname, userid , email , wallet, overview, profile_image, cover_image } = request.body
  if (!id || !fullname || !userid || !email || !wallet) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const user = {
    fullname, 
    userid,
    email,
    overview,
    profile_image,
    cover_image,
    'wallet' : wallet.toLowerCase(),
  };

  try{
    await knex('users').where('id', id).update(user);
    response.status(HttpStatusCodes.CREATED).send(`User Updated Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Update User, ${err}`);
  };
}

const deleteUser = async (request, response) => {
  const id = parseInt(request.params.id);
  try{
    await knex('users').where('id', id).del();
    response.status(HttpStatusCodes.ACCEPTED).send(`User Deleted Successfuly`)
  }
  catch{
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Error Delete User");
  };
}

module.exports = {
  getUsers,
  getUserById,
  getUserByWallet,
  createUser,
  updateUser,
  deleteUser,
}