import { generateCropAdvisory } from '../services/gemini.service.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/advisories
 * Retrieves all crop advisories belonging to the authenticated user.
 */
export const getAdvisories = async (req, res, next) => {
  try {
    const { crop_id } = req.query;

    let query = req.supabase
      .from('advisories')
      .select('*, crops(id, name, growth_stage, status, fields(name, farms(name)))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (crop_id) {
      query = query.eq('crop_id', crop_id);
    }

    const { data: advisories, error } = await query;

    if (error) {
      logger.error('Failed to fetch advisories:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: advisories || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/advisories/:id
 * Retrieves a single advisory with its associated crop details.
 */
export const getAdvisoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: advisory, error } = await req.supabase
      .from('advisories')
      .select('*, crops(id, name, growth_stage, status, fields(name, soil_type, farms(name, location))))')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !advisory) {
      return res.status(404).json({
        success: false,
        error: 'Advisory not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: advisory
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/advisories
 * Triggers the Gemini AI Agronomist, parses/validates structured JSON,
 * persists the advisory to Supabase, and returns the result.
 */
export const requestAdvisory = async (req, res, next) => {
  try {
    const { crop_id, symptoms, severity, weather_context } = req.body;

    // 1. Fetch crop details and verify ownership
    const { data: crop, error: cropError } = await req.supabase
      .from('crops')
      .select('id, name, growth_stage, status, fields(id, name, soil_type)')
      .eq('id', crop_id)
      .eq('user_id', req.user.id)
      .single();

    if (cropError || !crop) {
      return res.status(404).json({
        success: false,
        error: 'Target crop does not exist or does not belong to you'
      });
    }

    logger.info(`Requesting Gemini AI advisory for crop: ${crop.name} (${crop.growth_stage})`);

    // 2. Call Gemini Service
    const aiResult = await generateCropAdvisory({
      cropName: crop.name,
      growthStage: crop.growth_stage,
      symptoms,
      severity,
      weatherContext: weather_context || '',
      soilType: crop.fields?.soil_type || ''
    });

    // 3. Persist Advisory into Supabase
    const { data: savedAdvisory, error: saveError } = await req.supabase
      .from('advisories')
      .insert({
        crop_id,
        user_id: req.user.id,
        symptoms,
        weather_context: weather_context || null,
        condition_name: aiResult.likely_condition,
        reasoning: aiResult.reasoning_summary,
        severity: aiResult.severity,
        causes: aiResult.possible_causes,
        immediate_actions: aiResult.immediate_actions,
        long_term_actions: aiResult.long_term_recommendations,
        prevention: aiResult.prevention,
        expert_consult_recommended: aiResult.expert_consult_recommended,
        disclaimer: aiResult.disclaimer,
        raw_json: aiResult
      })
      .select('*, crops(id, name, growth_stage, status)')
      .single();

    if (saveError) {
      logger.error('Failed to save advisory to database:', saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to record advisory diagnosis in database: ' + saveError.message
      });
    }

    // 4. Optionally update crop status if AI detects high or critical severity
    if (aiResult.severity === 'Critical') {
      await req.supabase
        .from('crops')
        .update({ status: 'Critical' })
        .eq('id', crop_id)
        .eq('user_id', req.user.id);
    } else if (aiResult.severity === 'High' && crop.status !== 'Critical') {
      await req.supabase
        .from('crops')
        .update({ status: 'Warning' })
        .eq('id', crop_id)
        .eq('user_id', req.user.id);
    }

    return res.status(201).json({
      success: true,
      message: 'AI Crop Advisory generated and saved successfully',
      data: savedAdvisory
    });
  } catch (err) {
    next(err);
  }
};
