var express = require('express');
var HttpStatusCodes = require('http-status-codes');
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)


const getById = async (request, response) => {
  const id = parseInt(request.params.id)
  try{
    const result = await knex('order').where("id", id).select("*")

    const order = {
      data: result[0].data,
      dataType: result[0].type,
      maker: result[0].maker,
      makeAsset: {
        "assetType": {
          "assetClass": result[0].make_asset_type_class, 
          "data": result[0].make_asset_type_data
        },
        "value": result[0].make_asset_value,
      },
      taker: result[0].taker,
      takeAsset: {
        "assetType": {
          "assetClass": result[0].take_asset_type_class, 
          "data": result[0].take_asset_type_data
        },
        "value": result[0].take_asset_value,
      },
      start: result[0].start,
      end: result[0].end,
      salt: result[0].salt,
      signature: result[0].signature
    }

    response.status(HttpStatusCodes.ACCEPTED).send(order);
  }
  catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Get order by Id, ${err}`);
  }
}

const create = async (request, response) => {
  const { maker, makeAssetTypeClass , makeAssetTypeData , makeAssetValue, taker, takeAssetTypeClass , takeAssetTypeData , takeAssetValue, salt, start, end, dataType, data, signature  } = request.body

  const inputData = {
    "maker": maker, 
    "make_asset_type_class": makeAssetTypeClass,
    "make_asset_type_data": makeAssetTypeData,
    "make_asset_value": makeAssetValue,
    "taker": taker, 
    "take_asset_type_class": takeAssetTypeClass,
    "take_asset_type_data": takeAssetTypeData,
    "take_asset_value": takeAssetValue,
    "start": start,
    "end": end,
    "salt": salt,
    "type": dataType,
    "data": data,
    "signature": signature,
  };

  try{
    const id = await knex('order').insert(inputData).returning('id');
    response.status(HttpStatusCodes.CREATED).send(`Data Added Successfuly, id: ${id}`);
  }
  catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(`Error Create order, ${err}`);
  };
}

module.exports = {
  getById,
  create
}