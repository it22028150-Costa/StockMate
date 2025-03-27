const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Shopping = require('../models/Shopping');

// Get shopping list for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Shopping.find({ user: req.user.id });
    res.json(items);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new shopping item
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemName, amount } = req.body;
    const newItem = new Shopping({ user: req.user.id, itemName, amount });
    await newItem.save();
    res.status(201).json(newItem);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a shopping item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedItem = await Shopping.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedItem);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a shopping item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Shopping.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Item deleted' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
