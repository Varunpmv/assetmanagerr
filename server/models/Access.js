const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Access extends Model {}
  Access.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    asset_id: { type: DataTypes.UUID, allowNull: false },
    access_type_id: { type: DataTypes.UUID },
    access_level: { type: DataTypes.STRING, defaultValue: 'read' }, // Legacy/Backup
  }, { sequelize, modelName: 'Access' });
  return Access;
};
