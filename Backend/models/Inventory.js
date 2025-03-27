const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  expiryDate: { type: Date },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);
