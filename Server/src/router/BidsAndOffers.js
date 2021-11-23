var express = require("express");
var router = express.Router();

const { bidsAndOffers } = require("../controller/BidsAndOffersController.js");

router.get("/get", async (request, response) => {
	bidsAndOffers(request, response);
});

module.exports = router;
