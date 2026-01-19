
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- DATA MAPPING ---
// Unsplash URLs for better visuals
const imageUpdates = [
    {
        name: 'Nawabi Oud Essence',
        image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop' // Dark perfume bottle
    },
    {
        name: 'Mysore Sandalwood',
        image_url: 'https://images.unsplash.com/photo-1608508436440-d667d4f9f688?q=80&w=1200&auto=format&fit=crop' // Incense sticks
    },
    {
        name: 'Himalayan Lavender',
        image_url: 'https://images.unsplash.com/photo-1595181273908-11a562479e0a?q=80&w=1200&auto=format&fit=crop' // Lavender bottle
    },
    {
        name: 'Jaipur Rose Attar',
        image_url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?q=80&w=1200&auto=format&fit=crop' // Rose oil
    },
    {
        name: 'Mountain Cedarwood',
        image_url: 'https://images.unsplash.com/photo-1585808933614-434076722245?q=80&w=1200&auto=format&fit=crop' // Woodsy bottle
    },
    {
        name: 'Madurai Jasmine',
        image_url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1200&auto=format&fit=crop' // White floral/bottle
    }
];

async function updateImages() {
    console.log('🔄 Updating product images...');

    for (const item of imageUpdates) {
        // We use like because exact match sometimes fails due to spaces or casing, though here names are exact
        console.log(`Updating ${item.name}...`);

        // First get the ID to be safe
        const { data: products, error: fetchError } = await supabase
            .from('products')
            .select('id')
            .eq('name', item.name);

        if (fetchError) {
            console.error(`Error fetching ${item.name}:`, fetchError.message);
            continue;
        }

        if (products && products.length > 0) {
            // Update all matching products (in case of duplicates, fixes all)
            for (const prod of products) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ image_url: item.image_url })
                    .eq('id', prod.id);

                if (updateError) {
                    console.error(`Error updating instance of ${item.name}:`, updateError.message);
                } else {
                    console.log(`✓ Updated ${item.name} (ID: ${prod.id})`);
                }
            }
        } else {
            console.warn(`No product found with name: ${item.name}`);
        }
    }

    console.log('✨ Image update process complete!');
}

updateImages();
