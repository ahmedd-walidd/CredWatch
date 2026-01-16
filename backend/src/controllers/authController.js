import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import logger from '../config/logger.js';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      logger.warn(`Registration failed: User already exists - ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error(`Registration error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    logger.info(`User registered successfully: ${email}`);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.info(`User logged in successfully: ${email}`);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get current user info
 */
export const me = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { register, login, me };
