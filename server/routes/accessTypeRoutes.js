const express = require('express');
const router = express.Router();
const accessTypesController = require('../controllers/accessTypesController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', accessTypesController.getAccessTypes);
router.post('/', authorize(['admin']), accessTypesController.createAccessType);
router.put('/:id', authorize(['admin']), accessTypesController.updateAccessType);
router.delete('/:id', authorize(['admin']), accessTypesController.deleteAccessType);

module.exports = router;
