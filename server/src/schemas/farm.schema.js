import { z } from 'zod';

export const createFarmSchema = z.object({
  name: z.string({
    required_error: 'Farm name is required'
  }).min(1, 'Farm name cannot be empty').max(150, 'Farm name is too long'),
  location: z.string().max(255, 'Location cannot exceed 255 characters').optional().nullable(),
  area: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().positive('Area must be a positive number').optional().nullable()
  )
});

export const updateFarmSchema = createFarmSchema.partial();
