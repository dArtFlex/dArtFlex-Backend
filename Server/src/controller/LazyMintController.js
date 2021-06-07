// var express = require('express');
// const Web3 = require("web3");
// const axios = require("axios");
// const HDWalletProvider = require("@truffle/hdwallet-provider");
// var HttpStatusCodes = require('http-status-codes');
// const { signTypedData_v4 } = require("eth-sig-util");
// const os = require('os');
// var json = require(os.homedir() + "/.ethereum/rinkeby.json");
// const maker = new HDWalletProvider(json.key, json.url);
// const web3 = new Web3(maker)

// const ZERO = "0x0000000000000000000000000000000000000000";

// const DOMAIN_TYPE = [
//   {
//     type: "string",
//     name: "name"
//   },
//   {
//     type: "string",
//     name: "version"
//   },
//   {
//     type: "uint256",
//     name: "chainId"
//   },
//   {
//     type: "address",
//     name: "verifyingContract"
//   }
// ];

// const ERC721Types = {
// 	Part: [
// 		{name: 'account', type: 'address'},
// 		{name: 'value', type: 'uint96'}
// 	],
// 	Mint721: [
// 		{name: 'tokenId', type: 'uint256'},
// 		{name: 'tokenURI', type: 'string'},
// 		{name: 'creators', type: 'Part[]'},
// 		{name: 'royalties', type: 'Part[]'}
// 	]
// };

// const orderTypes = {
// 	AssetType: [
// 		{ name: 'assetClass', type: 'bytes4' },
// 		{ name: 'data', type: 'bytes' },
// 	],
// 	Asset: [
// 		{ name: 'assetType', type: 'AssetType' },
// 		{ name: 'value', type: 'uint256' },
// 	],
// 	Order: [
// 		{ name: 'maker', type: 'address' },
// 		{ name: 'makeAsset', type: 'Asset' },
// 		{ name: 'taker', type: 'address' },
// 		{ name: 'takeAsset', type: 'Asset' },
// 		{ name: 'salt', type: 'uint256' },
// 		{ name: 'start', type: 'uint256' },
// 		{ name: 'end', type: 'uint256' },
// 		{ name: 'dataType', type: 'bytes4' },
// 		{ name: 'data', type: 'bytes' },
// 	],
// }

// async function signTypedData(from, data) {
//   if (web3.currentProvider.isMetaMask) {
//     function cb(err, result) {
//       if (err) {
//         return reject(err);
//       }
//       if (result.error) {
//         return reject(result.error);
//       }

//       const sig = result.result;
//       const sig0 = sig.substring(2);
//       const r = "0x" + sig0.substring(0, 64);
//       const s = "0x" + sig0.substring(64, 128);
//       const v = parseInt(sig0.substring(128, 130), 16);

//       resolve({
//         data,
//         sig,
//         v, r, s
//       });
//     }
//       web3.currentProvider.sendAsync({
//         jsonrpc: "2.0",
//         method: "eth_signTypedData_v3",
//         params: [from, JSON.stringify(data)],
//         id: new Date().getTime()
//       }, cb);
//   }
//   else{
//     return signTypedData_v4(web3.currentProvider.wallets[from.toLowerCase()].privateKey, { data })
//   }
  
//   // return 0;
// }

// function createTypeData(
//   domainData,
//   primaryType,
//   message,
//   types
// ) {
//   return {
//     types: Object.assign(
//       {
//         EIP712Domain: DOMAIN_TYPE
//       },
//       types
//     ),
//     domain: domainData,
//     primaryType: primaryType,
//     message: message
//   };
// }

// async function generateTokenId(creator) {
//   const nonce = creator + web3.utils.randomHex(12).slice(2);
// 	const tokenId = web3.utils.toBN(nonce).toString();
// 	return tokenId;
// }


// const generateLazyMint = async (request, response) => {
//   const { contract , uri , creator, royalty } = request.body;
  
//   if (!contract || !uri || !creator) {
//       return response.status(HttpStatusCodes.BAD_REQUEST).send("Missing Data");
//   }
  
//   const tokenId = await generateTokenId(creator);
//   console.log(tokenId); 
//   const form = {
//     "@type": "ERC721",
// 		contract: contract,
// 		tokenId: tokenId,
// 		uri: uri,
// 		creators: [{ account: creator, value: "10000" }],
// 		royalties: []
//   }

// 	const data = createTypeData(
// 		{
// 			name: "Mint721",
// 			version: "1",
// 			chainId: 4,
// 			verifyingContract: contract
// 		},
// 		"Mint721",
// 		{ ...form, tokenURI: uri },
// 		ERC721Types
// 	);
//   const signature = await signTypedData(creator, data);
//   return response.send({ ...form, signatures: [signature] });

// }

// function createOrder(maker, contract, tokenId, price) {
// 	return {
// 		type: "RARIBLE_V2",
// 		maker: maker,
// 		make: {
// 			"assetType": {
// 				"assetClass": "ERC721",
// 				"contract": contract,
// 				"tokenId": tokenId,
// 			},
// 			"value": "1",
// 		},
// 		take: {
// 			"assetType": {
// 				"assetClass": "ETH",
// 			},
// 			"value": price,
// 		},
// 		data: {
// 			"dataType": "RARIBLE_V2_DATA_V1",
// 			"payouts": [],
// 			"originFees": [],
// 		},
// 		salt: `${random(1, 10000)}`,
// 	}
// }

// const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

// function enc(token, tokenId) {
// 	if (tokenId) {
// 		return web3.eth.abi.encodeParameters(["address", "uint256"], [token, tokenId]);
// 	} else {
// 		return web3.eth.abi.encodeParameter("address", token);
// 	}
// }

// const encodeOrder = async (form) => {
//   const makeAssetData = form.make.assetType.tokenId ? enc(form.make.assetType.contract, form.make.assetType.tokenId) : "0x";
//   const takeAssetData = form.take.assetType.tokenId ? enc(form.take.assetType.contract, form.take.assetType.tokenId) : "0x";
//   return {
// 		data: web3.eth.abi.encodeParameters(['tuple(address, uint256)[]', 'tuple(address, uint256)[]'], [[], []]),
//     dataType: "0x4c234266",
// 		maker: form.maker,
// 		makeAsset: {
// 			"assetType": {
// 				"assetClass": web3.utils.keccak256(form.make.assetType.assetClass).substring(0,10), 
// 				"data": makeAssetData
// 			},
// 			"value": form.make.value,
// 		},
//     taker: ZERO,
// 		takeAsset: {
// 			"assetType": {
// 				"assetClass": web3.utils.keccak256(form.take.assetType.assetClass).substring(0,10), 
// 				"data": takeAssetData
// 			},
// 			"value": form.take.value,
// 		},
// 		start: 0,
//     end: 0,
// 		salt: form.salt,
// 	}
// }

// const encodeOrderBuyer = async (form, taker) => {
// 	const makeAssetData = form.make.assetType.tokenId ? enc(form.make.assetType.contract, form.make.assetType.tokenId) : "0x";
// 	const takeAssetData = form.take.assetType.tokenId ? enc(form.take.assetType.contract, form.take.assetType.tokenId) : "0x";
// 	return {
// 		data: web3.eth.abi.encodeParameters(['tuple(address, uint256)[]', 'tuple(address, uint256)[]'], [[], []]),
// 	  	dataType: "0x4c234266",
// 		maker: taker,
// 		makeAsset: {
// 			"assetType": {
// 				"assetClass": web3.utils.keccak256(form.take.assetType.assetClass).substring(0,10), 
// 				"data": takeAssetData
// 			},
// 			"value": form.take.value,
// 		},
// 	  	taker: ZERO,
// 		takeAsset: {
// 			"assetType": {
// 				"assetClass": web3.utils.keccak256(form.make.assetType.assetClass).substring(0,10), 
// 				"data": makeAssetData
// 			},
// 			"value": form.make.value,
// 		},
// 		start: 0,
// 		end: 0,
// 		salt: form.salt,
// 	  }
//   }

// const generateOrder = async (request, response) => {
//   const { contract, tokenId , maker, taker, price } = request.body;
//   const notSignedOrderForm = createOrder(maker, contract, tokenId, price);
//   const order = await encodeOrder(notSignedOrderForm);
//   const orderBuyer = await encodeOrderBuyer(notSignedOrderForm, taker)
//   const data = createTypeData(
// 		{
// 			name: "Exchange",
// 			version: "2",
// 			chainId: 4,
// 			verifyingContract : "0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45",
// 		},
// 		"Order",
// 		order,
// 		orderTypes,
// 	)
//   const signature = await signTypedData(maker, data);
//   return response.send([{ ...order, signature }, orderBuyer]);
// }

// module.exports = {
//   generateLazyMint,
//   generateOrder
// }