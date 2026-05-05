const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: false,
});

const User = require('./User')(sequelize);
const Asset = require('./Asset')(sequelize);
const Access = require('./Access')(sequelize);
const Review = require('./Review')(sequelize);
const ReviewItem = require('./ReviewItem')(sequelize);
const Department = require('./Department')(sequelize);
const Notification = require('./Notification')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);
const SystemConfig = require('./SystemConfig')(sequelize);
const AccessType = require('./AccessType')(sequelize);

// Define Associations
User.hasMany(Asset, { foreignKey: 'owner_id', as: 'owned_assets' });
Asset.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.belongsToMany(Asset, { through: Access, foreignKey: 'user_id', as: 'accessible_assets' });
Asset.belongsToMany(User, { through: Access, foreignKey: 'asset_id', as: 'accessible_users' });

Access.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Access, { foreignKey: 'user_id' });
Access.belongsTo(Asset, { foreignKey: 'asset_id' });
Asset.hasMany(Access, { foreignKey: 'asset_id' });

Access.belongsTo(AccessType, { foreignKey: 'access_type_id' });
AccessType.hasMany(Access, { foreignKey: 'access_type_id' });

Department.belongsTo(User, { foreignKey: 'head_id', as: 'head' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'dept' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'employees' });

Asset.belongsTo(Department, { foreignKey: 'department_id', as: 'dept' });
Department.hasMany(Asset, { foreignKey: 'department_id', as: 'assets' });

Asset.hasMany(Review, { foreignKey: 'asset_id' });
Review.belongsTo(Asset, { foreignKey: 'asset_id' });

Department.hasMany(Review, { foreignKey: 'department_id' });
Review.belongsTo(Department, { foreignKey: 'department_id' });

Review.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

Review.hasMany(ReviewItem, { foreignKey: 'review_id' });
ReviewItem.belongsTo(Review, { foreignKey: 'review_id' });

User.hasMany(ReviewItem, { foreignKey: 'user_id' });
ReviewItem.belongsTo(User, { foreignKey: 'user_id' });

ReviewItem.belongsTo(AccessType, { foreignKey: 'access_type_id' });
AccessType.hasMany(ReviewItem, { foreignKey: 'access_type_id' });

ReviewItem.belongsTo(Asset, { foreignKey: 'asset_id' });
Asset.hasMany(ReviewItem, { foreignKey: 'asset_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ActivityLog, { foreignKey: 'user_id' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

const db = {
  sequelize,
  Sequelize,
  User,
  Asset,
  Access,
  Review,
  ReviewItem,
  Department,
  Notification,
  ActivityLog,
  SystemConfig,
  AccessType
};

module.exports = db;
