const router = require('express').Router();
const accountController = require("../../controllers/admin/account.controller");
const accountValidate = require("../../validates/admin/account.validate");
const middleWares = require("../../middlewares/admin/auth.middlewares");

router.get('/login', accountController.login);

router.post(
  '/login', 
  accountValidate.loginPost, 
  accountController.loginPost
)

router.get('/register',accountController.register);

router.get('/register-initial' ,accountController.registerInitial);

router.post(
    '/register', 
    accountValidate.registerPost, 
    accountController.registerPost
)
  

router.get('/forgot_password', accountController.forgot_password);
router.post('/forgot_password', accountController.forgot_passwordPost);

router.get('/otp_password', accountController.otp_password);
router.post('/otp_password', accountController.otp_passwordPost);

router.get('/reset_password', accountController.reset_password);
router.post('/reset_password',middleWares.verifyToken,accountController.reset_passwordPost);
router.post('/logout', accountController.logoutPost);

module.exports = router;
