const { Access, User, Asset, Review, ReviewItem, Department, AccessType, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.grantAccess = async (req, res) => {
  try {
    const { user_id, asset_id, access_type_id } = req.body;
    
    // Check if access already exists
    const existing = await Access.findOne({ where: { user_id, asset_id } });
    if (existing) {
      await existing.update({ access_type_id });
    } else {
      await Access.create({ user_id, asset_id, access_type_id });
    }

    res.json({ message: 'Access granted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const { user_id, asset_id } = req.params;
    await Access.destroy({ where: { user_id, asset_id } });

    const review = await Review.findOne({
      where: { 
        asset_id,
        review_status: { [Op.ne]: 'completed' }
      }
    });

    if (review) {
      await ReviewItem.destroy({ where: { review_id: review.id, user_id, asset_id } });
      await ReviewItem.create({
        review_id: review.id,
        user_id,
        asset_id,
        access_level: 'revoked',
        status: 'revoked'
      });
      if (review.review_status !== 'pending') {
        review.review_status = 'pending';
        review.reviewed_by = null;
        review.approved_by = null;
        await review.save();
      }
    }

    res.json({ message: 'Access revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsersForAsset = async (req, res) => {
  try {
    const { asset_id } = req.params;
    const asset = await Asset.findByPk(asset_id, {
      include: [{ 
        model: User, 
        as: 'accessible_users', 
        where: { status: 'active' }, 
        required: false, 
        attributes: ['id', 'name', 'email', 'department_id'],
        through: { attributes: ['access_level', 'access_type_id', 'updatedAt'] }
      }]
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset.accessible_users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssetsForUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, {
      include: [{ 
        model: Asset, 
        as: 'accessible_assets',
        through: { attributes: ['access_level', 'access_type_id', 'updatedAt'] }
      }]
    });
    if (!user) return res.status(404).json({ error: 'User find failed' });
    res.json(user.accessible_assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAccessRecords = async (req, res) => {
  try {
    const isGlobalRole = ['admin', 'auditor'].includes(req.user.role);
    const where = {};
    
    if (!isGlobalRole) {
      const depts = await Department.findAll({ where: { head_id: req.user.id } });
      const deptIds = depts.map(d => d.id);
      if (req.user.department_id) deptIds.push(req.user.department_id);
      where['$Asset.department_id$'] = { [Op.in]: deptIds };
    }

    const records = await Access.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Asset, attributes: ['id', 'name', 'type', 'department_id'] },
        { model: AccessType, attributes: ['id', 'name'] }
      ],
      order: [
        [Asset, 'name', 'ASC'],
        [User, 'name', 'ASC']
      ]
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
