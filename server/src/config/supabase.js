import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  logger.warn('Supabase environment variables (SUPABASE_URL, SUPABASE_SECRET_KEY) are not set. Ensure server/.env is configured.');
}

/**
 * Privileged Supabase Admin Client
 * Used strictly for privileged system tasks, such as verifying auth tokens.
 */
export const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseSecretKey || 'placeholder-secret-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

/**
 * Creates a user-scoped Supabase client initialized with the authenticated user's JWT.
 * This guarantees that Supabase Row Level Security (RLS) policies enforcing auth.uid()
 * remain strictly active for all database queries and mutations.
 * 
 * @param {string} userAccessToken - The Bearer JWT from the authenticated request
 * @returns {import('@supabase/supabase-js').SupabaseClient} User-scoped Supabase client
 */
export const createUserScopedClient = (userAccessToken) => {
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseSecretKey || 'placeholder-secret-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    }
  });
};
