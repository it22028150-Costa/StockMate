const mongoose = require('mongoose');

const ShoppingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  status: { type: String, enum: ['purchased', 'pending'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  amount: { type: Number, default: 0 },
  price: { type: Number, required: true } 
   // Added price field
});

module.exports = mongoose.model('Shoppings', ShoppingSchema);
