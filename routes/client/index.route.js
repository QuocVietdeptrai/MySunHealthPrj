const router = require('express').Router();

const homeRoutes = require("./home.route");
const accountRoutes = require("./account.route");

// Trang chủ
router.use('/', homeRoutes);

// Trang tài khoản
router.use('/account', accountRoutes);

module.exports = router;
