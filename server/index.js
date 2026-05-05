require('dotenv').config();
const express = require('express');
const cors = require('cors');

const reviewCron = require('./cron/reviewGenerator');
const renewalCron = require('./cron/renewalNotifier');
reviewCron.initCron();
renewalCron.initCron();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/access', require('./routes/accessRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/access-types', require('./routes/accessTypeRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Asset Access Manager API is running' });
});

const PORT = process.env.PORT || 5050;

const { sequelize, Department, AccessType } = require('./models');
Department.sync({ alter: true })
  .then(() => AccessType.sync({ alter: true }))
  .then(() => sequelize.sync({ alter: true }))
  .then(async () => {
    try {
      await sequelize.query('ALTER TABLE "Reviews" ALTER COLUMN "asset_id" DROP NOT NULL;');
    } catch (e) {}
    
    try {
      await sequelize.query(`ALTER TYPE "enum_Reviews_review_status" ADD VALUE IF NOT EXISTS 'pending_approval';`);
      await sequelize.query(`ALTER TYPE "enum_Reviews_review_status" ADD VALUE IF NOT EXISTS 'rejected';`);
    } catch (e) {}

    console.log('Database synced successfully.');

    const existingTypes = await AccessType.count();
    if (existingTypes === 0) {
      await AccessType.bulkCreate([
        { name: 'Read', description: 'Can view assets and associated documentation.' },
        { name: 'Write', description: 'Can modify configuration and data within the asset.' },
        { name: 'Admin', description: 'Full administrative control over the asset.' }
      ]);
      console.log('Default Access Types bootstrapped.');
    }
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
