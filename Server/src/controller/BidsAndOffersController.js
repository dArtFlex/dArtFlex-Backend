var express = require("express");
var HttpStatusCodes = require("http-status-codes");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);

const bidsAndOffers = async (request, response) => {
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

		let bids = await knex("bid")
			.where({ user_id: String(user.id) })
			.andWhere({ status: "pending" })
			.orWhere({ status: "offered" })
			.select("*");

		let data = await Promise.all(
			bids.map(async (bid) => {
				let item = await knex("item").where({ id: bid.item_id }).first();

				const metadataId = item["uri"].split("get/").pop();
				bid.imageData = await knex("metadata")
					.where("id", parseInt(metadataId))
					.select("*")
					.first();

				bid.marketData = await knex("marketplace")
					.where({ id: bid.market_id })
					.orderBy("created_at", "DESC")
					.select("*")
					.first();

				bid.ownerProfile = await knex("users")
					.andWhere({ id: item.owner })
					.first();

				bid.ownerData = await knex("bid")
					.where({ item_id: item.id })
					.andWhere({ user_id: item.owner })
					.first();

				return bid;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error get bids and offers, ${err}`);
	}
};

module.exports = {
	bidsAndOffers,
};
