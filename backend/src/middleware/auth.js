import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

/**
 * Middleware to verify JWT token and authenticate requests
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: Invalid token - ${error.message}`);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export default authenticateToken;
