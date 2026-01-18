
import { supabase } from '../config/supabaseClient.js';

export const getHealthLeads = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('health_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Fetch Health Leads Error:', err);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

import { logAudit } from '../utils/auditLogger.js';

export const updateHealthLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'contacted', 'closed'

        const { data, error } = await supabase
            .from('health_leads')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Audit Log
        if (req.user && req.user.id) {
            await logAudit(req.user.id, 'STATUS_CHANGE', 'health_lead', id, { new_status: status });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};
