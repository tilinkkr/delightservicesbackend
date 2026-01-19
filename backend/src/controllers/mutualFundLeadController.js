
import { createClient } from '@supabase/supabase-js';

// Load environment variables if not already loaded (server.js usually does this)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const getMutualFundLeads = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mutual_fund_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error fetching mutual fund leads:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

import { logAudit } from '../utils/auditLogger.js';

export const updateMutualFundLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('mutual_fund_leads')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Audit Log
        if (req.user && req.user.id) {
            await logAudit(req.user.id, 'STATUS_CHANGE', 'mutual_fund_lead', id, { new_status: status });
        }

        res.json(data[0]);
    } catch (err) {
        console.error('Error updating mutual fund lead status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
