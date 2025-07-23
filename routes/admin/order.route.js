const router = require('express').Router();
const orderController = require("../../controllers/admin/order.controller");

router.get('/list', orderController.list);
router.get('/edit/:id', orderController.edit);
router.patch('/edit/:id', orderController.editPatch);
router.patch('/delete/:id', orderController.deletePatch);

router.get('/trash', orderController.trash);
router.patch('/undo/:id', orderController.undoPatch)
router.patch('/delete-destroy/:id', orderController.deleteDestroyPatch)



module.exports = router;
