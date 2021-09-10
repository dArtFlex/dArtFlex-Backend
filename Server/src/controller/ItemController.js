var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)

// const {getNotificationById} = require('./NotificationController');
function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const getById = async (request, response) => {
  const id = parseInt(request.params.id);
  const {page, limit} = request.query;
  const offset = limit * (page - 1);
  try{
    const items = await knex('item').where("id", id).select("*").orderBy('created_at', 'DESC').offset(offset).limit(limit);
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
  const id = request.params.id;
  const {page, limit} = request.query;
  const offset = limit * (page - 1);
  try{
    const items = await knex('item').where("token_id", id).select("*").orderBy('created_at', 'DESC').offset(offset).limit(limit);
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
  const owner = request.params.id;
  const {page, limit} = request.query;
  const offset = limit * (page - 1);
  try{
    const items = await knex('item').where("owner", owner).select("*").orderBy('created_at', 'DESC').offset(offset).limit(limit);
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
  const {page, limit} = request.query;
  const offset = limit * (page - 1);
  try{
    const items = await knex('item').where("creator", creator).select("*").orderBy('created_at', 'DESC').offset(offset).limit(limit);
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

const getSalesDataByUser = async (request, response) => {
  const owner = request.params.id
  try{
    const items = await knex('item').where("owner", owner).select("*").orderBy('created_at', 'DESC');
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      const metadataId = item['uri'].split('get/').pop();
      const imageUrl = await knex('metadata').where('id', parseInt(metadataId)).select("*");
      if(imageUrl.length > 0){
        item['image_name'] = imageUrl[0]['name']; 
        item['image_url'] = imageUrl[0]['image'];
      }
      else {
        item['image_url'] = '';
        item['image_name'] = ''; 
      }
      let highestBid = [];
      let listedBid = [];
      if(marketplace.length > 0 )
      { 
        if(!marketplace[0]['sold']) {
          highestBid = await knex('bid').where('market_id', marketplace[0]['id']).andWhere("status", "pending").select("*");
        }
        if(marketplace[0].sold && item.lock) {
          listedBid = await knex('bid').where('market_id', marketplace[0]['id']).andWhere("status", "listed").select("*");
        }
      }
      const highestOffer  = await knex('bid').where("item_id", item.id).andWhere('status', 'like', 'offered').select("*")
      item['highest_offer'] = highestOffer;
      item['highest_bid'] = highestBid;
      item['listed_bid'] = listedBid;
      item['marketplace'] = marketplace;
      if(!(highestOffer.length == 0 && highestBid.length == 0 && marketplace.length == 0))
        return item;
      return ;  
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(data.filter(_data => _data!=null));
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by creator, ${err}`);
  }
}


const getAuction = async (request, response) => {
  try{
    const {page, limit} = request.query;
    const items = await knex('item').select("*").orderBy('created_at', 'DESC');
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      const metadataId = item['uri'].split('get/').pop();
      const imageUrl = await knex('metadata').where('id', parseInt(metadataId)).select("*");
      if(imageUrl.length > 0){
        item['image'] = imageUrl; 
      }
      else {
        item['image'] = [];
      }
      item['marketplace'] = marketplace;
      if(marketplace.length > 0 )
      { 
        if(!marketplace[0]['sold'] && marketplace[0]['type'] == "auction") {
          console.log("here")
          const bidData = await knex('bid').where('market_id', marketplace[0]['id']).andWhere('status','listed').select("*");
          item['user'] = [];
          if(bidData.length > 0) {
            const userData = await knex('users').where('id', bidData[0]['user_id']);
            item['user'] = userData;
          }
          return item;
        }
      }
      return ;  
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(paginate(data.filter(_data => _data!=null), limit, page));
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by creator, ${err}`);
  }
}

const getBuyNow = async (request, response) => {
  try{
    const {page, limit} = request.query;
    const items = await knex('item').select("*").orderBy('created_at', 'DESC');
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      const metadataId = item['uri'].split('get/').pop();
      const imageUrl = await knex('metadata').where('id', parseInt(metadataId)).select("*");
      if(imageUrl.length > 0){
        item['image'] = imageUrl; 
      }
      else {
        item['image'] = [];
      }
      item['marketplace'] = marketplace;
      if(marketplace.length > 0 )
      { 
        if(!marketplace[0]['sold'] && marketplace[0]['type'] == "instant_buy") {
          console.log("here")
          const bidData = await knex('bid').where('market_id', marketplace[0]['id']).andWhere('status','listed').select("*");
          item['user'] = [];
          if(bidData.length > 0) {
            const userData = await knex('users').where('id', bidData[0]['user_id']);
            item['user'] = userData;
          }
          return item;
        }
      }
      return ;  
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(paginate(data.filter(_data => _data!=null), limit, page));
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by creator, ${err}`);
  }
}

const getSold = async (request, response) => {
  try{
    const {page, limit} = request.query;
    const items = await knex('item').select("*").orderBy('created_at', 'DESC');
    let data = [];
    data = await Promise.all(items.map(async(item) => {
      const marketplace = await knex('marketplace').where('item_id', item.id).orderBy('id', 'DESC').limit(1).select("*");
      const metadataId = item['uri'].split('get/').pop();
      const imageUrl = await knex('metadata').where('id', parseInt(metadataId)).select("*");
      if(imageUrl.length > 0){
        item['image'] = imageUrl; 
      }
      else {
        item['image'] = [];
      }
      item['marketplace'] = marketplace;
      if(marketplace.length > 0 )
      { 
        if(marketplace[0]['sold']) {
          console.log("here")
          const userData = await knex('users').where('id', item['owner']);
          item['user'] = userData;
          return item;
        }
      }
      return ;  
    }));
    response.status(HttpStatusCodes.ACCEPTED).send(paginate(data.filter(_data => _data!=null), limit, page));
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get item by creator, ${err}`);
  }
}
const getAll = async (request, response) => {
  try{
    const {page, limit} = request.query;
    const offset = limit * (page - 1);
    const items = await knex('item').select("*").orderBy('created_at', 'DESC').offset(offset).limit(limit);
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
  getAuction,
  getByTokenId,
  getByOwner,
  getByCreator,
  getSalesDataByUser,
  getAll,
  getBuyNow,
  getSold,
  create,
  update
}