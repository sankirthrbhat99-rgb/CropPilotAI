import { GoogleGenAI } from '@google/genai';
import { geminiAdvisoryOutputSchema } from '../schemas/advisory.schema.js';
import { logger } from '../utils/logger.js';

const SYSTEM_INSTRUCTION = `You are an expert Agronomist and AI Crop Advisor. Your job is to analyze crop symptoms provided by farmers and provide highly structured, accurate, and actionable agricultural advice. You must assess the symptoms, identify the most likely disease, pest, or deficiency, and provide immediate and long-term actions. Always include a disclaimer that this is AI-generated advice and severe issues require a local certified agronomist.

You must respond ONLY with a valid JSON object matching this schema:
{
  "likely_condition": "Name of disease/pest/deficiency",
  "reasoning_summary": "Short explanation of why",
  "severity": "Low | Medium | High | Critical",
  "possible_causes": ["Cause 1", "Cause 2"],
  "immediate_actions": ["Action 1", "Action 2"],
  "long_term_recommendations": ["Rec 1", "Rec 2"],
  "prevention": ["Step 1", "Step 2"],
  "expert_consult_recommended": true,
  "disclaimer": "AI-generated advice and severe issues require a local certified agronomist."
}`;

/**
 * Strips markdown code fences if present in the response
 */
const cleanJsonString = (rawText) => {
  if (!rawText) return '{}';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

/**
 * Analyzes crop symptoms using Google Gemini API and returns validated structured advice.
 * 
 * @param {Object} params
 * @param {string} params.cropName
 * @param {string} params.growthStage
 * @param {string} params.symptoms
 * @param {string} [params.severity]
 * @param {string} [params.weatherContext]
 * @param {string} [params.soilType]
 * @returns {Promise<import('zod').infer<typeof geminiAdvisoryOutputSchema>>}
 */
export const generateCropAdvisory = async ({
  cropName,
  growthStage,
  symptoms,
  severity = 'Medium',
  weatherContext = '',
  soilType = ''
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    logger.error('GEMINI_API_KEY is not configured in the backend environment.');
    const error = new Error(
      'The AI advisor is temporarily unable to generate a diagnosis. Please try again in a moment.'
    );
    error.statusCode = 500;
    throw error;
  }

  const prompt = `Please analyze the following agricultural crop case:
- Crop Type / Name: ${cropName}
- Current Growth Stage: ${growthStage || 'Not specified'}
- Farmer Reported Symptoms: ${symptoms}
- Farmer Assessed Severity: ${severity}
${weatherContext ? `- Environmental / Weather Context: ${weatherContext}` : ''}
${soilType ? `- Soil Type: ${soilType}` : ''}

Provide a diagnostic assessment, probable causes, immediate mitigation steps, sustainable long-term practices, prevention protocols, and advise whether an in-person certified agronomist consultation is recommended. Output strictly valid JSON matching the specified schema.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Use gemini-2.5-flash as the primary fast and accurate model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const candidateText = response?.text;

    if (!candidateText) {
      throw new Error('Empty response received from Gemini AI model');
    }

    const cleanedJson = cleanJsonString(candidateText);

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedJson);
    } catch (parseErr) {
      logger.error('Failed to parse Gemini JSON output:', candidateText);
      const jsonErr = new Error('AI returned an unparseable response format');
      jsonErr.statusCode = 502;
      throw jsonErr;
    }

    // Validate structured output with Zod
    const validationResult = geminiAdvisoryOutputSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      logger.error('Gemini output failed Zod schema validation:', validationResult.error.format());
      const schemaErr = new Error('AI response structure did not meet quality and schema standards');
      schemaErr.statusCode = 502;
      throw schemaErr;
    }

    return validationResult.data;
  } catch (err) {
    // Log details server-side only (never includes the API key)
    logger.error('Error in Gemini Advisory Service:', err.message);
    const outputError = new Error(
      'The AI advisor is temporarily unable to generate a diagnosis. Please try again in a moment.'
    );
    outputError.statusCode = 500;
    throw outputError;
  }
};
