const cron = require('node-cron');
const { Asset, Access, Review, ReviewItem, Department, User } = require('../models');
const notificationService = require('../services/notificationService');

const generateReviews = async () => {
  try {
    console.log('Starting monthly access review generation...');
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const reviewMonthString = currentMonth.toISOString().split('T')[0];

    const assets = await Asset.findAll({ where: { status: 'active' } });

    for (const asset of assets) {
      const existingReview = await Review.findOne({
        where: { asset_id: asset.id, review_month: reviewMonthString }
      });

      if (!existingReview) {
        const review = await Review.create({
          asset_id: asset.id,
          review_month: reviewMonthString,
          review_status: 'pending'
        });

        const accessList = await Access.findAll({ 
          where: { asset_id: asset.id },
          include: [{ model: User, where: { status: 'active' }, required: true }]
        });

        for (const access of accessList) {
          await ReviewItem.create({
            review_id: review.id,
            user_id: access.user_id,
            asset_id: asset.id,
            access_level: access.access_level,
            access_type_id: access.access_type_id,
            status: 'pending'
          });
        }
      }
    }
    
    const departments = await Department.findAll({ include: [{ model: User, as: 'head' }] });
    for (const dept of departments) {
      if (dept.head_id) {
        await notificationService.notify(
          dept.head_id,
          'New Review Cycle',
          `The access review cycle for ${new Date(reviewMonthString).toLocaleString('default', { month: 'long', year: 'numeric' })} has started.`,
          'INFO',
          '/reviews'
        );
      }
    }

    console.log('Monthly access review generation completed.');
  } catch (err) {
    console.error('Error generating monthly reviews:', err);
  }
};

const initCron = () => {
  cron.schedule('0 0 1 * *', () => {
    generateReviews();
  });
};

module.exports = { initCron, generateReviews };
