import { Router } from 'express';
import farmRoutes from './farm.routes.js';
import fieldRoutes from './field.routes.js';
import cropRoutes from './crop.routes.js';
import advisoryRoutes from './advisory.routes.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CropPilotAI API',
    timestamp: new Date().toISOString()
  });
});

// User Profile Endpoint (Protected)
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: profile || {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.user_metadata?.full_name || ''
      }
    });
  } catch (err) {
    next(err);
  }
});

// Protected Entity Routes (Auth Middleware Enforces User Isolation & RLS Client)
router.use('/farms', requireAuth, farmRoutes);
router.use('/fields', requireAuth, fieldRoutes);
router.use('/crops', requireAuth, cropRoutes);
router.use('/advisories', requireAuth, advisoryRoutes);

export default router;
