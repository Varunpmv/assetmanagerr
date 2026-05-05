const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/update-password', authenticate, authController.updatePassword);

module.exports = router;
