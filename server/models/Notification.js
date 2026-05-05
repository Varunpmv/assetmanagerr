const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('INFO', 'WARNING', 'SUCCESS', 'DANGER'), defaultValue: 'INFO' },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    link: { type: DataTypes.STRING, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'Notifications' });
  return Notification;
};
