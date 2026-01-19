
import { supabase } from '../config/supabaseClient.js';

export const getCustomers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Fetch customers failed' });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError) throw profileError;

        // Get Orders Summary
        const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .eq('user_id', id);

        // Calculate spend
        const total_spent = orders?.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0) || 0;

        res.json({
            ...profile,
            total_spent,
            orders: orders || []
        });

    } catch (err) {
        res.status(404).json({ error: 'Customer not found' });
    }
};

export const toggleVIP = async (req, res) => {
    try {
        const { id } = req.params;

        // First get current status
        const { data: current } = await supabase.from('profiles').select('is_vip').eq('id', id).single();

        const { data, error } = await supabase
            .from('profiles')
            .update({ is_vip: !current?.is_vip })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Update VIP failed' });
    }
};
