const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://hellodevkhan_db_user:IGnNSxO5da7fN8VY@cluster0.nmkmsxp.mongodb.net/cybersecure_db?retryWrites=true&w=majority';

// Connect to the unified MongoDB cluster (external DB)
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected to external cluster successfully'))
  .catch(err => console.log('MongoDB connection error:', err.message));

const dbConnection = mongoose.connection;

module.exports = {
  localDB: dbConnection,
  externalDB: dbConnection // Alias externalDB to the main connection for compatibility
};
