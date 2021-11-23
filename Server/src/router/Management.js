var express = require("express");
var router = express.Router();

const {
	getPromotions,
	getWorks,
	getUsers,
} = require("../controller/ManagementController.js");

router.get("/promotions/get", async (request, response) => {
	getPromotions(request, response);
});

router.get("/works/get", async (request, response) => {
	getWorks(request, response);
});

router.get("/users/get", async (request, response) => {
	getUsers(request, response);
});

module.exports = router;
