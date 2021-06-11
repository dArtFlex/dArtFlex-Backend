var express = require('express');
var router = express.Router();

const {
    getById,
    create
} = require('../controller/OrderController.js')

/**
 * @swagger
 * components: 
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - id
 *              - type
 *              - data
 *              - maker
 *              - makeAssetTypeClass
 *              - makeAssetTypeData
 *              - makeAssetValue
 *              - taker
 *              - takeAssetTypeClass
 *              - takeAssetTypeData
 *              - takeAssetValue
 *              - salt
 *              - start
 *              - end
 *              - signature
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: The id of the user
 *              type:
 *                  type: string
 *                  description: data type of order
 *              data:
 *                  type: string
 *                  description: bytes string of order
 *              maker:
 *                  type: string
 *                  description: The address of maker
 *              makeAssetTypeClass:
 *                  type: string
 *                  description: The maker asset type class
 *              makeAssetTypeData:
 *                  type: string
 *                  description: the maker asset type data
 *              makeAssetValue:
 *                  type: string
 *                  description: The maker asset value
 *              taker:
 *                  type: string
 *                  description: The address of taker
 *              takeAssetTypeClass:
 *                  type: string
 *                  description: The taker asset type class
 *              takeAssetTypeData:
 *                  type: string
 *                  description: The taker asset type data
 *              takeAssetValue:
 *                  type: string
 *                  description: The taker asset value
 *              salt:
 *                  type: string
 *                  description: The salt of order
 *              start:
 *                  type: string
 *                  description: the vlaid time of order
 *              end:
 *                  type: string
 *                  description: the vlaid time of order
 *              signature:
 *                  type: string
 *                  description: the signature that 
 *          example:
 *              id: 1
 *              maker: "0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3"
 *              makeAssetTypeClass: "0x73ad2146"
 *              makeAssetTypeData: "0x0000000000000000000000006ede7f3c26975aad32a475e1021d8f6f39c89d823d0b45bced34de6402ce7b9e7e37bdd0be9424f359afba1fd8adff66932e8932"
 *              makeAssetValue: "1"
 *              taker: "0x0000000000000000000000000000000000000000"
 *              takeAssetTypeClass: "0xaaaebeba"
 *              takeAssetTypeData: "0x"
 *              takeAssetValue: "10000000000000000"
 *              start: "0"
 *              end: "0"
 *              salt: "1140"
 *              dataType: "0x4c234266"
 *              data: "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
 *              signature: "0xbb75a794c2aa63522d6a3557eca0eaf492cb7a4e63c703abae1c63d5d1f7361b0bc01f15dbc21f244d1d83868c376a6e9b247c2584efc6c10631da97d431dc331c"
 */

/**
 * @swagger
 * /api/order/get/{id}:
 *   get:
 *     summary: Returns order of id
 *     parameters:
 *      -   in: path
 *          name: id
 *          schema:
 *              type: integer
 *          required: true
 *          description: The id of the order
 *     responses:
 *       202:
 *         description: The list of the order
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/get/:id', async(request, response) => {
    getById(request, response);
});


/**
 * @swagger
 * /api/order/create:
 *   post:
 *      summary: Create a new order
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - type
 *                          - data
 *                          - maker
 *                          - makeAssetTypeClass
 *                          - makeAssetTypeData
 *                          - makeAssetValue
 *                          - taker
 *                          - takeAssetTypeClass
 *                          - takeAssetTypeData
 *                          - takeAssetValue
 *                          - salt
 *                          - start
 *                          - end
 *                          - signature
 *                      properties:
 *                          type:
 *                              type: string
 *                              description: data type of order
 *                          data:
 *                              type: string
 *                              description: bytes string of order
 *                          maker:
 *                              type: string
 *                              description: The address of maker
 *                          makeAssetTypeClass:
 *                              type: string
 *                              description: The maker asset type class
 *                          makeAssetTypeData:
 *                              type: string
 *                              description: the maker asset type data
 *                          makeAssetValue:
 *                              type: string
 *                              description: The maker asset value
 *                          taker:
 *                              type: string
 *                              description: The address of taker
 *                          takeAssetTypeClass:
 *                              type: string
 *                              description: The taker asset type class
 *                          takeAssetTypeData:
 *                              type: string
 *                              description: The taker asset type data
 *                          takeAssetValue:
 *                              type: string
 *                              description: The taker asset value
 *                          salt:
 *                              type: string
 *                              description: The salt of order
 *                          start:
 *                              type: string
 *                              description: the vlaid time of order
 *                          end:
 *                              type: string
 *                              description: the vlaid time of order
 *                          signature:
 *                              type: string
 *                              description: the signature that 
 *                      example:
 *                          fullname: Harry Liu
 *                          userid: harry1234
 *                          email: harry@ideasoft.com
 *                          wallet: "0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3"
 *                          overview: "Hi, I am Harry Liu, a 3D artist."
 *                          profile_image: "https://dartflex.s3.amazonaws.com/e33c005d090127ecc3be0920.jpeg"
 *                          cover_image: "https://dartflex.s3.amazonaws.com/e33c005d090127ecc3be0920.jpeg"
 *      responses:
 *           202:
 *              description: The user was Successfuly created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "User Added Successfuly, id: 8"
 *           500:
 *              description: The user creation failed.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error Create User, error: insert into "users" ("cover_image", "email", "fullname", "overview", "profile_image", "userid", "wallet") values ($1, $2, $3, $4, $5, $6, $7) returning "id" - duplicate key value violates unique constraint "users_userid_unique"'
 */

router.post('/create', async(request, response) => {
    create(request, response);
});

module.exports = router;