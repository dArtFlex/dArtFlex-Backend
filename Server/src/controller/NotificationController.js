var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)

const getNotificationByUser = async (userId) => {
  try{

    const data = await knex('activity').rightJoin('notification', 'activity.id', 'notification.activity_id').where('notification.user_id', userId).andWhere('notification.read', false).select("*");
    return data;
  }
  catch(err) {
    console.log(err); 
    return [];
  }
}

const getNotificationById = async (id) => {
  try{

    const data = await knex('activity').rightJoin('notification', 'activity.id', 'notification.activity_id').where('notification.id', id).andWhere('notification.read', false).select("*");
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