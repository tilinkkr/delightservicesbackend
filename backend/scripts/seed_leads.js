
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const healthLeads = [
    { full_name: 'Aarav Sharma', mobile: '9876543210', dob: '1985-04-12', city: 'Mumbai', coverage_type: 'Family Floater', status: 'new' },
    { full_name: 'Ishaan Verma', mobile: '9123456780', dob: '1990-11-23', city: 'Delhi', coverage_type: 'Individual', status: 'contacted' },
    { full_name: 'Ananya Gupta', mobile: '9988776655', dob: '1992-06-15', city: 'Bangalore', coverage_type: 'Critical Illness', status: 'closed' },
    { full_name: 'Rohan Mehta', mobile: '9811223344', dob: '1978-02-09', city: 'Pune', coverage_type: 'Senior Citizen', status: 'new' },
    { full_name: 'Meera Iyer', mobile: '9001122334', dob: '1982-08-30', city: 'Chennai', coverage_type: 'Family Floater', status: 'contacted' }
];

const lifeLeads = [
    { first_name: 'Vikram', last_name: 'Singh', nominee_name: 'Priya Singh', phone: '9898989898', email: 'vikram.s@example.com', sum_assured: '1 Crore', tenure: 20, status: 'new' },
    { first_name: 'Neha', last_name: 'Kapoor', nominee_name: 'Raj Kapoor', phone: '9765432109', email: 'neha.k@example.com', sum_assured: '50 Lakhs', tenure: 15, status: 'contacted' },
    { first_name: 'Rahul', last_name: 'Desai', nominee_name: 'Sita Desai', phone: '9543210987', email: 'rahul.d@example.com', sum_assured: '2 Crores', tenure: 25, status: 'closed' },
    { first_name: 'Sana', last_name: 'Khan', nominee_name: 'Amir Khan', phone: '9321098765', email: 'sana.k@example.com', sum_assured: '75 Lakhs', tenure: 10, status: 'new' },
    { first_name: 'Arjun', last_name: 'Reddy', nominee_name: 'Preeti Reddy', phone: '9210987654', email: 'arjun.r@example.com', sum_assured: '3 Crores', tenure: 30, status: 'contacted' }
];

const motorLeads = [
    { full_name: 'Suresh Patil', mobile: '9822334455', vehicle_reg: 'MH-12-AB-1234', policy_type: 'Comprehensive', status: 'new' },
    { full_name: 'Divya Nair', mobile: '9711223344', vehicle_reg: 'KA-01-XY-9876', policy_type: 'Third Party', status: 'contacted' },
    { full_name: 'Amitabh Bachchan', mobile: '9000000001', vehicle_reg: 'MH-02-ZZ-0001', policy_type: 'Comprehensive', status: 'closed' },
    { full_name: 'Karan Johar', mobile: '9111111111', vehicle_reg: 'MH-04-BJ-5678', policy_type: 'Own Damage', status: 'new' },
    { full_name: 'Deepika P', mobile: '9222222222', vehicle_reg: 'KA-05-MM-4321', policy_type: 'Comprehensive', status: 'contacted' }
];

const mutualFundLeads = [
    { full_name: 'Rajesh K', mobile: '9998887776', sip_capacity: '₹5,000/mo', primary_goal: 'Retirement', status: 'new' },
    { full_name: 'Pooja Hegde', mobile: '8887776665', sip_capacity: '₹10,000/mo', primary_goal: 'Wealth Creation', status: 'contacted' },
    { full_name: 'Virat Kohli', mobile: '7776665554', sip_capacity: '₹1,00,000/mo', primary_goal: 'Tax Saving', status: 'converted' },
    { full_name: 'Anushka S', mobile: '6665554443', sip_capacity: '₹50,000/mo', primary_goal: 'Child Education', status: 'new' },
    { full_name: 'MS Dhoni', mobile: '5554443332', sip_capacity: '₹2,00,000/mo', primary_goal: 'Retirement', status: 'closed' }
];

async function seed() {
    console.log('🌱 Seeding Leads...');

    // Health
    const { error: hErr } = await supabase.from('health_leads').insert(healthLeads);
    if (hErr) console.error('Error seeding Health:', hErr);
    else console.log('✅ Health Leads inserted');

    // Life
    const { error: lErr } = await supabase.from('life_leads').insert(lifeLeads);
    if (lErr) console.error('Error seeding Life:', lErr);
    else console.log('✅ Life Leads inserted');

    // Motor
    const { error: mErr } = await supabase.from('motor_leads').insert(motorLeads);
    if (mErr) console.error('Error seeding Motor:', mErr);
    else console.log('✅ Motor Leads inserted');

    // Mutual Funds
    const { error: mfErr } = await supabase.from('mutual_fund_leads').insert(mutualFundLeads);
    if (mfErr) console.error('Error seeding Mutual Funds:', mfErr);
    else console.log('✅ Mutual Fund Leads inserted');

    console.log('✨ Data Population Complete');
}

seed();
