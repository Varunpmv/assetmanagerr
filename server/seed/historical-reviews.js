const db = require('../models');
const { Op } = db.Sequelize;

async function seedHistory() {
  try {
    await db.sequelize.authenticate();
    const departments = await db.Department.findAll();
    const adminUser = await db.User.findOne({ where: { role: 'admin' } });
    const months = ['2026-01-01', '2026-02-01', '2026-03-01'];

    for (const month of months) {
      for (const dept of departments) {
        const [review] = await db.Review.findOrCreate({
          where: { department_id: dept.id, review_month: month },
          defaults: {
            review_status: 'completed',
            reviewed_by: dept.head_id || adminUser.id,
            approved_by: adminUser.id,
            approved_at: new Date(month)
          }
        });

        const deptUsers = await db.User.findAll({ where: { department_id: dept.id } });
        const userIds = deptUsers.map(u => u.id);
        const accessRecords = await db.Access.findAll({ where: { user_id: { [Op.in]: userIds } } });

        for (const access of accessRecords) {
          await db.ReviewItem.findOrCreate({
            where: { review_id: review.id, user_id: access.user_id, asset_id: access.asset_id },
            defaults: { access_level: access.access_level, status: 'approved' }
          });
        }
      }
    }
    console.log('✅ History seeded');
    process.exit(0);
  } catch (err) {
    console.error('History seed failed:', err);
    process.exit(1);
  }
}

seedHistory();
