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
 * /api/user/getAll:
 *   get:
 *     summary: Returns the list of all the users
 *     responses:
 *       202:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/get/:id', async(request, response) => {
    getById(request, response);
});

router.get('/get_by_item/:id', async(request, response) => {
    getByItemId(request, response);
});

router.get('/get_all', async(request, response) => {
    getAll(request, response);
});

router.post('/create', async(request, response) => {
    create(request, response);
});

module.exports = router;