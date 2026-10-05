import { logger } from '../utils/logger.js';

/**
 * GET /api/farms
 * Retrieves all farms belonging to the authenticated user.
 */
export const getFarms = async (req, res, next) => {
  try {
    const { data: farms, error } = await req.supabase
      .from('farms')
      .select('*, fields(id, name, area, soil_type)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch farms:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: farms || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/farms/:id
 * Retrieves a single farm and its fields.
 */
export const getFarmById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: farm, error } = await req.supabase
      .from('farms')
      .select('*, fields(*)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !farm) {
      return res.status(404).json({
        success: false,
        error: 'Farm not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: farm
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/farms
 * Creates a new farm for the authenticated user.
 */
export const createFarm = async (req, res, next) => {
  try {
    const { name, location, area } = req.body;

    const { data: farm, error } = await req.supabase
      .from('farms')
      .insert({
        user_id: req.user.id,
        name,
        location: location || null,
        area: area !== undefined && area !== null ? Number(area) : null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create farm:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: farm
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/farms/:id
 * Updates an existing farm owned by the authenticated user.
 */
export const updateFarm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, area } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (location !== undefined) updatePayload.location = location;
    if (area !== undefined) updatePayload.area = area !== null ? Number(area) : null;

    const { data: farm, error } = await req.supabase
      .from('farms')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !farm) {
      return res.status(404).json({
        success: false,
        error: 'Farm not found or update unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      data: farm
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/farms/:id
 * Deletes a farm owned by the authenticated user.
 */
export const deleteFarm = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('farms')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      logger.error('Failed to delete farm:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Farm not found or already deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
