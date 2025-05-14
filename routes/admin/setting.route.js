const router = require('express').Router();
const settingController = require("../../controllers/admin/setting.controller");
const settingValidate = require("../../validates/admin/setting.validate");

const multer  = require('multer');
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({storage: cloudinaryHelper.storage});

router.get('/list', settingController.list);
router.get('/website_info', settingController.website_info);
router.patch('/website_info', 
            upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]),
            settingValidate.createPostWebstieInfo,
            settingController.website_infoPatch);


router.get('/account_admin/list', settingController.account_admin_list);
router.get('/account_admin/create', settingController.account_admin_create);
router.get('/role/list', settingController.role_list);

router.get('/role/edit/:id', settingController.editRole);
router.patch('/role/edit/:id',settingValidate.createPostRole, settingController.editRolePatch);

router.get('/role/create', settingController.role_create);
router.post('/role/create',
    settingValidate.createPostRole, 
    settingController.role_createPost);
router.patch('/role/delete/:id', settingController.deletePatch);
router.patch('/role/change-multi',settingController.changeMultiRolePatch);

module.exports = router;
