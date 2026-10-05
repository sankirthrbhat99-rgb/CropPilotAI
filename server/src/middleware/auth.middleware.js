import { supabaseAdmin, createUserScopedClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication Middleware
 * Validates the Supabase JWT Bearer token on incoming requests.
 * Attaches the authenticated user (req.user) and an RLS-enforcing
 * user-scoped Supabase client (req.supabase) to the request object.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authorization Bearer token is required'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Malformed authorization token'
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn('Auth token verification failed:', error?.message || 'No user found');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired authentication token'
      });
    }

    // Attach user profile and user-scoped Supabase client
    req.user = user;
    req.token = token;
    req.supabase = createUserScopedClient(token);

    next();
  } catch (err) {
    logger.error('Unexpected error in auth middleware:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error'
    });
  }
};
