const router = require('express').Router();
const userController = require("../../controllers/admin/user.controller");


router.get('/list', userController.list);
router.get('/edit/:id', userController.edit);
router.patch('/edit/:id',userController.editPatch);
router.patch('/delete/:id', userController.deletePatch);
router.patch('/change-multi',userController.changeMultiPatch);
router.get('/trash', userController.trash);
router.patch('/undo/:id', userController.undoPatch)
router.patch('/delete-destroy/:id', userController.deleteDestroyPatch)
router.patch('/trash/change-multi', userController.trashChangeMultiPatch)
module.exports = router;
