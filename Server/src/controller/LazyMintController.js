var express = require("express");
const Web3 = require("web3");
const axios = require("axios");
const HDWalletProvider = require("@truffle/hdwallet-provider");
var HttpStatusCodes = require("http-status-codes");
const { signTypedData_v4 } = require("eth-sig-util");

// New infura flow
const secrets = require("../../secrets.js");
var WEB3_URL = null;

var web3;
switch (process.env.NODE_ENV) {
	case "production":
		const os = require("os");
		var json = require(os.homedir() + "/.ethereum/rinkeby.json");
		const maker = new HDWalletProvider(json.key, json.url);
		web3 = new Web3(maker);
		WEB3_URL = "wss://mainnet.infura.io/ws/v3/" + secrets.infura.id;

		break;
	case "development":
		WEB3_URL = "wss://rinkeby.infura.io/ws/v3/" + secrets.infura.id;
		web3 = new Web3(new Web3.providers.WebsocketProvider(WEB3_URL));
		break;
	default:
		WEB3_URL = "wss://rinkeby.infura.io/ws/v3/" + secrets.infura.id;
		web3 = new Web3(new Web3.providers.WebsocketProvider(WEB3_URL));
		break;
}

const ZERO = "0x0000000000000000000000000000000000000000";

const DOMAIN_TYPE = [
	{
		type: "string",
		name: "name",
	},
	{
		type: "string",
		name: "version",
	},
	{
		type: "uint256",
		name: "chainId",
	},
	{
		type: "address",
		name: "verifyingContract",
	},
];

const signTypes = {
	Sign: [],
};

const ERC1155Types = {
	Part: [
		{ name: "account", type: "address" },
		{ name: "value", type: "uint96" },
	],
	Mint721: [
		{ name: "tokenId", type: "uint256" },
		{ name: "tokenURI", type: "string" },
		{ name: "creators", type: "Part[]" },
		{ name: "royalties", type: "Part[]" },
	],
};

const orderTypes = {
	AssetType: [
		{ name: "assetClass", type: "bytes4" },
		{ name: "data", type: "bytes" },
	],
	Asset: [
		{ name: "assetType", type: "AssetType" },
		{ name: "value", type: "uint256" },
	],
	Order: [
		{ name: "maker", type: "address" },
		{ name: "makeAsset", type: "Asset" },
		{ name: "taker", type: "address" },
		{ name: "takeAsset", type: "Asset" },
		{ name: "salt", type: "uint256" },
		{ name: "start", type: "uint256" },
		{ name: "end", type: "uint256" },
		{ name: "dataType", type: "bytes4" },
		{ name: "data", type: "bytes" },
	],
};

const lazyMintNftEncodeParameters = [
	"address",
	"tuple(uint256, string, tuple(address, uint256)[], tuple(address, uint256)[], bytes[])",
];
const nftEncodeParameters = ["address", "uint256"];
const erc20EncodeParameters = ["address"];

async function signTypedData(from, data) {
	if (web3.currentProvider.isMetaMask) {
		function cb(err, result) {
			if (err) {
				return reject(err);
			}
			if (result.error) {
				return reject(result.error);
			}

			const sig = result.result;
			const sig0 = sig.substring(2);
			const r = "0x" + sig0.substring(0, 64);
			const s = "0x" + sig0.substring(64, 128);
			const v = parseInt(sig0.substring(128, 130), 16);

			resolve({
				data,
				sig,
				v,
				r,
				s,
			});
		}
		web3.currentProvider.sendAsync(
			{
				jsonrpc: "2.0",
				method: "eth_signTypedData_v4",
				params: [from, JSON.stringify(data)],
				id: new Date().getTime(),
			},
			cb
		);
	} else {
		return signTypedData_v4(
			web3.currentProvider.wallets[from.toLowerCase()].privateKey,
			{ data }
		);
	}

	// return 0;
}

function createTypeData(domainData, primaryType, message, types) {
	return {
		types: Object.assign(
			{
				EIP712Domain: DOMAIN_TYPE,
			},
			types
		),
		domain: domainData,
		primaryType: primaryType,
		message: message,
	};
}

async function generateTokenId(creator) {
	const nonce = creator + web3.utils.randomHex(12).slice(2);
	const tokenId = web3.utils.toBN(nonce).toString();
	return tokenId;
}

const generateLazyMint = async (request, response) => {
	const { contract, uri, creator, royalty } = request.body;

	if (!contract || !uri || !creator) {
		return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
	}

	const tokenId = await generateTokenId(creator);
	const form = {
		"@type": "ERC1155",
		contract: contract,
		creators: [{ account: creator, value: "10000" }],
		royalties: [],
		tokenId: tokenId,
		uri: uri,
	};

	const data = createTypeData(
		{
			name: "Mint721",
			version: "1",
			chainId: 4,
			verifyingContract: contract,
		},
		"Mint721",
		{ ...form, tokenURI: uri },
		ERC1155Types
	);
	const signature = await signTypedData(creator, data);
	return response.send({ ...form, signatures: [signature] });
};

function createOrder(maker, contract, tokenId, uri, erc20, price, signature) {
	return {
		type: "RARIBLE_V2",
		maker: maker,
		make: {
			assetType: {
				assetClass: signature == "0x" ? "ERC1155" : "ERC1155_LAZY",
				contract: contract,
				tokenId: tokenId,
				uri: uri,
				creator: maker,
				signature: signature,
			},
			value: "1",
		},
		take: {
			assetType: {
				assetClass: erc20 == "0x" ? "ETH" : "ERC20",
				contract: erc20,
			},
			value: price,
		},
		data: {
			dataType: "RARIBLE_V2_DATA_V1",
			payouts: [],
			originFees: [],
		},
		salt: `${random(1, 10000)}`,
	};
}

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

function enc(form) {
	if (form.assetClass == "ERC1155_LAZY")
		return web3.eth.abi.encodeParameters(lazyMintNftEncodeParameters, [
			form.contract,
			[form.tokenId, form.uri, [[form.creator, "10000"]], [], [form.signature]],
		]);
	if (form.assetClass == "ERC1155")
		return web3.eth.abi.encodeParameters(nftEncodeParameters, [
			form.contract,
			form.tokenId,
		]);
	if (form.assetClass == "ERC20") {
		return web3.eth.abi.encodeParameter("address", form.contract);
	}
	return "0x";
}

const encodeOrder = async (form, taker) => {
	const makeAsset = form.make.assetType;
	const takeAsset = form.take.assetType;
	return {
		data: web3.eth.abi.encodeParameters(
			["tuple(address, uint256)[]", "tuple(address, uint256)[]"],
			[[], []]
		),
		dataType: "0x4c234266",
		maker: taker,
		makeAsset: {
			assetType: {
				assetClass: web3.utils
					.keccak256(form.take.assetType.assetClass)
					.substring(0, 10),
				data: enc(takeAsset),
			},
			value: form.take.value,
		},
		taker: ZERO,
		takeAsset: {
			assetType: {
				assetClass: web3.utils
					.keccak256(form.make.assetType.assetClass)
					.substring(0, 10),
				data: enc(makeAsset),
			},
			value: form.make.value,
		},
		start: 0,
		end: 0,
		salt: form.salt,
	};
};

const generateOrder = async (request, response) => {
	const { contract, tokenId, uri, maker, taker, erc20, price, signature } =
		request.body;
	const notSignedOrderForm = createOrder(
		maker,
		contract,
		tokenId,
		uri,
		erc20,
		price,
		signature
	);
	const order = await encodeOrder(notSignedOrderForm, taker);
	const data = createTypeData(
		{
			name: "Exchange",
			version: "2",
			chainId: 4,
			verifyingContract: "0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45",
		},
		"Order",
		order,
		orderTypes
	);

	//   const signatureOrder = await signTypedData(taker, data);
	return response.send({ ...order, signature: "signatureOrder" });
};

const generateSignature = async (request, response) => {
	const { creator } = request.body;
	const data = createTypeData(
		{
			name: "sign",
			version: "1",
			chainId: 4,
			verifyingContract: "0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45",
		},
		"Sign",
		{},
		signTypes
	);
	const signature = await signTypedData(creator, data);
	return response.send({
		data: JSON.stringify(data),
		signature: signature,
	});
};

const getTxHash = async (request, response) => {
	const topic = web3.utils.keccak256("Transfer(address,address,uint256)");

	const data = await web3.eth.getTransactionReceipt(
		"0xebd662c0db0f6006e648beb467f10e06fbdad322ac403df90c6ee04ff6dab823"
	);

	const logs = data.logs;
	// return response.status(HttpStatusCodes.ACCEPTED).send({logs});
	for (let i = 0; i < logs.length; i++) {
		if (
			logs[i].address.toLowerCase() ==
				"0x6ede7f3c26975aad32a475e1021d8f6f39c89d82" &&
			logs[i].topics[0].toLowerCase() == topic
		) {
			const from = "0x" + logs[i].topics[1].toLowerCase().slice(26, 65);
			const to = "0x" + logs[i].topics[2].toLowerCase().slice(26, 65);
			const tokenId = web3.utils
				.toBN(logs[i].topics[3].toLowerCase())
				.toString();
			return response
				.status(HttpStatusCodes.ACCEPTED)
				.send({ from, to, tokenId });
		}
	}
	return response.status(HttpStatusCodes.ACCEPTED).send(logs);
};
module.exports = {
	generateLazyMint,
	generateOrder,
	generateSignature,
	getTxHash,
};
