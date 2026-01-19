
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function chatWithOllama(prompt) {
    try {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
            method: 'POST',
            body: JSON.stringify({
                model: process.env.CHAT_MODEL,
                prompt: prompt,
                stream: false
            })
        });
        const data = await response.json();
        return data.response;
    } catch (error) {
        return null;
    }
}

async function startWorker() {
    console.log("👷 AI Image Worker Started...");

    // 1. Fetch Products missing data
    // We select all to check fields, in production we'd filter
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) return console.error(error);

    console.log(`Processing ${products.length} products...`);

    for (const p of products) {
        let updates = {};

        // A. Generate Prompt if missing (Simulating Admin/AI filling it)
        if (!p.ai_image_prompt) {
            console.log(`[${p.name}] Generating Prompt...`);
            const prompt = `Describe a cinematic, high-end product shot of "${p.name}" (${p.category}) in a luxury setting. Lighting: studio, dramatic. visual descriptors only.`;
            const aiResponse = await chatWithOllama(prompt);
            updates.ai_image_prompt = aiResponse ? aiResponse.replace(/[\n\r"]/g, '').trim() : null;
        }

        // B. Generate Image if primary is missing (or if we just generated a prompt)
        // Note: User wants to populate ai_image_url and copy to primary_image_url
        const promptToUse = updates.ai_image_prompt || p.ai_image_prompt;

        if (promptToUse && (!p.primary_image_url || !p.ai_image_url)) {
            console.log(`[${p.name}] Rendering Image...`);

            // Pollinations.ai uses the prompt in the URL
            // We encode it to be safe
            const encodedPrompt = encodeURIComponent(promptToUse + " photorealistic, 8k, unreal engine 5, nologo");
            const newImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${p.id}`;

            updates.ai_image_url = newImageUrl;

            // Set primary if not manually set
            if (!p.primary_image_url) {
                updates.primary_image_url = newImageUrl;
                updates.external_image_source = 'ai_generated';
            }
        }

        // C. Save Updates
        // Force update user requested fields
        if (updates.ai_image_url) {
            updates.primary_image_url = updates.ai_image_url;
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('products')
                .update(updates)
                .eq('id', p.id);

            if (updateError) console.error(`Failed to update ${p.name}:`, updateError);
            else console.log(`✅ Updated ${p.name}`);
        }
    }

    console.log("🎉 Worker Cycle Complete. Database updated.");
}

startWorker();
