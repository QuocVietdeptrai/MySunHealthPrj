const router = require('express').Router();
const accountController = require("../../controllers/admin/account.controller");

router.get('/login', accountController.login);
router.get('/register', accountController.register);
router.get('/register-initial', accountController.registerInitial);
router.post('/register', accountController.registerPost);
router.get('/forgot_password', accountController.forgot_password);
router.get('/otp_password', accountController.otp_password);
router.get('/reset_password', accountController.reset_password);

module.exports = router;
