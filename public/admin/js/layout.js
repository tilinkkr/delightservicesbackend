export function renderLayout(activePage) {
    const sidebarHtml = `
    <aside class="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20 transition-all duration-300 shadow-xl border-r border-slate-800">
        <!-- Brand -->
        <div class="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur">
            <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                <span class="material-icons-round text-white text-lg">admin_panel_settings</span>
            </div>
            <span class="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Delight Admin</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            
            <div class="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</div>
            ${navItem('dashboard', 'dashboard', 'Dashboard', activePage)}
            ${navItem('orders', 'shopping_cart', 'Orders', activePage)}
            ${navItem('customers', 'people', 'Customers', activePage)}
            ${navItem('products', 'inventory_2', 'Inventory', activePage)}
            
            <div class="px-3 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads & Growth</div>
            ${navItem('mutual-funds', 'trending_up', 'Mutual Funds', activePage)}
            ${navItem('health-leads', 'monitor_heart', 'Health Insurance', activePage)}
            ${navItem('life-leads', 'family_restroom', 'Life Insurance', activePage)}
            ${navItem('motor-leads', 'directions_car', 'Motor Insurance', activePage)}

            <div class="px-3 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</div>
            ${navItem('analytics', 'analytics', 'Analytics', activePage)}
            ${navItem('inbox', 'mail', 'Inbox', activePage)}
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/30">
            <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium border border-slate-600">A</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">Administrator</p>
                    <p class="text-xs text-slate-500 truncate">admin@delight.com</p>
                </div>
                <button onclick="logout()" class="p-2 text-slate-400 hover:text-white transition-colors" title="Logout">
                    <span class="material-icons-round text-lg">logout</span>
                </button>
            </div>
        </div>
    </aside>
    `;

    // Inject CSS for Layout
    const style = document.createElement('style');
    style.textContent = `
        body { background-color: #f8fafc; } /* Gray-50 */
        .wrapper { display: flex; min-height: 100vh; }
        .main-content { margin-left: 16rem; flex: 1; padding: 2rem; }
        /* Scrollbar polish */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    // Convert string to HTML and inject
    const parser = new DOMParser();
    const doc = parser.parseFromString(sidebarHtml, 'text/html');
    const aside = doc.body.firstChild;
    document.body.prepend(aside);
}

function navItem(id, icon, label, activePage) {
    const isActive = activePage === id;
    const baseClass = "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative";
    const activeClass = isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white";

    return `
    <a href="${id}.html" class="${baseClass} ${activeClass}">
        ${isActive ? '<div class="absolute left-0 w-1 h-6 bg-white/20 rounded-r-full"></div>' : ''}
        <span class="material-icons-round text-[20px] ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}">${icon}</span>
        <span class="ml-3 text-sm font-medium">${label}</span>
    </a>
    `;
}

// Global Logout using the auth module
window.logout = async () => {
    // Dynamic import to avoid hard dependency if not used
    try {
        const { logout } = await import('../adminAuth.js');
        logout();
    } catch (e) {
        window.location.href = '/login.html';
    }
};
