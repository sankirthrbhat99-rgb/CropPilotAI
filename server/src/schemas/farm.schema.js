import { z } from 'zod';
import { optionalArea, optionalText } from './common.schema.js';

export const createFarmSchema = z.object({
  name: z.string({
    required_error: 'Farm name is required'
  }).trim().min(1, 'Farm name cannot be empty').max(150, 'Farm name is too long'),
  location: optionalText(255, 'Location'),
  area: optionalArea
});

export const updateFarmSchema = createFarmSchema.partial();
