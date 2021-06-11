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
 *      Metadata:
 *          type: object
 *          required:
 *              - id
 *              - name
 *              - image
 *              - image_data
 *              - attribute
 *              - description
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: The id of the user
 *              name:
 *                  type: string
 *                  description: The name of the metadata
 *              image:
 *                  type: string
 *                  description: The image url
 *              image_data:
 *                  type: string
 *                  description: The image data
 *              attribute:
 *                  type: string
 *                  description: Metadata attribute
 *              description:
 *                  type: string
 *                  description: The description of metadata
 *          example:
 *              id: 1
 *              name: "New Image"
 *              image: "https://ipfs.infura.io/ipfs/QmPo2KmiNp3C1yNsMAL7ELJdvUupjme7XkE1MZJkx9Unp3"
 *              image_data: "horse image"
 *              attribute: "attribute"
 *              description: "image destription"
 */

/**
 * @swagger
 * /api/metadata/get/{id}:
 *   get:
 *      summary: Get the metadata by id
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The metadata id
 *      responses:
 *           202:
 *              description: The list of the metadata
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Metadata'
 */
router.get('/get/:id', async(request, response) => {
    getDataById(request, response);
});

/**
 * @swagger
 * /api/metadata/delete/{id}:
 *   get:
 *      summary: Get the user by id
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The metadata id
 *      responses:
 *           202:
 *              description: Metadata successfuly deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Data Deleted Successfuly"
 */
router.get('/delete/:id', async(request, response) => {
    deleteData(request, response);
});

/**
 * @swagger
 * /api/metadata/create:
 *   post:
 *      summary: Create a new user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                          - image
 *                          - image_data
 *                          - attribute
 *                          - description
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: The name of the metadata
 *                          image:
 *                              type: string
 *                              description: The image url
 *                          image_data:
 *                              type: string
 *                              description: The image data
 *                          attribute:
 *                              type: string
 *                              description: Metadata attribute
 *                          description:
 *                              type: string
 *                              description: The description of metadata
 *                      example:
 *                          name: "New Image"
 *                          image: "https://ipfs.infura.io/ipfs/QmPo2KmiNp3C1yNsMAL7ELJdvUupjme7XkE1MZJkx9Unp3"
 *                          image_data: "horse image"
 *                          attribute: "attribute"
 *                          description: "image destription"
 *      responses:
 *           202:
 *              description: The metadata was Successfuly created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Data Added Successfuly, id: 8"
 *           500:
 *              description: The user creation failed.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Error Create Data, error: '
 */

router.post('/create', async(request, response) => {
    createData(request, response);
});

/**
 * @swagger
 * /api/metadata/update:
 *   post:
 *      summary: Update the metadata
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Metadata'
 *      responses:
 *           202:
 *              description: The Metadata was Successfuly update.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "Metadata updated Successfuly, id: 8"
 */
router.post('/update/', async(request, response) => {
    updateData(request, response);
});

module.exports = router;