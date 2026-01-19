
import { supabase } from '../config/supabaseClient.js';

export const requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // 1. Verify User
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // 2. Check Role in Profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            console.warn(`Access denied for user ${user.email} (Role: ${profile?.role})`);
            return res.status(403).json({ error: 'Forbidden: Admin access only' });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
