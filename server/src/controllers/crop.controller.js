import { logger } from '../utils/logger.js';

/**
 * GET /api/crops
 * Retrieves all crops belonging to the authenticated user, optionally filtered by field_id or status.
 */
export const getCrops = async (req, res, next) => {
  try {
    const { field_id, status } = req.query;

    let query = req.supabase
      .from('crops')
      .select('*, fields(id, name, soil_type, farms(id, name))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (field_id) {
      query = query.eq('field_id', field_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: crops, error } = await query;

    if (error) {
      logger.error('Failed to fetch crops:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: crops || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/crops/:id
 * Retrieves a single crop with field/farm hierarchy and past advisories.
 */
export const getCropById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: crop, error } = await req.supabase
      .from('crops')
      .select('*, fields(id, name, soil_type, farms(id, name)), advisories(*)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .order('created_at', { referencedTable: 'advisories', ascending: false })
      .single();

    if (error || !crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: crop
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/crops
 * Creates a new crop inside a user-owned field.
 */
export const createCrop = async (req, res, next) => {
  try {
    const { field_id, name, growth_stage, planting_date, status } = req.body;

    // Verify parent field belongs to user
    const { data: field, error: fieldError } = await req.supabase
      .from('fields')
      .select('id')
      .eq('id', field_id)
      .eq('user_id', req.user.id)
      .single();

    if (fieldError || !field) {
      return res.status(404).json({
        success: false,
        error: 'Target field does not exist or does not belong to you'
      });
    }

    const { data: crop, error } = await req.supabase
      .from('crops')
      .insert({
        field_id,
        user_id: req.user.id,
        name,
        growth_stage: growth_stage || 'Seedling',
        planting_date: planting_date || null,
        status: status || 'Healthy'
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create crop:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Crop registered successfully',
      data: crop
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/crops/:id
 * Updates an existing crop owned by the user.
 */
export const updateCrop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, growth_stage, planting_date, status } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (growth_stage !== undefined) updatePayload.growth_stage = growth_stage;
    if (planting_date !== undefined) updatePayload.planting_date = planting_date || null;
    if (status !== undefined) updatePayload.status = status;

    const { data: crop, error } = await req.supabase
      .from('crops')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or update unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      data: crop
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/crops/:id
 * Deletes a crop owned by the user.
 */
export const deleteCrop = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('crops')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      logger.error('Failed to delete crop:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or already deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
