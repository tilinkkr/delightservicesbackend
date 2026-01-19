
import { supabase } from '../config/supabaseClient.js';

export const getAnalytics = async (req, res) => {
    try {
        const range = Number(req.query.range || 30);

        // Fetch Orders
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('total_amount, created_at, status');

        if (orderError) throw orderError;

        // Fetch Profile Count
        const { count: customers, error: profileError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (profileError) throw profileError;

        // Calculate Real Revenue
        const revenue = orders.reduce((a, o) => a + (Number(o.total_amount) || 0), 0);

        // Mocking Trend and Insight Data as per User Request (Hard to calculate strictly from simple Order table without heavy SQL)
        // In production, this would use complex SQL aggregation or a View
        const revenue_trend = [
            { label: 'Week 1', value: revenue * 0.2 },
            { label: 'Week 2', value: revenue * 0.25 },
            { label: 'Week 3', value: revenue * 0.25 },
            { label: 'Week 4', value: revenue * 0.3 }
        ];

        const top_products = [
            { name: 'Nawabi Oud', category: 'Perfumes', sold: 240, revenue: 12450, growth: 12 },
            { name: 'Royal Sandalwood', category: 'Incense', sold: 185, revenue: 9500, growth: 8 }
        ];

        const ai_insights = [
            'Perfume category grew 22% due to Summer Scents campaign.',
            'Peak engagement on Thursday evenings (7–9 PM).',
            'Retention dropped 2% in Essentials segment.'
        ];

        res.json({
            kpis: {
                revenue,
                orders: orders.length,
                new_customers: customers,
                conversion_rate: 3.2
            },
            revenue_trend,
            order_volume: [
                { day: 'Mon', completed: 340, returns: 40 },
                { day: 'Tue', completed: 452, returns: 35 },
                { day: 'Wed', completed: 380, returns: 28 },
                { day: 'Thu', completed: 590, returns: 45 },
                { day: 'Fri', completed: 710, returns: 50 },
                { day: 'Sat', completed: 210, returns: 18 },
                { day: 'Sun', completed: 180, returns: 12 }
            ],
            top_products,
            ai_insights
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Analytics fetch failed' });
    }
};
