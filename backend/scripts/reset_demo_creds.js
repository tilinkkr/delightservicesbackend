import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we load the root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const adminEmail = 'tilinbijoykkr1@gmail.com';
const userEmail = 'customer@example.com';
const commonPassword = 'Delight123!';

async function resetCredentials() {
    console.log('🔄 Resetting Credentials for Demo...');

    const targets = [
        { email: adminEmail, role: 'admin' },
        { email: userEmail, role: 'user' }
    ];

    for (const target of targets) {
        console.log(`Searching for ${target.role}: ${target.email}...`);

        let { data: { users } } = await supabase.auth.admin.listUsers();
        let user = users.find(u => u.email === target.email);

        if (!user) {
            console.log(`⚠️ User ${target.email} not found. Creating...`);
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: target.email,
                password: commonPassword,
                email_confirm: true,
                user_metadata: { full_name: target.role === 'admin' ? 'Super Admin' : 'Demo User' }
            });
            if (createError) {
                console.error(`❌ Failed to create ${target.email}:`, createError.message);
                continue;
            }
            user = newUser.user;
            console.log(`✅ Created ${target.email}`);
        } else {
            console.log(`Found ${target.email}. Updating password...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { password: commonPassword }
            );
            if (updateError) {
                console.error(`❌ Failed to update password for ${target.email}:`, updateError.message);
                continue;
            }
            console.log(`✅ Password updated for ${target.email}`);
        }

        // Ensure Profile Role matches
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                role: target.role,
                full_name: target.role === 'admin' ? 'Tilin Bijoy' : 'Demo Customer'
            });

        if (profileError) {
            console.error(`❌ Failed to sync profile for ${target.email}:`, profileError.message);
        } else {
            console.log(`✅ Profile synced for ${target.email} [Role: ${target.role}]`);
        }
    }

    console.log('\n✨ CREDENTIALS RESET COMPLETE ✨');
    console.log('-----------------------------------');
    console.log(`ADMIN: ${adminEmail}  |  ${commonPassword}`);
    console.log(`USER:  ${userEmail}   |  ${commonPassword}`);
    console.log('-----------------------------------');
}

resetCredentials();
