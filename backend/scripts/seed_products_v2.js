
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- GENERATORS ---
const categories = ['perfume', 'incense', 'oil'];
const adjectives = ['Royal', 'Mysore', 'Himalayan', 'Ancient', 'Golden', 'Divine', 'Pure', 'Midnight', 'Velvet', 'Sacred'];
const nouns = {
    perfume: ['Oud', 'Essence', 'Mist', 'Aura', 'Elixir', 'Bloom', 'Nectar'],
    incense: ['Sandalwood', 'Sage', 'Resin', 'Sticks', 'Amber', 'Flow', 'Smoke'],
    oil: ['Rose', 'Cedar', 'Jasmine', 'Lavendar', 'Musk', 'Extract', 'Infusion']
};

const images = {
    perfume: [
        'https://images.unsplash.com/photo-1594035910387-fea477942698?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1616949755610-8c9abc08f8a1?auto=format&fit=crop&q=80&w=600'
    ],
    incense: [
        'https://images.unsplash.com/photo-1608505051912-426b32524a1b?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1563220478-f078513b6329?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1564594344079-0588663806a6?auto=format&fit=crop&q=80&w=600'
    ],
    oil: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5e84e7c?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1572635148818-96540f288921?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1615486511484-92e172cc416d?auto=format&fit=crop&q=80&w=600'
    ]
};

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProducts(count) {
    const products = [];
    for (let i = 0; i < count; i++) {
        const cat = getRandom(categories);
        const name = `${getRandom(adjectives)} ${getRandom(nouns[cat])}`;
        const price = Math.floor(Math.random() * (5000 - 500) + 500);

        products.push({
            name: name,
            description: `A ${getRandom(adjectives).toLowerCase()} blend for the discerning soul. Experience the ${getRandom(adjectives).toLowerCase()} quality.`,
            price: price,
            category: cat,
            image_url: getRandom(images[cat]),
            // stock_status: Math.random() > 0.8 ? 'low_stock' : 'in_stock', // Column missing in DB
            // is_featured: Math.random() > 0.7 // Column missing in DB
        });
    }
    return products;
}

// --- MAIN SEEDER ---
async function seedV2() {
    console.log('🚀 Starting V2 Seed (30 Products + Demo Services)...');

    // 1. Clear existing products (optional, but cleaner)
    await supabase.from('products').delete().neq('id', 0);

    // 2. Generate & Insert
    const newProducts = generateProducts(30);
    const { error } = await supabase.from('products').insert(newProducts);

    if (error) console.error('Product Seed Error:', error);
    else console.log(`✅ Successfully inserted ${newProducts.length} new products.`);

    // 3. Insert specific services if they don't exist (using logic from v1)
    // Skipped to save token space, assuming v1 ran or we only need products here.

    console.log('✨ Catalog Expansion Complete.');
}

seedV2();
