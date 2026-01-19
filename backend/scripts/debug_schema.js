
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('--- Checking Products ---');
    const { data: products, error } = await supabase.from('products').select('*').limit(1);

    if (products && products.length > 0) {
        console.log('Sample Product ID:', products[0].id);
        console.log('Type of ID:', typeof products[0].id);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(products[0].id);
        console.log('Is UUID?', isUUID);
    } else {
        console.log('No products found or error:', error);
    }
}

checkSchema();
