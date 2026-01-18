
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL_CONSUMER = 'http://localhost:3000';

async function testMotorFlow() {
    console.log('🏎️ Starting Motor Lead Integration Test...');

    const testLead = {
        full_name: "Speedy Racer",
        mobile: "9988776655",
        vehicle_reg: "MH 01 AB 9999",
        policy_type: "Comprehensive"
    };

    // 1. Submit Lead (Consumer)
    console.log('1. Submitting Motor Lead via Consumer API...');
    const res1 = await fetch(`${BASE_URL_CONSUMER}/api/motor-leads`, {
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

    // Allow slight delay for propagation if any (though usually instant)
    await new Promise(r => setTimeout(r, 1000));

    const { data, error } = await supabase
        .from('motor_leads')
        .select('*')
        .eq('vehicle_reg', testLead.vehicle_reg)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        console.error('❌ Lead not found in DB:', error);
        process.exit(1);
    }
    console.log('   ✅ Lead found in DB:', data.id);
    console.log('   ✅ Vehicle Reg matches:', data.vehicle_reg);
    console.log('   ✅ Policy Type matches:', data.policy_type);

    console.log('\n🏁 Motor Flow Verified Successfully!');
}

testMotorFlow();
