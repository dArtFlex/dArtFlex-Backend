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

router.post('/add_promotion', async(request, response) => {
    addPromotion(request, response);
});

router.post('/delete_promotion', async(request, response) => {
    deletePromotion(request, response);
});

router.post('/ban_user', async(request, response) => {
    banUser(request, response);
});

router.post('/unban_user', async(request, response) => {
    unBanUser(request, response);
});

router.post('/ban_item', async(request, response) => {
    banItem(request, response);
});

router.post('/unban_item', async(request, response) => {
    unBanItem(request, response);
});

router.post('/burn_user', async(request, response) => {
    burnUser(request, response);
});

router.post('/burn_item', async(request, response) => {
    burnItem(request, response);
});

module.exports = router;