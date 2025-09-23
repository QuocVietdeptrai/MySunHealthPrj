const router = require('express').Router();
const accountController = require("../../controllers/client/account.controller");

router.get('/login', accountController.login);

module.exports = router;
