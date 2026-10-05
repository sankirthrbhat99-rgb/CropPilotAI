import { z } from 'zod';

export const createFieldSchema = z.object({
  farm_id: z.string({
    required_error: 'Farm ID is required'
  }).uuid('Invalid Farm ID UUID format'),
  name: z.string({
    required_error: 'Field name is required'
  }).min(1, 'Field name cannot be empty').max(150, 'Field name is too long'),
  soil_type: z.string().max(100, 'Soil type cannot exceed 100 characters').optional().nullable(),
  area: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().positive('Area must be a positive number').optional().nullable()
  )
});

export const updateFieldSchema = z.object({
  name: z.string().min(1, 'Field name cannot be empty').max(150).optional(),
  soil_type: z.string().max(100).optional().nullable(),
  area: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().positive('Area must be a positive number').optional().nullable()
  )
});
