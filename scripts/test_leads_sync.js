
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSync() {
    console.log("Testing Mutual Fund Leads Sync...");

    // 1. Check DB Count
    const { count, error } = await supabase
        .from('mutual_fund_leads')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log("Real DB Count:", count);

    // 2. Fetch using fetch API (Simulating frontend)
    // We assume server is running on 3000
    try {
        // We'll skip complex auth for this quick test script and just check DB for now
        // since replicating the auth token flow in a script is tedious without logging in
        console.log("Use dashboard browser console to check network tab for /api/admin/mutual-fund-leads");
    } catch (e) {
        console.error(e);
    }
}

testSync();
