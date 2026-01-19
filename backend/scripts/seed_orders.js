
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedData() {
    console.log('🌱 Starting Data Seeding...');

    // 1. Get or Create Dummy Users
    console.log('...Checking Users');
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    // We need at least one user to attach orders to. Use the admin or first available.
    let userId = users[0]?.id;

    if (!userId) {
        console.log('...No users found. Creating dummy user.');
        const { data: newUser } = await supabase.auth.admin.createUser({
            email: 'customer@example.com',
            password: 'password123',
            email_confirm: true
        });
        userId = newUser.user.id;

        // Create profile
        await supabase.from('profiles').insert({
            id: userId,
            full_name: 'John Doe',
            role: 'user'
        });
    }

    // 2. Get or Create Products
    console.log('...Checking Products');
    let { data: products } = await supabase.from('products').select('id, price, name');

    if (!products || products.length === 0) {
        console.log('...No products found. Seeding products.');
        const newProducts = [
            { name: 'Nawabi Oud', category: 'Perfumes', price: 120, stock: 50, image_url: 'https://via.placeholder.com/150' },
            { name: 'Royal Sandalwood', category: 'Incense', price: 45, stock: 100, image_url: 'https://via.placeholder.com/150' },
            { name: 'Amber Musk', category: 'Perfumes', price: 85, stock: 20, image_url: 'https://via.placeholder.com/150' },
            { name: 'Rose Water', category: 'Essentials', price: 15, stock: 200, image_url: 'https://via.placeholder.com/150' }
        ];
        const { data: inserted } = await supabase.from('products').insert(newProducts).select();
        products = inserted;
    }

    // 3. Create Orders (Past 30 Days)
    console.log('...Generating Orders');
    const orders = [];
    const statuses = ['delivered', 'shipped', 'pending'];

    for (let i = 0; i < 25; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const total = product.price * qty;

        // Random date in past 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        orders.push({
            user_id: userId,
            total_amount: total,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            created_at: date.toISOString()
            // payment_method removed as column missing in DB
        });
    }

    const { error: orderError } = await supabase.from('orders').insert(orders);

    if (orderError) {
        console.error('❌ Error seeding orders:', orderError);
    } else {
        console.log(`✅ Successfully seeded ${orders.length} orders!`);
    }
}

seedData();
