import { z } from 'zod';

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
  }).min(1, 'Crop name cannot be empty').max(150, 'Crop name is too long'),
  growth_stage: growthStageEnum.default('Seedling'),
  planting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Planting date must be in YYYY-MM-DD format').optional().nullable(),
  status: cropStatusEnum.default('Healthy')
});

export const updateCropSchema = z.object({
  name: z.string().min(1, 'Crop name cannot be empty').max(150).optional(),
  growth_stage: growthStageEnum.optional(),
  planting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Planting date must be in YYYY-MM-DD format').optional().nullable(),
  status: cropStatusEnum.optional()
});
