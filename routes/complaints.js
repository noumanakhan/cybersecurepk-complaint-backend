const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAllComplaints,
  getActivities
} = require('../controllers/complaintController');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/complaints
router.post('/', auth, upload.single('attachment'), createComplaint);

// @route   GET /api/complaints
router.get('/', auth, getComplaints);

// @route   GET /api/complaints/:id
router.get('/:id', auth, getComplaintById);

// @route   PUT /api/complaints/:id/status
router.put('/:id/status', auth, updateComplaintStatus);

// @route   GET /api/complaints/admin/all
router.get('/admin/all', auth, checkRole('admin'), getAllComplaints);

// @route   GET /api/complaints/:id/activities
router.get('/:id/activities', auth, getActivities);

module.exports = router;