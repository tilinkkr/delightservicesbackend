
// -- Supabase Config --
const SUPABASE_URL = 'https://rkhzwlwhprhlecobvxcw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraHp3bHdocHJobGVjb2J2eGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5ODIsImV4cCI6MjA4NDE0ODk4Mn0.jDj0C5lc3h7-PSgPAv-GKFY_yUeULcfWrW3nfqTx5L8';

// Use the global client created in the HTML file to avoid duplicates/race conditions
const supabase = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {

    // ==========================================
    // 1. SESSION GUARD (Portal Page Only)
    // ==========================================
    if (window.location.pathname.includes('portal.html')) {
        const { data, error } = await supabase.auth.getSession();

        if (!data.session) {
            // Not logged in -> Redirect to Login
            window.location.href = 'login.html';
            return;
        } else {
            // Logged in -> Update UI
            console.log('Logged in as', data.session.user.email);
            const user = data.session.user;

            // Simple UI Update
            const nameEl = document.getElementById('user-name-display');
            const welcomeEl = document.getElementById('welcome-name');
            const initEl = document.getElementById('user-initial');

            const fullName = user.user_metadata?.full_name || user.email.split('@')[0];

            if (nameEl) nameEl.textContent = fullName;
            if (welcomeEl) welcomeEl.textContent = fullName;
            if (initEl) initEl.textContent = fullName.charAt(0).toUpperCase();
        }
    }

    // ==========================================
    // 2. PUBLIC PAGE GUARD (Login/Signup Pages)
    // ==========================================
    // If user is already logged in, push them to portal
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('started.html')) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            window.location.href = 'home.html';
            return;
        }
    }

    // ==========================================
    // 2.5 GLOBAL NAVIGATION UPDATE (All Pages)
    // ==========================================
    // ==========================================
    // 2.5 GLOBAL NAVIGATION UPDATE (All Pages)
    // ==========================================
    const updateAuthUI = async () => {
        const desktopContainer = document.getElementById('auth-buttons-container');
        const mobileContainer = document.getElementById('auth-buttons-mobile');

        // Helper to fade in elements
        const fadeIn = (el) => {
            if (!el) return;
            // If explicit class exists
            if (el.classList.contains('opacity-0')) {
                // Small delay to ensure DOM update is registered before transition
                requestAnimationFrame(() => {
                    el.classList.remove('opacity-0');
                    el.classList.add('opacity-100');
                });
            } else {
                // Fallback for pages without the classes
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.5s ease-in-out';
                requestAnimationFrame(() => {
                    el.style.opacity = '1';
                });
            }
        };

        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            const user = session.user;
            const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
            const firstInitial = fullName.charAt(0).toUpperCase();

            // Desktop HTML
            const desktopHTML = `
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.href='portal.html'">
                        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            ${firstInitial}
                        </div>
                        <span class="text-sm font-semibold hover:text-blue-600 transition-colors hidden sm:block">
                            ${fullName}
                        </span>
                    </div>
                </div>
            `;

            // Mobile HTML
            const mobileHTML = `
                 <div class="flex flex-col gap-4 items-center w-full">
                    <div class="flex items-center gap-3 cursor-pointer w-full justify-center p-3 rounded-xl bg-gray-50 border border-gray-100" onclick="window.location.href='portal.html'">
                        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            ${firstInitial}
                        </div>
                        <span class="text-sm font-semibold text-gray-800">
                            ${fullName}
                        </span>
                    </div>
                    <button id="mobile-logout-btn" class="w-full py-2 text-sm text-red-500 font-medium hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        Sign Out
                    </button>
                </div>
            `;

            if (desktopContainer) desktopContainer.innerHTML = desktopHTML;
            if (mobileContainer) {
                mobileContainer.innerHTML = mobileHTML;
                setTimeout(() => {
                    const mobLogout = document.getElementById('mobile-logout-btn');
                    if (mobLogout) {
                        mobLogout.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            await supabase.auth.signOut();
                            window.location.href = 'home.html';
                        });
                    }
                }, 0);
            }
        }

        // Reveal elements regardless of auth state (Logged In OR Default)
        fadeIn(desktopContainer);
        fadeIn(mobileContainer);
    };

    // Execute Global Update
    await updateAuthUI();

    // ==========================================
    // 3. LOGIN LOGIC (login.html)
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-message');
            const btn = document.getElementById('login-btn');

            if (errorMsg) errorMsg.classList.add('hidden');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Signing in...';
            btn.disabled = true;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            // -- HARDCODED ADMIN BACKDOOR --
            if (email === 'admin123@gmail.com' && password === 'Tilinbijoy@2004') {
                console.log('Using Hardcoded Admin Access');
                // Mock a session or just redirect (Warning: Session won't be valid for RLS)
                // To make this work better, ideally we should actually sign them in, but if user doesn't exist...
                // We'll just force redirect.
                alert('Admin Access Granted (Bypass)');
                window.location.href = '/admin/dashboard.html';
                return;
            }
            // ------------------------------

            if (error) {
                console.error('Login Error:', error);
                if (errorMsg) {
                    errorMsg.textContent = error.message; // Show exact message
                    errorMsg.classList.remove('hidden');
                } else {
                    alert(error.message);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            // Success -> Canonical Redirect
            // Success -> Check Role & Redirect
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*') // Select all to be safe
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Profile Fetch Error:', profileError);
                // Fallback: If email is admin email, allow (Temporary fix for testing if RLS is acting up)
                if (data.user.email === 'tilinbijoykkr1@gmail.com') {
                    console.log('Fallback: Recognized Admin Email');
                    window.location.href = '/admin/dashboard.html';
                    return;
                }
            }

            console.log('Login Profile:', profile);

            // DEBUGGING ALERT (Remove after fix)
            if (profile) {
                alert(`Debug: Found Profile. Role: ${profile.role}`);
            } else {
                alert(`Debug: No Profile Found! Error: ${profileError?.message}`);
            }

            if (profile?.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/home.html';
            }
        });
    }

    // ==========================================
    // 4. SIGNUP LOGIC (started.html)
    // ==========================================
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullname').value;
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('signup-error');
            const btn = signupForm.querySelector('button');

            if (errorMsg) errorMsg.classList.add('hidden');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Creating account...';
            btn.disabled = true;

            // Use Backend API for Auto-Confirmed Signup
            try {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, full_name: fullName, phone })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Signup failed');
                }

                // Success! Now Auto-Login since backend creation doesn't return a session
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (loginError) {
                    throw loginError;
                }

                alert('Account Created! Redirecting...');
                window.location.href = 'home.html';

            } catch (err) {
                console.error('Signup Error:', err);
                const msg = err.message;

                if (errorMsg) {
                    errorMsg.textContent = msg;
                    errorMsg.classList.remove('hidden');
                } else {
                    alert(msg);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // ==========================================
    // 5. LOGOUT LOGIC
    // ==========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'home.html';
        });
    }
});
