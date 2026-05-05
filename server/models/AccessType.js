const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AccessType extends Model {}
  AccessType.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
  }, { sequelize, modelName: 'AccessType' });
  return AccessType;
};
