import { logger } from '../utils/logger.js';

/**
 * GET /api/fields
 * Retrieves all fields belonging to the authenticated user, optionally filtered by farm_id.
 */
export const getFields = async (req, res, next) => {
  try {
    const { farm_id } = req.query;

    let query = req.supabase
      .from('fields')
      .select('*, farms(id, name, location), crops(id, name, growth_stage, status)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (farm_id) {
      query = query.eq('farm_id', farm_id);
    }

    const { data: fields, error } = await query;

    if (error) {
      logger.error('Failed to fetch fields:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: fields || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/fields/:id
 * Retrieves a single field, its parent farm, and associated crops.
 */
export const getFieldById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: field, error } = await req.supabase
      .from('fields')
      .select('*, farms(id, name, location), crops(*)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: field
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/fields
 * Creates a new field inside a user-owned farm.
 */
export const createField = async (req, res, next) => {
  try {
    const { farm_id, name, soil_type, area } = req.body;

    // Verify parent farm belongs to authenticated user
    const { data: farm, error: farmError } = await req.supabase
      .from('farms')
      .select('id')
      .eq('id', farm_id)
      .eq('user_id', req.user.id)
      .single();

    if (farmError || !farm) {
      return res.status(404).json({
        success: false,
        error: 'Target farm does not exist or does not belong to you'
      });
    }

    const { data: field, error } = await req.supabase
      .from('fields')
      .insert({
        farm_id,
        user_id: req.user.id,
        name,
        soil_type: soil_type || null,
        area: area !== undefined && area !== null ? Number(area) : null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create field:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: field
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/fields/:id
 * Updates an existing field owned by the user.
 */
export const updateField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, soil_type, area } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (soil_type !== undefined) updatePayload.soil_type = soil_type;
    if (area !== undefined) updatePayload.area = area !== null ? Number(area) : null;

    const { data: field, error } = await req.supabase
      .from('fields')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found or update unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Field updated successfully',
      data: field
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/fields/:id
 * Deletes a field owned by the user.
 */
export const deleteField = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('fields')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      logger.error('Failed to delete field:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Field not found or already deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Field deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
