var express = require("express");
var router = express.Router();

const { tradeHistory } = require("../controller/TradeHistoryController.js");

router.get("/get", async (request, response) => {
	tradeHistory(request, response);
});

module.exports = router;
