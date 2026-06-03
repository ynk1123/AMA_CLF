const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  const jwtSecret = process.env.JWT_SECRET || 'mysecretkey123';


  try {
    const verified = jwt.verify(token, jwtSecret);

    // Normalize payloads so controllers can reliably use req.user.id and req.user.role.
    // Student login JWTs are signed with: { id: user.id, ... }
    // Admin login JWTs are signed with: { role: 'admin', ... } (may omit id)

    if (verified?.role === 'admin') {
      req.user = { id: verified.id ?? 0, role: 'admin' };
    } else if (verified?.id != null) {
      req.user = { id: verified.id, role: verified.role || 'student' };
    } else {
      // If token has neither role nor id, treat as invalid for our app.
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

module.exports = { authenticate, authorizeAdmin };