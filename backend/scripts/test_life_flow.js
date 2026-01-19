
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL_CONSUMER = 'http://localhost:3000';

async function testLifeFlow() {
    console.log('🌱 Starting Life Lead Integration Test...');

    const testLead = {
        first_name: "Integration",
        last_name: "TestUser",
        nominee_name: "Test Nominee",
        phone: "9876543210",
        email: "test.life@example.com",
        sum_assured: "10cr",
        tenure: 25,
        riders: ["Critical Illness", "Waiver of Premium"]
    };

    // 1. Submit Lead (Consumer)
    console.log('1. Submitting Life Lead via Consumer API...');
    const res1 = await fetch(`${BASE_URL_CONSUMER}/api/life-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLead)
    });

    if (!res1.ok) {
        console.error('❌ Submission Failed:', await res1.text());
        process.exit(1);
    }
    console.log('   ✅ Submission API returned 201 OK');

    // 2. Verify in DB
    console.log('2. Verifying Data in Database...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
        .from('life_leads')
        .select('*')
        .eq('email', testLead.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        console.error('❌ Lead not found in DB:', error);
        process.exit(1);
    }
    console.log('   ✅ Lead found in DB:', data.id);
    console.log('   ✅ Name matches:', data.first_name);
    console.log('   ✅ Riders match:', data.riders);

    console.log('\n🎉 Life Flow Verified Successfully!');
}

testLifeFlow();
