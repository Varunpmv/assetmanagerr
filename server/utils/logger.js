const { ActivityLog } = require('../models');

const logActivity = async (req, action, entityType, entityId = null, details = {}) => {
  try {
    const user = req.user || {};
    await ActivityLog.create({
      user_id: user.id || null,
      user_name: user.name || 'System',
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      details,
      ip_address: req.ip || req.connection.remoteAddress,
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err);
  }
};

module.exports = { logActivity };
