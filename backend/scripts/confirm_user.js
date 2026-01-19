import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent dir
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const email = 'tilinbijoykkr1@gmail.com';
const password = 'password123';

async function main() {
    console.log(`Ensuring user ${email} exists with known password...`);

    // 1. Try to create
    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Tilin Bijoy' }
    });

    if (error) {
        console.log(`Create result: ${error.message}`);
        
        // If error implies existence, we find and update.
        // We'll iterate users to find the ID. 
        // Note: In a huge DB this is bad, but for this project it's fine.
        
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        
        if (listError) {
             console.error('Error listing users:', listError);
             return;
        }

        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            console.log(`Found user ID: ${existingUser.id}. Updating password...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password: password, email_confirm: true, user_metadata: { full_name: 'Tilin Bijoy' } }
            );

            if (updateError) {
                console.error('Failed to update user:', updateError);
            } else {
                console.log('✓ SUCCESS: User updated.');
                console.log(`   Email: ${email}`);
                console.log(`   Password: ${password}`);
            }
        } else {
            console.error('❌ ERROR: Create failed but could not find user in list.');
        }
    } else {
        console.log('✓ SUCCESS: User created.');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
    }
}

main().catch(err => console.error('Script Error:', err));
