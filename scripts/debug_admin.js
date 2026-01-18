
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = 'tilinbijoykkr1@gmail.com';

async function verifyAdmin() {
    console.log(`Verifying profile for ${email}...`);

    // 1. Get Auth User
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('❌ User not found in Auth!');
        return;
    }
    console.log(`Auth User ID: ${user.id}`);

    // 2. Get Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile Fetch Error:', profileError);
    } else {
        console.log('✅ Profile Found:', profile);
        if (profile.role === 'admin') {
            console.log('🎉 Role is CORRECT: admin');
        } else {
            console.log(`⚠️ Role is INCORRECT: ${profile.role}`);
        }
    }
}

verifyAdmin();
