const db = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('🌱 Seeding Corporate Knowledge Base...');

  const hashedPassword = await bcrypt.hash('tcs123', 10);

  // 1. Create Users
  const sme = {
    id: uuidv4(),
    emp_id: 'TCS-SME-001',
    name: 'Priya Sharma (SME)',
    email: 'priya.sme@tcs.com',
    password: hashedPassword,
    role: 'SME',
    department: 'L&D'
  };

  const associate = {
    id: uuidv4(),
    emp_id: 'TCS-ASC-101',
    name: 'Rahul Verma',
    email: 'rahul.v@tcs.com',
    password: hashedPassword,
    role: 'Associate',
    department: 'Cloud'
  };

  // 2. Create Module & Asset
  const moduleId = uuidv4();
  const assetId = uuidv4();

  db.serialize(() => {
    // Insert Users
    const insertUser = `INSERT OR IGNORE INTO associates (id, emp_id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(insertUser, [sme.id, sme.emp_id, sme.name, sme.email, sme.password, sme.role, sme.department]);
    db.run(insertUser, [associate.id, associate.emp_id, associate.name, associate.email, associate.password, associate.role, associate.department]);

    // Insert Module (This was missing before!)
    db.run(`INSERT OR IGNORE INTO modules (id, title, description, sme_name, sme_id, category) VALUES (?, ?, ?, ?, ?, ?)`,
      [moduleId, 'Java Full Stack 2026', 'Comprehensive training for new joiners on Java 21, Spring Boot, and Microservices architecture.', sme.name, sme.id, 'Technical']
    );

    // Insert Asset (SOP)
    db.run(`INSERT OR IGNORE INTO assets (id, module_id, title, file_type, file_path, uploaded_by, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [assetId, moduleId, 'Java Coding Standards v2.0', 'PDF', 'uploads/java_standards.pdf', sme.id, 'java, coding standards, sop']
    );

    console.log('✅ Data Seeding Complete!');
    console.log('   Module Created: Java Full Stack 2026');
    console.log('   Asset Created: Java Coding Standards v2.0');
  });
}

seed();