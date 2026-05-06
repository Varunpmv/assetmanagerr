require('dotenv').config();
const db = require('../models');
const { Op } = db.Sequelize;

async function seedHistory() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection established.');

    const departments = await db.Department.findAll();
    const adminUser = await db.User.findOne({ where: { role: 'admin' } });

    const months = ['2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01'];

    for (const month of months) {
      console.log(`Processing month: ${month}...`);
      
      for (const dept of departments) {
        const [review, created] = await db.Review.findOrCreate({
          where: {
            department_id: dept.id,
            review_month: month
          },
          defaults: {
            review_status: 'completed',
            reviewed_by: dept.head_id || adminUser.id,
            approved_by: adminUser.id,
            approved_at: new Date(month),
            comments: 'Historical migration of completed reviews.'
          }
        });

        if (!created) {
            await review.update({ review_status: 'completed' });
        }

        const deptUsers = await db.User.findAll({ where: { department_id: dept.id } });
        const userIds = deptUsers.map(u => u.id);
        
        const accessRecords = await db.Access.findAll({
          where: { user_id: { [Op.in]: userIds } }
        });

        let itemCounter = 0;
        for (const access of accessRecords) {
          const [item, itemCreated] = await db.ReviewItem.findOrCreate({
            where: {
              review_id: review.id,
              user_id: access.user_id,
              asset_id: access.asset_id
            },
            defaults: {
              access_level: access.access_level,
              status: 'approved'
            }
          });
          if (itemCreated) itemCounter++;
        }
        console.log(`  - ${dept.name}: ${itemCounter} items created/verified.`);
      }
    }

    console.log('✅ Historical review data seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed migration data:', err);
    process.exit(1);
  }
}

seedHistory();
