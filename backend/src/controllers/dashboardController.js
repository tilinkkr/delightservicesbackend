
import { supabase } from '../config/supabaseClient.js';

export const getStats = async (req, res) => {
    try {
        // Parallel Queries
        const [revenueRes, ordersRes, lowStockRes] = await Promise.all([
            supabase.from('orders').select('total_amount'),
            supabase.from('orders').select('id', { count: 'exact' }),
            supabase.from('products').select('id', { count: 'exact' }).lt('stock', 5)
        ]);

        // Calculate Revenue
        const revenue = revenueRes.data?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
        const ordersCount = ordersRes.count || 0;
        const lowStockCount = lowStockRes.count || 0;

        res.json({
            revenue,
            orders: ordersCount,
            lowStock: lowStockCount
        });

    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
