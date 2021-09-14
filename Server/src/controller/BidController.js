var express = require('express');
var HttpStatusCodes = require('http-status-codes');
var secrets= require('../../secrets.js')
var knex = require('knex')(secrets.database)
const BN = require('bn.js');

const {getNotificationById} = require('./NotificationController');

function getCurrentTime() {
  const d = new Date();
  const n = d.getTime();
  return n;
}
const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("id", id).andWhereNot("status", "canceled").select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by order Id, ${err}`);
  }
}

const getByMarketId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("market_id", id).orderBy('created_at', 'DESC').select("*");
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by market Id, ${err}`);
  }
}

const getOfferByItemId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("item_id", id).andWhere('status', 'like', '%offer%').select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid offer by item Id, ${err}`);
  }
}

const getByUserId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("user_id", id).select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by user Id, ${err}`);
  }
}

const getActiveBidByUserId = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const items = await knex('bid').where("user_id", id).andWhere("status", "pending").select("*")
    response.status(HttpStatusCodes.ACCEPTED).send(items);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get bid list by user Id, ${err}`);
  }
}

const listItem = async (request, response) => {
  const { orderId, itemId , userId , marketId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !marketId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", marketId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("marketplace id invalid");

  const bidData = await knex('bid').where("market_id", marketId).andWhere('status','listed').select("*");
  if(bidData.length > 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("Item already listed");
      
  else{
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "market_id": marketId,
      "bid_amount": bidAmount,
      "status": "listed"
    };
    try{
      const id = await knex('bid').insert(data).returning('id');
      const activityId = await knex('activity').insert({
        'from': userId,
        'to': 0,
        'item_id': itemId,
        'market_id': marketId,
        'order_id': orderId,
        'bid_id': id[0],
        'bid_amount': bidAmount,
        'sales_token_contract': '0x',
        'status': 'listed'
      }).returning('id');

      response.status(HttpStatusCodes.CREATED).send(`List item Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error List Item, ${err}`);
    }
  }
}

const unListItem = async (request, response) => {
  
  const { id } = request.body;
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", id).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("item did not listed");
  else{
    try{

      const creatorData = await knex('bid').where('market_id', id).andWhere('status', 'listed').select('*');
      await knex('bid').where('market_id', id).del();
      await knex('marketplace').where("id", id).del();

      const activityId = await knex('activity').insert({
        'from': creatorData[0]['user_id'],
        'to': 0,
        'item_id': creatorData[0]['item_id'],
        'market_id': id,
        'order_id': creatorData[0]['order_id'],
        'bid_amount': creatorData[0]['bid_amount'],
        'bid_id': 0,
        'sales_token_contract': '0x',
        'status': 'unlisted'  
      }).returning('id');

      response.status(HttpStatusCodes.CREATED).send(`unList item Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error unList Item, ${err}`);
    }
  }
}


const changePrice = async (request, response) => {
  
  const { id, newPrice } = request.body;
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", id).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("item did not listed");
  else{
    try{

      const creatorData = await knex('bid').where('market_id', id).andWhere('status', 'listed').select('*');
      await knex('bid').where('market_id', id).andWhereNot('status', 'listed').del();
      await knex('marketplace').update('start_price', newPrice).where("id", id);
      await knex('bid').where('market_id', id).andWhere('status', 'listed').update('bid_amount', newPrice);
      const activityId = await knex('activity').insert({
        'from': creatorData[0]['user_id'],
        'to': 0,
        'item_id': creatorData[0]['item_id'],
        'market_id': id,
        'order_id': creatorData[0]['order_id'],
        'bid_amount': newPrice,
        'bid_id': 0,
        'sales_token_contract': '0x',
        'status': 'price changed'  
      }).returning('id');

      response.status(HttpStatusCodes.CREATED).send(`item price chagned Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error unList Item, ${err}`);
    }
  }
}

const placeBid = async (request, response) => {
  
  const { orderId, itemId , userId , marketId, bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !marketId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", marketId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("marketplace id is invalid");
  else{
    if(result[0].sold)
      return response.status(HttpStatusCodes.BAD_REQUEST).send("item is already sold");
    else{
      const startPrice = new BN(result[0]['start_price']);
      const _bidAmount = new BN(bidAmount);
      if(!(startPrice.lte(_bidAmount)))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid bid amount"); 
      if(!(result[0]['start_time'] <= getCurrentTime() && result[0]['end_time'] >= getCurrentTime()))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invliad bid time");
    }
    
    let data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "bid_amount": bidAmount,
      "market_id": marketId,
      "status": "pending"
    };

    const highestBid = await knex('bid').where("market_id", marketId).andWhere('status', 'pending').select('*').orderBy('bid_amount', 'DESC').limit(1);
    if(highestBid.length > 0)
    {
      const _highestBid = new BN(highestBid[0]['bid_amount']);
      const _bidAmount = new BN(bidAmount);
      if(_bidAmount.lte(_highestBid))
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Bid amount is less than highest bid`);
      // Withdraw previous bidder
      await knex('bid').where('id', highestBid[0]['id']).update({"status": "canceled"});
      const noticeId = await knex('notification').insert({
        'user_id':parseInt(highestBid[0]['user_id']),
        'item_id':parseInt(itemId),
        'message': 'Your bid was outbid',
        'read': false
      }).returning('id')
      const noticeData = await getNotificationById(noticeId[0])
      request.io.emit('notification', noticeData);

    }
    try{
      
      // Insert new bid
      const endPrice = new BN(result[0]['end_price']);
      const _bidAmount = new BN(bidAmount);
      if(_bidAmount.gte(endPrice)) {
        data.status = "accepted"
        const id = await knex('bid').insert(data).returning('id');
        await knex('marketplace').where('id', marketId).update({"sold": true, "current_price": bidAmount});
        const seller = await knex('item').where('id', itemId).returning('*');
        await knex('item').where('id', itemId).update({'owner' : userId, 'lazymint': false, 'lock' : true});
        
        await knex('activity').insert({
          'from': seller[0]['owner'],
          'to': userId,
          'item_id': itemId,
          'market_id': marketId,
          'order_id': orderId,
          'bid_id': id,
          'bid_amount': bidAmount,
          'sales_token_contract': '0x',
          'tx_hash': '0x',
          'status': 'pending'
        }).returning('id');

        await knex('activity').insert({
          'from': userId,
          'to': seller[0]['owner'],
          'item_id': itemId,
          'market_id': marketId,
          'order_id': orderId,
          'bid_id': id,
          'bid_amount': bidAmount,
          'sales_token_contract': '0x',
          'tx_hash': '0x',
          'status': 'pending'
        }).returning('id');

        const noticeId = await knex('notification').insert({
          'user_id':userId,
          'item_id':itemId,
          'message': 'Congratulations on your successful purchase!',
          'read': false
        }).returning('id')
        const noticeData = await getNotificationById(noticeId[0])
        request.io.emit('notification', noticeData);
        return response.status(HttpStatusCodes.CREATED).send(`Item successfully sold`);
      }

      const id = await knex('bid').insert(data).returning('id');
      await knex('marketplace').where('id', marketId).update({"current_price": bidAmount});
      if((result[0]['end_time'] - getCurrentTime()) <= 900000) {
        await knex('marketplace').where('id', marketId).update({"end_time": result[0]['end_time'] + 900000});
      }
      const activityId = await knex('activity').insert({
        'from': userId,
        'to': 0,
        'item_id': itemId,
        'market_id': marketId,
        'order_id': orderId,
        'bid_id': id[0],
        'bid_amount': bidAmount,
        'sales_token_contract': '0x',
        'status': 'bidded'
      }).returning('id');

      const seller = await knex('item').where('id', parseInt(itemId)).returning('*');
      const noticeId = await knex('notification').insert({
        'user_id':parseInt(seller[0]['owner']),
        'item_id':parseInt(itemId),
        'message': 'Your Item has been bid',
        'read': false
      }).returning('id')
      const noticeData = await getNotificationById(noticeId[0])
      request.io.emit('notification', noticeData);
      

      response.status(HttpStatusCodes.CREATED).send(`Bid Placed Successfuly, id: ${id}`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Place Bid, ${err}`);
    }
  }
}

const makeOffer = async (request, response) => {
  
  const { orderId, itemId , userId , bidAmount } = request.body;
  if (!orderId || !itemId || !userId  || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result =  await knex('marketplace').where("item_id", itemId).andWhere('sold', 'false').select("*");
  if (result.length > 0 )
    return response.status(HttpStatusCodes.BAD_REQUEST).send("Item is currently listed in the market place");
  
  const data = {
    "item_id": itemId,
    "order_id": orderId,
    "user_id": userId,
    "bid_amount": bidAmount,
    "market_id": 0,
    "status": "offered"
  };

  try{
    const currentOffer = await knex('bid').where('item_id', itemId).andWhere('status','offered').select('*').orderBy('bid_amount', 'DESC').limit(1);;
    if(currentOffer.length > 0) {
      const _currentOffer = new BN(currentOffer[0]['bid_amount']);
      const _bidAmount = new BN(bidAmount);
      if(_bidAmount.lte(_currentOffer))
        return response.status(HttpStatusCodes.BAD_REQUEST).send(`Offer amount is less than current offer`);
      // Withdraw previous bidder
      await knex('bid').where('id', currentOffer[0]['id']).update({"status": "canceled offer"});
    }
    // Insert new bid
    const id = await knex('bid').insert(data).returning('id');
    const activityId = await knex('activity').insert({
      'from': userId,
      'to': 0,
      'item_id': itemId,
      'market_id': 0,
      'order_id': orderId,
      'bid_id': id[0],
      'bid_amount': bidAmount,
      'sales_token_contract': '0x',
      'status': 'offered'
    }).returning('id');

    const seller = await knex('item').where('id', parseInt(itemId)).returning('*');
    const noticeId = await knex('notification').insert({
      'user_id':parseInt(seller[0]['owner']),
      'item_id':parseInt(itemId),
      'message': 'Your Item has been offered',
      'read': false
    }).returning('id')
    const noticeData = await getNotificationById(noticeId[0])
    request.io.emit('notification', noticeData);

    response.status(HttpStatusCodes.CREATED).send(`Bid offered Successfuly, id: ${id}`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error make offer, ${err}`);
  }
  
}

const withdrawBid = async (request, response) => {
  
  const { id } = request.body
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  try{
    const data = await knex('bid').where('id', id).returning('*');
    const prevHighestBid = await knex('bid').where("market_id", data[0]['market_id']).andWhere('status', 'canceled').select('*').orderBy('bid_amount', 'DESC').limit(1);

    if(prevHighestBid.length > 0) {
      await knex('bid').where('id', prevHighestBid[0]['id']).update({"status": "pending"});
      await knex('marketplace').where('id', data[0]['market_id']).update({"current_price": prevHighestBid[0]['bid_amount']});
    }
    else {
      await knex('marketplace').where('id', data[0]['market_id']).update({"current_price":"0"});
    }

    await knex('bid').where('id', id).del();
    
    const activityId = await knex('activity').insert({
      'from': data[0]['user_id'],
      'to': 0,
      'item_id': data[0]['item_id'],
      'market_id': data[0]['market_id'],
      'order_id': data[0]['order_id'],
      'bid_id': id,
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'status': 'canceled'
    });


    response.status(HttpStatusCodes.CREATED).send(`Withdraw bid successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error withdraw bid, ${err}`);
  };
}

const withdrawOffer = async (request, response) => {
  
  const { id } = request.body
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  try{
    const data = await knex('bid').where('id', id).returning('*');
    const prevHighestOffer = await knex('bid').where("item_id", data[0]['item_id']).andWhere('status', 'canceled offer').select('*').orderBy('bid_amount', 'DESC').limit(1);

    if(prevHighestOffer.length > 0) {
      await knex('bid').where('id', prevHighestOffer[0]['id']).update({"status": "offered"});
    }
    await knex('bid').where('id', id).del();
    
    const activityId = await knex('activity').insert({
      'from': data[0]['user_id'],
      'to': 0,
      'item_id': data[0]['item_id'],
      'market_id': 0,
      'order_id': data[0]['order_id'],
      'bid_id': id,
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'status': 'canceled offer'
    }).returning('id');

    response.status(HttpStatusCodes.CREATED).send(`Withdraw offer successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error withdraw offer, ${err}`);
  };
}

const acceptBid = async (request, response) => {
  
  const { id, sellerId, txHash } = request.body
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  try{
    const data = await knex('bid').where('id', id).update({"status": "accepted"}).returning('*');
    await knex('marketplace').where('id', parseInt(data[0]['market_id'])).update({"sold": true, "current_price": data[0]['bid_amount']});
    const buyer = await knex('bid').where('id', id).select("*");
    // const sellerId = await knex('item').where('id', parseInt(buyer[0]['item_id'])).returning('*');
    await knex('item').where('id', buyer[0]['item_id']).update({'owner' : buyer[0]['user_id'], 'lazymint': false});
    
    await knex('activity').insert({
      'from': sellerId,
      'to': buyer[0]['user_id'],
      'item_id': data[0]['item_id'],
      'market_id': data[0]['market_id'],
      'order_id': data[0]['order_id'],
      'bid_id': id,
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'tx_hash': txHash,
      'status': 'sold'
    }).returning('id');

    await knex('activity').insert({
      'from': buyer[0]['user_id'],
      'to': sellerId,
      'item_id': data[0]['item_id'],
      'market_id': data[0]['market_id'],
      'order_id': data[0]['order_id'],
      'bid_id': id,
      'bid_amount': data[0]['bid_amount'],
      'sales_token_contract': '0x',
      'tx_hash': txHash,
      'status': 'purchased'
    }).returning('id');

    const noticeId = await knex('notification').insert({
      'user_id':parseInt(buyer[0]['user_id']),
      'item_id':parseInt(buyer[0]['item_id']),
      'message': 'Congratulations on your successful purchase!',
      'read': false
    }).returning('id')
    const noticeData = await getNotificationById(noticeId[0])
    request.io.emit('notification', noticeData);

    return response.status(HttpStatusCodes.CREATED).send(`accept bid successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error accept bid, ${err}`);
  };
}

const acceptOffer = async (request, response) => {
  
  const { id, sellerId, txHash } = request.body
  if (!id) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  try{
    const buyer = await knex('bid').where('id', id).update({"status": "accepted"}).returning('*');
    await knex('bid').where('item_id',buyer[0]['item_id']).andWhere('status','canceled offer').del();

    // const sellerId = await knex('item').where('id', parseInt(buyer[0]['item_id'])).returning('*');
    await knex('item').where('id', buyer[0]['item_id']).update({'owner' : buyer[0]['user_id'], 'lazymint': false});
    
    await knex('activity').insert({
      'from': sellerId,
      'to': buyer[0]['user_id'],
      'item_id': buyer[0]['item_id'],
      'market_id': buyer[0]['market_id'],
      'order_id': buyer[0]['order_id'],
      'bid_id': id,
      'bid_amount': buyer[0]['bid_amount'],
      'sales_token_contract': '0x',
      'tx_hash': txHash,
      'status': 'sold'
    }).returning('id');
    
    await knex('activity').insert({
      'from': buyer[0]['user_id'],
      'to': sellerId,
      'item_id': buyer[0]['item_id'],
      'market_id': buyer[0]['market_id'],
      'order_id': buyer[0]['order_id'],
      'bid_id': id,
      'bid_amount': buyer[0]['bid_amount'],
      'sales_token_contract': '0x',
      'tx_hash': txHash,
      'status': 'purchased'
    }).returning('id');

    const noticeId = await knex('notification').insert({
      'user_id':parseInt(buyer[0]['user_id']),
      'item_id':parseInt(buyer[0]['item_id']),
      'message': 'Congratulations on your successful purchase!',
      'read': false
    }).returning('id')
    const noticeData = await getNotificationById(noticeId[0])
    request.io.emit('notification', noticeData);

    return response.status(HttpStatusCodes.CREATED).send(`accept bid successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error accept bid, ${err}`);
  };
}

const claimNFT = async (request, response) => {
  
  const { itemId, buyerId, sellerId, txHash } = request.body

  try{
    
    await knex('item').where('id', itemId).update({'lock' : false});
    
    await knex('activity').where({'from':sellerId , 'to' : buyerId, 'status' : 'pending '}).update({
      'tx_hash': txHash,
      'status': 'sold'
    }).returning('id');

    await knex('activity').where({'from':sellerId , 'to' : buyerId, 'status' : 'pending '}).update({
      'tx_hash': txHash,
      'status': 'purchased'
    }).returning('id');

    return response.status(HttpStatusCodes.CREATED).send(`Claim NFT successfuly`);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error claim NFT, ${err}`);
  };
}

const buyNow = async (request, response) => {
  
  const { orderId, itemId , userId , sellerId,  marketId, bidAmount, txHash } = request.body;
  if (!orderId || !itemId || !userId  || !marketId || !bidAmount) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
  }

  const result = await knex('marketplace').where("id", marketId).select("*");
  if(result.length == 0) 
    return response.status(HttpStatusCodes.BAD_REQUEST).send("marketplace id is invalid");
  else{
    if(result[0].sold)
      return response.status(HttpStatusCodes.BAD_REQUEST).send("item is already sold");
    else{
      // console.log(result[0]['start_price'], result[0]['end_price'], bidAmount)
      const startPrice = new BN(result[0]['start_price']);
      const _bidAmount = new BN(bidAmount);
      if(!(startPrice.eq(_bidAmount)))
        return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid bid amount");
    }
      
    const data = {
      "item_id": itemId,
      "order_id": orderId,
      "user_id": userId,
      "bid_amount": bidAmount,
      "market_id": marketId,
      "status": "accepted"
    };

    try{
      const id = await knex('bid').insert(data).returning('id');
      // const seller = await knex('item').where('id', parseInt(itemId)).returning('*');
      await knex('marketplace').where('id', parseInt(marketId)).update({"sold": true, "current_price": bidAmount})
      await knex('item').where('id', itemId).update({'owner' : userId, 'lazymint': false});

      await knex('activity').insert({
        'from': sellerId,
        'to': userId,
        'item_id': itemId,
        'market_id': marketId,
        'order_id': orderId,
        'bid_id': id[0],
        'bid_amount': bidAmount,
        'sales_token_contract': '0x',
        'tx_hash': txHash,
        'status': 'sold'
      }).returning('id');

      await knex('activity').insert({
        'from': userId,
        'to': sellerId,
        'item_id': itemId,
        'market_id': marketId,
        'order_id': orderId,
        'bid_id': id[0],
        'bid_amount': bidAmount,
        'sales_token_contract': '0x',
        'tx_hash': txHash,
        'status': 'purchased'
      }).returning('id');

      const noticeId = await knex('notification').insert({
        'user_id':parseInt(sellerId),
        'item_id':parseInt(itemId),
        'message': 'Item was sold',
        'read': false
      }).returning('id')
      const noticeData = await getNotificationById(noticeId[0])
      request.io.emit('notification', noticeData);

      response.status(HttpStatusCodes.CREATED).send(`Item successfully sold`);
    }
    catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Buy now error, ${err}`);
    }
  }
}


module.exports = {
  getById,
  getByMarketId,
  getByUserId,
  getActiveBidByUserId,
  getOfferByItemId,
  listItem,
  unListItem,
  placeBid,
  makeOffer,
  withdrawBid,
  withdrawOffer,
  acceptBid,
  acceptOffer,
  buyNow,
  claimNFT,
  changePrice
}