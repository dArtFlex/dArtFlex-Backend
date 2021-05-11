var express = require('express');
var router = express.Router();

const {
    getUsers,
    getUserById,
    getUserByWallet,
    createUser,
    updateUser,
    deleteUser,
} = require('../controller/UserController.js')


router.get('/getAll', async(request, response) => {
    getUsers(request, response);
});
router.get('/get/:id', async(request, response) => {
    getUserById(request, response);
});
router.get('/get/wallet/:wallet', async(request, response) => {
    getUserByWallet(request, response);
});
router.get('/delete/:id', async(request, response) => {
    deleteUser(request, response);
});
router.post('/create', async(request, response) => {
    createUser(request, response);
});
router.post('/update/', async(request, response) => {
    updateUser(request, response);
});

module.exports = router;