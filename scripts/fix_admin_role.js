
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixAdminProfile() {
    console.log('--- Fixing Admin Profile ---');
    const email = 'admin@delight.com';

    // 1. Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    const adminUser = users.find(u => u.email === email);

    if (!adminUser) {
        console.error(`User ${email} not found. Please run debug_auth.js first.`);
        return;
    }
    console.log(`User ID: ${adminUser.id}`);

    // 2. Check/Upsert Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.id)
        .maybeSingle();

    if (profile) {
        console.log('Existing Profile:', profile);
        if (profile.role !== 'admin') {
            console.log('Updating role to admin...');
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', adminUser.id);
            console.log('✅ Role updated.');
        } else {
            console.log('✅ Profile already has admin role.');
        }
    } else {
        console.log('No profile found. Creating one...');
        const { error: insertError } = await supabase.from('profiles').insert({
            id: adminUser.id,
            full_name: 'System Admin',
            role: 'admin',
            phone: '0000000000'
        });

        if (insertError) {
            console.error('❌ Failed to create profile:', insertError);
        } else {
            console.log('✅ Admin profile created.');
        }
    }
}

fixAdminProfile();
