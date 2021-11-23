var express = require("express");
var HttpStatusCodes = require("http-status-codes");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);

const tradeHistory = async (request, response) => {
	try {
		let params = request.query;
		if (!params.wallet) {
			throw new Error("Wallet not specified");
		}
		let user = await knex("users")
			.where({ wallet: params.wallet.toLowerCase() })
			.select("*")
			.first();

		if (!user) {
			throw new Error("User not found");
			return;
		}

		let activitiesRaw = await knex("activity")
			.where({ from: String(user.id) })
			.orWhere({ to: String(user.id) })
			.select("*")
			.orderBy("created_at", "DESC");

		let activities = activitiesRaw.reduce((accum, activity) => {
			let inAccum = accum.find((a) => a.item_id == activity.item_id);
			if (inAccum) {
				return accum;
			} else {
				accum.push(activity);
				return accum;
			}
		}, []);

		let data = await Promise.all(
			activities.map(async (activity) => {
				activity.fromUserData = await knex("users")
					.where({
						id: activity.from,
					})
					.first();
				activity.toUserData = await knex("users")
					.where({ id: activity.to })
					.first();

				if (!activity.fromUserData && activity.toUserData) {
					activity.fromUserData = activity.toUserData;
				} else if (activity.fromUserData && !activity.toUserData) {
					activity.toUserData = activity.fromUserData;
				}

				const item = await knex("item")
					.where({
						id: activity.item_id,
					})
					.first();
				const metadataId = item["uri"].split("get/").pop();
				activity.imageData = await knex("metadata")
					.where("id", parseInt(metadataId))
					.orderBy("id", "DESC")
					.select("*")
					.first();
				return activity;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error get Trading History, ${err}`);
	}
};

module.exports = {
	tradeHistory,
};
