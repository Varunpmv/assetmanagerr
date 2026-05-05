const express = require('express');
const router = express.Router();
const multer = require('multer');
const assetsController = require('../controllers/assetsController');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticate);

router.get('/', authorize(['admin', 'approver', 'reviewer', 'user', 'auditor']), assetsController.getAssets);
router.get('/expiring', authorize(['admin', 'approver', 'reviewer', 'user', 'auditor']), assetsController.getExpiringAssets);
router.get('/:id', authorize(['admin', 'approver', 'reviewer', 'user', 'auditor']), assetsController.getAssetById);
router.post('/', authorize(['admin']), assetsController.createAsset);
router.post('/import', authorize(['admin']), upload.single('file'), assetsController.importAssets);
router.put('/:id', authorize(['admin']), assetsController.updateAsset);
router.delete('/:id', authorize(['admin']), assetsController.deleteAsset);
router.post('/:id/renew', authorize(['admin']), assetsController.renewAsset);

module.exports = router;
