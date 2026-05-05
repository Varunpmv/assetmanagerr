const { Asset, User, Department, Sequelize } = require('../models');
const { logActivity } = require('../utils/logger');
const { parseCSV } = require('../utils/csvHelper');
const { sendRenewalEmail } = require('../services/notificationService');
const RiskService = require('../services/riskService');
const { Op } = Sequelize;

exports.getAssets = async (req, res) => {
  try {
    const where = {};
    // Role-based filtering
    if (!['admin', 'auditor'].includes(req.user.role)) {
      const myDept = await Department.findOne({ where: { head_id: req.user.id } });
      if (myDept) {
        where.department_id = myDept.id;
      } else {
        where.id = -1; 
      }
    }

    const assets = await Asset.findAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: Department, as: 'dept', attributes: ['id', 'name'] }
      ]
    });
    res.json(assets);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: Department, as: 'dept', attributes: ['id', 'name'] }
      ]
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAsset = async (req, res) => {
  try {
    const assetData = { ...req.body };
    assetData.risk_score = RiskService.calculateScore(assetData);
    
    const asset = await Asset.create(assetData);
    await logActivity(req, 'CREATE', 'Asset', asset.id, { name: asset.name });
    res.status(201).json(asset);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    
    const oldValues = asset.toJSON();
    const updatedData = { ...asset.toJSON(), ...req.body };
    updatedData.risk_score = RiskService.calculateScore(updatedData);
    
    await asset.update(updatedData);
    await logActivity(req, 'UPDATE', 'Asset', asset.id, { old: oldValues, new: req.body });
    res.json(asset);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    const assetId = asset.id;
    await asset.destroy();
    await logActivity(req, 'DELETE', 'Asset', assetId, { name: asset.name });
    res.json({ message: 'Asset deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getExpiringAssets = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'admin' && req.user.role !== 'auditor') {
      const myDept = await Department.findOne({ 
        where: { [Op.or]: [{ head_id: req.user.id }, { id: req.user.department_id || null }] }
      });
      if (myDept) where.department_id = myDept.id;
      else return res.json([]);
    }

    const allAssets = await Asset.findAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['name', 'email'] },
        { model: Department, as: 'dept', attributes: ['name'] }
      ]
    });

    const now = new Date();
    const expiring = allAssets.filter(asset => {
      if (!asset.renewal_date) return false;
      const diff = new Date(asset.renewal_date) - now;
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      const isYearly = asset.renewal_cycle === 'Yearly' && daysLeft > 0 && daysLeft <= 30;
      const isMonthly = asset.renewal_cycle === 'Monthly' && daysLeft > 0 && daysLeft <= 7;
      return isYearly || isMonthly;
    }).map(a => ({
      ...a.toJSON(),
      daysRemaining: Math.ceil((new Date(a.renewal_date) - now) / (1000 * 60 * 60 * 24))
    }));

    res.json(expiring);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.renewAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { 
          model: Department, 
          as: 'dept', 
          include: [{ model: User, as: 'head', attributes: ['name', 'email'] }] 
        }
      ]
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (!asset.renewal_date) return res.status(400).json({ error: 'Asset has no renewal date to rollover' });

    const rawDate = asset.renewal_date instanceof Date
      ? asset.renewal_date.toISOString().split('T')[0]
      : String(asset.renewal_date).split('T')[0];

    const [year, month, day] = rawDate.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month - 1;

    if (asset.renewal_cycle === 'Monthly') {
      nextMonth += 1;
      if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }
    } else {
      nextYear += 1;
    }

    const nextDate = new Date(Date.UTC(nextYear, nextMonth, day));
    await asset.update({ renewal_date: nextDate.toISOString().split('T')[0] });

    await sendRenewalEmail({ asset, type: 'CONFIRMATION' });

    res.json({ message: 'Asset renewed successfully', next_renewal: nextDate });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.importAssets = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const data = await parseCSV(req.file.buffer);
    const results = { success: 0, failed: 0, errors: [] };

    const departments = await Department.findAll();
    const deptMap = departments.reduce((acc, d) => {
      acc[d.name.toLowerCase()] = d.id;
      return acc;
    }, {});

    const users = await User.findAll({ attributes: ['id', 'email'] });
    const userMap = users.reduce((acc, u) => {
      acc[u.email.toLowerCase()] = u.id;
      return acc;
    }, {});

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const assetData = {
          name: row.name || row.AssetName,
          type: row.type || row.AssetType || 'Software',
          description: row.description || row.Description || '',
          criticality: row.criticality || row.Criticality || 'Medium',
          renewal_cycle: row.renewal_cycle || row.RenewalCycle || 'Yearly',
          renewal_date: row.renewal_date || row.RenewalDate || null,
          purchase_date: row.purchase_date || row.PurchaseDate || null,
          data_classification: row.data_classification || row.DataClassification || 'Internal',
          status: 'active'
        };

        if (!assetData.name) throw new Error('Missing Asset Name');

        const deptName = row.department || row.Department;
        if (deptName && deptMap[deptName.toLowerCase()]) {
          assetData.department_id = deptMap[deptName.toLowerCase()];
        } else {
          throw new Error(`Department "${deptName}" not found`);
        }

        const ownerEmail = row.owner_email || row.OwnerEmail;
        if (ownerEmail && userMap[ownerEmail.toLowerCase()]) {
          assetData.owner_id = userMap[ownerEmail.toLowerCase()];
        } else {
          assetData.owner_id = req.user.id;
        }

        assetData.risk_score = RiskService.calculateScore(assetData);
        
        await Asset.create(assetData);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    await logActivity(req, 'IMPORT', 'Asset', null, { 
      filename: req.file.originalname, 
      success: results.success, 
      failed: results.failed 
    });

    res.json({ 
      message: `Import completed. ${results.success} succeeded, ${results.failed} failed.`,
      results 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
