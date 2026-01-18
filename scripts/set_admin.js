
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = 'tilinbijoykkr1@gmail.com';

async function setAdmin() {
    console.log(`Finding user ${email}...`);
    // 1. Get User ID from Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`User ID: ${user.id}. Upserting profile with role = 'admin'...`);

    // 2. Upsert Profile
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'admin',
            full_name: 'Tilin Bijoy' // Optional
        });

    if (error) {
        console.error('Error setting admin:', error);
    } else {
        console.log('✓ SUCCESS: User is now an ADMIN.');
    }
}

setAdmin();
