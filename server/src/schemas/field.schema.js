import { z } from 'zod';
import { optionalArea, optionalText } from './common.schema.js';

export const createFieldSchema = z.object({
  farm_id: z.string({
    required_error: 'Farm ID is required'
  }).uuid('Invalid Farm ID UUID format'),
  name: z.string({
    required_error: 'Field name is required'
  }).trim().min(1, 'Field name cannot be empty').max(150, 'Field name is too long'),
  soil_type: optionalText(100, 'Soil type'),
  area: optionalArea
});

// farm_id is intentionally not updatable.
export const updateFieldSchema = z.object({
  name: z.string().trim().min(1, 'Field name cannot be empty').max(150).optional(),
  soil_type: optionalText(100, 'Soil type'),
  area: optionalArea
});
