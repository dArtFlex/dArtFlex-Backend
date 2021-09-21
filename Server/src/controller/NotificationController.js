var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)

const getNotificationByUser = async (userId) => {
  try{

    const notifications = await knex('notification').where("user_id", userId).select("*");
    console.log('notifications', notifications);
    let data = [];
    data = await Promise.all(notifications.map(async(notification) => {
      const item = await knex('item').where('id', notification['item_id']);
      if(item.length == 0) 
      {
        notification['image_url'] = '';
        return notification;
      }
      else {
        const metadataId = item[0]['uri'].split('get/').pop();
        console.log(metadataId)
        const imageUrl = await knex('metadata').where('id', parseInt(metadataId)).select("*");
        notification['image_url'] = imageUrl[0]['image'];
        return notification;
      }
      
    }));
    return data;
  }
  catch(err) {
    console.log(err); 
    return [];
  }
}

const getNotificationById = async (id) => {
  try{

    const notifications = await knex('notification').where("id", id).select("*");
    let data = [];
    data = await Promise.all(notifications.map(async(notification) => {
      const item = await knex('item').where('id', notification['item_id']);
      if(item.length == 0) 
      {
        notification['image_url'] = '';
        return notification;
      }
      else {
        const metadataId = item[0]['uri'].split('get/').pop();
        const imageUrl = await knex('metadata').where('id', parseInt(metadataId)).select("*");
        notification['image_url'] = imageUrl[0]['image'];
        return notification;
      }
      
    }));
    return data;
  }
  catch(err) {
    console.log(err); 
    return [];
  }
}

const updateNotificationStatus = async (id, read) => {
  try {
    await knex('notification').where('id', id).update({'read' : read});
    return ;
  }
  catch (err) {
    return ;
  }
}


module.exports = {
  getNotificationByUser,
  getNotificationById,
  updateNotificationStatus
}