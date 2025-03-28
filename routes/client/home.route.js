const router = require('express').Router();

const tourController = require("../../controllers/client/home.controller");
router.get('/', tourController.home);
module.exports = router ;