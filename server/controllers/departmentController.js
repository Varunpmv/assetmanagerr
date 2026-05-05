const { Department, User } = require('../models');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{ model: User, as: 'head', attributes: ['id', 'name', 'email'] }]
    });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, head_id } = req.body;
    const dept = await Department.create({ name, head_id });
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, head_id } = req.body;
    const dept = await Department.findByPk(id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    
    dept.name = name || dept.name;
    dept.head_id = head_id || dept.head_id;
    await dept.save();
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.destroy({ where: { id } });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
