import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderCustomers } from './views/customers.js';
import { renderLeads } from './views/leads.js';
import { checkAuth, logout } from '../adminAuth.js';

class App {
    constructor() {
        this.container = document.getElementById('app-content');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.currentView = null;
        this.routes = {
            'dashboard': renderDashboard,
            'products': renderProducts,
            'orders': renderOrders,
            'customers': renderCustomers,
            'mutual-funds': (c) => renderLeads(c, 'mutual-fund'),
            'health-leads': (c) => renderLeads(c, 'health'),
            'life-leads': (c) => renderLeads(c, 'life'),
            'motor-leads': (c) => renderLeads(c, 'motor')
        };

        this.init();
    }

    async init() {
        // 1. Auth Check
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return; // checkAuth handles redirect

        // 2. Global Helpers
        window.app = {
            logout: () => {
                logout();
            },
            navigate: (page) => {
                window.location.hash = page;
            }
        };

        // 3. Router Listener
        window.addEventListener('hashchange', () => this.handleRoute());

        // 4. Initial Route
        this.handleRoute();
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const page = hash.split('?')[0]; // Handle query params if needed

        // Update Sidebar UI
        this.updateSidebar(page);

        // Load View
        const renderer = this.routes[page];
        if (renderer) {
            // Cleanup previous view if needed
            if (this.currentView && this.currentView.destroy) {
                this.currentView.destroy();
            }

            // Render new view
            this.container.innerHTML = '<div class="flex justify-center p-12"><span class="material-icons-round animate-spin">sync</span></div>'; // Loading Spinner

            try {
                // Determine if render function returns html string or object
                // We'll standardize: render functions are async, return nothing, but inject into container passed to them.
                // OR they return HTML string and we inject.
                // Let's go with: They take the container and do their thing.

                this.container.innerHTML = ''; // Clear
                await renderer(this.container);

                // Add fade animation
                this.container.classList.remove('fade-in');
                void this.container.offsetWidth; // Trigger reflow
                this.container.classList.add('fade-in');

            } catch (err) {
                console.error("View Load Error", err);
                this.container.innerHTML = `<div class="p-8 text-red-500">Error loading view: ${err.message}</div>`;
            }
        } else {
            this.container.innerHTML = '<div class="p-8 text-slate-500">Page not found.</div>';
        }
    }

    updateSidebar(activePage) {
        this.navLinks.forEach(link => {
            const page = link.dataset.page;
            const icon = link.querySelector('.material-icons-round');

            if (page === activePage) {
                link.classList.remove('text-slate-400', 'hover:bg-slate-800');
                link.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/20');
                if (icon) icon.classList.remove('text-slate-500');
            } else {
                link.classList.add('text-slate-400', 'hover:bg-slate-800');
                link.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/20');
                if (icon) icon.classList.add('text-slate-500');
            }
        });
    }
}

// Start App
new App();
