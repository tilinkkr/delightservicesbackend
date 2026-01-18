
import { supabase } from '../config/supabaseClient.js';

export const getInquiries = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Fetch inquiries failed' });
    }
};

export const getInquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: 'Inquiry not found' });
    }
};

export const replyToInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        // In a real app, this would send an email via SendGrid/AWS SES
        console.log(`[MOCK EMAIL] To Inquiry ${id}: ${message}`);

        // Update status to answered/resolved if needed, for now just log it
        // We can update the row to say 'replied' or log conversation

        res.json({ success: true, message: 'Reply sent' });
    } catch (err) {
        res.status(500).json({ error: 'Reply failed' });
    }
};

export const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('inquiries')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Update status failed' });
    }
};
