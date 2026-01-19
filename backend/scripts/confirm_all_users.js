
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role required for Admin updates
);

async function confirmAllUsers() {
    console.log('--- FORCING EMAIL CONFIRMATION FOR ALL USERS ---');

    // 1. List Users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users found.');
        return;
    }

    console.log(`Found ${users.length} users. Confirming...`);

    // 2. Update Each User
    for (const user of users) {
        if (!user.email_confirmed_at) {
            console.log(`Confirming ${user.email}...`);
            const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            );

            if (updateError) {
                console.error(`❌ Failed to confirm ${user.email}:`, updateError.message);
            } else {
                console.log(`✅ CONFIRMED: ${user.email}`);
            }
        } else {
            console.log(`ℹ️ Already confirmed: ${user.email}`);
        }
    }

    console.log('--- Confirmation Complete ---');
}

confirmAllUsers();
