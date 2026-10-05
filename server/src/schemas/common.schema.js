import { z } from 'zod';

/**
 * Optional positive number. Missing -> undefined (field untouched on update),
 * empty string / null -> null (clears the value), otherwise coerced to Number.
 */
export const optionalArea = z.preprocess(
  (val) => {
    if (val === undefined) return undefined;
    if (val === '' || val === null) return null;
    return Number(val);
  },
  z.number({ invalid_type_error: 'Area must be a number' })
    .positive('Area must be a positive number')
    .optional()
    .nullable()
);

/**
 * Optional string. Missing -> undefined, empty string -> null.
 */
export const optionalText = (max, label) =>
  z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().max(max, `${label} cannot exceed ${max} characters`).optional().nullable()
  );

/**
 * Optional YYYY-MM-DD date. Missing -> undefined, empty string -> null.
 */
export const optionalDate = z.preprocess(
  (val) => (val === '' ? null : val),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable()
);
