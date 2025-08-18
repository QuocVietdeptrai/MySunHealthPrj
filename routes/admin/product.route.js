const router = require('express').Router();
const multer  = require('multer');
const productController = require("../../controllers/admin/product.controller");
const productValidate = require("../../validates/admin/product.validate");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({storage: cloudinaryHelper.storage});


router.get('/list', productController.list);
router.get('/create', productController.create);
router.post('/create',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  productValidate.createPost,
  productController.createPost
);
router.get('/trash', productController.trash);
router.get('/edit/:id', productController.edit);
router.patch(
  '/edit/:id', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]), 
  productValidate.createPost,
  productController.editPatch
)

router.patch('/delete/:id', productController.deletePatch);
router.patch('/undo/:id', productController.undoPatch)
router.patch('/delete-destroy/:id', productController.deleteDestroyPatch)
router.patch('/trash/change-multi', productController.trashChangeMultiPatch)
router.patch('/change-multi',productController.changeMultiPatch);
module.exports = router;
