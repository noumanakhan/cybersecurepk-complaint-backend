const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const useExternal = process.env.USE_EXTERNAL_AUTH === 'true';

// Local Database Connection (Default)
// Note: useNewUrlParser and useUnifiedTopology are no longer supported in Mongoose 6+
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB (Local) connected'))
  .catch(err => console.log('MongoDB (Local) connection error:', err.message));

const localDB = mongoose.connection;

// External Database Connection - Only attempt if explicitly enabled
let externalDB = null;
if (useExternal && process.env.EXTERNAL_MONGO_URI) {
  try {
    externalDB = mongoose.createConnection(process.env.EXTERNAL_MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Fail fast if connection is bad
    });

    externalDB.on('connected', () => {
      console.log('MongoDB (External) connected');
    });

    externalDB.on('error', (err) => {
      console.log('MongoDB (External) connection error:', err.message);
    });
  } catch (err) {
    console.error('Failed to initialize External DB connection:', err.message);
  }
}

module.exports = {
  localDB,
  externalDB
};
