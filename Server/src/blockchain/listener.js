require("dotenv").config();
const Web3 = require("web3");
const abi = require("./abi/ERC721.json");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);
const logger = require("../utilities/logger-blockchain");
const _ = require("lodash");
const {
	buyNowService,
	acceptBidService,
	// Accept offer looks the same as acceptBidService
	acceptOfferService,
} = require("../controller/BidController");

const { getNotificationById } = require("../controller/NotificationController");

const config = {
	contracts: {
		bsc: process.env.BSC_721,
		bsc_testnet: process.env.BSC_TESTNET_721,
		polygon: process.env.POLYGON_721,
		rinkeby: process.env.RINKEBY_721,
	},
	rpc: {
		bsc: process.env.BSC_RPC,
		bsc_testnet: process.env.BSC_TESTNET_RPC,
		polygon: process.env.POLYGON_RPC,
		rinkeby: process.env.RINKEBY_RPC,
	},
};

// Initialize providers
const web3Bsc = new Web3(new Web3.providers.HttpProvider(config.rpc.bsc));
const web3BscTestnet = new Web3(
	new Web3.providers.HttpProvider(config.rpc.bsc_testnet)
);
const web3Polygon = new Web3(
	new Web3.providers.HttpProvider(config.rpc.polygon)
);
const web3Rinkeby = new Web3(
	new Web3.providers.HttpProvider(config.rpc.rinkeby)
);

// Initialize contracts
const contractBsc = new web3Bsc.eth.Contract(abi, config.contracts.bsc);
const contractBscTestnet = new web3BscTestnet.eth.Contract(
	abi,
	config.contracts.bsc_testnet
);

const contractPolygon = new web3Polygon.eth.Contract(
	abi,
	config.contracts.polygon
);
const contractRinkeby = new web3Rinkeby.eth.Contract(
	abi,
	config.contracts.rinkeby
);

class Monitoring {
	constructor(options) {
		this.web3 = new Web3(new Web3.providers.HttpProvider(options.rpc));
		this.contract = new this.web3.eth.Contract(
			options.abi,
			options.contractAddress
		);
		this.name = options.name;
		this.poolingTimeout = options.poolingTimeout;
		this.io = options.io;

		if (
			!["eth", "rinkeby", "bsc", "bsc_testnet", "polygon"].includes(this.name)
		) {
			throw new Error("Incorrect name");
		}
	}
	async notice(fullInfo, noticeData) {
		let { buyer, seller, item } = fullInfo;

		const keys = this.io.sockets.sockets.keys();
		for (var key of keys) {
			let socket = this.io.sockets.sockets.get(key);

			// Notify buyer
			if (socket.handshake.query.userId == parseInt(buyer.id)) {
				socket.emit("notification", {
					user_id: parseInt(buyer.id),
					item_id: parseInt(item.id),
					message: "Congratulations on your successful purchase!",
					read: false,
				});
			}

			// Notify seller
			if (socket.handshake.query.userId == parseInt(seller.id)) {
				socket.emit("notification", {
					user_id: parseInt(seller.id),
					item_id: parseInt(item.id),
					message: "Item was sold",
					read: false,
				});
			}
		}
	}

	async getFullInfo(_fromWallet, _toWallet, tokenId) {
		let item = await knex("item")
			.where({ token_id: tokenId })
			.select("*")
			.first();

		let seller = await knex("users").where({ id: item.owner }).first();

		let buyer = await knex("users")
			.where({ wallet: _toWallet.toLowerCase() })
			.first();

		let marketplace = await knex("marketplace")
			.where({ item_id: item.id })
			.orderBy("created_at", "DESC")
			.first();

		let bid = await knex("bid")
			.where({ item_id: item.id })
			.select("*")
			.orderBy("created_at", "DESC")
			.first();

		if (!item || !seller || !buyer || !marketplace || !bid) {
			throw new Error("Not enough data in getFullInfo");
		}

		let data = {
			item,
			seller,
			buyer,
			marketplace,
			bid,
		};

		return data;
	}

	async saveBlockNumber(newBlock) {
		//logger.info(`${this.name} new pointer: ${newBlock}`);
		await knex(`${this.name}_pointer`).update({ last_block: newBlock });
	}

	async getLastHandledBlockNumber() {
		let pointer = await knex(`${this.name}_pointer`).select("*").first();
		return pointer.last_block;
	}

	async getLastTxHash() {
		return await knex("activity")
			.whereNotNull("tx_hash")
			.select("*")
			.orderBy("id", "DESC")
			.first()
			.then((activity) => activity.tx_hash);
	}

	async getEvents(_fromBlock, _toBlock) {
		let fromBlock = _fromBlock || (await this.getLastHandledBlockNumber());
		let toBlock = _toBlock || (await this.web3.eth.getBlockNumber());

		if (toBlock - fromBlock > 1000) {
			logger.info(
				`${this.name} Fix blocks range...  Get only 1000 blocks from last known block`
			);
			toBlock = fromBlock + 1000;
		}

		let events = await this.contract.getPastEvents("Transfer", {
			fromBlock: fromBlock,
			toBlock: toBlock,
		});

		return {
			fromBlock,
			toBlock,
			events,
		};
	}

	async needToSkip(txHash, tokenId) {
		// If activity with this hash exist - skip
		const activities = await knex("activity").where({ tx_hash: txHash });
		if (activities.length > 0) return true;

		// If item with this tokenId not exist - skip(maybe another database)
		let item = await knex("item").where({ token_id: tokenId }).first();
		if (!item) return true;

		return false;
	}

	async handle() {
		try {
			let { fromBlock, toBlock, events } = await this.getEvents();

			logger.info(
				`${this.name} From block ${fromBlock}, To block ${toBlock}, Events length ${events.length}`
			);
			for (var i = 0; i < events.length; i++) {
				const event = events[i];
				const {
					from: _fromWallet,
					to: _toWallet,
					tokenId,
				} = event.returnValues;
				const txHash = event.transactionHash.toLowerCase();

				// Check if events actual or we need to skip this event
				let needToSkip = await this.needToSkip(txHash, tokenId);
				if (needToSkip) {
					logger.info(
						`${this.name} skip event in blockNumber ${event.blockNumber}`
					);
					continue;
				} else {
					logger.info(
						`${this.name} Unhandled event: \n${JSON.stringify(event, false, 2)}`
					);

					// Prepare data for controller
					let fullInfo = await this.getFullInfo(
						_fromWallet,
						_toWallet,
						tokenId
					);

					// If not pending - buy now. Else - auction;
					if (fullInfo.bid.status != "pending") {
						let _data = {
							orderId: String(0),
							itemId: String(fullInfo.item.id),
							userId: String(fullInfo.buyer.id),
							sellerId: String(fullInfo.seller.id),
							marketId: String(fullInfo.marketplace.id),
							bidAmount: String(fullInfo.bid.bid_amount),
							txHash: txHash,
						};
						// Run controller
						let notificationData = await buyNowService(_data);

						// Run notification
						await this.notice(fullInfo, notificationData);
					} else {
						let _data = {
							id: String(fullInfo.bid.id),
							sellerId: String(fullInfo.seller.id),
							txHash: txHash,
						};
						// Run controller
						let notificationData = await acceptBidService(_data);

						// Run notification
						await this.notice(fullInfo, notificationData);
					}
				}
			}
			// Save new handled block to pointer
			await this.saveBlockNumber(toBlock);
		} catch (err) {
			logger.error(`${this.name} ${err.stack}`);
		}
	}

	launch() {
		logger.info(`Start listening events in chain ${this.name}`);
		this.handle();
		setInterval(() => {
			this.handle();
		}, this.poolingTimeout);
	}
}

module.exports = async (io) => {
	const monitoringRinkeby = new Monitoring({
		name: "rinkeby",
		rpc: config.rpc.rinkeby,
		contractAddress: config.contracts.rinkeby,
		abi: abi,
		poolingTimeout: 1000 * 30,
		io,
	});

	const monitoringBsc = new Monitoring({
		name: "bsc",
		rpc: config.rpc.bsc,
		contractAddress: config.contracts.bsc,
		abi: abi,
		poolingTimeout: 1000 * 30,
		io,
	});

	const monitoringBscTestnet = new Monitoring({
		name: "bsc_testnet",
		rpc: config.rpc.bsc_testnet,
		contractAddress: config.contracts.bsc_testnet,
		abi: abi,
		poolingTimeout: 1000 * 30,
		io,
	});

	const monitoringPolygon = new Monitoring({
		name: "polygon",
		rpc: config.rpc.polygon,
		contractAddress: config.contracts.polygon,
		abi: abi,
		poolingTimeout: 1000 * 30,
		io,
	});

	monitoringRinkeby.launch();
	monitoringBsc.launch();
	monitoringBscTestnet.launch();
	monitoringPolygon.launch();
};
