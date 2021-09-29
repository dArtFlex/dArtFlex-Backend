var express = require('express');
var router = express.Router();

const {
    getById,
    getByItemId,
    getAll,
    create
} = require('../controller/MarketplaceController.js')

/**
 * @swagger
 * components: 
 *  schemas:
 *      Marketplace:
 *          type: object
 *          required:
 *              - id
 *              - item_id
 *              - type
 *              - start_price
 *              - end_price
 *              - platform_fee
 *              - sales_token_contract
 *              - sold
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: The id of the marketplace
 *              item_id:
 *                  type: string
 *                  description: the id of the item
 *              type:
 *                  type: string
 *                  description: The type of the sale
 *              start_price:
 *                  type: string
 *                  description: The start price of the sale
 *              end_price:
 *                  type: string
 *                  description: Max purchase price of the sale
 *              start_time:
 *                  type: string
 *                  description: The start time of the sale
 *              end_time:
 *                  type: string
 *                  description: The end time of the sale
 *              platform_fee:
 *                  type: string
 *                  description: The platform fee of each transaction
 *              sales_token_contract:
 *                  type: string
 *                  description: The address of sales token contract
 *              sold:
 *                  type: bool
 *                  description: The boolean of the sales status
 *          example:
 *              id: 1
 *              item_id: 1
 *              type: Auction
 *              start_price: harry@ideasoft.com
 *              end_price: "0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3"
 *              start_time: 1626403759
 *              end_time: 1626403759
 *              platform_fee: 10
 *              sales_token_contract: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *              sold: false
 */

/**
 * @swagger
 * /api/marketplace/get/{id}:
 *   get:
 *     summary: Returns marketplace data of id
 *     parameters:
 *      -   in: path
 *          name: id
 *          schema:
 *              type: integer
 *          required: true
 *          description: The id of the marketplace
 *     responses:
 *       202:
 *         description: The list of the marketplace
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Marketplace'
 */
router.get('/get/:id', async(request, response) => {
    getById(request, response);
});

/**
 * @swagger
 * /api/marketplace/get_by_item/{id}:
 *   get:
 *     summary: Returns marketplace data by item id
 *     parameters:
 *      -   in: path
 *          name: id
 *          schema:
 *              type: integer
 *          required: true
 *          description: The id of the item
 *     responses:
 *       202:
 *         description: The list of the marketplace
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Marketplace'
 */

router.get('/get_by_item/:id', async(request, response) => {
    getByItemId(request, response);
});

/**
 * @swagger
 * /api/marketplace/get_all:
 *   get:
 *     summary: Returns all marketplace data
 *     responses:
 *       202:
 *         description: The list of the marketplace
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Marketplace'
 */

router.get('/get_all', async(request, response) => {
    getAll(request, response);
});



/**
 * @swagger
 * /api/marketplace/create:
 *   post:
 *      summary: Create a new user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - itemId
 *                          - type
 *                          - startPrice
 *                          - endPrice
 *                          - startTime
 *                          - endTime
 *                          - salesTokenContract
 *                          - platfromFee
 *                      properties:
 *                          itemId:
 *                              type: string
 *                              description: The id of the item
 *                          type:
 *                              type: string
 *                              description: The type of the sale
 *                          startPrice:
 *                              type: string
 *                              description: The start price of teh sale
 *                          endPrice:
 *                              type: string
 *                              description: The end price of the sale
 *                          startTime:
 *                              type: string
 *                              description: The start time of the sale
 *                          endTime:
 *                              type: string
 *                              description: The end time of the sale
 *                          salesTokenContract:
 *                              type: string
 *                              description: The address of the sales token 
 *                          platfromFee:
 *                              type: string
 *                              description: the platform fee
 *                      example:
 *                          itemId: 1
 *                          type: auction
 *                          startPrice: harry@ideasoft.com
 *                          endPrice: "0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3"
 *                          startTime: 1626403759
 *                          endTime: 1626403759
 *                          platfromFee: 10
 *                          salesTokenContract: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *      responses:
 *           202:
 *              description: The item was Successfuly created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Data Added Successfuly, id: 8"
 *           500:
 *              description: The item creation failed.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error Create User, error:'
 */

router.post('/create', async(request, response) => {
    create(request, response);
});

module.exports = router;