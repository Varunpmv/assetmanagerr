const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SystemConfig extends Model {}
  SystemConfig.init({
    key:   { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    value: { type: DataTypes.TEXT,   allowNull: true },
  }, { sequelize, modelName: 'SystemConfig', tableName: 'SystemConfigs', timestamps: true });
  return SystemConfig;
};
