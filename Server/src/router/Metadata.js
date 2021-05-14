var express = require('express');
var router = express.Router();

const {
    getDataById,
    createData,
    updateData,
    deleteData
} = require('../controller/MetadataController.js')

/**
 * @swagger
 * components: 
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - id
 *              - fullname
 *              - userid
 *              - email
 *              - wallet
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: The id of the user
 *              fullname:
 *                  type: string
 *                  description: The full name of the user
 *              userid:
 *                  type: string
 *                  description: The id of the user
 *              email:
 *                  type: string
 *                  description: The email address of the user
 *              wallet:
 *                  type: string
 *                  description: The wallet address of the user
 *              overview:
 *                  type: string
 *                  description: The overview of the user
 *              profile_image:
 *                  type: string
 *                  description: The url of the user profile image
 *              cover_image:
 *                  type: string
 *                  description: The url of the user cover image
 *          example:
 *              id: 1
 *              fullname: Harry Liu
 *              userid: harry1234
 *              email: harry@ideasoft.com
 *              wallet: "0x3D0b45BCEd34dE6402cE7b9e7e37bDd0Be9424F3"
 *              overview: "Hi, I am Harry Liu, a 3D artist."
 *              profile_image: "https://dartflex.s3.amazonaws.com/e33c005d090127ecc3be0920.jpeg"
 *              cover_image: "https://dartflex.s3.amazonaws.com/e33c005d090127ecc3be0920.jpeg"
 */

/**
 * @swagger
 * /api/user/get/{id}:
 *   get:
 *      summary: Get the user by id
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The user id
 *      responses:
 *           202:
 *              description: The list of the users
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 */
router.get('/get/:id', async(request, response) => {
    getDataById(request, response);
});

/**
 * @swagger
 * /api/user/delete/{id}:
 *   get:
 *      summary: Get the user by wallet
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The user id
 *      responses:
 *           202:
 *              description: User successfuly deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "User Deleted Successfuly"
 */
router.get('/delete/:id', async(request, response) => {
    deleteData(request, response);
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
 *                          - fullname
 *                          - userid
 *                          - email
 *                          - wallet
 *                      properties:
 *                          id: 
 *                              type: integer
 *                              description: The id of the user
 *                          fullname:
 *                              type: string
 *                              description: The full name of the user
 *                          userid:
 *                              type: string
 *                              description: The id of the user
 *                          email:
 *                              type: string
 *                              description: The email address of the user
 *                          wallet:
 *                              type: string
 *                              description: The wallet address of the user
 *                          overview:
 *                              type: string
 *                              description: The overview of the user
 *                          profile_image:
 *                              type: string
 *                              description: The url of the user profile image
 *                          cover_image:
 *                              type: string
 *                              description: The url of the user cover image
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
    createData(request, response);
});

/**
 * @swagger
 * /api/user/update:
 *   post:
 *      summary: Update the user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *           202:
 *              description: The user was Successfuly update.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "User updated Successfuly, id: 8"
 */
router.post('/update/', async(request, response) => {
    updateData(request, response);
});

module.exports = router;