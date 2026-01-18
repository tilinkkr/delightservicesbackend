
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Using Service Role Key is best for seeding, but anon works if RLS allows

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- DATA ---
const products = [
    {
        name: 'Nawabi Oud Essence',
        description: 'Exquisite long-lasting woody notes inspired by royal evenings.',
        price: 2499,
        category: 'perfume',
        image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop',
        stock_status: 'in_stock',
        is_featured: true
    },
    {
        name: 'Mysore Sandalwood',
        description: '100% Organic ingredients, hand-rolled for purity and prayer.',
        price: 999,
        category: 'incense',
        image_url: 'https://images.unsplash.com/photo-1608508436440-d667d4f9f688?q=80&w=1200&auto=format&fit=crop',
        stock_status: 'in_stock',
        is_featured: true
    },
    {
        name: 'Himalayan Lavender',
        description: 'Calming evening fragrance harvested from high altitudes.',
        price: 1299,
        category: 'perfume',
        image_url: 'https://images.unsplash.com/photo-1595181273908-11a562479e0a?q=80&w=1200&auto=format&fit=crop',
        stock_status: 'in_stock',
        is_featured: false
    },
    {
        name: 'Jaipur Rose Attar',
        description: 'Pure essential oil extract, distilled using ancient techniques.',
        price: 1499,
        category: 'oil',
        image_url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?q=80&w=1200&auto=format&fit=crop',
        stock_status: 'low_stock',
        is_featured: false
    },
    {
        name: 'Mountain Cedarwood',
        description: 'Earthy and grounding scent perfect for meditation spaces.',
        price: 1199,
        category: 'perfume',
        image_url: 'https://images.unsplash.com/photo-1585808933614-434076722245?q=80&w=1200&auto=format&fit=crop',
        stock_status: 'in_stock',
        is_featured: false
    },
    {
        name: 'Madurai Jasmine',
        description: 'Fresh morning bloom scent with sweet southern undertones.',
        price: 1899,
        category: 'perfume',
        image_url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1200&auto=format&fit=crop',
        stock_status: 'in_stock',
        is_featured: false
    }
];

const services = [
    {
        name: 'Lakshmi Wealth Plan',
        type: 'investment',
        description: 'Comprehensive financial protection tailored for family legacy.',
        min_investment: 50000,
        features: ['Advisory', 'Legacy Planning', 'Custom Portfolio']
    },
    {
        name: 'Health Elite+',
        type: 'insurance',
        description: 'Comprehensive protection for you and your loved ones against rising medical costs.',
        min_investment: 15000,
        features: ['Cashless', 'No Claim Bonus', 'Family Floater']
    },
    {
        name: 'Term Life Secure',
        type: 'insurance',
        description: 'Secure your family\'s financial future even when you are not around.',
        min_investment: 10000,
        features: ['High Cover', 'Critical Illness Rider', 'Tax Benefits']
    },
    {
        name: 'Motor Shield',
        type: 'insurance',
        description: 'Drive with confidence knowing your vehicle is protected against the unexpected.',
        min_investment: 5000,
        features: ['Zero Dep', 'RSA', 'Key Replacement']
    },
    {
        name: 'Smart Stocks',
        type: 'investment',
        description: 'Expert tools and insights to help you navigate the stock market efficiently.',
        min_investment: 25000,
        features: ['Intraday Tips', 'Long Term Calls', 'Portfolio Review']
    },
    {
        name: 'Growth Mutual Funds',
        type: 'investment',
        description: 'Disciplined wealth creation through professionally managed portfolios.',
        min_investment: 500,
        features: ['SIP', 'ELSS', 'Direct Plans']
    }
];

async function seed() {
    console.log('🌱 Starting Seed Process...');

    // 1. Seed Products
    console.log(`Inserting ${products.length} products...`);
    const { error: prodError } = await supabase.from('products').insert(products);

    if (prodError) {
        console.error('Error inserting products:', prodError.message);
    } else {
        console.log('✅ Products seeded successfully.');
    }

    // 2. Seed Services
    console.log(`Inserting ${services.length} services...`);
    const { error: servError } = await supabase.from('services').insert(services);

    if (servError) {
        console.error('Error inserting services:', servError.message);
    } else {
        console.log('✅ Services seeded successfully.');
    }

    console.log('✨ Seeding Completed!');
}

seed();
