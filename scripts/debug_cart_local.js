
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BASE_URL = 'http://localhost:3000';

async function testCart() {
    console.log('--- Debugging Cart API ---');

    // 1. Login
    console.log('Logging in...');
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: 'customer@example.com',
        password: 'Delight123!'
    });

    if (error || !session) {
        console.error('Login failed:', error);
        return;
    }

    const token = session.access_token;
    console.log('Token acquired.');

    // 2. Fetch Cart
    console.log('Fetching /api/cart...');
    try {
        const res = await fetch(`${BASE_URL}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            console.error(`Error Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Response Body:', text);
        } else {
            const data = await res.json();
            console.log('Success!', JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

testCart();
