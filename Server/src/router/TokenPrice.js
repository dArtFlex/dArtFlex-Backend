var express = require('express');
var router = express.Router();

const {
    getETH,
    getBNB,
    getMATIC
} = require('../controller/TokenPriceController.js')


router.get('/get/ETH', async(request, response) => {
    getETH(request, response);
});

router.get('/get/BNB', async(request, response) => {
    getBNB(request, response);
});

router.get('/get/MATIC', async(request, response) => {
    getMATIC(request, response);
});

module.exports = router;