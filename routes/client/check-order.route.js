const router = require('express').Router();

const checkOrderController = require("../../controllers/client/checkorder.controller");
router.get('/', checkOrderController.checkOrder);
module.exports = router ;