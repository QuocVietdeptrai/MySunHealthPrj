const router = require('express').Router();
const settingController = require("../../controllers/admin/setting.controller");

router.get('/list', settingController.list);
router.get('/website_info', settingController.website_info);
router.get('/account_admin/list', settingController.account_admin_list);
router.get('/account_admin/create', settingController.account_admin_create);
router.get('/role/list', settingController.role_list);
router.get('/role/create', settingController.role_create);
module.exports = router;
