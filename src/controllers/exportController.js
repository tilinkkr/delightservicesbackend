
import { supabase } from '../config/supabaseClient.js';

export const exportLeads = async (req, res) => {
    try {
        const { type } = req.query;

        let table;
        switch (type) {
            case 'health': table = 'health_leads'; break;
            case 'life': table = 'life_leads'; break;
            case 'motor': table = 'motor_leads'; break;
            case 'mutual-fund': table = 'mutual_fund_leads'; break; // normalize if needed
            case 'mutual_fund': table = 'mutual_fund_leads'; break;
            default:
                return res.status(400).json({ error: 'Invalid lead type' });
        }

        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No data found to export' });
        }

        // Convert to CSV manually
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => {
            return Object.values(row).map(val => {
                if (val === null || val === undefined) return '';
                const str = String(val);
                // Escape quotes and wrap in quotes if contains comma or newline
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        const csv = [headers, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_leads_${Date.now()}.csv`);
        res.status(200).send(csv);

    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).json({ error: 'Export failed' });
    }
};
