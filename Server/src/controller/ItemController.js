var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)

const {getNotificationById} = require('./NotificationController');

const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('item').where("id", id).select("*");
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const hashtag = await knex('hashtag_item').innerJoin('hashtag', 'hashtag_item.hashtag_id', 'hashtag.id').where('hashtag_item.item_id', item.id);
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      item['hashtag'] = hashtag;
      item['marketplace'] = marketplace;
      return item;
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by Id, ${err}`);
  }
}

const getByTokenId = async (request, response) => {
  const id = request.params.id
  try{
    const items = await knex('item').where("token_id", id).select("*")
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const hashtag = await knex('hashtag_item').innerJoin('hashtag', 'hashtag_item.hashtag_id', 'hashtag.id').where('hashtag_item.item_id', item.id);
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      item['hashtag'] = hashtag;
      item['marketplace'] = marketplace;
      return item;
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by token Id, ${err}`);
  }
}

const getByOwner = async (request, response) => {
  const owner = request.params.id
  try{
    const items = await knex('item').where("owner", owner).select("*")
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const hashtag = await knex('hashtag_item').innerJoin('hashtag', 'hashtag_item.hashtag_id', 'hashtag.id').where('hashtag_item.item_id', item.id);
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      item['hashtag'] = hashtag;
      item['marketplace'] = marketplace;
      return item;
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by owner, ${err}`);
  }
}

const getByCreator = async (request, response) => {
  const creator = request.params.id
  try{
    const items = await knex('item').where("creator", creator).select("*")
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const hashtag = await knex('hashtag_item').innerJoin('hashtag', 'hashtag_item.hashtag_id', 'hashtag.id').where('hashtag_item.item_id', item.id);
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      item['hashtag'] = hashtag;
      item['marketplace'] = marketplace;
      return item;
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by creator, ${err}`);
  }
}

const getAll = async (request, response) => {
  try{
    const items = await knex('item').select("*")
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const hashtag = await knex('hashtag_item').innerJoin('hashtag', 'hashtag_item.hashtag_id', 'hashtag.id').where('hashtag_item.item_id', item.id);
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      item['hashtag'] = hashtag;
      item['marketplace'] = marketplace;
      return item;
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(data);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get all item, ${err}`);
  }
}

const create = async (request, response) => {
  // console.log(request.io.sockets.sockets)
  const { contract, tokenId , uri , creator, owner, royalty, royaltyFee, lazymint, signature, hashtagIdList } = request.body
  if (!contract || !tokenId || !uri || !creator || !owner) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    contract, 
    "token_id" : tokenId,
    uri,
    creator,
    owner,
    royalty,
    'royalty_fee': royaltyFee,
    lazymint,
    signature,
    "ban": false
  };

  try{
    const id = await knex('item').insert(data).returning('id');
    
    await Promise.all(hashtagIdList.map(async (hashId) => {
      await knex('hashtag_item').insert({
        "hashtag_id" : hashId,
        "item_id": id[0]
      });
    }));

    const activityId =  await knex('activity').insert({
      'from': 0,
      'to': creator,
      'item_id': id[0],
      'market_id': 0,
      'order_id': 0,
      'bid_id' : 0,
      'bid_amount': 0,
      'sales_token_contract': "0x",
      'status': 'minted'
    }).returning('id');
    
    const noticeId = await knex('notification').insert({
      'user_id' : creator,
      'activity_id' : activityId[0],
      'read' : false
    }).returning('id');
    console.log(noticeId);
    const noticeData = await getNotificationById(noticeId[0])
    request.io.emit('notification', noticeData);

    response.status(HttpStatusCodes.CREATED).send(`Data Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create User, ${err}`);
  };
}

const update = async (request, response) => {
  const { id, contract, tokenId , uri , creator, owner, royalty, royaltyFee, lazymint, signature } = request.body
  if (!id, !contract || !tokenId || !uri || !creator || !owner ) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const data = {
    contract, 
    "token_id" : tokenId,
    uri,
    creator,
    owner,
    royalty,
    'royalty_fee': royaltyFee,
    lazymint,
    signature,
  };
  console.log(data);
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
  getByTokenId,
  getByOwner,
  getByCreator,
  getAll,
  create,
  update
}