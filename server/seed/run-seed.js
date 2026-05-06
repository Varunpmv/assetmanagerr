const bcrypt = require('bcryptjs');
const db = require('../models');

const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Laura', 'Robert', 'Linda', 'William', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Betty', 'Matthew', 'Lisa', 'Anthony', 'Dorothy', 'Donald', 'Sandra', 'Mark', 'Ashley', 'Paul', 'Kimberly', 'Steven', 'Donna', 'Andrew', 'Carol', 'Kenneth', 'Michelle', 'Joshua', 'Emily', 'George', 'Amanda', 'Kevin', 'Melissa', 'Brian', 'Deborah', 'Edward', 'Stephanie'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function runSeed() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await db.sequelize.sync({ force: true });
    try {
      await db.sequelize.query(`ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'approver';`);
    } catch(e) {}
    console.log('Database synced.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const deptNames = ['Engineering', 'Information Technology', 'Human Resources', 'Finance', 'Compliance', 'Sales & Marketing'];
    const departments = [];
    for (const name of deptNames) {
      const dept = await db.Department.create({
        name,
      });
      departments.push(dept);
    }
    console.log(`Created ${departments.length} departments.`);

    const users = [];
    const adminUser = await db.User.create({
      name: 'Admin User', email: 'admin@company.com', designation: 'Sysadmin', 
      role: 'admin', password: hashedPassword, department_id: departments[1].id
    });
    users.push(adminUser);

    for (let i = 1; i < 50; i++) {
      let role = 'user';
      if (i < 4) role = 'approver';
      else if (i < 10) role = 'reviewer';

      const name = getRandomName();
      const email = `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}${i}@company.com`;
      const dept = getRandomItem(departments);
      const designations = role === 'user' ? ['Software Engineer', 'Analyst', 'Specialist', 'Coordinator'] 
                         : role === 'reviewer' ? ['Manager', 'Lead', 'Principal']
                         : role === 'approver' ? ['Director', 'VP', 'Head'] : ['Admin'];

      const user = await db.User.create({
        name, email, designation: getRandomItem(designations), role, password: hashedPassword, department_id: dept.id
      });
      users.push(user);
    }
    console.log(`Created ${users.length} users.`);

    for (const dept of departments) {
      const deptUsers = users.filter(u => u.department_id === dept.id && (u.role === 'approver' || u.role === 'reviewer' || u.role === 'admin'));
      if (deptUsers.length > 0) {
        dept.head_id = deptUsers[0].id;
        await dept.save();
      } else {
        dept.head_id = adminUser.id;
        await dept.save();
      }
    }

    const assetTypes = ['Cloud', 'SaaS', 'Internal'];
    const assetNames = [
      'AWS Production Environment', 'GitHub Enterprise', 'Jira Software', 'Slack Workspace', 'Google Workspace',
      'Salesforce CRM', 'Zendesk Support', 'MongoDB Atlas', 'Figma Design', 'Datadog APM',
      'Stripe Billing', 'Tableau Analytics', 'Confluence Wiki', 'Asana Tasks', 'Notion',
      'Jenkins CI/CD', 'Docker Hub', 'Postman Enterprise', 'Sentry Error Tracking', 'Zoom Video'
    ];
    
    const assets = [];
    for (let i = 0; i < 20; i++) {
      const dept = getRandomItem(departments);
      const owner = getRandomItem(users.filter(u => u.department_id === dept.id));
      
      const asset = await db.Asset.create({
        name: assetNames[i] || `Asset ${i}`,
        type: getRandomItem(assetTypes),
        department_id: dept.id,
        owner_id: owner ? owner.id : adminUser.id,
        renewal_date: new Date(new Date().setMonth(new Date().getMonth() + getRandomInt(1, 24))),
        cost: getRandomInt(100, 15000) * 1.5,
      });
      assets.push(asset);
    }
    console.log(`Created ${assets.length} assets.`);

    const accessLevels = ['read', 'write', 'admin'];
    let accessCount = 0;
    
    for (const asset of assets) {
      const numUsers = getRandomInt(2, 8);
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, numUsers);
      
      for (const u of shuffledUsers) {
        await db.Access.create({
          user_id: u.id,
          asset_id: asset.id,
          access_level: getRandomItem(accessLevels),
          granted_by: adminUser.id
        });
        accessCount++;
      }
    }
    console.log(`Created ${accessCount} access mappings.`);

    console.log('✅ Seed data generated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed DB:', err);
    process.exit(1);
  }
}

runSeed();
