const express = require('express');
const app = express();
const port = 3000;

// Import MongoDB connection function
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route for testing
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
