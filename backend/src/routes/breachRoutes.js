import express from 'express';
import { checkBreach, getCheckHistory, getBreachStats } from '../controllers/breachController.js';
import { validateBreachCheck } from '../middleware/validators.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/breach/check
 * @desc    Check if email appears in breaches
 * @access  Private
 */
router.post('/check', authenticateToken, validateBreachCheck, checkBreach);

/**
 * @route   GET /api/breach/history
 * @desc    Get user's breach check history
 * @access  Private
 */
router.get('/history', authenticateToken, getCheckHistory);

/**
 * @route   GET /api/breach/stats
 * @desc    Get breach statistics
 * @access  Public
 */
router.get('/stats', getBreachStats);

export default router;
