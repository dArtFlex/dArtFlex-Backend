var express = require("express");
var HttpStatusCodes = require("http-status-codes");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);
const BN = require("bn.js");
const web3 = require("web3");
// const {getNotificationById} = require('./NotificationController');
function paginate(array, page_size, page_number) {
	// human-readable page numbers usually start with 1, so we reduce 1 in the first argument
	return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function getCurrentTime() {
	const d = new Date();
	const n = d.getTime();
	return n;
}

const formatParams = (request) => {
	let params = request.query;
	const _params = params;
	_params.where = {};

	// Basic item filters
	if (params.id) _params.where.id = params.id;
	if (params.contract) _params.where.contract = params.contract;
	if (params.token_id) _params.where.token_id = params.token_id;
	if (params.uri) _params.where.uri = params.uri;
	if (params.creator) _params.where.creator = params.creator;
	if (params.owner) _params.where.owner = params.owner;
	if (params.royalty) _params.where.royalty = params.royalty;
	if (params.royalty_fee) _params.where.royalty_fee = params.royalty_fee;
	if (params.signature) _params.where.signature = params.signature;
	if (params.ban) _params.where.ban = params.ban;
	if (params.lazymint) _params.where.lazymint = params.lazymint;
	if (params.chain_id) _params.where.chain_id = params.chain_id;

	if (
		params.hotOnly &&
		(params.hotOnly == "true" || params.hotOnly == "false")
	) {
		if (params.hotOnly == "true") {
			_params.hotOnly = true;
		} else if (params.hotOnly == "false") {
			_params.hotOnly = false;
		}
	}

	if (params.sold && (params.sold == "false" || params.sold == "true")) {
		if (params.sold == "true") {
			_params.sold = true;
		} else if (params.sold == "false") {
			_params.sold = false;
		}
	}
	if (params.filter) _params.filter = params.filter;
	if (params.search) _params.search = params.search;

	_params.offset = params.offset ? params.offset : 0;
	_params.order = params.order ? params.order : "DESC";
	_params.limit = params.limit ? params.limit : 20;

	return _params;
};

const getItem = async (request, response) => {
	const getCurrentTime = () => {
		const d = new Date();
		const n = d.getTime();
		return n;
	};

	try {
		//throw new Error("Fuck");
		let params = formatParams(request);
		const items = await knex("item")
			.where(params.where)
			.select("*")
			.orderBy("created_at", params.order);

		const rawData = await Promise.all(
			items.map(async (item) => {
				const hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);

				const metadataId = item["uri"].split("get/").pop();
				const metadata = await knex("metadata")
					.where("id", parseInt(metadataId))
					.orderBy("id", params.order)
					.limit(1)
					.select("*");

				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", params.order)
					.limit(1)
					.select("*");

				const bid = await knex("bid")
					.where("item_id", item.id)
					.orderBy("id", params.order)
					.limit(1)
					.select("*");

				var user = [];
				if (bid.length > 0) {
					user = await knex("users").where("id", bid[0]["user_id"]);
				} else {
					user = await knex("users").where("users.id", item.owner);
				}

				item["hashtag"] = hashtag || null;
				item["hashtags"] = hashtag.map((tag) => tag.name);
				item["marketplace"] = marketplace[0] || null;
				item["metadata"] = metadata[0] || null;
				item["bid"] = bid[0] || null;
				item["user"] = user[0] || null;
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;

				return item;
			})
		);

		var result = [];
		for (var i = 0; i < rawData.length; i++) {
			let item = rawData[i];

			// Price filter
			if (params.fromPrice && params.toPrice) {
				if (!item.marketplace) continue;
				var startPrice =
					item.marketplace.current_price > 0
						? item.marketplace.current_price
						: item.marketplace.start_price;

				const _startPrice = new BN(startPrice);
				const _priceFrom = new BN(web3.utils.toWei(params.fromPrice));
				const _priceTo = new BN(web3.utils.toWei(params.toPrice));

				if (
					(_priceFrom.gtn(0) &&
						_priceTo.eqn(0) &&
						_startPrice.lt(_priceFrom)) ||
					(_priceFrom.eqn(0) && _priceTo.gtn(0) && _startPrice.gt(_priceTo)) ||
					(_priceFrom.gtn(0) &&
						_priceTo.gtn(0) &&
						_startPrice.lt(_priceFrom)) ||
					(_priceFrom.gtn(0) && _priceTo.gtn(0) && _startPrice.gt(_priceTo))
				) {
					continue;
				}
			}

			// Status filter
			if (params.status) {
				if (!item.bid) continue;
				if (item.bid.status !== params.status) continue;
			}
			// Auction filter(type and sold)
			if (params.type) {
				if (!item.marketplace) continue;
				if (item.marketplace.type !== params.type) continue;
			}
			// Sold filter
			if (params.sold == true || params.sold == false) {
				if (!item.marketplace) continue;
				if (item.marketplace.sold !== params.sold) continue;
			}

			// Hashtag filter
			if (params.hashtags) {
				if (!item.hashtags || item.hashtags.lenth == 0) continue;
				let containHashtags = params.hashtags.every((elem) => {
					return item.hashtags.includes(elem);
				});
				if (!containHashtags) continue;
			}
			// Hot only
			if (params.hotOnly) {
				if (!item.marketplace) continue;
				let createdTime = new Date(item.marketplace.created_at).getTime();
				let timeNow = getCurrentTime();
				if (
					timeNow - createdTime < 1000 * 60 * 60 &&
					timeNow - createdTime > 0
				) {
					item.hot = true;
				} else {
					item.hot = false;
					continue;
				}
			}

			// Search filter
			if (params.search && params.search.length > 0) {
				const search = params.search;

				const match = (value) => {
					if (String(value) == undefined || String(value) == null) {
						return null;
					}
					return String(value).match(new RegExp(search, "gi"));
				};

				if (
					match(item?.metadata?.name) ||
					match(item?.user?.id) ||
					match(item?.user?.wallet)
				) {
					// pass
				} else {
					continue;
				}
			}

			// ending soon
			if (params.endingSoon) {
				if (item.marketplace.end_time != null) {
				}
			}

			result.push(item);
		}

		if (params.filter) {
			if (params.filter == "ending_soon") {
				result = result.sort((item1, item2) => {
					let item1EndTime = item1?.marketplace?.end_time;
					let item2EndTime = item2?.marketplace?.end_time;

					if (!item1EndTime && item2EndTime) {
						return 1;
					}
					if (item1EndTime && !item2EndTime) {
						return -1;
					}

					if (parseFloat(item1EndTime) > parseFloat(item2EndTime)) {
						return 1;
					} else {
						return -1;
					}
				});
			}
			if (params.filter == "recently_listed") {
				result = result.sort((item1, item2) => {
					let item1Created = new Date(item1.created_at).getTime();
					let item2Created = new Date(item2.created_at).getTime();

					if (item1Created > item2Created) {
						return -1;
					} else {
						return 1;
					}
				});
			}
			if (params.filter == "high_to_low") {
				result = result.sort((item1, item2) => {
					if (!item1.marketplace) {
						return 1;
					}
					if (!item2.marketplace) {
						return -1;
					}
					let item1Price =
						parseFloat(item1.marketplace.current_price) >
						parseFloat(item1.marketplace.start_price)
							? parseFloat(item1.marketplace.current_price)
							: parseFloat(item1.marketplace.start_price);
					let item2Price =
						parseFloat(item2.marketplace.current_price) >
						parseFloat(item2.marketplace.start_price)
							? parseFloat(item2.marketplace.current_price)
							: parseFloat(item2.marketplace.start_price);

					if (item1Price > item2Price) {
						return -1;
					} else {
						return 1;
					}
				});
			}
			if (params.filter == "low_to_high") {
				result = result.sort((item1, item2) => {
					if (!item1.marketplace) {
						return 1;
					}
					if (!item2.marketplace) {
						return -1;
					}
					let item1Price =
						parseFloat(item1.marketplace.current_price) >
						parseFloat(item1.marketplace.start_price)
							? parseFloat(item1.marketplace.current_price)
							: parseFloat(item1.marketplace.start_price);
					let item2Price =
						parseFloat(item2.marketplace.current_price) >
						parseFloat(item2.marketplace.start_price)
							? parseFloat(item2.marketplace.current_price)
							: parseFloat(item2.marketplace.start_price);

					if (item1Price > item2Price) {
						return 1;
					} else {
						return -1;
					}
				});
			}
		}

		let data = result.slice(params.offset, params.offset + params.limit);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Request failed`);
	}
};

const isHot = (end_time) => {
	let lifeTime = end_time - getCurrentTime();
	if (lifeTime < 900000 && lifeTime > 0) {
		return true;
	}
};

const getById = async (request, response) => {
	const id = parseInt(request.params.id);
	const { page, limit } = request.query;
	const offset = limit * (page - 1);
	try {
		const items = await knex("item")
			.where("id", id)
			.select("*")
			.orderBy("created_at", "DESC")
			.offset(offset)
			.limit(limit);
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				item["hashtag"] = hashtag;
				item["marketplace"] = marketplace;
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;
				return item;
			})
		);

		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by Id, ${err}`);
	}
};

const getByTokenId = async (request, response) => {
	const id = request.params.id;
	const { page, limit } = request.query;
	const offset = limit * (page - 1);
	try {
		const items = await knex("item")
			.where("token_id", id)
			.select("*")
			.orderBy("created_at", "DESC")
			.offset(offset)
			.limit(limit);
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				item["hashtag"] = hashtag;
				item["marketplace"] = marketplace;
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;
				return item;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by token Id, ${err}`);
	}
};

const getByOwner = async (request, response) => {
	const owner = request.params.id;
	const { page, limit } = request.query;
	const offset = limit * (page - 1);
	try {
		const items = await knex("item")
			.where("owner", owner)
			.select("*")
			.orderBy("created_at", "DESC")
			.offset(offset)
			.limit(limit);
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				item["hashtag"] = hashtag;
				item["marketplace"] = marketplace;
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;
				return item;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by owner, ${err}`);
	}
};

const getByCreator = async (request, response) => {
	const creator = request.params.id;
	const { page, limit } = request.query;
	const offset = limit * (page - 1);
	try {
		const items = await knex("item")
			.where("creator", creator)
			.select("*")
			.orderBy("created_at", "DESC")
			.offset(offset)
			.limit(limit);
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				item["hashtag"] = hashtag;
				item["marketplace"] = marketplace;
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;
				return item;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};

const getSalesDataByUser = async (request, response) => {
	const owner = request.params.id;
	try {
		const items = await knex("item")
			.where("owner", owner)
			.select("*")
			.orderBy("created_at", "DESC");
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				const metadataId = item["uri"].split("get/").pop();
				const imageUrl = await knex("metadata")
					.where("id", parseInt(metadataId))
					.select("*");
				if (imageUrl.length > 0) {
					item["image_name"] = imageUrl[0]["name"];
					item["image_url"] = imageUrl[0]["image"];
				} else {
					item["image_url"] = "";
					item["image_name"] = "";
				}
				let highestBid = [];
				let listedBid = [];
				if (marketplace.length > 0) {
					if (!marketplace[0]["sold"]) {
						highestBid = await knex("bid")
							.where("market_id", marketplace[0]["id"])
							.andWhere("status", "pending")
							.select("*");
					}
					if (marketplace[0].sold && item.lock) {
						listedBid = await knex("bid")
							.where("market_id", marketplace[0]["id"])
							.andWhere("status", "listed")
							.select("*");
					}
				}
				const highestOffer = await knex("bid")
					.where("item_id", item.id)
					.andWhere("status", "like", "offered")
					.select("*");
				item["highest_offer"] = highestOffer;
				item["highest_bid"] = highestBid;
				item["listed_bid"] = listedBid;
				item["marketplace"] = marketplace;
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;
				if (
					!(
						highestOffer.length == 0 &&
						highestBid.length == 0 &&
						marketplace.length == 0
					)
				)
					return item;
				return;
			})
		);
		response
			.status(HttpStatusCodes.ACCEPTED)
			.send(data.filter((_data) => _data != null));
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};

const getBidAndOfferDataByUser = async (request, response) => {
	const userId = request.params.id;
	try {
		const bids = await knex("bid")
			.whereIn("status", ["pending", "offered"])
			.andWhere("user_id", userId)
			.select("*")
			.orderBy("created_at", "DESC");
		let data = [];
		data = await Promise.all(
			bids.map(async (bid) => {
				const marketplace = await knex("marketplace")
					.where("id", bid["market_id"])
					.select("*");
				let itemData = await knex("item")
					.where("id", bid["item_id"])
					.select("*");
				const metadataId = itemData[0]["uri"].split("get/").pop();
				const imageUrl = await knex("metadata")
					.where("id", parseInt(metadataId))
					.select("*");
				if (imageUrl.length > 0) {
					itemData[0]["image_name"] = imageUrl[0]["name"];
					itemData[0]["image_url"] = imageUrl[0]["image"];
				} else {
					itemData[0]["image_url"] = "";
					itemData[0]["image_name"] = "";
				}
				itemData[0]["highest_bid"] = [];
				itemData[0]["highest_offer"] = [];
				if (bid.status == "pending") itemData[0]["highest_bid"].push(bid);
				else itemData[0]["highest_offer"].push(bid);
				itemData[0]["marketplace"] = marketplace;

				if (itemData[0].lazymint)
					itemData[0][
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${itemData[0].contract}?a=${itemData[0]["token_id"]}#inventory`;
				else itemData[0]["etherscan"] = ``;

				return itemData[0];
			})
		);
		response
			.status(HttpStatusCodes.ACCEPTED)
			.send(data.filter((_data) => _data != null));
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};

const getAuction = async (request, response) => {
	try {
		const { page, limit, search, sortBy, filters } = request.query;
		const parsedFilter = JSON.parse(filters);
		const hashtags = parsedFilter["hashtag"];
		const priceFrom = parsedFilter["priceFrom"];
		const priceTo = parsedFilter["priceTo"];
		const hotOnly = parsedFilter["hotOnly"];

		const items = await knex("item").select("*").orderBy("created_at", "DESC");
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				const metadataId = item["uri"].split("get/").pop();
				const imageUrl = await knex("metadata")
					.where("id", parseInt(metadataId))
					.andWhere("name", "like", `%${search}%`)
					.select("*");
				let hashtag = [];
				if (hashtags.length > 0) {
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.whereIn("hashtag.name", hashtags)
						.andWhere("hashtag_item.item_id", item.id);
					if (hashtag.length == 0) return;
				} else
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.where("hashtag_item.item_id", item.id);

				if (imageUrl.length == 0) {
					return;
				}
				item["hashtag"] = hashtag;
				item["image"] = imageUrl;
				item["marketplace"] = marketplace;

				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;

				if (marketplace.length > 0) {
					if (!marketplace[0]["sold"] && marketplace[0]["type"] == "auction") {
						if (hotOnly) {
							if (
								marketplace[0]["end_time"] - getCurrentTime() > 900000 &&
								marketplace[0]["end_time"] - getCurrentTime() < 0
							) {
								return;
							}
						}
						const startPrice =
							marketplace[0]["current_price"] > 0
								? marketplace[0]["current_price"]
								: marketplace[0]["start_price"];
						const _startPrice = new BN(startPrice);
						const _priceFrom = new BN(priceFrom);
						const _priceTo = new BN(priceTo);

						if (
							(_priceFrom.gtn(0) &&
								_priceTo.eqn(0) &&
								_startPrice.lt(_priceFrom)) ||
							(_priceFrom.eqn(0) &&
								_priceTo.gtn(0) &&
								_startPrice.gt(_priceTo)) ||
							(_priceFrom.gtn(0) &&
								_priceTo.gtn(0) &&
								_startPrice.lt(_priceFrom)) ||
							(_priceFrom.gtn(0) && _priceTo.gtn(0) && _startPrice.gt(_priceTo))
						) {
							return;
						}
						const bidData = await knex("bid")
							.where("market_id", marketplace[0]["id"])
							.andWhere("status", "listed")
							.select("*");
						item["user"] = [];
						if (bidData.length > 0) {
							const userData = await knex("users").where(
								"id",
								bidData[0]["user_id"]
							);
							item["user"] = userData;
						}
						return item;
					}
				}
				return;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(
			paginate(
				data.filter((_data) => _data != null),
				limit,
				page
			)
		);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};

const getBuyNow = async (request, response) => {
	try {
		const { page, limit, search, sortBy, filters } = request.query;
		const parsedFilter = JSON.parse(filters);
		const hashtags = parsedFilter["hashtag"];
		const priceFrom = parsedFilter["priceFrom"];
		const priceTo = parsedFilter["priceTo"];

		const items = await knex("item").select("*").orderBy("created_at", "DESC");
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				const metadataId = item["uri"].split("get/").pop();
				const imageUrl = await knex("metadata")
					.where("id", parseInt(metadataId))
					.andWhere("name", "like", `%${search}%`)
					.select("*");
				let hashtag = [];
				if (hashtags.length > 0) {
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.whereIn("hashtag.name", hashtags)
						.andWhere("hashtag_item.item_id", item.id);
					if (hashtag.length == 0) return;
				} else
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.where("hashtag_item.item_id", item.id);

				if (imageUrl.length == 0) {
					return;
				}
				item["hashtag"] = hashtag;
				item["image"] = imageUrl;

				item["marketplace"] = marketplace;

				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;

				if (marketplace.length > 0) {
					if (
						!marketplace[0]["sold"] &&
						marketplace[0]["type"] == "instant_buy"
					) {
						const startPrice =
							marketplace[0]["current_price"] > 0
								? marketplace[0]["current_price"]
								: marketplace[0]["start_price"];
						const _startPrice = new BN(startPrice);
						const _priceFrom = new BN(priceFrom);
						const _priceTo = new BN(priceTo);

						if (
							(_priceFrom.gtn(0) &&
								_priceTo.eqn(0) &&
								_startPrice.lt(_priceFrom)) ||
							(_priceFrom.eqn(0) &&
								_priceTo.gtn(0) &&
								_startPrice.gt(_priceTo)) ||
							(_priceFrom.gtn(0) &&
								_priceTo.gtn(0) &&
								_startPrice.lt(_priceFrom)) ||
							(_priceFrom.gtn(0) && _priceTo.gtn(0) && _startPrice.gt(_priceTo))
						) {
							return;
						}

						const bidData = await knex("bid")
							.where("market_id", marketplace[0]["id"])
							.andWhere("status", "listed")
							.select("*");
						item["user"] = [];
						if (bidData.length > 0) {
							const userData = await knex("users").where(
								"id",
								bidData[0]["user_id"]
							);
							item["user"] = userData;
						}
						return item;
					}
				}
				return;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(
			paginate(
				data.filter((_data) => _data != null),
				limit,
				page
			)
		);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};

const getSold = async (request, response) => {
	try {
		const { page, limit, search, sortBy, filters } = request.query;
		const parsedFilter = JSON.parse(filters);
		const hashtags = parsedFilter["hashtag"];
		const priceFrom = parsedFilter["priceFrom"];
		const priceTo = parsedFilter["priceTo"];

		const items = await knex("item").select("*").orderBy("created_at", "DESC");
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				const metadataId = item["uri"].split("get/").pop();
				const imageUrl = await knex("metadata")
					.where("id", parseInt(metadataId))
					.andWhere("name", "like", `%${search}%`)
					.select("*");
				let hashtag = [];
				if (hashtags.length > 0) {
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.whereIn("hashtag.name", hashtags)
						.andWhere("hashtag_item.item_id", item.id);
					if (hashtag.length == 0) return;
				} else
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.where("hashtag_item.item_id", item.id);

				if (imageUrl.length == 0) {
					return;
				}
				item["hashtag"] = hashtag;
				item["image"] = imageUrl;

				item["marketplace"] = marketplace;

				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;

				if (marketplace.length > 0) {
					if (marketplace[0]["sold"]) {
						const startPrice =
							marketplace[0]["current_price"] > 0
								? marketplace[0]["current_price"]
								: marketplace[0]["start_price"];
						const _startPrice = new BN(startPrice);
						const _priceFrom = new BN(priceFrom);
						const _priceTo = new BN(priceTo);

						if (
							(_priceFrom.gtn(0) &&
								_priceTo.eqn(0) &&
								_startPrice.lt(_priceFrom)) ||
							(_priceFrom.eqn(0) &&
								_priceTo.gtn(0) &&
								_startPrice.gt(_priceTo)) ||
							(_priceFrom.gtn(0) &&
								_priceTo.gtn(0) &&
								_startPrice.lt(_priceFrom)) ||
							(_priceFrom.gtn(0) && _priceTo.gtn(0) && _startPrice.gt(_priceTo))
						) {
							return;
						}

						const userData = await knex("users").where("id", item["owner"]);
						item["user"] = userData;
						return item;
					}
				}
				return;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(
			paginate(
				data.filter((_data) => _data != null),
				limit,
				page
			)
		);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};

const getFeatured = async (request, response) => {
	try {
		const { page, limit, search, sortBy, filters } = request.query;
		const parsedFilter = JSON.parse(filters);
		const hashtags = parsedFilter["hashtag"];
		const priceFrom = parsedFilter["priceFrom"];
		const priceTo = parsedFilter["priceTo"];

		const items = await knex("item").select("*").orderBy("created_at", "DESC");
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				const metadataId = item["uri"].split("get/").pop();
				const imageUrl = await knex("metadata")
					.where("id", parseInt(metadataId))
					.andWhere("name", "like", `%${search}%`)
					.select("*");
				let hashtag = [];
				if (hashtags.length > 0) {
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.whereIn("hashtag.name", hashtags)
						.andWhere("hashtag_item.item_id", item.id);
					if (hashtag.length == 0) return;
				} else
					hashtag = await knex("hashtag_item")
						.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
						.where("hashtag_item.item_id", item.id);

				if (imageUrl.length == 0) {
					return;
				}
				item["hashtag"] = hashtag;
				item["image"] = imageUrl;

				item["marketplace"] = marketplace;

				if (marketplace.length > 0) {
					const startPrice =
						marketplace[0]["current_price"] > 0
							? marketplace[0]["current_price"]
							: marketplace[0]["start_price"];
					const _startPrice = new BN(startPrice);
					const _priceFrom = new BN(priceFrom);
					const _priceTo = new BN(priceTo);

					if (
						(_priceFrom.gtn(0) &&
							_priceTo.eqn(0) &&
							_startPrice.lt(_priceFrom)) ||
						(_priceFrom.eqn(0) &&
							_priceTo.gtn(0) &&
							_startPrice.gt(_priceTo)) ||
						(_priceFrom.gtn(0) &&
							_priceTo.gtn(0) &&
							_startPrice.lt(_priceFrom)) ||
						(_priceFrom.gtn(0) && _priceTo.gtn(0) && _startPrice.gt(_priceTo))
					) {
						return;
					}
				}
				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;

				const userData = await knex("users").where("id", item.owner);
				item["user"] = userData;
				return item;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(
			paginate(
				data.filter((_data) => _data != null),
				limit,
				page
			)
		);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get item by creator, ${err}`);
	}
};
const getAll = async (request, response) => {
	try {
		const { page, limit } = request.query;
		const offset = limit * (page - 1);
		const items = await knex("item")
			.select("*")
			.orderBy("created_at", "DESC")
			.offset(offset)
			.limit(limit);
		let data = [];
		data = await Promise.all(
			items.map(async (item) => {
				const hashtag = await knex("hashtag_item")
					.innerJoin("hashtag", "hashtag_item.hashtag_id", "hashtag.id")
					.where("hashtag_item.item_id", item.id);
				const marketplace = await knex("marketplace")
					.where("item_id", item.id)
					.orderBy("id", "DESC")
					.limit(1)
					.select("*");
				item["hashtag"] = hashtag;
				item["marketplace"] = marketplace;

				if (!item.lazymint)
					item[
						"etherscan"
					] = `https://rinkeby.etherscan.io/token/${item.contract}?a=${item["token_id"]}#inventory`;
				else item["etherscan"] = ``;

				return item;
			})
		);
		response.status(HttpStatusCodes.ACCEPTED).send(data);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Get all item, ${err}`);
	}
};

const create = async (request, response) => {
	const {
		contract,
		tokenId,
		chainId,
		uri,
		creator,
		owner,
		royalty,
		royaltyFee,
		lazymint,
		signature,
		hashtagIdList,
	} = request.body;
	if (!contract || !tokenId || !uri || !creator || !owner || !chainId) {
		return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
	}

	const data = {
		contract,
		token_id: tokenId,
		chain_id: chainId,
		uri,
		creator,
		owner,
		royalty,
		royalty_fee: royaltyFee,
		lazymint,
		signature,
		ban: false,
	};

	try {
		const id = await knex("item").insert(data).returning("id");

		await Promise.all(
			hashtagIdList.map(async (hashId) => {
				await knex("hashtag_item").insert({
					hashtag_id: hashId,
					item_id: id[0],
				});
			})
		);

		const activityId = await knex("activity")
			.insert({
				from: 0,
				to: creator,
				item_id: id[0],
				market_id: 0,
				order_id: 0,
				bid_id: 0,
				bid_amount: 0,
				sales_token_contract: "0x",
				status: "minted",
			})
			.returning("id");

		response
			.status(HttpStatusCodes.CREATED)
			.send(`Data Added Successfuly, id: ${id}`);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error Create User, ${err}`);
	}
};

const update = async (request, response) => {
	const {
		id,
		contract,
		tokenId,
		uri,
		creator,
		owner,
		royalty,
		royaltyFee,
		lazymint,
		signature,
	} = request.body;
	if ((!id, !contract || !tokenId || !uri || !creator || !owner)) {
		return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
	}

	const data = {
		contract,
		token_id: tokenId,
		uri,
		creator,
		owner,
		royalty,
		royalty_fee: royaltyFee,
		lazymint,
		signature,
	};
	try {
		await knex("item").where("id", id).update(data);
		response.status(HttpStatusCodes.CREATED).send(`Data Updated Successfuly`);
	} catch (err) {
		return response
			.status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
			.send(`Error update item, ${err}`);
	}
};

module.exports = {
	getItem,
	getById,
	getAuction,
	getByTokenId,
	getByOwner,
	getByCreator,
	getSalesDataByUser,
	getBidAndOfferDataByUser,
	getFeatured,
	getAll,
	getBuyNow,
	getSold,
	create,
	update,
};
