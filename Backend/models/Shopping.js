// 

const mongoose = require('mongoose');

const shoppingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  unit: { type: String, enum: ['pcs', 'g', 'kg', 'ml', 'l'], required: true },
  status: { type: String, enum: ['pending', 'purchased'], default: 'pending' },
});

module.exports = mongoose.model('Shopping', shoppingSchema);