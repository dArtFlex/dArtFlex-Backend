var express = require("express");
var router = express.Router();

const { sales } = require("../controller/SalesController.js");

router.get("/get", async (request, response) => {
	sales(request, response);
});

module.exports = router;
