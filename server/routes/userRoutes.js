const express = require('express');
const router = express.Router();
const multer = require('multer');
const usersController = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticate);

router.get('/', authorize(['admin', 'approver', 'reviewer', 'user', 'auditor']), usersController.getUsers);
router.get('/me', usersController.getMe);
router.get('/:id', authorize(['admin', 'approver', 'reviewer', 'user', 'auditor']), usersController.getUserById);
router.post('/', authorize(['admin']), usersController.createUser);
router.post('/import', authorize(['admin']), upload.single('file'), usersController.importUsers);
router.put('/:id', authorize(['admin']), usersController.updateUser);
router.delete('/:id', authorize(['admin']), usersController.deleteUser);
router.post('/:id/force-reset', authorize(['admin']), usersController.forcePasswordReset);

module.exports = router;
