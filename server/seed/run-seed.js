const bcrypt = require('bcryptjs');
const db = require('../models');

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Sandra', 'Mark', 'Margaret', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Edward', 'Deborah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function runSeed() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    
    try {
      await db.sequelize.query(`ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'approver';`);
      await db.sequelize.query(`ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'auditor';`);
    } catch(e) {}

    const hashedPassword = await bcrypt.hash('password123', 10);

    const deptNames = ['Engineering', 'Information Technology', 'Human Resources', 'Finance', 'Compliance', 'Sales & Marketing'];
    const departments = [];
    for (const name of deptNames) {
      const dept = await db.Department.create({ name, description: `${name} Department` });
      departments.push(dept);
    }

    const users = [];
    const adminUser = await db.User.create({
      name: 'Admin User', email: 'admin@company.com', designation: 'Sysadmin', 
      role: 'admin', password: hashedPassword, department_id: departments[1].id
    });
    users.push(adminUser);

    for (let i = 1; i < 50; i++) {
      let role = i < 4 ? 'approver' : i < 10 ? 'reviewer' : 'user';
      const name = getRandomName();
      const email = `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}${i}@company.com`;
      const dept = getRandomItem(departments);
      const user = await db.User.create({
        name, email, designation: 'Staff', role, password: hashedPassword, department_id: dept.id
      });
      users.push(user);
    }

    for (const dept of departments) {
      const deptUsers = users.filter(u => u.department_id === dept.id && (u.role === 'approver' || u.role === 'reviewer' || u.role === 'admin'));
      dept.head_id = deptUsers.length > 0 ? deptUsers[0].id : adminUser.id;
      await dept.save();
    }

    const assetNames = ['AWS Production', 'GitHub', 'Jira', 'Slack', 'Google Workspace', 'Salesforce', 'Zendesk', 'MongoDB', 'Figma', 'Datadog'];
    const assets = [];
    for (let i = 0; i < 10; i++) {
      const dept = getRandomItem(departments);
      const owner = getRandomItem(users.filter(u => u.department_id === dept.id));
      const asset = await db.Asset.create({
        name: assetNames[i], type: 'SaaS', department_id: dept.id,
        owner_id: owner ? owner.id : adminUser.id, criticality: 'High', data_sensitivity: 'Confidential'
      });
      assets.push(asset);
    }

    const accessLevels = ['Read', 'Write', 'Admin'];
    for (const asset of assets) {
      const numUsers = getRandomInt(3, 10);
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, numUsers);
      for (const u of shuffledUsers) {
        await db.Access.create({ user_id: u.id, asset_id: asset.id, access_level: getRandomItem(accessLevels) });
      }
    }

    console.log('✅ Seed successful');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

runSeed();
