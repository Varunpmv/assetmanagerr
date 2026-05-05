const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize(['admin', 'approver', 'reviewer', 'auditor']), reviewsController.getReviews);
router.get('/:id', authorize(['admin', 'approver', 'reviewer', 'auditor']), reviewsController.getReviewById);
router.post('/:id/submit', authorize(['admin', 'approver', 'reviewer']), reviewsController.submitReview);
router.post('/:id/approve', authorize(['admin', 'approver']), reviewsController.approveReview);
router.post('/:id/reject', authorize(['admin', 'approver']), reviewsController.rejectReview);

router.get('/export/:deptId', authorize(['admin', 'approver', 'reviewer', 'auditor']), reviewsController.exportDepartmentReviews);
router.get('/privileged', authorize(['admin', 'reviewer', 'auditor']), reviewsController.getPrivilegedAccessList);
router.post('/privileged/confirm', authorize(['admin', 'reviewer']), reviewsController.confirmPrivilegedReview);

router.post('/instant-revoke', authorize(['admin', 'reviewer', 'approver']), reviewsController.revokeAccessImmediately);
router.post('/reset-cycle/:deptId', authorize(['admin', 'reviewer', 'approver']), reviewsController.resetReviewCycle);

module.exports = router;
