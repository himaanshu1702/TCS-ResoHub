const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/modules
// @desc    Get all available Knowledge Modules
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM modules ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// @route   POST /api/modules
// @desc    Create a new Module (SME Only)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'SME') {
    return res.status(403).json({ error: 'Access Denied: SME Privileges Required' });
  }

  const { title, description, category } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO modules (id, title, description, sme_name, sme_id, category) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, description, req.user.name, req.user.id, category || 'General'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Knowledge Module Created', id });
    }
  );
});

// @route   PUT /api/modules/:id
// @desc    Update a Module (SME Only)
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'SME') {
    return res.status(403).json({ error: 'Access Denied: SME Privileges Required' });
  }

  const { title, description, category } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE modules SET title = ?, description = ?, category = ? WHERE id = ?`,
    [title, description, category, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Module Updated Successfully' });
    }
  );
});

// @route   DELETE /api/modules/:id
// @desc    Delete a Module (SME Only)
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'SME') {
    return res.status(403).json({ error: 'Access Denied: SME Privileges Required' });
  }

  const { id } = req.params;

  // Note: In a real production app, we would also delete associated assets here.
  db.run('DELETE FROM modules WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Module Deleted Successfully' });
  });
});

module.exports = router;