const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { 
    type: String, 
    required: true, 
    enum: ['pcs', 'g', 'kg', 'ml', 'l'],
    default: 'pcs' 
  },
  expiryDate: { type: Date },
  addedAt: { type: Date, default: Date.now },
  category: {
    type: String,
    required: true,
    enum: ["Fruits", "Vegetables", "Dairy", "Bakery", "Other", "Meat", "Poultry"],
  },
});

module.exports = mongoose.model('Inventory', InventorySchema);