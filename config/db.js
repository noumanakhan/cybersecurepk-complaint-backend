const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://hellodevkhan_db_user:IGnNSxO5da7fN8VY@cluster0.nmkmsxp.mongodb.net/cybersecure_db?retryWrites=true&w=majority';

console.log('[DB] Attempting connection to MongoDB Atlas...');

mongoose.connect(mongoUri)
  .then(() => console.log('[DB] ✅ MongoDB connected successfully to Atlas'))
  .catch(err => console.error('[DB] ❌ MongoDB initial connection error:', err.message));

const dbConnection = mongoose.connection;

dbConnection.on('error', err => {
  console.error('[DB Error]:', err.message);
});

dbConnection.on('disconnected', () => {
  console.warn('[DB Warning]: MongoDB disconnected.');
});

module.exports = {
  localDB: dbConnection,
  externalDB: dbConnection
};
