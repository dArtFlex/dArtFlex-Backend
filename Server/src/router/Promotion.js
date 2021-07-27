var express = require('express');
var router = express.Router();

const {
    getAll
} = require('../controller/PromotionController.js')

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

/**
 * @swagger
 * /api/promotion/get_all:
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
router.get('/get_all', async(request, response) => {
    getAll(request, response);
})

module.exports = router;