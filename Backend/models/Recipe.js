const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  ingredients: [{ type: String }],
  instructions: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
