const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const generateTicketId = require('../utils/generateTicketId');

// Auto-assign based on category
const assignDepartment = (category) => {
  const mapping = {
    'Scholarship': 'Scholarship Dept',
    'Accounts': 'Finance Dept',
    'Technical': 'IT Team',
    'Support': 'Support Team'
  };
  return mapping[category] || 'General Support';
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res) => {
  try {
    const { category, subcategory, subject, description } = req.body;
    const userId = req.user._id;
    
    // Generate unique Ticket ID
    const ticketId = await generateTicketId(category);
    
    const complaint = await Complaint.create({
      ticketId,
      userId,
      category,
      subcategory,
      subject,
      description,
      attachment: req.file ? `/uploads/${req.file.filename}` : null,
      department: assignDepartment(category),
      status: 'OPEN'
    });

    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name');
    
    // Log Activity
    await Activity.create({
      complaintId: complaint._id,
      userId,
      action: 'CREATED',
      details: `Ticket generated with ID: ${ticketId}`
    });

    // Simulated Notification (Email/SMS)
    console.log(`[NOTIFICATION] Ticket ${ticketId} created. Sending confirmation to ${req.user.email}...`);
    
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { userId: req.user._id } : {};
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security check: Only allow student owner or staff/admin
    if (req.user.role === 'student' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Staff/Admin/Student for resolution)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Role-based logic for status updates
    if (req.user.role === 'student') {
      // Student can only CLOSE (Accept) or REOPEN (if resolved)
      if (status !== 'CLOSED' && status !== 'IN_PROGRESS' && status !== 'OPEN') {
        return res.status(403).json({ message: 'Students can only close or reopen tickets.' });
      }
    }

    complaint.status = status;
    
    // Escalation logic
    if (status === 'ESCALATED') {
      complaint.escalatedAt = new Date();
      console.log(`[ALERT] Admin notified: Ticket ${complaint.ticketId} has been escalated!`);
    }
    
    await complaint.save();
    
    // Log Activity
    await Activity.create({
      complaintId: complaint._id,
      userId: req.user._id,
      action: 'STATUS_UPDATE',
      details: `Status changed to ${status}`
    });
    
    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name');
    
    // Create Notification for the student
    if (req.user.role !== 'student') {
      await Notification.create({
        userId: complaint.userId._id,
        title: 'Ticket Status Updated',
        message: `Your ticket #${complaint.ticketId} status has been changed to ${status}.`,
        link: `/ticket/${complaint._id}`
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints for admin
// @route   GET /api/complaints/admin/all
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
  try {
    // Senior Audit: Ensure only admins can access global data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }

    const { category, status } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get activities for a complaint
// @route   GET /api/complaints/:id/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ complaintId: req.params.id })
      .populate('userId', 'name role')
      .sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAllComplaints,
  getActivities
};