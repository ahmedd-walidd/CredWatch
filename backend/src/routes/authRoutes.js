import express from 'express';
import { register, login, me } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validators.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateToken, me);

export default router;
