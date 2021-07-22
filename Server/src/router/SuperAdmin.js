var express = require('express');
var router = express.Router();

const {
    addPromotion,
    deletePromotion,
    banUser,
    unBanUser,
    banItem,
    unBanItem,
    burnUser,
    burnItem
} = require('../controller/SuperAdminController.js')


/**
 * @swagger
 * components: 
 *  schemas:
 *      SuperAdmin:
 */


/**
 * @swagger
 * /api/super_admin/add_promotion:
 *   post:
 *      summary: Add item to promotion table
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - itemId
 *                          - data
 *                          - signature
 *                      properties:
 *                          itemId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          itemId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : Item added to promotion Successfuly
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: The message of the response
 *                              id: 
 *                                  type: integer
 *                                  description: the Item id
 *                          example:
 *                              message: Item added to promotion Successfuly,
 *                              id: 1
 *                                  
 */
router.post('/add_promotion', async(request, response) => {
    addPromotion(request, response);
});

/**
 * @swagger
 * /api/super_admin/delete_promotion:
 *   post:
 *      summary: remove item to promotion table
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - itemId
 *                          - data
 *                          - signature
 *                      properties:
 *                          itemId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          itemId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : Item successfully removed from promotion table
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Item successfully removed from promotion table'
 */
router.post('/delete_promotion', async(request, response) => {
    deletePromotion(request, response);
});

/**
 * @swagger
 * /api/super_admin/ban_user:
 *   post:
 *      summary: Ban user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - userId
 *                          - data
 *                          - signature
 *                      properties:
 *                          userId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          userId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : user ban successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'User successfully banned'
 */

router.post('/ban_user', async(request, response) => {
    banUser(request, response);
});

/**
 * @swagger
 * /api/super_admin/unban_user:
 *   post:
 *      summary: unBan user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - userId
 *                          - data
 *                          - signature
 *                      properties:
 *                          userId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          userId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : user unban successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'User successfully unbanned'
 */
router.post('/unban_user', async(request, response) => {
    unBanUser(request, response);
});

/**
 * @swagger
 * /api/super_admin/ban_item:
 *   post:
 *      summary: Ban item
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - itemId
 *                          - data
 *                          - signature
 *                      properties:
 *                          itemId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          itemId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : item ban successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'item successfully banned'
 */
router.post('/ban_item', async(request, response) => {
    banItem(request, response);
});

/**
 * @swagger
 * /api/super_admin/unban_item:
 *   post:
 *      summary: unBan item
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - itemId
 *                          - data
 *                          - signature
 *                      properties:
 *                          itemId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          itemId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : item unban successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'item successfully banned'
 */
router.post('/unban_item', async(request, response) => {
    unBanItem(request, response);
});

/**
 * @swagger
 * /api/super_admin/burn_user:
 *   post:
 *      summary: Burn user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - userId
 *                          - data
 *                          - signature
 *                      properties:
 *                          userId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          userId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : user burnt successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'User successfully burnt'
 */
router.post('/burn_user', async(request, response) => {
    burnUser(request, response);
});

/**
 * @swagger
 * /api/super_admin/burn_item:
 *   post:
 *      summary: Burn item
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - itemId
 *                          - data
 *                          - signature
 *                      properties:
 *                          itemId: 
 *                              type: string
 *                              description: The id of the item
 *                          data:
 *                              type: string
 *                              description: The data that used to genearte signature
 *                          signature:
 *                              type: string
 *                              description: The signature string that signed by owner
 *                      example:
 *                          itemId: 1
 *                          data: "{\"types\":{\"EIP712Domain\":[{\"type\":\"string\",\"name\":\"name\"},{\"type\":\"string\",\"name\":\"version\"},{\"type\":\"uint256\",\"name\":\"chainId\"},{\"type\":\"address\",\"name\":\"verifyingContract\"}],\"Sign\":[]},\"domain\":{\"name\":\"sign\",\"version\":\"1\",\"chainId\":4,\"verifyingContract\":\"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45\"},\"primaryType\":\"Sign\",\"message\":{}}"
 *                          signature: "0xfe36964439607f1cea33f00ae8aa71f00eee1f10ed22fcfbee4a32b6428baebf2ae33eea71b223bdffa78ab3b5103274dddb7286c1928326f89de30b7fc2e95f1c"
 *      responses:
 *           202:
 *              description : item burn successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'item successfully burnt'
 */
router.post('/burn_item', async(request, response) => {
    burnItem(request, response);
});

module.exports = router;