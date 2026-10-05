import { ZodError } from 'zod';

/**
 * Higher-order middleware function to validate incoming request data using Zod.
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate (default: 'body')
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req[source]);
      req[source] = validated;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorDetails = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed: Invalid request parameters',
          details: errorDetails
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid request payload'
      });
    }
  };
};
