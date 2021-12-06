require("dotenv").config();
const Web3 = require("web3");
const abi = require("./abi/ERC721.json");
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);
const logger = require("../utilities/logger");
const _ = require("lodash");
const {
	buyNowService,
	acceptBidService,
} = require("../controller/BidController");

const config = {
	contracts: {
		bsc: process.env.BSC_721,
		bscTestnet: process.env.BSC_TESTNET_721,
		polygon: process.env.POLYGON_721,
		ethRinkeby: process.env.RINKEBY_721,
	},
	rpc: {
		bsc: process.env.BSC_RPC,
		bscTestnet: process.env.BSC_TESTNET_RPC,
		polygon: process.env.POLYGON_RPC,
		ethRinkeby: process.env.RINKEBY_RPC,
	},
};

// Initialize providers
const web3Bsc = new Web3(new Web3.providers.HttpProvider(config.rpc.bsc));
const web3BscTestnet = new Web3(
	new Web3.providers.HttpProvider(config.rpc.bscTestnet)
);
const web3Polygon = new Web3(
	new Web3.providers.HttpProvider(config.rpc.polygon)
);
const web3Rinkeby = new Web3(
	new Web3.providers.HttpProvider(config.rpc.ethRinkeby)
);

// Initialize contracts
const contractBsc = new web3Bsc.eth.Contract(abi, config.contracts.bsc);
const contractBscTestnet = new web3BscTestnet.eth.Contract(
	abi,
	config.contracts.bscTestnet
);
const contractPolygon = new web3Polygon.eth.Contract(
	abi,
	config.contracts.polygon
);
const contractRinkeby = new web3Rinkeby.eth.Contract(
	abi,
	config.contracts.ethRinkeby
);

class Monitoring {
	constructor(options) {
		this.web3 = new Web3(new Web3.providers.HttpProvider(options.rpc));
		this.contract = new web3Rinkeby.eth.Contract(
			options.abi,
			options.contractAddress
		);
		this.name = options.name;
		this.poolingTimeout = options.poolingTimeout;

		if (
			!["eth", "rinkeby", "bsc", "bsc_testnet", "polygon"].includes(this.name)
		) {
			throw new Error("Incorrect name");
		}
	}

	async getFullInfo(_fromWallet, _toWallet, tokenId) {
		console.log("get full info", _fromWallet, _toWallet, tokenId);
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

		//await knex("bid").select("*").then(console.log);
		let bid = await knex("bid")
			.where({ item_id: item.id })
			.select("*")
			.orderBy("created_at", "DESC")
			.first();
		//console.log(bid);

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
		console.log("newBlock", newBlock);
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

	async getEvents(_fromBlock = 0, _toBlock = null) {
		let fromBlock = _fromBlock || (await this.getLastHandledBlockNumber()) + 1;
		let toBlock = _toBlock || (await this.web3.eth.getBlockNumber());

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

		console.log(activities);

		// If item with this tokenId not exist - skip(maybe another database)
		let item = await knex("item").where({ token_id: tokenId }).first();
		if (!item) return true;

		return false;
	}

	async handle() {
		try {
			let { fromBlock, toBlock, events } = await this.getEvents(9749442);
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
				logger.info(`needToSkip: ${needToSkip}`);
				if (needToSkip) {
					logger.info(`Skip event in blockNumber ${event.blockNumber}`);
					continue;
				} else {
					logger.info(`Unhandled event: \n${JSON.stringify(event, false, 2)}`);

					// Prepare data for controller
					let fullInfo = await this.getFullInfo(
						_fromWallet,
						_toWallet,
						tokenId
					);

					logger.info(`Full info: \n${JSON.stringify(fullInfo, false, 2)}`);

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
						await buyNowService(_data);
						console.log("_data", _data);
					} else {
						let _data = {
							id: String(fullInfo.bid.id),
							sellerId: String(fullInfo.seller.id),
							txHash: txHash,
						};
						console.log("_data", _data);
						await acceptBidService(_data);
					}

					// Save new handled block to pointer
					await this.saveBlockNumber(toBlock);
				}
			}
		} catch (err) {
			logger.error(err.stack);
		}
	}

	launch() {
		setTimeout(() => {
			this.handle();
		}, this.poolingTimeout);
	}

	async test() {
		console.log(this.contract.methods.tokenURI().call());
	}
}

const monitoring = new Monitoring({
	name: "rinkeby",
	rpc: config.rpc.ethRinkeby,
	contractAddress: config.contracts.ethRinkeby,
	abi: abi,
	poolingTimeout: 1000 * 30,
});

const getFullInfo = async (_fromWallet, _toWallet, tokenId) => {
	console.log("get full info", _fromWallet, _toWallet, tokenId);
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
		.where({ item_id: item.id, user_id: seller.id })
		.select("*")
		.orderBy("created_at", "DESC")
		.first();

	if (!item || !seller || !buyer || !marketplace || !bid) {
		throw new Error("Not enough data in getFullInfo");
	}

	return {
		item,
		seller,
		buyer,
		marketplace,
		bid,
	};
};

const main = async () => {
	//await getPastEvents();
	//NameContract.methods.getName().call();
	//let data = await monitoring.getEvents();
	//console.log(data);
	//console.log(data.events.length);

	//await monitoring.handle();
	//await monitoring.test();
	//await knex("metadata").select("*").first().then(console.log);
	//await knex("bid").select("*").then(console.log);

	await monitoring.handle();
	logger.info("Finish");
	// await getFullInfo(
	// 	"0x0000000000000000000000000000000000000000",
	// 	"0x2c66a771323205C4889a42F78CDd2eF56A43C8a8",
	// 	"89303112621432652928060209148402977491600177541612807763276592005610181308854"
	// );
};

main();

// web3Bsc.eth.getBlockNumber().then((res) => console.log(res));
// web3BscTestnet.eth.getBlockNumber().then((res) => console.log(res));
// web3Polygon.eth.getBlockNumber().then((res) => console.log(res));
// web3Rinkeby.eth.getBlockNumber().then((res) => console.log(res));
