const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const shoppingRoutes = require('./routes/shopping');
const recipeRoutes = require('./routes/recipe');
const chatbotRoutes = require('./routes/chatbot');
const userRoutes = require('./routes/user');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
