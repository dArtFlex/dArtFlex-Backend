var HttpStatusCodes = require("http-status-codes");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);

const fillItems = async (items) => {
	return await Promise.all(
		items.map(async (item) => {
			const hashtag = await knex("hashtag_item")
				.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
				.where("hashtag_item.item_id", item.id);

			const metadataId = item["uri"].split("get/").pop();
			const metadata = await knex("metadata")
				.where("id", parseInt(metadataId))
				.orderBy("id", "DESC")
				.select("*");

			const marketplace = await knex("marketplace")
				.where("item_id", item.id)
				.orderBy("id", "DESC")
				.select("*");

			const bid = await knex("bid")
				.where("item_id", item.id)
				.orderBy("id", "DESC")
				.select("*");

			item["metadata"] = metadata[0];
			item["hashtag"] = hashtag || null;
			item["hashtags"] = hashtag.map((tag) => tag.name);
			item["marketplace"] = marketplace || null;

			item["bid"] = bid;

			return item;
		})
	);
};

const getProfile = async (request, response) => {
	try {
		let { wallet, filter, chain_id, search, offset, limit, order } =
			request.query;

		if (!order) order = "DESC";

		if (!wallet) {
			response
				.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
				.send("Wallet not specified");
			return;
		}

		const users = await knex("users")
			.where({ wallet: wallet.toLowerCase() })
			.select("*");

		if (users.length == 0) {
			response
				.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
				.send("User now exist");
			return;
		}

		const user = users[0];

		// All user items where user are creator or owner
		let userItems = await knex("item")
			.where({ creator: user.id })
			.orWhere({ owner: user.id })
			.select("*")
			.then(fillItems);

		// chain_id and search filters
		if (chain_id) {
			userItems = userItems.filter((item) => item.chain_id == chain_id);
		}
		if (search) {
			const match = (value) => {
				if (String(value) == undefined || String(value) == null) {
					return null;
				}
				return String(value).match(new RegExp(search, "gi"));
			};

			userItems = userItems.filter((item) => {
				if (
					match(item?.metadata?.name) ||
					match(user?.id) ||
					match(user?.wallet)
				) {
					return true;
				}
			});
		}

		switch (filter) {
			case "in_wallet":
				let inWalletItems = userItems.filter((item) => {
					if (item.owner == user.id) {
						return true;
					}
				});
				user["items"] = userItems;
				break;

			case "created":
				let createdItems = userItems.filter((item) => {
					if (
						item.creator == String(user.id) &&
						item.owner == String(user.id)
					) {
						return true;
					}
				});
				user["items"] = createdItems;
				break;
			case "collected":
				let collectedItems = userItems.filter((item) => {
					if (item.creator != String(user.id)) {
						return true;
					}
				});
				user["items"] = collectedItems;
				break;
			case "sold":
				// This cant return sold item if it not created and owned by user
				// let soldItems = userItems.filter((item) => {
				// 	if (item?.marketplace[0]?.sold == true) {
				// 		return true;
				// 	}
				// });
				// user["items"] = soldItems;

				let userBids = await knex("bid")
					.where({ user_id: user.id })
					.andWhere({ status: "listed" })
					.select("*");

				let uniqItemsId = [...new Set(userBids.map((bid) => bid.item_id))];
				let soldItems = await knex("item")
					.whereIn("id", uniqItemsId)
					.andWhereNot("owner", user.id)
					.select("*")
					.then(fillItems);
				user["items"] = soldItems;
				break;
			default:
				user["items"] = userItems;
				break;
		}

		// Pagination

		if (order == "DESC") {
			user["items"] = user["items"].sort((a, b) => (a.id < b.id ? 1 : -1));
		}
		if (order == "ASC") {
			user["items"] = user["items"].sort((a, b) => (a.id < b.id ? -1 : 1));
		}

		if (offset || limit) {
			_offset = offset ? offset : 0;
			_limit = limit ? limit : user["items"].length;

			let _start = parseInt(_offset);
			let _end = parseInt(_offset + _limit);

			user["items"] = user["items"].slice(_start, _end);
		}

		response.status(HttpStatusCodes.ACCEPTED).send(user);
	} catch (err) {
		console.log(err);
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by token Id, ${err}`);
	}
};

module.exports = {
	getProfile,
};
