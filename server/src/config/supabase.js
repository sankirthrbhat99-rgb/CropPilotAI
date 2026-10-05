import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  logger.warn('Supabase environment variables (SUPABASE_URL, SUPABASE_SECRET_KEY) are not set. Ensure server/.env is configured.');
}

if (!supabasePublishableKey) {
  logger.warn(
    'SUPABASE_PUBLISHABLE_KEY is not set. User-scoped queries will fall back to SUPABASE_SECRET_KEY as the gateway apikey. ' +
    'Set SUPABASE_PUBLISHABLE_KEY so Row Level Security is evaluated under the standard "authenticated" role.'
  );
}

const authOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false
};

/**
 * Privileged Supabase Admin Client (Secret Key).
 * Used ONLY for token verification (auth.getUser). Never used for per-user CRUD.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseSecretKey || 'placeholder-secret-key',
  { auth: authOptions }
);

/**
 * Creates a user-scoped Supabase client carrying the authenticated user's JWT.
 * It is initialised with the PUBLISHABLE key as apikey so that PostgREST evaluates
 * every query as the user's role and Row Level Security (auth.uid() = user_id)
 * stays enforced for all reads and writes.
 *
 * @param {string} userAccessToken - The Bearer JWT from the authenticated request
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export const createUserScopedClient = (userAccessToken) => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabasePublishableKey || supabaseSecretKey || 'placeholder-key',
    {
      auth: authOptions,
      global: {
        headers: {
          Authorization: `Bearer ${userAccessToken}`
        }
      }
    }
  );
};
