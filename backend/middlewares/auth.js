import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

// Admin authentication middleware
export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ message: 'Token is not valid or admin is inactive' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// User authentication middleware
export const userAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'Active') {
      return res.status(401).json({ message: 'Token is not valid or user is blocked' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional user authentication (doesn't fail if no token)
export const optionalUserAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user && user.status === 'Active') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Role-based access control for admin
export const adminRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }

    next();
  };
};

