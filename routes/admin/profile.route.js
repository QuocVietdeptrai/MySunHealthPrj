const router = require('express').Router();
const profileController = require("../../controllers/admin/profile.controller");
const multer  = require('multer');
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({storage: cloudinaryHelper.storage});


router.get('/edit', profileController.edit);
router.patch('/edit',upload.single('avatar'), profileController.editPatch);
router.get('/change_password', profileController.change_password);
router.patch('/change_password', profileController.change_passwordPatch);



module.exports = router;
