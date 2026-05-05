const { Review, ReviewItem, Asset, User, Access, Department, AccessType, Sequelize } = require('../models');
const { logActivity } = require('../utils/logger');
const notificationService = require('../services/notificationService');
const { Op } = Sequelize;

exports.getReviews = async (req, res) => {
  try {
    const isGlobal = ['admin', 'auditor'].includes(req.user.role);
    const where = {};
    if (!isGlobal) {
      const myDept = await Department.findOne({ where: { head_id: req.user.id } });
      if (myDept) {
        where.department_id = myDept.id;
      } else {
        return res.json([]); 
      }
    }

    const reviews = await Review.findAll({
      where,
      include: [
        { model: Asset, attributes: ['id', 'name', 'type'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] },
        { model: Department, attributes: ['id', 'name'] }
      ],
      order: [['review_month', 'DESC']]
    });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: Asset, attributes: ['id', 'name', 'type'] },
        { model: Department, attributes: ['id', 'name'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
        { 
          model: ReviewItem, 
          include: [
            { model: User, attributes: ['id', 'name', 'email'] },
            { model: Asset, attributes: ['id', 'name', 'type'] },
            { model: AccessType, attributes: ['id', 'name'] }
          ] 
        }
      ]
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.submitReview = async (req, res) => {
  try {
    const { items, comments } = req.body;
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    for (const item of items) {
      await ReviewItem.update(
        { status: item.status },
        { where: { id: item.id, review_id: review.id } }
      );
    }

    review.review_status = 'pending_approval';
    review.reviewed_by = req.user.id;
    review.comments = comments;
    await review.save();

    await logActivity(req, 'SUBMIT', 'Review', review.id, { itemsCount: items.length });
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{ model: ReviewItem }]
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    for (const item of review.ReviewItems) {
      if (item.status === 'revoked') {
        await Access.destroy({ where: { user_id: item.user_id, asset_id: item.asset_id } });
      }
    }

    review.review_status = 'completed';
    review.approved_by = req.user.id;
    review.approved_at = new Date();
    await review.save();

    await logActivity(req, 'APPROVE', 'Review', review.id);
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.review_status = 'rejected';
    review.comments = req.body.comments || 'Rejected by approver';
    await review.save();

    await logActivity(req, 'REJECT', 'Review', review.id);
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.revokeAccessImmediately = async (req, res) => {
  try {
    const { userId, assetId, accessLevel, accessTypeId } = req.body;
    
    await Access.destroy({ where: { user_id: userId, asset_id: assetId } });

    const reviewMonth = new Date().toISOString().slice(0, 7) + '-01';
    const [review] = await Review.findOrCreate({
      where: { asset_id: assetId, review_month: reviewMonth },
      defaults: { review_status: 'pending' }
    });

    const [item, created] = await ReviewItem.findOrCreate({
      where: { review_id: review.id, user_id: userId, asset_id: assetId },
      defaults: { 
        status: 'revoked', 
        access_level: accessLevel,
        access_type_id: accessTypeId
      }
    });

    if (!created) {
      item.status = 'revoked';
      if (accessLevel) item.access_level = accessLevel;
      if (accessTypeId) item.access_type_id = accessTypeId;
      await item.save();
    }

    if (review.review_status === 'completed') {
      review.review_status = 'pending';
      await review.save();
    }

    await logActivity(req, 'ACCESS_REVOKED', 'ReviewItem', null, { userId, assetId });
    res.json({ message: 'Access revoked successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resetReviewCycle = async (req, res) => {
  try {
    const { deptId } = req.params;
    const reviewMonth = new Date().toISOString().slice(0, 7) + '-01';
    const review = await Review.findOne({ where: { department_id: deptId, review_month: reviewMonth } });
    if (review) {
      review.review_status = 'pending';
      await review.save();
    }
    res.json({ message: 'Review cycle reset to pending.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.exportDepartmentReviews = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { reviewId } = req.query;

    const where = { department_id: deptId };
    if (reviewId) where.id = reviewId;
    else where.review_status = 'completed';

    const reviews = await Review.findAll({
      where,
      include: [
        { model: User, as: 'reviewer', attributes: ['name'] },
        { model: User, as: 'approver', attributes: ['name'] },
        {
          model: ReviewItem,
          include: [
            { model: Asset, attributes: ['name', 'type'] },
            { model: User, attributes: ['name', 'email'] },
            { model: AccessType, attributes: ['name'] }
          ]
        }
      ]
    });

    if (reviews.length === 0) return res.status(404).json({ error: 'No completed reviews found.' });

    const csvContent = _generateReviewCSV(reviews);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Reviews_${deptId.slice(0,8)}.csv`);
    res.status(200).send(csvContent);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const _generateReviewCSV = (reviews) => {
  const headers = ['Month', 'Asset', 'Type', 'Employee', 'Email', 'Access', 'Status', 'Reviewer', 'Approver', 'Date'];
  const rows = reviews.flatMap(review => {
    return review.ReviewItems.map(item => [
      review.review_month,
      item.Asset?.name || 'N/A',
      item.Asset?.type || 'N/A',
      item.User?.name || 'N/A',
      item.User?.email || 'N/A',
      item.AccessType?.name || item.access_level || 'N/A',
      item.status,
      review.reviewer?.name || 'N/A',
      review.approver?.name || 'N/A',
      review.approved_at || 'N/A'
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  });
  return [headers.join(','), ...rows].join('\n');
};

exports.getPrivilegedAccessList = async (req, res) => {
  try {
    const privilegedTypes = await AccessType.findAll({
      where: { name: { [Op.iLike]: '%admin%' } }
    });
    const typeIds = privilegedTypes.map(t => t.id);

    const privilegedAccess = await Access.findAll({
      where: { access_type_id: { [Op.in]: typeIds } },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Asset, attributes: ['id', 'name', 'type', 'department_id'], include: [{ model: Department, as: 'dept', attributes: ['name'] }] },
        { model: AccessType, attributes: ['id', 'name'] }
      ]
    });

    res.json({ accessList: privilegedAccess });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.confirmPrivilegedReview = async (req, res) => {
  try {
    const { items } = req.body;
    const revokedItems = items.filter(i => i.status === 'revoked');
    for (const item of revokedItems) {
      await Access.destroy({ where: { user_id: item.userId, asset_id: item.assetId, access_type_id: item.accessLevelId } });
    }
    await logActivity(req, 'REVIEW', 'PrivilegedAccess', null, { total: items.length, revoked: revokedItems.length });
    res.json({ message: 'Processed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
