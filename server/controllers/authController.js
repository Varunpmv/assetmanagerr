const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Department } = require('../models');
const { logActivity } = require('../utils/logger');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Department, as: 'dept', attributes: ['id', 'name'] }]
    });

    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });
    if (user.status !== 'active') return res.status(403).json({ error: 'User account is inactive.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name, department_id: user.department_id, requires_password_change: user.requires_password_change },
      process.env.JWT_SECRET || 'supersecretjwtkey123',
      { expiresIn: '24h' }
    );

    await logActivity(req, 'LOGIN', 'Auth', user.id, { name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, dept: user.dept, requires_password_change: user.requires_password_change } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'department_id', 'role', 'status', 'requires_password_change'],
      include: [{ model: Department, as: 'dept', attributes: ['id', 'name'] }]
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long.' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.requires_password_change = false;
    await user.save();

    await logActivity(req, 'UPDATE_PASSWORD', 'Auth', user.id, { email: user.email });
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
