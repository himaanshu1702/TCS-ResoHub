require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Import Database
const db = require('./database');

// Import All Routes (Traffic Controllers)
const authRoutes = require('./routes/authRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const assetRoutes = require('./routes/assetRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Security & Parsing)
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Uploaded Files (Corporate Assets)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Connect Routes to API Paths
app.use('/api/auth', authRoutes);      // Login System
app.use('/api/modules', moduleRoutes); // Training Modules
app.use('/api/assets', assetRoutes);   // SOPs & Files
app.use('/api/ai', aiRoutes);          // ResoBot AI

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Operational', 
    system: 'TCS ResoHub Enterprise System',
    timestamp: new Date()
  });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`\n TCS ResoHub Server Online`);
  console.log(`➜  Local:   http://localhost:${PORT}`);
  console.log(`➜  Status:  All Systems (Auth, Modules, Assets, AI) Active\n`);
});

module.exports = app;