const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    department_id: { type: DataTypes.UUID },
    designation: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('admin', 'approver', 'reviewer', 'auditor', 'user'), defaultValue: 'user' },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    exit_date: { type: DataTypes.DATEONLY },
    password: { type: DataTypes.STRING, allowNull: false },
    requires_password_change: { type: DataTypes.BOOLEAN, defaultValue: true },
    notification_preferences: { 
      type: DataTypes.JSON, 
      defaultValue: { email: true, slack: true, inApp: true } 
    }
  }, { sequelize, modelName: 'User' });
  return User;
};
