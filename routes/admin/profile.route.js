const router = require('express').Router();
const profileController = require("../../controllers/admin/profile.controller");

router.get('/edit', profileController.edit);
router.get('/change_password', profileController.change_password);



module.exports = router;
