const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'resohub.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Database Connection Error:', err);
  else {
    console.log('✅ Connected to Corporate Knowledge Warehouse (SQLite)');
    initializeSchema();
  }
});

function initializeSchema() {
  db.serialize(() => {
    // 1. ASSOCIATES (Users)
    db.run(`CREATE TABLE IF NOT EXISTS associates (
      id TEXT PRIMARY KEY,
      emp_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Associate',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. KNOWLEDGE MODULES (Courses)
    db.run(`CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      sme_name TEXT NOT NULL,
      sme_id TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sme_id) REFERENCES associates(id)
    )`);

    // 3. ASSETS (Resources - PDFs, Videos, Docs)
    db.run(`CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT,
      uploaded_by TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(module_id) REFERENCES modules(id),
      FOREIGN KEY(uploaded_by) REFERENCES associates(id)
    )`);
  });
}

module.exports = db;