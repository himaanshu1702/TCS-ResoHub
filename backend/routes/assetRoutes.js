const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// 1. UPLOAD
router.post('/:moduleId/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (req.user.role !== 'SME') return res.status(403).json({ error: 'Access Denied' });

  const { moduleId } = req.params;
  const { title, file_type, tags } = req.body;

  if (!req.file) return res.status(400).json({ error: 'No File Uploaded' });

  const id = uuidv4();
  const filePath = `uploads/${req.file.filename}`;

  db.run(
    `INSERT INTO assets (id, module_id, title, file_type, file_path, uploaded_by, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, moduleId, title, file_type, filePath, req.user.id, tags],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Asset Uploaded Successfully', id, path: filePath });
    }
  );
});

// 2. GET ALL
router.get('/:moduleId', authenticateToken, (req, res) => {
  const { moduleId } = req.params;
  db.all('SELECT * FROM assets WHERE module_id = ?', [moduleId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3. UPDATE (Edit)
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'SME') return res.status(403).json({ error: 'Access Denied' });

  const { title, file_type, tags } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE assets SET title = ?, file_type = ?, tags = ? WHERE id = ?`,
    [title, file_type, tags, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Asset Updated Successfully' });
    }
  );
});

// 4. DELETE
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'SME') return res.status(403).json({ error: 'Access Denied' });

  const { id } = req.params;

  db.run('DELETE FROM assets WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Asset Deleted Successfully' });
  });
});

module.exports = router;