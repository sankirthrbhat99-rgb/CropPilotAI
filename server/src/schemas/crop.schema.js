import { z } from 'zod';
import { optionalDate } from './common.schema.js';

export const growthStageEnum = z.enum([
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Harvest'
], {
  errorMap: () => ({ message: 'Growth stage must be one of: Seedling, Vegetative, Flowering, Fruiting, Harvest' })
});

export const cropStatusEnum = z.enum([
  'Healthy',
  'Warning',
  'Critical'
], {
  errorMap: () => ({ message: 'Status must be one of: Healthy, Warning, Critical' })
});

export const createCropSchema = z.object({
  field_id: z.string({
    required_error: 'Field ID is required'
  }).uuid('Invalid Field ID UUID format'),
  name: z.string({
    required_error: 'Crop name is required'
  }).trim().min(1, 'Crop name cannot be empty').max(150, 'Crop name is too long'),
  growth_stage: growthStageEnum.default('Seedling'),
  planting_date: optionalDate,
  status: cropStatusEnum.default('Healthy')
});

// field_id is intentionally not updatable.
export const updateCropSchema = z.object({
  name: z.string().trim().min(1, 'Crop name cannot be empty').max(150).optional(),
  growth_stage: growthStageEnum.optional(),
  planting_date: optionalDate,
  status: cropStatusEnum.optional()
});
