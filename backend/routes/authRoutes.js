const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tcs_resohub_secret_2026';

// @route   POST /api/auth/login
// @desc    Corporate Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM associates WHERE email = ?', [email], async (err, associate) => {
    if (err) return res.status(500).json({ error: 'Database Connection Error' });
    if (!associate) return res.status(400).json({ error: 'Invalid Corporate Email' });

    const validPass = await bcrypt.compare(password, associate.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid Credentials' });

    const token = jwt.sign(
      { id: associate.id, role: associate.role, name: associate.name, emp_id: associate.emp_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Authentication Successful',
      token,
      user: {
        id: associate.id,
        name: associate.name,
        role: associate.role,
        emp_id: associate.emp_id,
        department: associate.department
      }
    });
  });
});

module.exports = router;