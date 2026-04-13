const express = require('express');
const AiEngine = require('../chatbot/aiEngine');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/ai/query
// @desc    Process Natural Language Query from Associate
router.post('/query', authenticateToken, async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: 'Query cannot be empty' });

  try {
    const response = await AiEngine.processQuery(query);
    res.json(response);
  } catch (error) {
    console.error('AI Engine Error:', error);
    res.status(500).json({ error: 'Internal AI Processing Error' });
  }
});

module.exports = router;