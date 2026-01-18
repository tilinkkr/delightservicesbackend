
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://rkhzwlwhprhlecobvxcw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraHp3bHdocHJobGVjb2J2eGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5ODIsImV4cCI6MjA4NDE0ODk4Mn0.jDj0C5lc3h7-PSgPAv-GKFY_yUeULcfWrW3nfqTx5L8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getAdminToken() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        // Only redirect if NOT on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
        return null;
    }
    return data.session.access_token;
}

// Alias for getAdminToken to support legacy calls if any
export const getToken = getAdminToken;

export async function checkAuth() {
    const token = await getAdminToken();
    return !!token;
}

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
}
