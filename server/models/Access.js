const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Access extends Model {}
  Access.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    asset_id: { type: DataTypes.UUID, allowNull: false },
    access_level: { type: DataTypes.ENUM('read', 'write', 'admin', 'super_admin'), defaultValue: 'read', allowNull: true },
    access_type_id: { type: DataTypes.UUID, allowNull: true },
    granted_by: { type: DataTypes.UUID },
  }, { sequelize, modelName: 'Access' });
  return Access;
};
