var express = require("express");
var router = express.Router();

const { getProfile } = require("../controller/ProfileController.js");

router.get("/get", async (request, response) => {
	getProfile(request, response);
});

module.exports = router;
