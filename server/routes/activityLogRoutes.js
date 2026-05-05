const express = require('express');
const router = express.Router();
const activityLogsController = require('../controllers/activityLogsController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, activityLogsController.getActivityLogs);

module.exports = router;
