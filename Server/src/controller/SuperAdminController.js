var express = require('express');
var HttpStatusCodes = require('http-status-codes');
var secrets= require('../../secrets.js')
var knex = require('knex')(secrets.database)
var sigUtil = require('eth-sig-util')

const addPromotion = async (request, response) => {
  const {itemId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  console.log(itemId);
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const promotions = await knex('promotion').where("item_id", itemId).select("*");
      console.log(promotions);
      if(promotions.length == 0)
      {
        const id = await knex('promotion').insert({'item_id' : itemId}).returning('id');
        return response.status(HttpStatusCodes.CREATED).send({
          message: `Item added to promotion Successfuly`,
          id: id
        });
      }
      else
        return response.status(HttpStatusCodes.ACCEPTED).send(`Item already exisit`);
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Add promotion, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const deletePromotion = async (request, response) => {
  const {itemId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const promotions = await knex('promotion').where("item_id", itemId).select("*");
      if(promotions.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Item not exisit in the promotion table`);
      else
      {
        await knex('promotion').where('item_id', itemId).del();
        return response.status(HttpStatusCodes.ACCEPTED).send(`Item successfully removed from promotion table`);
      }
        
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create User, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const banUser = async (request, response) => {
  const {userId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const _users = await knex('users').where("id", userId).select("*");
      if(_users.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);
      else
      {
        await knex('users').where('id', userId).update({ ban: true });
        return response.status(HttpStatusCodes.ACCEPTED).send(`User successfully banned`);
      }
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error ban User, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const unBanUser = async (request, response) => {
  const {userId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const _users = await knex('users').where("id", userId).select("*");
      if(_users.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);
      else
      {
        await knex('users').where('id', userId).update({ ban: false });
        return response.status(HttpStatusCodes.ACCEPTED).send(`User successfully unbanned`);
      }
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Unban user, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const banItem = async (request, response) => {
  const {itemId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const items = await knex('item').where("id", itemId).select("*");
      if(items.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit item`);
      else
      {
        await knex('item').where('id', itemId).update({ ban: true });
        return response.status(HttpStatusCodes.ACCEPTED).send(`Item successfully banned`);
      }
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Ban Item, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const unBanItem = async (request, response) => {
  const {itemId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const items = await knex('item').where("id", itemId).select("*");
      if(items.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit item`);
      else
      {
        await knex('item').where('id', itemId).update({ ban: false });
        return response.status(HttpStatusCodes.ACCEPTED).send(`Item successfully unbanned`);
      }
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error unban Item, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const burnUser = async (request, response) => {
  const {userId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const _users = await knex('users').where("id", userId).select("*");
      if(_users.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);
      else
      {
        await knex('users').where('id', userId).del();
        return response.status(HttpStatusCodes.ACCEPTED).send(`User successfully burned`);
      }
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error burn user, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

const burnItem = async (request, response) => {
  const {itemId, data, signature} = request.body;
  const msgSender = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(data), sig: signature })
  try{
    const users = await knex('users').where("wallet", msgSender).select("*")
    if(users.length == 0)
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit user`);

    if(users[0].role != "super_admin")
      return response.status(HttpStatusCodes.BAD_REQUEST).send(`The caller is not admin role`);

    try{
      const items = await knex('item').where("id", itemId).select("*");
      if(items.length == 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Not exisit item`);
      else
      {
        await knex('item').where('id', itemId).del();
        return response.status(HttpStatusCodes.ACCEPTED).send(`Item successfully burned`);
      }
    }
    catch(err) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error burn item, ${err}`);
    };
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get Admin`);
  }  
}

module.exports = {
  addPromotion,
  deletePromotion,
  banUser,
  unBanUser,
  banItem,
  unBanItem,
  burnUser,
  burnItem
}