const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize(['admin', 'approver', 'reviewer']), accessController.grantAccess);
router.delete('/:asset_id/user/:user_id', authorize(['admin', 'approver', 'reviewer']), accessController.revokeAccess);

router.get('/asset/:asset_id', authorize(['admin', 'approver', 'reviewer', 'user']), accessController.getUsersForAsset);
router.get('/user/:user_id', authorize(['admin', 'approver', 'reviewer', 'user']), accessController.getAssetsForUser);

router.get('/explorer', authorize(['admin', 'auditor', 'approver', 'reviewer']), accessController.getAllAccessRecords);

module.exports = router;
