const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Department extends Model {}
  Department.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    head_id: { type: DataTypes.UUID, allowNull: true },
  }, { sequelize, modelName: 'Department' });
  return Department;
};
