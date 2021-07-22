var express = require('express');
var router = express.Router();

const {
    getNftHistory,
    getTradingHistory,
    getSoldHistory,
    getPurchasedHistory
} = require('../controller/ActivityController.js')


/**
 * @swagger
 * components: 
 *  schemas:
 *      Activity:
 *          type: object
 *          required:
 *              - id
 *              - from
 *              - to
 *              - item_id
 *              - market_id
 *              - bid_amount
 *              - sales_token_contract
 *              - status
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: The id of the Activity
 *              from:
 *                  type: string
 *                  description: The from user id
 *              to:
 *                  type: string
 *                  description: The to user id
 *              item_id:
 *                  type: string
 *                  description: The item id
 *              market_id:
 *                  type: string
 *                  description: The id of the market
 *              bid_amount:
 *                  type: string
 *                  description: The bid amount
 *              sales_token_contract:
 *                  type: string
 *                  description: The bid token contract
 *              status:
 *                  type: string
 *                  description: the status of the bid
 *          example:
 *              id: 1
 *              from: 2
 *              to: 5
 *              item_id: 1
 *              market_id: 1
 *              bid_amount: 10000000000000000
 *              sales_token_contract: "0x"
 *              status: "sold"
 */


/**
 * @swagger
 * /api/activity/get_nft_history/{id}:
 *   get:
 *     summary: Returns the activity by nft
 *     responses:
 *       202:
 *         description: The list of the activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */


router.get('/get_nft_history/:id', async(request, response) => {
    getNftHistory(request, response);
});

/**
 * @swagger
 * /api/activity/get_trading_history/{id}:
 *   get:
 *     summary: Returns the activity by trading
 *     responses:
 *       202:
 *         description: The list of the activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.get('/get_trading_history/:id', async(request, response) => {
    getTradingHistory(request, response);
});


/**
 * @swagger
 * /api/activity/get_sold_history/{id}:
 *   get:
 *     summary: Returns the user's sold activity
 *     responses:
 *       202:
 *         description: The list of the activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.get('/get_sold_history/:id', async(request, response) => {
    getSoldHistory(request, response);
});

/**
 * @swagger
 * /api/activity/get_purchased_history/{id}:
 *   get:
 *     summary: Returns the user's purchased activity
 *     responses:
 *       202:
 *         description: The list of the activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.get('/get_purchased_history/:id', async(request, response) => {
    getPurchasedHistory(request, response);
});

module.exports = router;