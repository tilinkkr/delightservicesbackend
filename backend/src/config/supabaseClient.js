
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
// Load .env (Vercel injects automatically, local finds in root)
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using Service Key for Admin Backend power

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
