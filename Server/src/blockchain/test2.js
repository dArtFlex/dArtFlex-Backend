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

const main = async () => {
	// let pointer = await knex("rinkeby_pointer").select("*").first();
	// 	console.log(pointer);

	//await knex("item").select("*").then(console.log);
	//await knex("bid").select("*").then(console.log);

	// 14654272
	let events = await contractBscTestnet.getPastEvents("Transfer", {
		fromBlock: 14654271,
		toBlock: 14654273,
	});
	console.log(events);

	await knex("bsc_testnet_pointer").update({ last_block: 14654271 });
};

main();
