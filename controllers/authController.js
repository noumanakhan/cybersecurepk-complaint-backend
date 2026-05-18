const LocalUser = require('../models/User');
const ExternalUser = require('../models/ExternalUser');
const jwt = require('jsonwebtoken');
const { externalDB } = require('../config/db');

// Helper to determine which model to use
const getUserModel = () => {
  const useExternal = process.env.USE_EXTERNAL_AUTH === 'true';
  return useExternal ? ExternalUser : LocalUser;
};

// Generate JWT token including role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  if (process.env.USE_EXTERNAL_AUTH === 'true') {
    return res.status(403).json({ message: 'Registration is disabled when using external authentication.' });
  }

  try {
    const { name, email, password, role } = req.body;
    const User = getUserModel();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const useExternal = process.env.USE_EXTERNAL_AUTH === 'true';
    const User = getUserModel();

    if (!User) {
      return res.status(500).json({ message: 'Authentication system is not configured.' });
    }

    // If external, check connection state to avoid 10s timeout hang
    if (useExternal && externalDB.readyState !== 1) {
      return res.status(503).json({ message: 'External authentication service is currently unavailable. Please try again later.' });
    }
    
    // Find user with a catch-all for database connectivity issues
    let user;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      if (dbError.message.includes('buffering timed out')) {
        return res.status(503).json({ message: 'External database connection timed out. Only cybersecurity users can access this system.' });
      }
      throw dbError;
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Only cybersecurity program users are allowed.' });
    }

    // Security Check: If external, verify program if field exists
    if (useExternal && user.program && user.program !== 'cybersecurity') {
      return res.status(403).json({ message: 'Access denied. Only cybersecurity program users are allowed.' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Only cybersecurity program users are allowed.' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = {
  register,
  login
};