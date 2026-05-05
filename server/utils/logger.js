const { ActivityLog } = require('../models');

/**
 * Utility to log user activities for the Audit Trail.
 */
const logActivity = async (req, action, targetType, targetId = null, details = {}) => {
  try {
    await ActivityLog.create({
      user_id: req.user?.id || null,
      action,
      target_type: targetType,
      target_id: String(targetId),
      details,
      ip_address: req.ip || req.connection.remoteAddress,
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err);
  }
};

module.exports = { logActivity };
