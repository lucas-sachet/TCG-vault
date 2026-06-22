/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Fallback to project credentials if env variables are not set in the host environment
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ayndfsrnbcdjrkilxugg.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FJtWrQQnMMKDkDkNlsh62g_JwfjnZpo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
