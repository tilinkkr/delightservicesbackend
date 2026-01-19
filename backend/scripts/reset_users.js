
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
    process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role required for deletion
);

async function wipeUsers() {
    console.log('--- WIPING ALL USERS (Fresh Start) ---');

    // 1. List Users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users to delete.');
        return;
    }

    console.log(`Found ${users.length} users. Deleting...`);

    // 2. Delete Each User
    for (const user of users) {
        const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
        if (delError) {
            console.error(`Failed to delete ${user.email}:`, delError.message);
        } else {
            console.log(`✅ Deleted: ${user.email}`);
        }
    }

    console.log('--- Wipe Complete ---');
}

wipeUsers();
