const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Asset extends Model {}
  Asset.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('Cloud', 'SaaS', 'Internal', 'Hardware'), allowNull: false },
    department_id: { type: DataTypes.UUID },
    owner_id: { type: DataTypes.UUID, allowNull: false },
    purchase_date: { type: DataTypes.DATE },
    renewal_date: { type: DataTypes.DATE },
    renewal_cycle: { type: DataTypes.ENUM('Monthly', 'Yearly'), defaultValue: 'Yearly' },
    last_reviewed_at: { type: DataTypes.DATE },
    cost: { type: DataTypes.DECIMAL(10, 2) },
    currency: { type: DataTypes.ENUM('USD', 'INR'), defaultValue: 'USD' },
    license_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    criticality: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' },
    data_sensitivity: { type: DataTypes.ENUM('Public', 'Internal', 'Confidential', 'Restricted'), defaultValue: 'Internal' },
    risk_score: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
    responsible: { type: DataTypes.STRING },
    accountable: { type: DataTypes.STRING },
    consulted: { type: DataTypes.STRING },
    informed: { type: DataTypes.STRING },
  }, { sequelize, modelName: 'Asset' });
  return Asset;
};
