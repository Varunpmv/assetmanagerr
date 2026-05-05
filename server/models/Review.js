const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Review extends Model {}
  Review.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    asset_id: { type: DataTypes.UUID, allowNull: true },
    department_id: { type: DataTypes.UUID, allowNull: true },
    review_month: { type: DataTypes.DATEONLY, allowNull: false },
    review_status: { type: DataTypes.ENUM('pending', 'pending_approval', 'completed', 'rejected'), defaultValue: 'pending' },
    reviewed_by: { type: DataTypes.UUID },
    approved_by: { type: DataTypes.UUID },
    approved_at: { type: DataTypes.DATE },
    comments: { type: DataTypes.TEXT },
  }, { sequelize, modelName: 'Review' });
  return Review;
};
