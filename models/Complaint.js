const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Accounts', 'Scholarship', 'Support']
  },
  subcategory: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  attachment: {
    type: String // File URL
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'ESCALATED'],
    default: 'OPEN'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);