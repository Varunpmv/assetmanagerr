const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ReviewItem extends Model {}
  ReviewItem.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    review_id: { type: DataTypes.UUID, allowNull: false },
    asset_id: { type: DataTypes.UUID, allowNull: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    access_level: { type: DataTypes.STRING, allowNull: false },
    access_type_id: { type: DataTypes.UUID, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'approved', 'revoked'), defaultValue: 'pending' },
  }, { sequelize, modelName: 'ReviewItem' });
  return ReviewItem;
};
