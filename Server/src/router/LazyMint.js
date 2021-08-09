var express = require('express');
var router = express.Router();

const {
    generateLazyMint,
    generateOrder,
    generateSignature,
    getTxHash
} = require('../controller/LazyMintController.js')

router.post('/mint', async(request, response) => {
    generateLazyMint(request, response);
});

router.post('/order', async(request, response) => {
    generateOrder(request, response);
});

router.post('/sign', async(request, response) => {
    generateSignature(request, response);
})

router.get('/bid', async(request, response) => {
    getTxHash(request, response);
})
module.exports = router;