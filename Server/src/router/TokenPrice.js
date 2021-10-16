var express = require('express');
var router = express.Router();

const {
    getETH,
    getBNB
} = require('../controller/TokenPriceController.js')


router.getETH('/get/ETH', async(request, response) => {
    getETH(request, response);
});

router.getBNB('/get/BNB', async(request, response) => {
    getBNB(request, response);
});

module.exports = router;