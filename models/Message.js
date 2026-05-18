const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);