import { z } from 'zod';

export const advisorySeverityEnum = z.enum(['Low', 'Medium', 'High', 'Critical'], {
  errorMap: () => ({ message: 'Severity must be one of: Low, Medium, High, Critical' })
});

export const requestAdvisorySchema = z.object({
  crop_id: z.string({
    required_error: 'Crop selection is required'
  }).uuid('Invalid Crop ID UUID format'),
  symptoms: z.string({
    required_error: 'Symptoms description is required'
  }).min(5, 'Please provide more details regarding symptoms (at least 5 characters)'),
  severity: advisorySeverityEnum.default('Medium'),
  weather_context: z.string().max(500, 'Weather context too long').optional().nullable()
});

export const geminiAdvisoryOutputSchema = z.object({
  likely_condition: z.string().min(1, 'Condition name is required'),
  reasoning_summary: z.string().min(1, 'Reasoning summary is required'),
  severity: advisorySeverityEnum,
  possible_causes: z.array(z.string()).min(1, 'At least one possible cause must be identified'),
  immediate_actions: z.array(z.string()).min(1, 'At least one immediate action must be provided'),
  long_term_recommendations: z.array(z.string()).min(1, 'At least one long-term recommendation must be provided'),
  prevention: z.array(z.string()).min(1, 'At least one prevention strategy must be provided'),
  expert_consult_recommended: z.boolean(),
  disclaimer: z.string().min(1, 'Disclaimer is required')
});
