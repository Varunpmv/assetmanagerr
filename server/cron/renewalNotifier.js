const cron = require('node-cron');
const { Asset, Department, User } = require('../models');
const notificationService = require('../services/notificationService');

const checkRenewals = async () => {
  console.log('[Cron] Checking for upcoming asset renewals...');
  try {
    const assets = await Asset.findAll({
      include: [
        { 
          model: Department, 
          as: 'dept', 
          include: [{ model: User, as: 'head', attributes: ['name', 'email'] }] 
        }
      ]
    });

    for (const asset of assets) {
      if (!asset.renewal_date) continue;

      const diff = new Date(asset.renewal_date) - new Date();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      let shouldNotify = false;
      if (asset.renewal_cycle === 'Yearly' && daysLeft > 0 && daysLeft <= 30) shouldNotify = true;
      if (asset.renewal_cycle === 'Monthly' && daysLeft > 0 && daysLeft <= 7) shouldNotify = true;

      if (shouldNotify && asset.dept?.head_id) {
        await notificationService.notify(
          asset.dept.head_id,
          'Upcoming Asset Renewal',
          `The asset "${asset.name}" is scheduled for renewal in ${daysLeft} days.`,
          'WARNING',
          '/assets'
        );
      }
    }
  } catch (err) {
    console.error('[Cron Error] Renewal check failed:', err);
  }
};

const initCron = () => {
  cron.schedule('0 1 * * *', checkRenewals);
  console.log('[Cron] Renewal Notifier initialized (Daily @ 1 AM).');
};

module.exports = { initCron, checkRenewals };
