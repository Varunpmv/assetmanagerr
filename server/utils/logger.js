const { ActivityLog } = require('../models');

/**
 * Utility to log user activities for the Audit Trail.
 * @param {Object} req - Express request object (to extract user and IP)
 * @param {String} action - The action type (CREATE, UPDATE, DELETE, etc.)
 * @param {String} entityType - The type of entity being acted upon (Asset, User, etc.)
 * @param {String} entityId - The ID of the affected entity
 * @param {Object} details - Additional JSON payload for details
 */
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
