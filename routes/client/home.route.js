const router = require('express').Router();

const medicineController = require("../../controllers/client/home.controller");
router.get('/', medicineController.home);
module.exports = router ;