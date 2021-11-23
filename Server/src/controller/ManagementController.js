var express = require("express");
var HttpStatusCodes = require("http-status-codes");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);

const match = (value, search) => {
	if (String(value) == undefined || String(value) == null) {
		return null;
	}
	return String(value).match(new RegExp(search, "gi"));
};

const getPromotions = async (request, response) => {
	try {
		let params = request.query;
		let offset = params.offset || 0;
		let limit = params.limit || 20;
		let order = params.order || "DESC";
		let chain_id = params.chain_id;

		let promotions = await knex("promotion")
			.offset(offset)
			.limit(limit)
			.orderBy("created_at", order)
			.select("*");

		let itemsRaw = await knex("item")
			.whereIn(
				"id",
				promotions.map((p) => p.item_id)
			)
			.select("*");

		let data = await Promise.all(
			itemsRaw.map(async (item) => {
				let promotionObject = {};
				promotionObject.marketData = {};
				promotionObject.ownerData = {};
				promotionObject.imageData = {};
				promotionObject.tokenData = {};

				promotionObject.marketData = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.first();

				promotionObject.ownerData = await knex("users")
					.where({ id: item.owner })
					.first();

				const metadataId = item["uri"].split("get/").pop();
				promotionObject.imageData = await knex("metadata")
					.where("id", parseInt(metadataId))
					.orderBy("id", "DESC")
					.first();

				promotionObject.tokenData = item;

				return promotionObject;
			})
		);

		if (chain_id) {
			data = data.filter((item) =>
				item?.tokenData?.chain_id == chain_id ? true : false
			);
		}

		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get all item, ${err}`);
	}
};

const getWorks = async (request, response) => {
	try {
		let params = request.query;
		let offset = params.offset || 0;
		let limit = params.limit || 20;
		let order = params.order || "DESC";
		let search = params.search || null;

		let itemsRaw = await knex("item").select("*");

		let items = await Promise.all(
			itemsRaw.map(async (item) => {
				item.hashtag = {};
				item.marketplace = {};
				item.creatorData = {};
				item.ownerData = {};
				item.imageData = {};

				item.hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);
				item.hashtags = item.hashtag.map((tag) => tag.name);

				item.marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.select("*")
					.first();

				item.creatorData = await knex("users")
					.where({ id: item.owner })
					.first();

				item.ownerData = await knex("users")
					.where({ id: item.creator })
					.first();

				const metadataId = item["uri"].split("get/").pop();
				item.imageData = await knex("metadata")
					.where("id", parseInt(metadataId))
					.orderBy("id", "DESC")
					.select("*")
					.first();

				return item;
			})
		);

		if (search && search.length > 0) {
			items = items.filter((item) => {
				if (
					match(item?.imageData?.name, search) ||
					match(item?.ownerData?.userid, search) ||
					match(item?.creatorData?.userid, search)
				) {
					return true;
				}
			});
		}

		let itemsSorted = items.sort((a, b) => {
			switch (order) {
				case "DESC":
					if (
						new Date(a.created_at).getTime() >= new Date(b.created_at).getTime()
					) {
						return -1;
					} else {
						return 1;
					}
					break;
				case "ASC":
					if (
						new Date(a.created_at).getTime() < new Date(b.created_at).getTime()
					) {
						return -1;
					} else {
						return 1;
					}
					break;
				case "a-z":
					if (a.imageData.name >= b.imageData.name) {
						return 1;
					} else {
						return -1;
					}
					break;
				case "z-a":
					if (a.imageData.name < b.imageData.name) {
						return 1;
					} else {
						return -1;
					}
					break;
				default:
					return 0;
					break;
			}
		});

		let data = itemsSorted.slice(offset, offset + limit);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get all item, ${err}`);
	}
};

const getUsers = async (request, response) => {
	try {
		let params = request.query;
		let offset = params.offset || 0;
		let limit = params.limit || 20;
		let order = params.order || "DESC";
		let search = params.search || null;

		var users = [];
		switch (order) {
			case "DESC":
				users = await knex("users")
					.offset(offset)
					.limit(limit)
					.orderBy("created_at", order)
					.select("*");
				break;
			case "ASK":
				users = await knex("users")
					.offset(offset)
					.limit(limit)
					.orderBy("created_at", order)
					.select("*");
				break;
			case "a-z":
				users = await knex("users")
					.offset(offset)
					.limit(limit)
					.orderBy("fullname", "ASK")
					.select("*");
				break;
			case "z-a":
				users = await knex("users")
					.offset(offset)
					.limit(limit)
					.orderBy("fullname", "DESK")
					.select("*");
				break;
			default:
				users = await knex("users")
					.offset(offset)
					.limit(limit)
					.orderBy("created_at", DESC)
					.select("*");
				break;
		}

		if (search && search.length > 0) {
			users = users.filter((user) => {
				if (match(user?.fullname, search) || match(user?.userid, search)) {
					return true;
				}
			});
		}

		response.status(HttpStatusCodes.ACCEPTED).send(users);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get all item, ${err}`);
	}
};

module.exports = {
	getPromotions,
	getWorks,
	getUsers,
};
