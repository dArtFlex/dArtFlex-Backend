/*
	Script for migration purpose. If item not contain chain_id - set it.
*/

require("dotenv").config();
const secrets = require("../../secrets.js");
const knex = require("knex")(secrets.database);

// Dartflex contracts
const chains = [
	{
		contract: "0xc673958b3e599c06d650e09ddad533b30cf5fbef",
		network: "eth_rinkeby",
		chain_id: 4,
	},
	{
		contract: "0x0a7fc7a6a93c419708722cd8ee71ab1a61a42161",
		network: "bsc_tetnet",
		chain_id: 97,
	},
	{
		contract: "0x44118bf542e29926dc43853d14d74cbf12556dd6",
		network: "bsc_mainnet",
		chain_id: 56,
	},
	{
		contract: "0xe2cc21f793876b8613cf56a9696c6a644fa49185",
		network: "poly_mainnet",
		chain_id: 137,
	},
];
const onlyContracts = chains.map((item) => item.contract);

const main = async () => {
	console.log("Get all items where chain_id is not exist");
	let allItems = await knex("item")
		.where({ chain_id: null })
		.orWhere({ chain_id: 0 })
		.select("id", "contract")
		.then((items) => {
			// To lower case all
			return items.map((item) => {
				item.contract = item.contract.toLowerCase();
				return item;
			});
		});
	console.log(`Found ${allItems.length} items`);

	for (var i = 0; i < allItems.length; i++) {
		let item = allItems[i];
		let chain = chains.find((chain) => chain.contract == item.contract);
		if (!chain) {
			console.log("Item with unknown contract:", item);
			console.log("Set 0");
			await knex("item")
				.where({ id: item.id })
				.update({ chain_id: 0 })
				.catch((err) => console.log(err));
		} else {
			// update
			await knex("item")
				.where({ id: item.id })
				.update({ chain_id: chain.chain_id })
				.catch((err) => console.log(err));
		}
	}
};

main();
