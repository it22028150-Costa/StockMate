const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables


const dbURI = process.env.MONGO_URI;

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);  // Exit the process if connection fails
    }
};

module.exports = connectDB;
