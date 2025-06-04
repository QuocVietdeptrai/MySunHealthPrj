const router = require('express').Router();
const tourRoutes = require("./tour.route");
const homeRoutes = require("./home.route");
const cartRoutes = require("./cart.route");
const contactRoutes = require("./contact.route");

const settingMiddleWares = require("../../middlewares/client/setting.middlewares")
const categoryMiddleWares = require("../../middlewares/client/category.middlewares")
router.use(settingMiddleWares.websiteInfo);
router.use(categoryMiddleWares.list);
router.use('/', homeRoutes);
router.use('/tours', tourRoutes);
router.use('/cart', cartRoutes);
router.use('/contact', contactRoutes);
module.exports = router ;