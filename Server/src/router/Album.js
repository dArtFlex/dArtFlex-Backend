var express = require('express');
var router = express.Router();

const {
    getById,
    getByUser,
    create,
    deleteImage
} = require('../controller/AlbumController.js')


router.get('/get/:id', async(request, response) => {
    getById(request, response);
});

router.get('/get_by_user/:id', async(request, response) => {
    getByUser(request, response);
});

router.get('/delete/:id', async(request, response) => {
    deleteImage(request, response);
});

/**
 * @swagger
 * /api/album/create:
 *   post:
 *      summary: Create Album image
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - userId
 *                          - imageUrl
 *                      properties:
 *                          userId:
 *                              type: integer
 *                              description: The id of the user
 *                          imageUrl:
 *                              type: string
 *                              description: The url of image
 *                      example:
 *                          userId: 1
 *                          imageUrl: "https://ipfs.infura.io/ipfs/QmPo2KmiNp3C1yNsMAL7ELJdvUupjme7XkE1MZJkx9Unp3"
 *      responses:
 *           202:
 *              description : Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: integer
 *                          example: 8
 *           500:
 *              description: Error create album.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error create album'
 */

router.post('/create', async(request, response) => {
    create(request, response);
});

module.exports = router;