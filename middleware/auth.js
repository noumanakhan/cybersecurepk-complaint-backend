const jwt = require('jsonwebtoken');
const LocalUser = require('../models/User');
const ExternalUser = require('../models/ExternalUser');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Dynamically choose model to verify user existence
    const useExternal = process.env.USE_EXTERNAL_AUTH === 'true';
    const User = useExternal ? ExternalUser : LocalUser;

    if (!User) {
      return res.status(500).json({ message: 'Auth system misconfigured.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// Middleware to check user roles
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user.role}' is not authorized.` });
    }
    next();
  };
};

module.exports = { auth, checkRole };