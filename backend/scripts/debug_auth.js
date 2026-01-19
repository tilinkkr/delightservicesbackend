
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetAdminPassword() {
    console.log('--- Resetting Admin Password ---');

    const email = 'admin@delight.com';
    const newPassword = 'password123';

    // 1. Find User
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const adminUser = users.find(u => u.email === email);

    if (!adminUser) {
        console.error(`User ${email} not found!`);
        return;
    }

    console.log(`Found user ${email} (ID: ${adminUser.id})`);

    // 2. Update Password and Confirm Email
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        {
            password: newPassword,
            email_confirm: true
        }
    );

    if (updateError) {
        console.error('Failed to update user:', updateError);
    } else {
        console.log(`✅ Successfully reset password for ${email}`);
        console.log(`New Password: ${newPassword}`);
    }
}

resetAdminPassword();
