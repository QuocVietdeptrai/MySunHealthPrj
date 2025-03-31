const router = require('express').Router();
const accountRoutes = require("./account.route");
const dashboardRoutes = require("./dashboard.route");

router.use('/dashboard', dashboardRoutes);
router.use('/account', accountRoutes);


module.exports = router;
