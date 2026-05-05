const { ActivityLog, User } = require('../models');

exports.getActivityLogs = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { limit = 100, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await ActivityLog.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }]
    });

    const total = await ActivityLog.count();
    res.json({ logs, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
