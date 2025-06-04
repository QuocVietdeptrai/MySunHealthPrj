const router = require('express').Router();
const tourRoutes = require("./tour.route");
const homeRoutes = require("./home.route");
const cartRoutes = require("./cart.route");
const contactRoutes = require("./contact.route");
const categoryRoutes = require("./category.route");
const searchRoutes = require("./search.route");

const settingMiddleWares = require("../../middlewares/client/setting.middlewares")
const categoryMiddleWares = require("../../middlewares/client/category.middlewares")
router.use(settingMiddleWares.websiteInfo);
router.use(categoryMiddleWares.list);
router.use('/', homeRoutes);
router.use('/tour', tourRoutes);
router.use('/cart', cartRoutes);
router.use('/contact', contactRoutes);
router.use('/category', categoryRoutes);
router.use('/search', searchRoutes);
module.exports = router ;