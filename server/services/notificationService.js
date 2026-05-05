const nodemailer = require('nodemailer');
const axios = require('axios');
const { Notification, User, SystemConfig } = require('../models');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.slackUrl = null;
    this.smtpUser = null;
    this._init();
  }

  async _getVal(key, envFallback) {
    try {
      const row = await SystemConfig.findByPk(key);
      return (row && row.value) ? row.value : (envFallback || null);
    } catch {
      return envFallback || null;
    }
  }

  async _init() {
    const host = await this._getVal('smtp_host', process.env.SMTP_HOST);
    const port = await this._getVal('smtp_port', process.env.SMTP_PORT || '587');
    const user = await this._getVal('smtp_user', process.env.SMTP_USER);
    const pass = await this._getVal('smtp_pass', process.env.SMTP_PASS);
    this.slackUrl = await this._getVal('slack_webhook_url', process.env.SLACK_WEBHOOK_URL);
    this.smtpUser = user;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host, port: parseInt(port), secure: port === '465',
        auth: { user, pass },
      });
      console.log('[NOTIFICATION] Email channel initialized.');
    } else {
      this.transporter = null;
      console.warn('[NOTIFICATION] Email credentials missing. Running in MOCK mode.');
    }
  }

  async reinitialize() {
    await this._init();
  }

  async notify(userId, title, message, type = 'INFO', link = null) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      const prefs = user.notification_preferences || { email: true, slack: true, inApp: true };

      let notification = null;
      if (prefs.inApp !== false) {
        notification = await Notification.create({ user_id: userId, title, message, type, link });
      }

      if (prefs.email !== false && this.transporter && user.email) {
        this.sendEmail(user.email, title, message, link, type);
      }

      if (prefs.slack !== false && this.slackUrl) {
        this.sendSlack(user.name, title, message, link, type);
      }

      return notification;
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
    }
  }

  async sendEmail(to, title, message, link, type, attachments = []) {
    const color = type === 'DANGER' ? '#ef4444' : type === 'WARNING' ? '#f59e0b' : '#6366f1';
    try {
      await this.transporter.sendMail({
        from: `"Asset Manager" <${this.smtpUser}>`,
        to,
        subject: `[${type}] ${title}`,
        html: `
          <div style="font-family:sans-serif;padding:20px;color:#333">
            <h2 style="color:${color};border-bottom:2px solid ${color};padding-bottom:10px">${title}</h2>
            <p style="font-size:16px">${message}</p>
            ${link ? `<a href="${process.env.CLIENT_URL||'http://localhost:5173'}${link}" style="display:inline-block;padding:10px 20px;background:${color};color:white;text-decoration:none;border-radius:5px">View Details</a>` : ''}
            <hr style="margin-top:30px;border:0;border-top:1px solid #eee"/>
            <p style="font-size:12px;color:#999">Automated alert from Riskcovry Asset Manager.</p>
          </div>`,
        attachments: attachments || []
      });
    } catch (err) {
      console.error('[NOTIFICATION] Email send failed:', err.message);
    }
  }

  async sendSlack(userName, title, message, link, type) {
    const emoji = type === 'DANGER' ? '🚨' : type === 'WARNING' ? '⚠️' : '🔔';
    const payload = {
      text: `${emoji} *${title}*`,
      blocks: [{ type: 'section', text: { type: 'mrkdwn', text: `${emoji} *${title}*\nUser: ${userName}\n${message}` } }]
    };
    if (link) payload.blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Details' }, url: `${process.env.CLIENT_URL||'http://localhost:5173'}${link}` }] });
    try {
      await axios.post(this.slackUrl, payload);
    } catch (err) {
      console.error('[NOTIFICATION] Slack send failed:', err.message);
    }
  }

  async notifyMany(userIds, title, message, type = 'INFO', link = null) {
    return Promise.all(userIds.map(id => this.notify(id, title, message, type, link)));
  }

  sendRenewalEmail = async ({ asset, type }) => {
    try {
      if (type === 'CONFIRMATION') {
        const headId = asset.dept?.head_id;
        const admins = await User.findAll({ where: { role: 'admin', status: 'active' } });
        const adminIds = admins.map(a => a.id);
        const recipientIds = [...new Set([headId, ...adminIds])].filter(Boolean);
        const nextRenewalStr = asset.renewal_date ? new Date(asset.renewal_date).toLocaleDateString('en-GB') : 'Unknown';
        await this.notifyMany(recipientIds, 'Asset Renewed', `The asset "${asset.name}" has been successfully renewed. Next renewal date: ${nextRenewalStr}.`, 'SUCCESS', '/assets');
      }
    } catch (err) {
      console.error('[NOTIFICATION] Failed to send renewal email:', err);
    }
  }
}

module.exports = new NotificationService();
