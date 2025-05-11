const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Shopping = require('../models/Shopping');

// Get shopping list for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Shopping.find({ user: req.user.id });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add new shopping item
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const { itemName, amount, price, unit, status } = req.body;

    // Validate required fields
    if (!itemName) {
      return res.status(400).json({ message: "itemName is required" });
    }
    if (!unit || !['pcs', 'g', 'kg', 'ml', 'l'].includes(unit)) {
      return res.status(400).json({ message: "Valid unit is required (pcs, g, kg, ml, l)" });
    }
    if (!status || !['pending', 'purchased'].includes(status)) {
      return res.status(400).json({ message: "Valid status is required (pending, purchased)" });
    }

    // Define standard quantities for validation
    const standardQuantities = {
      pcs: 1,
      g: 100,
      kg: 1,
      ml: 100,
      l: 1,
    };
    const standardQty = standardQuantities[unit] || 1;

    // Validate amount (ensure it's at least 1 standard quantity)
    if (!amount || amount < standardQty) {
      return res.status(400).json({ message: `Amount must be at least ${standardQty} ${unit}` });
    }

    // Validate price
    if (!price || price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const newItem = new Shopping({
      user: req.user.id,
      itemName,
      amount, // Actual amount (e.g., 200g)
      price,  // Total price (e.g., $10 for 2 x 100g at $5 per 100g)
      unit,
      status,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a shopping item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { itemName, amount, price, unit, status } = req.body;

    // Validate fields if provided
    if (itemName && !itemName) {
      return res.status(400).json({ message: "itemName cannot be empty" });
    }
    if (unit && !['pcs', 'g', 'kg', 'ml', 'l'].includes(unit)) {
      return res.status(400).json({ message: "Valid unit is required (pcs, g, kg, ml, l)" });
    }
    if (status && !['pending', 'purchased'].includes(status)) {
      return res.status(400).json({ message: "Valid status is required (pending, purchased)" });
    }
    if (amount !== undefined) {
      const standardQuantities = {
        pcs: 1,
        g: 100,
        kg: 1,
        ml: 100,
        l: 1,
      };
      const standardQty = standardQuantities[unit] || 1;
      if (amount < standardQty) {
        return res.status(400).json({ message: `Amount must be at least ${standardQty} ${unit}` });
      }
    }
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const updatedItem = await Shopping.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a shopping item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedItem = await Shopping.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;