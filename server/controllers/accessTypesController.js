const { AccessType } = require('../models');

exports.getAccessTypes = async (req, res) => {
  try {
    const types = await AccessType.findAll({ order: [['name', 'ASC']] });
    res.json(types);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAccessType = async (req, res) => {
  try {
    const type = await AccessType.create(req.body);
    res.status(201).json(type);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateAccessType = async (req, res) => {
  try {
    const type = await AccessType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ error: 'Access type not found' });
    await type.update(req.body);
    res.json(type);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteAccessType = async (req, res) => {
  try {
    const type = await AccessType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ error: 'Access type not found' });
    await type.destroy();
    res.json({ message: 'Access type deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
