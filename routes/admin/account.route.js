const router = require('express').Router();
const accountController = require("../../controllers/admin/account.controller");

router.get('/login', accountController.login);
router.get('/register', accountController.register);
router.get('/forgot_password', accountController.forgot_password);

module.exports = router;
