var express = require('express');
var router = express.Router();

const {
    get
} = require('../controller/TokenPriceController.js')


router.get('/get/ETH', async(request, response) => {
    get(request, response);
});

module.exports = router;