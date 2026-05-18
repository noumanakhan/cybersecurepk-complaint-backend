const mongoose = require('mongoose');
const { externalDB } = require('../config/db');

const externalUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student'
  },
  program: {
    type: String,
    default: 'cybersecurity'
  }
}, {
  timestamps: true
});

// Since external users might be logged in, we need comparePassword
const bcrypt = require('bcryptjs');

externalUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// We only export the model if externalDB is available
const ExternalUser = externalDB ? externalDB.model('User', externalUserSchema) : null;

module.exports = ExternalUser;
