
import { supabase } from '../config/supabaseClient.js';

export const createProduct = async (req, res) => {
    try {
        const { name, price, stock, category, image_url } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and Price are required' });
        }

        const { data, error } = await supabase
            .from('products')
            .insert({ name, price, stock, category, image_url })
            .select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Create product failed' });
    }
};


export const getProducts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Fetch products failed' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // e.g. { stock: 50, price: 99.99 }

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Update product failed' });
    }
};

import { logAudit } from '../utils/auditLogger.js';

export const archiveProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('products')
            .update({ is_archived: true, active: false })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Audit Log
        if (req.user && req.user.id) {
            await logAudit(req.user.id, 'ARCHIVE', 'product', id);
        }

        res.json(data);
    } catch (err) {
        console.error('Archive Error:', err);
        res.status(500).json({ error: 'Archive check failed' });
    }
};
