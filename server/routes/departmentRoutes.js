const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize(['admin', 'approver', 'reviewer', 'user', 'auditor']), departmentController.getAllDepartments);
router.post('/', authorize(['admin']), departmentController.createDepartment);
router.put('/:id', authorize(['admin']), departmentController.updateDepartment);
router.delete('/:id', authorize(['admin']), departmentController.deleteDepartment);

module.exports = router;
