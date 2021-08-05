var express = require('express');
var router = express.Router();

const {
    getById,
    getByMarketId,
    getByUserId,
    getActiveBidByUserId,
    listItem,
    unListItem,
    placeBid,
    makeOffer,
    withdrawBid,
    acceptBid,
    buyNow
} = require('../controller/BidController.js')

/**
 * @swagger
 * components: 
 *  schemas:
 *      Bid:
 *          type: object
 *          required:
 *              - id
 *              - item_id
 *              - order_id
 *              - user_id
 *              - market_id
 *              - bid_amount
 *              - status
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: The id of the Bid table
 *              item_id:
 *                  type: string
 *                  description: The id of the item
 *              order_id:
 *                  type: string
 *                  description: The id of the order
 *              user_id:
 *                  type: string
 *                  description: The id of the user
 *              market_id:
 *                  type: string
 *                  description: The id of the market
 *              bid_amount:
 *                  type: string
 *                  description: The bid amount
 *              status:
 *                  type: string
 *                  description: the status of the bid
 *          example:
 *              id: 1
 *              item_id: 1
 *              order_id: 1
 *              user_id: 1
 *              market_id: 1
 *              bid_amount: 10000000000000000
 *              status: "pending"
 */

/**
 * @swagger
 * /api/bid/get/{id}:
 *   get:
 *     summary: Returns the bid by id
 *     responses:
 *       202:
 *         description: The list of the bid
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bid'
 */

router.get('/get/:id', async(request, response) => {
    getById(request, response);
});

/**
 * @swagger
 * /api/bid/get_by_market/{id}:
 *   get:
 *     summary: Returns the bid by market id
 *     responses:
 *       202:
 *         description: The list of the bid
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bid'
 */

router.get('/get_by_market/:id', async(request, response) => {
    getByMarketId(request, response);
});

/**
 * @swagger
 * /api/bid/get_by_user/{id}:
 *   get:
 *     summary: Returns the bid by user id
 *     responses:
 *       202:
 *         description: The list of the bid
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bid'
 */

router.get('/get_by_user/:id', async(request, response) => {
    getByUserId(request, response);
});

/**
 * @swagger
 * /api/bid/get_active_by_user/{id}:
 *   get:
 *     summary: Returns the bid by user id
 *     responses:
 *       202:
 *         description: The list of the bid
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bid'
 */

 router.get('/get_active_by_user/:id', async(request, response) => {
    getActiveBidByUserId(request, response);
});

/**
 * @swagger
 * /api/bid/list_item:
 *   post:
 *      summary: List NFT to the Marketplace
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - orderId
 *                          - itemId
 *                          - userId
 *                          - marketId
 *                          - bidAmount
 *                      properties:
 *                          orderId: 
 *                              type: string
 *                              description: The id of the order
 *                          itemId:
 *                              type: string
 *                              description: The id of the item
 *                          userId:
 *                              type: string
 *                              description: The id of the user
 *                          marketId:
 *                              type: string
 *                              description: The id of the market
 *                          bidAmount:
 *                              type: string
 *                              description: Bid amount
 *                      example:
 *                          itemId: 1
 *                          orderId: 1
 *                          userId: 1
 *                          marketId: 1
 *                          bidAmount: 10000000000000000
 *      responses:
 *           202:
 *              description: List item Successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "List item Successfuly, id: 8"
 *           500:
 *              description: List item failed.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error List Item,'
 */
router.post('/list_item', async(request, response) => {
    listItem(request, response);
});

/**
 * @swagger
 * /api/bid/make_offer:
 *   post:
 *      summary: Make an offer to item
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - orderId
 *                          - itemId
 *                          - userId
 *                          - bidAmount
 *                      properties:
 *                          orderId: 
 *                              type: string
 *                              description: The id of the order
 *                          itemId:
 *                              type: string
 *                              description: The id of the item
 *                          userId:
 *                              type: string
 *                              description: The id of the user
 *                          bidAmount:
 *                              type: string
 *                              description: Bid amount
 *                      example:
 *                          itemId: 1
 *                          orderId: 1
 *                          userId: 1
 *                          bidAmount: 10000000000000000
 *      responses:
 *           202:
 *              description: Make offer Successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Bid offered Successfuly, id: 8"
 *           500:
 *              description: Error Make Bid.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error Make Bid'
 */

 router.post('/make_offer', async(request, response) => {
    makeOffer(request, response);
});


/**
 * @swagger
 * /api/bid/place_bid:
 *   post:
 *      summary: bid to the item on Auction
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - orderId
 *                          - itemId
 *                          - userId
 *                          - marketId
 *                          - bidAmount
 *                      properties:
 *                          orderId: 
 *                              type: string
 *                              description: The id of the order
 *                          itemId:
 *                              type: string
 *                              description: The id of the item
 *                          userId:
 *                              type: string
 *                              description: The id of the user
 *                          marketId:
 *                              type: string
 *                              description: The id of the market
 *                          bidAmount:
 *                              type: string
 *                              description: Bid amount
 *                      example:
 *                          itemId: 1
 *                          orderId: 1
 *                          userId: 1
 *                          marketId: 1
 *                          bidAmount: 10000000000000000
 *      responses:
 *           202:
 *              description: Bid Placed Successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Bid Placed Successfuly, id: 8"
 *           500:
 *              description: Error Place Bid.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error Place Bid'
 */

router.post('/place_bid', async(request, response) => {
    placeBid(request, response);
});

/**
 * @swagger
 * /api/bid/withdraw_bid:
 *   post:
 *      summary: bid to the item on Auction
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - id
 *                      properties:
 *                          id: 
 *                              type: string
 *                              description: The id of the bid
 *                      example:
 *                          id: 1
 *      responses:
 *           202:
 *              description: Withdraw bid successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Withdraw bid successfuly"
 *           500:
 *              description: Error withdraw bid.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error withdraw bid'
 */

router.post('/withdraw_bid', async(request, response) => {
    withdrawBid(request, response);
});

/**
 * @swagger
 * /api/bid/unlist_item:
 *   post:
 *      summary: Accept the highest bid
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - id
 *                      properties:
 *                          id: 
 *                              type: string
 *                              description: The id of the bid
 *                      example:
 *                          id: 1
 *      responses:
 *           202:
 *              description: accept bid successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "accept bid successfuly"
 *           500:
 *              description: Error accept bid.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error accept bid'
 */
 router.post('/unlist_item', async(request, response) => {
    unListItem(request, response);
});

/**
 * @swagger
 * /api/bid/accept_bid:
 *   post:
 *      summary: Accept the highest bid
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - id
 *                          - txHash
 *                      properties:
 *                          id: 
 *                              type: string
 *                              description: The id of the bid
 *                          txHash: 
 *                              type: string
 *                              description: The transaction hash
 *                      example:
 *                          id: 1
 *                          txHash: "0x7a69606196659c8ffd047280106c8ad86588b28e9124cd29fcdcd3899343ab5e"
 *      responses:
 *           202:
 *              description: accept bid successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "accept bid successfuly"
 *           500:
 *              description: Error accept bid.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error accept bid'
 */
router.post('/accept_bid', async(request, response) => {
    acceptBid(request, response);
});

/**
 * @swagger
 * /api/bid/buy:
 *   post:
 *      summary: Buy the listed item
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - orderId
 *                          - itemId
 *                          - userId
 *                          - marketId
 *                          - bidAmount
 *                          - txHash
 *                      properties:
 *                          orderId: 
 *                              type: string
 *                              description: The id of the order
 *                          itemId:
 *                              type: string
 *                              description: The id of the item
 *                          userId:
 *                              type: string
 *                              description: The id of the user
 *                          marketId:
 *                              type: string
 *                              description: The id of the market
 *                          bidAmount:
 *                              type: string
 *                              description: Bid amount
 *                          txHash: 
 *                              type: string
 *                              description: The transaction hash
 *                      example:
 *                          itemId: 1
 *                          orderId: 1
 *                          userId: 1
 *                          marketId: 1
 *                          bidAmount: 10000000000000000
 *                          txHash: "0x7a69606196659c8ffd047280106c8ad86588b28e9124cd29fcdcd3899343ab5e"
 *      responses:
 *           202:
 *              description : Item successfully sold
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Item successfully sold, id: 8"
 *           500:
 *              description: Error Buy now error.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error Buy now error'
 */

router.post('/buy', async(request, response) => {
    buyNow(request, response);
});
module.exports = router;