const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check subscription status
const checkSubscription = (requiredPlan) => {
  return (req, res, next) => {
    const { subscription } = req.user;
    
    if (!subscription || subscription.plan === 'free') {
      return res.status(403).json({ message: 'Subscription required' });
    }
    
    if (requiredPlan === 'premium' && subscription.plan !== 'premium') {
      return res.status(403).json({ message: 'Premium subscription required' });
    }
    
    if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
      return res.status(403).json({ message: 'Subscription expired' });
    }
    
    next();
  };
};

module.exports = { auth, isAdmin, checkSubscription };