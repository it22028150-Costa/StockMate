const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Inventory = require('../models/Inventory');

// Get inventory for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Inventory.find({ user: req.user.id });
    res.json(items);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new inventory item
router.post('/', authMiddleware, async (req, res) => {
  console.log(req.body);
  try {
    const { itemName, quantity, expiryDate,category} = req.body;
    const newItem = new Inventory({ user: req.user.id, itemName, quantity, expiryDate, category});
    
    await newItem.save();
    res.status(201).json(newItem);
    
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an inventory item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedItem = await Inventory.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedItem);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an inventory item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Inventory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Item deleted' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
