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

router.post('/create', async(request, response) => {
    create(request, response);
});

module.exports = router;