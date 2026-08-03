const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token including role with fallback secret
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'cybersecurepk_super_secret_jwt_key_2025';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, program } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      program: program || 'cybersecurity'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Only cybersecurity program users are allowed.' });
    }

    // Security Check: Verify program if field exists
    if (user.program && user.program !== 'cybersecurity') {
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
    res.status(500).json({ message: error.message || 'An internal server error occurred.' });
  }
};

module.exports = {
  register,
  login
};