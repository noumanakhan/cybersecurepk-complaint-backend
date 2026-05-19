const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to the unified MongoDB cluster (external DB)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected to external cluster successfully'))
  .catch(err => console.log('MongoDB connection error:', err.message));

const dbConnection = mongoose.connection;

module.exports = {
  localDB: dbConnection,
  externalDB: dbConnection // Alias externalDB to the main connection for compatibility
};
