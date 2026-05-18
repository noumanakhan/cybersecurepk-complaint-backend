const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    const senderId = req.user._id;
    
    // Check if user has access to this ticket
    const complaint = await Complaint.findOne({ ticketId });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (req.user.role === 'student' && complaint.userId.toString() !== senderId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'staff' && complaint.assignedTo?.toString() !== senderId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const newMessage = await Message.create({
      ticketId,
      senderId,
      message
    });
    
    await newMessage.populate('senderId', 'name role');
    
    // Update complaint status based on logic
    if (req.user.role === 'staff' && complaint.status === 'OPEN') {
      complaint.status = 'IN_PROGRESS';
      await complaint.save();
    } else if (req.user.role === 'student' && complaint.status === 'PENDING') {
      complaint.status = 'IN_PROGRESS';
      await complaint.save();
    }
    
    // Create Notification
    if (req.user.role === 'student') {
      // Notify assigned staff if exists
      if (complaint.assignedTo) {
        await Notification.create({
          userId: complaint.assignedTo,
          title: 'New Message',
          message: `You have a new message on ticket #${ticketId}.`,
          link: `/ticket/${complaint._id}`
        });
      }
      
      // Also notify admins
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      const adminNotifications = admins.map(admin => ({
        userId: admin._id,
        title: 'New Message from Student',
        message: `Student sent a message on ticket #${ticketId}.`,
        link: `/ticket/${complaint._id}`
      }));
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
    } else {
      // If staff/admin sends a message, notify the student
      await Notification.create({
        userId: complaint.userId,
        title: 'New Message from Support',
        message: `You have a new message on ticket #${ticketId}.`,
        link: `/ticket/${complaint._id}`
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for ticket
// @route   GET /api/messages/:ticketId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Check access
    const complaint = await Complaint.findOne({ ticketId });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (req.user.role === 'student' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'staff' && complaint.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const messages = await Message.find({ ticketId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages
};