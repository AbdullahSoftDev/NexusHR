import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connected successfully!');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
};