import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://127.0.0.1:3001';
const ENDPOINT = `${BASE_URL}/api/mutual-fund-leads`;

// Test Data
const testPayload = {
    full_name: "Test User MutualFund",
    mobile: "9998887776",
    sip_capacity: "15000",
    primary_goal: "wealth"
};

async function testMutualFundFlow() {
    console.log('--- Starting Mutual Fund Flow Test ---');

    try {
        // 1. Submit Lead
        console.log(`\n1. Submitting Lead to ${ENDPOINT}...`);
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        let data;
        const text = await res.text();
        console.log('Status Code:', res.status);

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('❌ Failed to parse JSON. Response might be HTML (Zombie Server?):');
            console.error('--- Response Start ---');
            console.error(text.substring(0, 500));
            console.error('--- Response End ---');
            return;
        }

        if (res.ok) {
            console.log('✅ Lead Submitted Successfully!');
            console.log('Response:', data);
        } else {
            console.error('❌ Lead Submission Failed.');
            console.error('Error:', data);
            if (data.error && data.error.includes('relation "mutual_fund_leads" does not exist')) {
                console.log('\n⚠️  ACTION REQUIRED: The database table is missing.');
            }
        }

    } catch (err) {
        console.error('❌ Network or Server Error:', err.message);
    }

    console.log('\n--- Test Complete ---');
}

testMutualFundFlow();
