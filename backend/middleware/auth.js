const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get token from header: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Missing Corporate Credentials' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'tcs_resohub_secret_2026');
    req.user = verified; // Stores associate ID and Role
    next();
  } catch (err) {
    res.status(403).json({ error: 'Access Denied: Invalid or Expired Session' });
  }
};

module.exports = { authenticateToken };