
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const CONSUMER_URL = 'http://localhost:3000';
const ADMIN_PORT = 3001; // Admin API is accessible via Supabase Service Role, but we can test the server endpoints too given a token.
// For simplicity, we verify the "Sync" by modifying DB and checking Consumer API.

async function runTests() {
    console.log('🧪 Starting End-to-End System Test...\n');
    let errors = 0;

    // TEST 1: Check Database Connectivity & Orders (Dashboard Liveness)
    console.log('[TEST 1] Checking Admin Dashboard Data (Orders)...');
    try {
        const { data: orders, error } = await supabase.from('orders').select('id').limit(1);
        if (error) throw error;
        console.log(`   ✅ Success: Database accessible. Found ${orders.length} orders.`);
    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
        errors++;
    }

    // TEST 2: Product Sync (Admin Update -> Consumer Site)
    console.log('\n[TEST 2] Verifying Admin-to-Consumer Sync...');
    let originalPrice = 0;
    let productId = null;
    try {
        // 1. Get a product
        const { data: products } = await supabase.from('products').select('*').limit(1);
        if (!products || products.length === 0) throw new Error("No products found to test");

        const product = products[0];
        productId = product.id;
        originalPrice = product.price;
        const testPrice = 777.77;

        console.log(`   ...Target Product: "${product.name}" (ID: ${product.id})`);
        console.log(`   ...Original Price: ${originalPrice}`);

        // 2. Simulate Admin Update (Update DB)
        console.log(`   ...Simulating Admin updating price to ${testPrice}`);
        await supabase.from('products').update({ price: testPrice }).eq('id', productId);

        // 3. Check Consumer Website API
        console.log(`   ...Fetching from Consumer Website (${CONSUMER_URL}/api/products)`);
        const res = await fetch(`${CONSUMER_URL}/api/products`);
        const json = await res.json();
        const updatedProduct = json.products.find(p => p.id === productId);

        if (Math.abs(updatedProduct.price - testPrice) < 0.01) {
            console.log(`   ✅ Success: Consumer API reflects new price (${updatedProduct.price})`);
        } else {
            console.error(`   ❌ Failed: Consumer API shows ${updatedProduct.price}, expected ${testPrice}`);
            errors++;
        }

    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
        errors++;
    } finally {
        // Revert
        if (productId) {
            await supabase.from('products').update({ price: originalPrice }).eq('id', productId);
            console.log(`   ...Reverted price to ${originalPrice}`);
        }
    }

    // TEST 3: Contact Form (Consumer -> Admin Inbox)
    console.log('\n[TEST 3] Verifying Contact Form (Consumer -> Admin Inbox)...');
    try {
        const testInquiry = {
            name: "Test Bot",
            email: "bot@test.com",
            subject: "System Check",
            message: `Integration Test ${Date.now()}`
        };

        // 1. Submit to Consumer API
        console.log('   ...Submitting Inquiry to Consumer API');
        const res = await fetch(`${CONSUMER_URL}/api/inquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testInquiry)
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        // 2. Verify in Admin DB
        console.log('   ...Checking Admin Database for Inquiry');
        const { data: inbox } = await supabase
            .from('inquiries')
            .select('*')
            .eq('email', testInquiry.email)
            .order('created_at', { ascending: false })
            .limit(1);

        if (inbox && inbox.length > 0 && inbox[0].message === testInquiry.message) {
            console.log('   ✅ Success: Inquiry found in Admin Database.');
        } else {
            console.error('   ❌ Failed: Inquiry not found in DB.');
            errors++;
        }

    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
        errors++;
    }

    console.log('\n----------------------------------------');
    if (errors === 0) {
        console.log('🎉 ALL INTEGRATION TESTS PASSED. SYSTEM IS STABLE.');
    } else {
        console.log(`⚠️  ${errors} TESTS FAILED. CHECK LOGS.`);
    }
}

runTests();
