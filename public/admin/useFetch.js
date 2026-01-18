
import { getAdminToken } from './adminAuth.js';

/**
 * A reusable fetch helper for Admin pages.
 * Adapts strict React hooks pattern to Vanilla JS async/await.
 * Automatically handles:
 * 1. Base URL (Port 3001)
 * 2. Auth Headers
 * 3. Error Throwing
 */
export async function useFetch(endpoint) {
    const API_BASE = 'http://localhost:3000/api/admin';
    // Support both relative path ("/stats") and full URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    try {
        const token = await getAdminToken();
        if (!token) throw new Error("Unauthorized: No session token");

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMsg = `Error ${response.status}: ${response.statusText}`;
            try {
                // Try decoding backend error message
                const errJson = await response.json();
                if (errJson.error) errorMsg = errJson.error;
            } catch (e) { } // Fallback to status text
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return { data, error: null };

    } catch (err) {
        console.error("Fetch Error:", err);
        return { data: null, error: err.message };
    }
}
