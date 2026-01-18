
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('--- Checking Orders Table Schema ---');

    // Attempt to insert a dummy row with ALL possible keys to see what fails, 
    // OR just try to select * limit 1 and look at keys.
    const { data, error } = await supabase.from('orders').select('*').limit(1);

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found in existing row:', Object.keys(data[0]));
    } else {
        console.log('No rows found. Attempting to insert dummy to see error...');
        // Fallback: try to insert empty object, it might default values or error with missing cols?
        // Actually, listing columns via an RPC or just guessing is hard. 
        // But we have seed_orders.js which we know works. 
        console.log('Please infer from seed_orders.js patterns.');
    }
}

checkSchema();
