
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:3000';

async function testProducts() {
    console.log('--- Debugging Products API ---');
    console.log(`Fetching ${BASE_URL}/api/products...`);

    try {
        const res = await fetch(`${BASE_URL}/api/products`);

        if (!res.ok) {
            console.error(`Error Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Response Body:', text);
        } else {
            const data = await res.json();
            console.log(`Success! Found ${data.products ? data.products.length : 0} products.`);
            // console.log(JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

testProducts();
