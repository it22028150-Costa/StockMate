const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Simulated ChatBot endpoint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    // A real implementation might call a chatbot service.
    const response = `You said: ${message}. This is a simulated chatbot response.`;
    res.json({ response });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
