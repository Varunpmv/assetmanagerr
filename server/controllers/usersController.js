const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Department, Sequelize } = require('../models');
const { logActivity } = require('../utils/logger');
const { parseCSV } = require('../utils/csvHelper');
const notificationService = require('../services/notificationService');
const { Op } = Sequelize;

exports.getUsers = async (req, res) => {
  try {
    const where = {};
    if (!['admin', 'auditor'].includes(req.user.role)) {
      if (req.user.department_id) {
        where.department_id = req.user.department_id;
      } else {
        const myDept = await Department.findOne({ where: { head_id: req.user.id } });
        if (myDept) where.department_id = myDept.id;
        else where.id = req.user.id;
      }
    }

    const users = await User.findAll({ 
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Department, as: 'dept', attributes: ['id', 'name'] }]
    });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['password'] },
      include: [{ model: Department, as: 'dept', attributes: ['id', 'name'] }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { 
      attributes: { exclude: ['password'] },
      include: [{ model: Department, as: 'dept', attributes: ['id', 'name'] }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (req.user.role !== 'admin' && user.department_id !== req.user.department_id && user.id !== req.user.id) {
       return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, department_id, designation, role, status, exit_date, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, department_id, designation, role, status, exit_date, password: hashedPassword, requires_password_change: true });
    
    await notificationService.sendEmail(
      email,
      'Welcome to Asset Manager',
      `Your account has been created successfully. Your temporary password is: <b>${password}</b>`,
      null,
      'INFO'
    );

    await logActivity(req, 'CREATE', 'User', user.id, { name: user.name, role: user.role });
    const userObj = user.toJSON();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, department_id, designation, role, status, exit_date } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const oldValues = { ...user.toJSON() };
    delete oldValues.password;
    await user.update({ name, email, department_id, designation, role, status, exit_date });
    await logActivity(req, 'UPDATE', 'User', user.id, { old: oldValues, new: req.body });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const userId = user.id;
    await user.destroy();
    await logActivity(req, 'DELETE', 'User', userId, { name: user.name });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.forcePasswordReset = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    user.requires_password_change = true;
    await user.save();

    await notificationService.sendEmail(
      user.email,
      'Security Alert: Mandatory Password Reset',
      `Your password has been reset. Temporary password: <b>${tempPassword}</b>`,
      null,
      'WARNING'
    );

    res.json({ message: 'Password reset and user notified.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.importUsers = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const data = await parseCSV(req.file.buffer);
    const results = { success: 0, failed: 0, errors: [] };

    const departments = await Department.findAll();
    const deptMap = departments.reduce((acc, d) => {
      acc[d.name.toLowerCase()] = d.id;
      return acc;
    }, {});

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const name = (row.name || row.Name || '').trim();
        const email = (row.email || row.Email || '').trim();
        const deptName = (row.department || row.Department || '').trim();
        const designation = (row.designation || row.Designation || 'Employee').trim();
        const role = (row.system_role || row.SystemRole || 'user').toLowerCase().trim();
        
        if (!name || !email) throw new Error('Missing name/email');
        
        const department_id = deptMap[deptName.toLowerCase()] || null;
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const [user, created] = await User.findOrCreate({
          where: { email: email.toLowerCase() },
          defaults: { name, department_id, designation, role, password: hashedPassword, requires_password_change: true, status: 'active' }
        });

        if (!created) {
          await user.update({ name, department_id, designation, role });
        } else {
          await notificationService.sendEmail(email, 'Welcome', `Temp password: ${tempPassword}`, null, 'INFO');
        }
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    await logActivity(req, 'IMPORT', 'User', null, { success: results.success, failed: results.failed });
    res.json({ message: `Import completed. ${results.success} success, ${results.failed} failed.`, results });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
