import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Required for Ollama calls
import adminRoutes from './routes/adminRoutes.js'; // Import Admin Routes

// Load enviroment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Vercel robust path
app.use(express.static(path.join(process.cwd(), '../frontend')));

// Mount Admin Routes
app.use('/api/admin', adminRoutes);

// Supabase Client
// Supabase Client (Using Service Role for Server-Side Access)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Helper: Generate Embedding (Reusing logic for consistency, ideally shared utility)
async function generateEmbedding(text) {
    if (!process.env.OLLAMA_URL) return null; // Safety Guard for Vercel
    try {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/embeddings`, {
            method: 'POST',
            body: JSON.stringify({
                model: process.env.EMBED_MODEL,
                prompt: text
            })
        });
        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error("Embedding Error:", error);
        return null;
    }
}

// Helper: Chat with Ollama
async function chatWithOllama(prompt) {
    if (!process.env.OLLAMA_URL) return "AI Chat is currently offline (No GPU Provider)."; // Safety Guard
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
        console.error("Ollama Chat Error:", error);
        return "I'm having trouble thinking right now.";
    }
}

// Helper: Query Router
function classifyQuery(query) {
    const lower = query.toLowerCase();

    // Products Routing
    if (lower.match(/perfume|incense|price|cost|bottle|scent|buy|shop|attar|oud/)) return 'products.html';

    // Services Routing
    if (lower.match(/membership|plan|session|service|reset|therapy|health|life|motor|stocks|mutual|insurance|investment/)) return 'index1.html';

    // About Routing
    if (lower.match(/about|who are you|founder|mission|contact|team/)) return 'aboutus.html';

    // Home/Vision Routing
    if (lower.match(/vision|home|welcome|intro/)) return 'home.html';

    return null; // General query
}

// ==========================================
// API ENDPOINTS (Products, Services, Inquiries)
// ==========================================

// GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: true });

        console.log(`API Debug: Found ${data?.length} products`);

        if (error) throw error;
        res.json({ products: data });
    } catch (err) {
        console.error('Products API Error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/services
app.get('/api/services', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*');
        // .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ services: data });
    } catch (err) {
        console.error('Services API Error:', err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// POST /api/inquiry
app.post('/api/inquiry', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic Validation
        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required' });
        }

        const { error } = await supabase.from('inquiries').insert({
            name,
            email,
            subject,
            message
        });

        if (error) {
            console.error('Inquiry Insert Error:', error);
            throw error;
        }
        res.status(201).json({ ok: true, message: 'Inquiry submitted successfully' });
    } catch (err) {
        console.error('Inquiry API Error:', err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

// POST /api/health-leads
app.post('/api/health-leads', async (req, res) => {
    try {
        const { full_name, mobile, dob, city, coverage_type, conditions } = req.body;

        // Validation
        if (!full_name || !mobile || !city) {
            return res.status(400).json({ error: 'Name, Mobile, and City are required' });
        }

        const { error } = await supabase.from('health_leads').insert({
            full_name,
            mobile,
            dob,
            city,
            coverage_type,
            conditions: conditions || [] // Ensure array
        });

        if (error) {
            console.error('Health Lead Insert Error:', error);
            throw error;
        }

        res.status(201).json({ ok: true, message: 'Health Details Submitted' });
    } catch (err) {
        console.error('Health Lead API Error:', err);
        res.status(500).json({ error: 'Failed to submit details' });
    }
});

// POST /api/life-leads
app.post('/api/life-leads', async (req, res) => {
    try {
        const { first_name, last_name, nominee_name, phone, email, sum_assured, tenure, riders } = req.body;

        if (!first_name || !last_name || !phone) {
            return res.status(400).json({ error: 'Name and Phone are required' });
        }

        const { error } = await supabase.from('life_leads').insert({
            first_name,
            last_name,
            nominee_name,
            phone,
            email,
            sum_assured,
            tenure,
            riders: riders || []
        });

        if (error) {
            console.error('Life Lead Insert Error:', error);
            throw error;
        }

        res.status(201).json({ ok: true, message: 'Life Logic Submitted' });
    } catch (err) {
        console.error('Life Lead API Error:', err);
        res.status(500).json({ error: 'Failed to submit details' });
    }
});

// POST /api/motor-leads
app.post('/api/motor-leads', async (req, res) => {
    try {
        const { full_name, mobile, vehicle_reg, policy_type } = req.body;

        if (!full_name || !mobile) {
            return res.status(400).json({ error: 'Name and Mobile are required' });
        }

        const { error } = await supabase.from('motor_leads').insert({
            full_name,
            mobile,
            vehicle_reg,
            policy_type,
            status: 'new'
        });

        if (error) {
            console.error('Motor Lead Insert Error:', error);
            throw error;
        }

        res.status(201).json({ ok: true, message: 'Motor Lead Submitted' });
    } catch (err) {
        console.error('Motor Lead API Error:', err);
        res.status(500).json({ error: 'Failed to submit details' });
    }
});

// POST /api/mutual-fund-leads
app.post('/api/mutual-fund-leads', async (req, res) => {
    try {
        const { full_name, mobile, sip_capacity, primary_goal } = req.body;

        if (!full_name || !mobile) {
            return res.status(400).json({ error: 'Name and Mobile are required' });
        }

        const { error } = await supabase.from('mutual_fund_leads').insert({
            full_name,
            mobile,
            sip_capacity,
            primary_goal,
            status: 'new'
        });

        if (error) {
            console.error('Mutual Fund Lead Insert Error:', error);
            throw error;
        }

        res.status(201).json({ ok: true, message: 'Mutual Fund Inquiry Submitted' });
    } catch (err) {
        console.error('Mutual Fund Lead API Error:', err);
        res.status(500).json({ error: 'Failed to submit details' });
    }
});

// ==========================================
// CART ENDPOINTS (ROBUST & VERIFIED)
// ==========================================

// Helper: Get or Create Cart
async function getOrCreateCart(userId) {
    console.log(`[CART] Getting/creating cart for user: ${userId}`);

    // Try to find existing cart using maybeSingle to avoid 406 error
    const { data: existingCart, error: findError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existingCart) {
        console.log(`[CART] Found existing cart: ${existingCart.id}`);
        return existingCart.id;
    }

    if (findError && findError.code !== 'PGRST116') {
        console.error('[CART] Find error:', findError);
    }

    // Create new cart
    console.log('[CART] Creating new cart...');
    const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

    if (createError) {
        console.error('[CART] Create error:', createError);
        throw createError;
    }

    console.log(`[CART] Created new cart: ${newCart.id}`);
    return newCart.id;
}

// POST /api/cart - Add item to cart
app.post('/api/cart', async (req, res) => {
    console.log('[API] POST /api/cart');

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('[CART] Auth failed:', authError);
            return res.status(401).json({ error: 'Invalid token' });
        }

        console.log(`[CART] User: ${user.email}`);

        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: 'product_id required' });
        }

        // Verify product exists
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, price')
            .eq('id', product_id)
            .single();

        if (productError || !product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get or create cart
        const cartId = await getOrCreateCart(user.id);

        // Check if item already in cart
        const { data: existingItem, error: checkError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cartId)
            .eq('product_id', product_id)
            .maybeSingle();

        if (existingItem) {
            // Update quantity
            console.log(`[CART] Updating quantity: ${existingItem.quantity} + ${quantity}`);
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id);

            if (updateError) throw updateError;
        } else {
            // Insert new item
            console.log(`[CART] Inserting new item`);
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cartId,
                    product_id,
                    quantity
                });

            if (insertError) throw insertError;
        }

        // Get updated cart count
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('cart_id', cartId);

        const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        console.log('[CART] ✓ Item added successfully');
        res.json({
            ok: true,
            cart_count: totalItems,
            message: `${product.name} added to cart`
        });

    } catch (err) {
        console.error('[CART] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cart - Fetch user's cart
app.get('/api/cart', async (req, res) => {
    console.log('[API] GET /api/cart');

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        console.log(`[CART] Fetching cart for: ${user.email}`);

        // Get cart
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!cart) {
            console.log('[CART] No cart found');
            return res.json({ cart: [], total: 0, count: 0 });
        }

        // Get items with product details
        const { data: items, error: itemsError } = await supabase
            .from('cart_items')
            .select(`
        id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_url,
          category
        )
      `)
            .eq('cart_id', cart.id)
            .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;

        // Calculate totals
        const total = items?.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0) || 0;

        const count = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        console.log(`[CART] Found ${items?.length || 0} items, total: ₹${total}`);

        res.json({
            cart: items || [],
            total: parseFloat(total.toFixed(2)),
            count
        });

    } catch (err) {
        console.error('[CART] Error:', err);
        res.status(500).json({ error: err.message, cart: [], total: 0, count: 0 });
    }
});

// PATCH /api/cart/:id - Update item quantity
app.patch('/api/cart/:id', async (req, res) => {
    console.log(`[API] PATCH /api/cart/${req.params.id}`);

    const token = req.headers.authorization?.split(' ')[1];
    const { quantity } = req.body;
    const itemId = req.params.id;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

        // Verify ownership indirectly via cart_id -> user_id check would be best,
        // but for now we rely on the DB query ensuring we find the item

        // 1. Get cart id for user
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        // 2. Update item ensuring it belongs to this cart
        const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId)
            .eq('cart_id', cart.id); // Security: Ensure item belongs to user's cart

        if (updateError) throw updateError;

        res.json({ ok: true });
    } catch (err) {
        console.error('[CART] Update Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/cart/:id - Remove item
app.delete('/api/cart/:id', async (req, res) => {
    console.log(`[API] DELETE /api/cart/${req.params.id}`);

    const token = req.headers.authorization?.split(' ')[1];
    const itemId = req.params.id;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)
            .eq('cart_id', cart.id); // Security check

        if (deleteError) throw deleteError;

        res.json({ ok: true });
    } catch (err) {
        console.error('[CART] Delete Error:', err);
        res.status(500).json({ error: err.message });
    }
});



// POST /api/checkout (Modified for New Cart)
app.post('/api/checkout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Invalid Token' });

        const { items } = req.body;
        let orderItems = items;

        // Cart Checkout
        if (!items || items.length === 0) {
            const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
            if (!cart) return res.json({ ok: true }); // Empty

            const { data: cartData } = await supabase
                .from('cart_items')
                .select('*, product:products(*)')
                .eq('cart_id', cart.id);

            if (cartData) {
                orderItems = cartData.map(c => ({
                    product_id: c.product.id,
                    product_name: c.product.name,
                    product_price: c.product.price
                }));
            }
        }

        if (!orderItems || orderItems.length === 0) return res.json({ ok: true });

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3); // Random 3-7 days

        // Calculate Total Amount
        const totalAmount = orderItems.reduce((sum, item) => sum + (Number(item.product_price) || 0), 0);

        // Insert Single Order
        // NOTE: This requires running scripts/improve_orders_schema.sql in Supabase first!
        const { error } = await supabase.from('orders').insert({
            user_id: user.id,
            total_amount: totalAmount,
            status: 'confirmed',
            payment_status: 'paid',
            delivery_date: deliveryDate
        });

        if (error) throw error;

        // Clear Cart
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
            await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        }

        res.json({ ok: true, delivery_date: deliveryDate });

    } catch (err) {
        console.error('Checkout API Error:', err);
        res.status(500).json({ error: 'Payment failed' });
    }
});

// GET /api/trends (AI Generated)
app.get('/api/trends', async (req, res) => {
    try {
        // Simple caching could go here, but for demo we gen every time or use a static fallback if AI fails
        const prompt = "Generate a short, sophisticated, single-sentence update (max 15 words) about the current trends in luxury oud perfumes and organic incense for a high-end conceptual store.";
        const trend = await chatWithOllama(prompt);
        res.json({ trend: trend.trim().replace(/^"|"$/g, '') }); // Remove quotes
    } catch (err) {
        res.json({ trend: "Embrace the timeless elegance of royal oud and artisanal sandalwood this season." }); // Fallback
    }
});


// GET /api/user/dashboard (Real Data)
app.get('/api/user/dashboard', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: 'Invalid Token' });

        // Fetch User Data Parallel
        const [profile, inquiries, orders, services] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('inquiries').select('*').eq('user_id', user.id),
            supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('user_services').select('*').eq('user_id', user.id)
        ]);

        res.json({
            profile: profile.data,
            orders: orders.data || [],
            inquiries: inquiries.data || [],
            services: services.data || []
        });

    } catch (err) {
        console.error('Dashboard API Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// ==========================================
// CHAT ROUTE
// ==========================================
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    console.log(`User Input: ${message}`);

    // Safety: Check if Ollama is available
    if (!process.env.OLLAMA_URL) {
        return res.json({ reply: "I can answer product questions, but my AI brain is currently sleeping (No GPU online). Please check the product items directly." });
    }

    // 1. Turn Question into Vector
    const vector = await generateEmbedding(message);
    if (!vector) return res.status(500).json({ error: 'Failed to process question' });

    // 2. Search Supabase for Matching Content
    // Fetch more candidates (15) to allow for filtering
    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: vector,
        match_threshold: 0.70, // Slightly lower threshold to ensure we get candidates to filter
        match_count: 15
    });

    if (error) {
        console.error('Supabase Search Error:', error);
    }

    // 3. Apply Query Routing & Filtering
    let filteredDocs = documents || [];
    const route = classifyQuery(message);

    if (route) {
        console.log(`Routing query to: ${route}`);
        const routedDocs = filteredDocs.filter(doc => doc.metadata?.source === route);

        // If we found relevant docs in the routed category, stick to them.
        if (routedDocs.length > 0) {
            filteredDocs = routedDocs;
        } else {
            console.log("Router found no matches in target source, falling back to global search.");
        }
    }

    // Slice to top 4 most relevant after filtering
    filteredDocs = filteredDocs.slice(0, 4);

    // 4. Construct Prompt with Context
    const contextText = filteredDocs.length > 0 ? filteredDocs.map(doc => {
        const m = doc.metadata || {};
        const page = m.source_page || 'unknown';
        const section = m.section || 'unknown';
        const name = m.product_name ? `Product: ${m.product_name}\n` : '';
        return `[Page: ${page} | Section: ${section}]\n${name}${doc.content}`;
    }).join('\n---\n') : '';

    const prompt = `
    You are the chatbot for the Delight Services website.

    Use ONLY the information in the CONTEXT below.
    - If the question is about products, answer strictly from product data.
    - If the question is about services or plans, answer from services sections.
    - If you cannot find the answer in the context, say:
      "I’m not sure based on the current Delight Services site content."

    CONTEXT:
    ${contextText}

    QUESTION:
    ${message}

    Answer in 2–4 concise sentences.
    `.trim();

    // 5. Get Answer from Ollama
    const botResponse = await chatWithOllama(prompt);

    res.json({ reply: botResponse });
});

// ==========================================
// AUTH ENDPOINT (Auto-Confirm Signup)
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log(`[AUTH] Creating auto-confirmed user: ${email}`);

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { full_name, phone }
        });

        if (error) {
            // Translate common Supabase errors
            if (error.code === 'email_exists' || error.message.includes('already registered')) {
                console.log('[AUTH] User already registered, returning 400.');
                return res.status(400).json({ error: 'User already exists. Please login.' });
            }
            console.error('[AUTH] Signup Error:', error);
            throw error;
        }

        // Also create a profile entry ensuring it exists (Supabase triggers usually do this, but safe to double check)
        // We defer to triggers for now to avoid race conditions, or we can insert if needed.
        // Assuming triggers handle profile creation.

        res.status(201).json({ ok: true, message: 'User created and verified.', user: data.user });

    } catch (err) {
        if (err.code === 'email_exists' || err.message?.includes('already registered')) {
            return res.status(400).json({ error: 'User already exists. Please login.' });
        }
        console.error('[AUTH] Critical Signup Error:', err);
        res.status(500).json({ error: err.message || 'Signup failed' });
    }
});

export default app;
