const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Recipe = require('../models/Recipe');

// Get recipes for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id });
    res.json(recipes);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new recipe
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const newRecipe = new Recipe({ user: req.user.id, title, ingredients, instructions });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a recipe
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedRecipe);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a recipe
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Recipe deleted' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
