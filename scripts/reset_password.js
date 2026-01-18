
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const email = 'tilinbijoykkr1@gmail.com';
const newPassword = 'admin123';

async function run() {
    console.log(`Checking user: ${email}...`);

    // 1. List users to find the ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log(`User found (ID: ${user.id}). Updating password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: newPassword
        });

        if (updateError) {
            console.error('Failed to update password:', updateError);
        } else {
            console.log(`✅ SUCCESS: Password updated to '${newPassword}'`);
        }
    } else {
        console.log('User not found. Creating new admin user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: newPassword,
            email_confirm: true
        });

        if (createError) {
            console.error('Failed to create user:', createError);
        } else {
            console.log(`✅ SUCCESS: Created user with password '${newPassword}'`);
            // Also ensure profile role is admin
        }
    }
}

run();
