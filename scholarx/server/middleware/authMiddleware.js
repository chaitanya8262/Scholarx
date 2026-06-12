// ========================================
// Auth Middleware - verify JWT and enforce roles
// ========================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: require valid JWT in Authorization header
exports.protect = async (req, res, next) => {
  let token;
  // Expect: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user (without password) to req
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Authorize specific roles (e.g. authorize('editor', 'reviewer'))
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role || 'unknown'}' is not authorized for this action`
      });
    }
    next();
  };
};
