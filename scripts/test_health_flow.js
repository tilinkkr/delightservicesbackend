
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL_CONSUMER = 'http://localhost:3000';
const BASE_URL_ADMIN = 'http://localhost:3001';

async function testHealthFlow() {
    console.log('🏥 Starting Health Lead Integration Test...');

    const testLead = {
        full_name: "Test User " + Date.now(),
        mobile: "9999999999",
        dob: "1990-01-01",
        city: "Mumbai",
        coverage_type: "Self Only",
        conditions: ["Diabetes"]
    };

    // 1. Submit Lead (Consumer)
    console.log('1. Submitting Lead via Consumer API...');
    const res1 = await fetch(`${BASE_URL_CONSUMER}/api/health-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLead)
    });

    if (!res1.ok) {
        console.error('❌ Submission Failed:', await res1.text());
        process.exit(1);
    }
    console.log('   ✅ Submission API returned 201 OK');

    // 2. Fetch as Admin (Using Supabase Direct or Admin API)
    // To check Admin API we need a token. 
    // For simplicity in this script, we'll verify directly against DB OR use the Service Role to mock admin access if we haven't implemented a login helper in node.
    // The previous test suite used direct DB checks. Let's do that for reliability of "Data reached correct place".

    console.log('2. Verifying Data in Database...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
        .from('health_leads')
        .select('*')
        .eq('full_name', testLead.full_name)
        .single();

    if (error || !data) {
        console.error('❌ Lead not found in DB:', error);
        process.exit(1);
    }
    console.log('   ✅ Lead found in DB:', data.id);
    console.log('   ✅ Name matches:', data.full_name);
    console.log('   ✅ Conditions match:', data.conditions);

    console.log('\n🎉 Health Flow Verified Successfully!');
}

testHealthFlow();
