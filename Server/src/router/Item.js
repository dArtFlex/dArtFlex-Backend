var express = require("express");
var router = express.Router();

const {
	getItem,
	getById,
	getByTokenId,
	getByOwner,
	getByCreator,
	getSalesDataByUser,
	getBidAndOfferDataByUser,
	getAll,
	getAuction,
	getBuyNow,
	getSold,
	create,
	update,
	getFeatured,
} = require("../controller/ItemController.js");

/**
 * @swagger
 * components:
 *  schemas:
 *      Item:
 *          type: object
 *          required:
 *              - id
 *              - contract
 *              - token_id
 *              - uri
 *              - creator
 *              - owner
 *              - royalty
 *              - royalty_fee
 *              - signature
 *              - lazymint
 *          properties:
 *              id:
 *                  type: integer
 *                  description: The id of the item
 *              contract:
 *                  type: string
 *                  description: NFT contract address
 *              token_id:
 *                  type: string
 *                  description: The token id of NFT
 *              uri:
 *                  type: string
 *                  description: The metadata uri of NFT
 *              creator:
 *                  type: string
 *                  description: The wallet address of NFT creator
 *              owner:
 *                  type: string
 *                  description: The wallet address of NFT owner
 *              royalty:
 *                  type: string
 *                  description: The royalty of 2nd sale
 *              royalty_fee:
 *                  type: string
 *                  description: The royalty fee
 *              signature:
 *                  type: string
 *                  description: The signature by creator
 *              lazymint:
 *                  type: bool
 *                  description: mint type
 *          example:
 *              id: 1
 *              contract: 0x6ede7f3c26975aad32a475e1021d8f6f39c89d82,
 *              tokenId: 27611000395240475944337849388924502630485855913601372222199548041408536408804,
 *              uri: http://3.11.202.153:8888/api/metadata/get/1
 *              creator: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *              owner: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *              royalty: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *              royaltyFee: 20
 *              lazymint: true
 *              signature: "0x3beb428e415be366cc06f6f65f59c9d209abdcec18d88acdec838f86d6d8088e418720f89568bbe0fffc134db19d137a216c86ae98e70c21b41eed7bb39084b81b"
 */

router.get("/get", async (request, response) => {
	getItem(request, response);
});

/**
 * @swagger
 * /api/item/get/{id}:
 *   get:
 *     summary: Returns item by id
 *     parameters:
 *      -   in: path
 *          name: id
 *          schema:
 *              type: integer
 *          required: true
 *          description: The item id
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get/:id", async (request, response) => {
	getById(request, response);
});

/**
 * @swagger
 * /api/item/get_by_token_id/{id}:
 *   get:
 *     summary: Returns item by token id
 *     parameters:
 *      -   in: path
 *          name: id
 *          schema:
 *              type: string
 *          required: true
 *          description: The nft token_id
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_by_token_id/:id", async (request, response) => {
	getByTokenId(request, response);
});

/**
 * @swagger
 * /api/item/get_by_owner/{wallet}:
 *   get:
 *     summary: Returns item by owner wallet
 *     parameters:
 *      -   in: path
 *          name: wallet
 *          schema:
 *              type: string
 *          required: true
 *          description: The wallet address of owner
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_by_owner/:id", async (request, response) => {
	getByOwner(request, response);
});

router.get("/get_salesdata_by_owner/:id", async (request, response) => {
	getSalesDataByUser(request, response);
});

router.get("/get_buyandoffer_by_owner/:id", async (request, response) => {
	getBidAndOfferDataByUser(request, response);
});

/**
 * @swagger
 * /api/item/get_by_creator/{wallet}:
 *   get:
 *     summary: Returns item by creator wallet
 *     parameters:
 *      -   in: path
 *          name: wallet
 *          schema:
 *              type: string
 *          required: true
 *          description: The wallet address of creator
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_by_creator/:id", async (request, response) => {
	getByCreator(request, response);
});

/**
 * @swagger
 * /api/item/get_all:
 *   get:
 *     summary: Returns all items
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_all", async (request, response) => {
	getAll(request, response);
});

/**
 * @swagger
 * /api/item/get_auction:
 *   get:
 *     summary: Returns all items
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_auction", async (request, response) => {
	getAuction(request, response);
});

/**
 * @swagger
 * /api/item/get_featured:
 *   get:
 *     summary: Returns all items
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_featured", async (request, response) => {
	getFeatured(request, response);
});
/**
 * @swagger
 * /api/item/get_buynow:
 *   get:
 *     summary: Returns all items
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_buynow", async (request, response) => {
	getBuyNow(request, response);
});

/**
 * @swagger
 * /api/item/get_sold:
 *   get:
 *     summary: Returns all items
 *     responses:
 *       202:
 *         description: The list of the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/get_sold", async (request, response) => {
	getSold(request, response);
});

/**
 * @swagger
 * /api/user/create:
 *   post:
 *      summary: Create a new user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - id
 *                          - contract
 *                          - token_id
 *                          - uri
 *                          - creator
 *                          - owner
 *                          - royalty
 *                          - royalty_fee
 *                          - signature
 *                          - lazymint
 *                          - hashtagIdList
 *                      properties:
 *                          contract:
 *                              type: string
 *                              description: NFT contract address
 *                          token_id:
 *                              type: string
 *                              description: The token id of NFT
 *                          uri:
 *                              type: string
 *                              description: The metadata uri of NFT
 *                          creator:
 *                              type: string
 *                              description: The wallet address of NFT creator
 *                          owner:
 *                              type: string
 *                              description: The wallet address of NFT owner
 *                          royalty:
 *                              type: string
 *                              description: The royalty of 2nd sale
 *                          royalty_fee:
 *                              type: string
 *                              description: The royalty fee
 *                          signature:
 *                              type: string
 *                              description: The signature by creator
 *                          lazymint:
 *                              type: bool
 *                              description: mint type
 *                          hashtagIdList:
 *                              type: array
 *                              description: hashtag id list
 *                      example:
 *                          contract: 0x6ede7f3c26975aad32a475e1021d8f6f39c89d82,
 *                          tokenId: 27611000395240475944337849388924502630485855913601372222199548041408536408804,
 *                          uri: http://3.11.202.153:8888/api/metadata/get/1
 *                          creator: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *                          owner: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *                          royalty: 0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3
 *                          royaltyFee: 20
 *                          lazymint: true
 *                          signature: "0x3beb428e415be366cc06f6f65f59c9d209abdcec18d88acdec838f86d6d8088e418720f89568bbe0fffc134db19d137a216c86ae98e70c21b41eed7bb39084b81b"
 *                          hashtagIdList : [1, 3, 4]
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

router.post("/create", async (request, response) => {
	create(request, response);
});

/**
 * @swagger
 * /api/item/update:
 *   post:
 *      summary: Update the item
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Item'
 *      responses:
 *           202:
 *              description: The item was Successfuly update.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Data updated Successfuly, id: 8"
 */

router.post("/update", async (request, response) => {
	update(request, response);
});

module.exports = router;
