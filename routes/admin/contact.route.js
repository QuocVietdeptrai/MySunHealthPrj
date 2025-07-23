const router = require('express').Router();
const contactController = require("../../controllers/admin/contact.controller");

router.get('/list', contactController.list);
router.patch('/delete/:id', contactController.deletePatch);
router.get('/trash', contactController.trash);

router.patch('/undo/:id', contactController.undoPatch);

router.patch('/delete-destroy/:id', contactController.deleteDestroyDelete);

router.patch('/change-multi', contactController.changeMultiPatch)

router.patch('/trash/change-multi', contactController.trashChangeMultiPatch)

module.exports = router;
