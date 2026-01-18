import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('--- STEP 1: VERIFY DATABASE ---');
    const { data: orders, error: dbError } = await supabase.from('orders').select('*');
    if (dbError) {
        console.error('❌ DB Error:', dbError);
    } else {
        console.log(`✅ DB Orders Count: ${orders.length}`);
        if (orders.length === 0) {
            console.log('⚠️ Orders table is empty! Inserting test order...');
            const { data: profile } = await supabase.from('profiles').select('id').eq('role', 'admin').single();
            if (profile) {
                await supabase.from('orders').insert({
                    user_id: profile.id,
                    total_amount: 1500.00,
                    status: 'pending',
                    payment_method: 'Credit Card',
                    delivery_date: new Date()
                });
                console.log('✅ Inserted test order.');
            } else {
                console.log('❌ Could not find admin profile to insert order.');
            }
        }
    }

    console.log('\n--- STEP 2: LOGIN AS ADMIN ---');
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@delight.com',
        password: 'password123'
    });

    if (authError) {
        console.error('❌ Login Failed:', authError.message);
        return;
    }
    console.log('✅ Login Successful. Token obtained.');
    const token = auth.session.access_token;

    console.log('\n--- STEP 3: CALL ADMIN API ---');
    try {
        const response = await fetch('http://localhost:3000/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`API Status: ${response.status}`);
        if (response.status === 200) {
            const json = await response.json();
            console.log('✅ API Response:', Array.isArray(json) ? `Array of ${json.length} items` : 'Object (Check structure)');
            if (Array.isArray(json) && json.length > 0) {
                console.log('Sample Item:', JSON.stringify(json[0], null, 2));
            } else if (!Array.isArray(json)) {
                console.log('Response Body:', JSON.stringify(json, null, 2));
            }
        } else {
            console.log('❌ API Failed:', await response.text());
        }
    } catch (e) {
        console.error('❌ Fetch Error:', e.message);
    }
}

verify();
