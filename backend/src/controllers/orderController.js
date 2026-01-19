
import { supabase } from '../config/supabaseClient.js';

export const getOrders = async (req, res) => {
    try {
        // 1. Fetch Orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*') // No relationship join
            .order('created_at', { ascending: false })
            .limit(20);

        if (ordersError) throw ordersError;
        if (!orders || orders.length === 0) return res.json([]);

        // 2. Fetch Profiles Manually (Workaround for FK issue)
        const userIds = [...new Set(orders.map(o => o.user_id))];

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        if (profilesError) {
            console.error('Profile Fetch Error:', profilesError);
            // Proceed without names rather than failing
        }

        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

        // 3. Attach Profiles
        const joined = orders.map(o => ({
            ...o,
            profiles: profileMap[o.user_id] || { full_name: 'Unknown' }
        }));

        res.json(joined);

    } catch (err) {
        console.error('Fetch Orders Critical Error:', err);
        res.status(500).json({ error: 'Fetch orders failed: ' + err.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Basic Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) throw orderError || new Error('Order not found');

        // 2. Fetch Profile Manually
        let profile = { full_name: 'Unknown', email: 'N/A' };
        if (order.user_id) {
            const { data: p } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('id', order.user_id)
                .single();
            if (p) profile = p;
        }

        // 3. Fetch Items
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

        if (itemsError) console.error('Error fetching items', itemsError);

        // 4. Fetch Product Details for Items
        const enrichedItems = [];
        if (items && items.length > 0) {
            const productIds = [...new Set(items.map(i => i.product_id))];
            const { data: products } = await supabase
                .from('products')
                .select('id, name, image_url')
                .in('id', productIds);

            const productMap = (products || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

            items.forEach(item => {
                enrichedItems.push({
                    ...item,
                    products: productMap[item.product_id] || { name: 'Deleted Product' }
                });
            });
        }

        // 5. Construct Final Response
        const fullOrder = {
            ...order,
            profiles: profile,
            order_items: enrichedItems
        };

        res.json(fullOrder);

    } catch (err) {
        console.error('Fetch Order Details Error:', err);
        res.status(404).json({ error: 'Order not found or access denied' });
    }
};

import { logAudit } from '../utils/auditLogger.js';

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log(`Updating Order ${id} to ${status}`);

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase Update Error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.error('Order not found during update (ID check failed)');
            return res.status(404).json({ error: 'Order not found' });
        }

        // Audit Log
        if (req.user && req.user.id) {
            await logAudit(req.user.id, 'STATUS_CHANGE', 'order', id, { new_status: status });
        }

        res.json(data);
    } catch (err) {
        console.error('Update Order Status Critical:', err);
        res.status(500).json({ error: 'Update failed: ' + err.message });
    }
};
