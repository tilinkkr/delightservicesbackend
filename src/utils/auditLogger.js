
import { supabase } from '../config/supabaseClient.js';

export const logAudit = async (adminId, action, entity, entityId, details = {}) => {
    try {
        // Run in background (fire and forget) to not block the main request
        // But for critical logs, maybe we want to await. 
        // For now, we await to ensure it's saved, as usually these ops are not high frequency high throughput.

        console.log(`[AUDIT] ${action} on ${entity} ${entityId} by ${adminId}`);

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                admin_id: adminId,
                action,
                entity,
                entity_id: String(entityId),
                details
            });

        if (error) {
            console.error('Failed to write audit log:', error);
        }
    } catch (err) {
        console.error('Audit Log Exception:', err);
    }
};
