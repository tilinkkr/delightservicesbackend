import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("DEBUG CHECK:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SERVICE KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "LOADED" : "MISSING");

// Connect to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Helper: Turn text into numbers (Embedding)
async function generateEmbedding(text) {
    try {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/embeddings`, {
            method: 'POST',
            body: JSON.stringify({
                model: process.env.EMBED_MODEL,
                prompt: text // Note: Ollama API uses 'prompt' for embeddings
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}

// Helper: Overlapping Chunking
function chunkText(text, size = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + size, text.length);
        chunks.push(text.slice(start, end));
        start += size - overlap;
    }
    return chunks;
}

// Helper: Safe DOM text extraction
const safeGet = (el, selector) => el.find(selector).first().text().trim() || '';

// Handler for Products Page
async function processProducts($, fileName) {
    const chunks = [];
    const productCards = $('.group.relative.flex.flex-col.rounded-2xl');

    console.log(`Found ${productCards.length} product cards in ${fileName}`);

    productCards.each((i, el) => {
        const card = $(el);
        const name = safeGet(card, 'h3');
        const price = safeGet(card, 'p.text-heritage-gold') || safeGet(card, 'p.text-heritage-navy\\/80'); // Handle both price styles
        const desc = safeGet(card, 'p.text-heritage-text\\/70');

        if (!name) return; // Skip empty

        const content = `Product: ${name}\nPrice: ${price}\nDescription: ${desc}`;

        chunks.push({
            content: content,
            metadata: {
                source: fileName,
                source_page: 'products',
                section: 'product_card',
                product_name: name,
                category: 'product' // Could be refined if category tags existed
            }
        });
    });
    return chunks;
}

// Handler for Services Page (index1.html)
async function processServices($, fileName) {
    const chunks = [];
    const sections = $('section[id]'); // Sections with IDs like #health, #life

    console.log(`Found ${sections.length} service sections in ${fileName}`);

    sections.each((i, el) => {
        const section = $(el);
        const id = section.attr('id');
        const title = safeGet(section, 'h2');
        const text = section.text().replace(/\s+/g, ' ').trim();

        if (!title && text.length < 50) return; // Skip navigation or empty sections

        chunks.push({
            content: `Service: ${title}\n\n${text}`,
            metadata: {
                source: fileName,
                source_page: 'services',
                section: id,
                title: title
            }
        });
    });
    return chunks;
}

// Handler for Generic Pages (Home, About)
async function processGeneric($, fileName) {
    const chunks = [];
    // Try to split by common semantic block containers
    const blocks = $('section, main, article, .reveal-section');

    // If no good blocks found, fallback to body text chunking
    if (blocks.length === 0) {
        const text = $('body').text().replace(/\s+/g, ' ').trim();
        const textChunks = chunkText(text, 1000, 200);
        return textChunks.map(txt => ({
            content: txt,
            metadata: { source: fileName, section: 'general_body' }
        }));
    }

    console.log(`Found ${blocks.length} semantic blocks in ${fileName}`);

    blocks.each((i, el) => {
        const block = $(el);
        const text = block.text().replace(/\s+/g, ' ').trim();

        if (text.length < 100) return; // Skip tiny blocks

        // If block is too huge, sub-chunk it
        if (text.length > 1500) {
            const subChunks = chunkText(text, 1000, 200);
            subChunks.forEach(sub => {
                chunks.push({
                    content: sub,
                    metadata: { source: fileName, section: `block_${i}` }
                });
            });
        } else {
            chunks.push({
                content: text,
                metadata: { source: fileName, section: `block_${i}` }
            });
        }
    });

    return chunks;
}

// Main Ingest Function
async function ingest() {
    const files = ['products.html', 'index1.html', 'home.html', 'aboutus.html'];

    // Optional: Clear existing documents for a clean slate (requires unsafe RLS bypass or separate function)
    // For now, we just append.

    for (const fileName of files) {
        const filePath = path.join(process.cwd(), 'public', fileName);
        if (!fs.existsSync(filePath)) continue;

        console.log(`Processing ${fileName}...`);
        const html = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(html);

        // Global cleanup
        $('script, style, nav, footer, noscript').remove();

        let chunks = [];

        if (fileName === 'products.html') {
            chunks = await processProducts($, fileName);
        } else if (fileName === 'index1.html') {
            chunks = await processServices($, fileName);
        } else {
            chunks = await processGeneric($, fileName);
        }

        console.log(`Generated ${chunks.length} vectors for ${fileName}`);

        // Save
        for (const item of chunks) {
            const vector = await generateEmbedding(item.content);
            if (!vector) continue;

            const { error } = await supabase.from('documents').insert({
                content: item.content,
                metadata: item.metadata,
                embedding: vector
            });

            if (error) console.error('DB Insert Error:', error.message);
        }
    }
    console.log("Ingestion Complete!");
}

ingest();
