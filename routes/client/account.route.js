const router = require('express').Router();
const accountController = require("../../controllers/client/account.controller");
const accountValidate = require("../../validates/client/account.validate");
const middleWares = require("../../middlewares/client/auth.middlewares");

router.get('/login', accountController.login);
router.post('/login', accountController.loginPost);


router.get('/register', accountController.register);
router.post('/register', 
    accountValidate.registerPost,
    accountController.registerPost);


router.get('/forgot_password', accountController.forgotPassword);
router.post('/forgot_password', accountController.forgot_passwordPost);

router.get('/otp_password', accountController.otp_password);
router.post('/otp_password', accountController.otp_passwordPost);

router.get('/reset_password', accountController.reset_password);
router.post('/reset_password',accountValidate.resetPassWordPost,middleWares.verifyToken,accountController.reset_passwordPost);

router.post('/logout', accountController.logoutPost);

module.exports = router;
