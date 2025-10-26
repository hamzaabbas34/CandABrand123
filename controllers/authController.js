const { successResponse, errorResponse } = require('../utils/responseUtils');
const crypto = require('crypto');

// Store active sessions (in production, use Redis or database)
const activeSessions = new Map();

/**
 * Generate a simple session token
 */
const generateToken = (username) => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Admin login - simple credential check against environment variables
 */
const login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return errorResponse(res, 400, 'Username and password are required');
    }

    // Check credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
      // Generate session token
      const token = generateToken(username);
      
      // Store session (expires in 7 days)
      activeSessions.set(token, {
        username: adminUsername,
        role: 'admin',
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });

      return successResponse(res, {
        user: {
          username: adminUsername,
          role: 'admin'
        },
        token
      }, 'Login successful');
    } else {
      return errorResponse(res, 401, 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

/**
 * Verify token
 */
const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return errorResponse(res, 401, 'No token provided');
    }

    const session = activeSessions.get(token);

    if (!session) {
      return errorResponse(res, 401, 'Invalid token');
    }

    // Check if token is expired
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(token);
      return errorResponse(res, 401, 'Token expired');
    }

    return successResponse(res, {
      user: {
        username: session.username,
        role: session.role
      }
    }, 'Token valid');
  } catch (error) {
    console.error('Token verification error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

/**
 * Logout
 */
const logout = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      activeSessions.delete(token);
    }

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

module.exports = {
  login,
  verifyToken,
  logout
};

