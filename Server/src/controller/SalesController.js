var express = require("express");
var HttpStatusCodes = require("http-status-codes");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);

const sales = async (request, response) => {
	try {
		let params = request.query;
		let user = await knex("users")
			.where({ wallet: params.wallet.toLowerCase() })
			.select("*")
			.first();

		if (!user) {
			throw new Error("User not found");
			return;
		}

		let marketplaces = await knex("marketplace")
			.where({ sold: false })
			.select("*");

		let bids = await knex("bid")
			.where({ user_id: user.id })
			.andWhere(function () {
				this.where("status", "offered").orWhere("status", "listed");
			})
			.select("*");

		let itemsRaw = await knex("item").where({ owner: user.id }).select("*");

		let itemsFilled = await Promise.all(
			itemsRaw.map(async (item) => {
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.first();

				const bid = await knex("bid")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.first();
				item.marketplace = marketplace;
				item.bid = bid;
				return item;
			})
		);
		let items = itemsFilled.filter((item) => {
			if (item?.bid?.status == "offered" || item?.marketplace?.sold == false) {
				return true;
			}
		});
		let data = await Promise.all(
			items.map(async (item) => {
				const metadataId = item["uri"].split("get/").pop();
				item.metadata = await knex("metadata")
					.where("id", parseInt(metadataId))
					.orderBy("id", "DESC")
					.first();
				return item;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error get sold items, ${err}`);
	}
};

module.exports = {
	sales,
};
