import { useFetch } from '../useFetch.js';

export async function renderDashboard(container) {
    const html = `
        <div class="animate-fade-in space-y-8">
            <!-- Header -->
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p class="text-sm text-gray-500 mt-1">Real-time business insights</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                        <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">System Online</span>
                    </div>
                </div>
            </div>

            <!-- KPI Cards (Business) -->
            <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4 px-1">Business Metrics</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- Revenue -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
                        <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center">
                                <span class="material-icons-round text-emerald-600">payments</span>
                            </div>
                            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                        <h3 class="text-2xl font-bold text-gray-900" id="val-revenue">--</h3>
                    </div>

                    <!-- Orders -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
                         <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <span class="material-icons-round text-blue-600">shopping_bag</span>
                            </div>
                        </div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                        <h3 class="text-2xl font-bold text-gray-900" id="val-orders">--</h3>
                    </div>

                    <!-- Customers -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
                         <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center">
                                <span class="material-icons-round text-purple-600">people</span>
                            </div>
                        </div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Active Customers</p>
                        <h3 class="text-2xl font-bold text-gray-900" id="val-customers">--</h3>
                    </div>

                    <!-- Action Required -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
                         <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center">
                                <span class="material-icons-round text-amber-600">warning</span>
                            </div>
                        </div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Alerts</p>
                        <h3 class="text-2xl font-bold text-gray-900" id="val-alerts">--</h3>
                    </div>
                </div>
            </div>

            <!-- Leads Overview (Unified) -->
            <div>
                 <h3 class="text-lg font-bold text-gray-800 mb-4 px-1">Leads & Inquiries</h3>
                 <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- Health -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <i class="fa-solid fa-heart-pulse text-6xl text-blue-500"></i>
                        </div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center relative z-10">
                                <span class="material-icons-round text-blue-600">favorite</span>
                            </div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 relative z-10" id="val-health">--</h3>
                        <p class="text-sm font-medium text-gray-500 mb-3 relative z-10">Health Leads</p>
                        <a href="health-leads.html" class="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 relative z-10">
                            View All <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Life -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <i class="fa-solid fa-seedling text-6xl text-amber-500"></i>
                        </div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center relative z-10">
                                <span class="material-icons-round text-amber-600">spa</span>
                            </div>
                        </div>
                         <h3 class="text-2xl font-bold text-gray-900 relative z-10" id="val-life">--</h3>
                        <p class="text-sm font-medium text-gray-500 mb-3 relative z-10">Life Leads</p>
                        <a href="life-leads.html" class="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 relative z-10">
                            View All <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Motor -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <i class="fa-solid fa-car text-6xl text-indigo-500"></i>
                        </div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center relative z-10">
                                <span class="material-icons-round text-indigo-600">directions_car</span>
                            </div>
                        </div>
                         <h3 class="text-2xl font-bold text-gray-900 relative z-10" id="val-motor">--</h3>
                        <p class="text-sm font-medium text-gray-500 mb-3 relative z-10">Motor Leads</p>
                        <a href="motor-leads.html" class="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 relative z-10">
                            View All <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Wealth (Mutual Funds) -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all relative overflow-hidden group">
                         <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <i class="fa-solid fa-chart-line text-6xl text-emerald-500"></i>
                        </div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center relative z-10">
                                <span class="material-icons-round text-emerald-600">trending_up</span>
                            </div>
                        </div>
                         <h3 class="text-2xl font-bold text-gray-900 relative z-10" id="val-wealth">--</h3>
                        <p class="text-sm font-medium text-gray-500 mb-3 relative z-10">Mutual Funds</p>
                         <button onclick="window.location.hash='mutual-funds'" class="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 relative z-10">
                            View All <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- System Alerts -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <span class="material-icons-round text-indigo-500">dns</span>
                    <h3 class="font-bold text-gray-900">System Activity Log</h3>
                </div>
                <div class="p-6" id="alerts-container">
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-600 text-sm font-medium border border-gray-100">
                        <span class="h-2 w-2 rounded-full bg-gray-400"></span>
                        <span>Loading system status...</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Load Data
    loadData();
}

async function loadData() {
    try {
        // Fetch Stats
        const { data: statsData } = await useFetch('/stats');

        // Fetch All Leads (Parallel)
        const [healthRes, lifeRes, motorRes, wealthRes] = await Promise.all([
            useFetch('/health-leads').catch(() => ({ data: [] })),
            useFetch('/life-leads').catch(() => ({ data: [] })),
            useFetch('/motor-leads').catch(() => ({ data: [] })),
            useFetch('/mutual-fund-leads').catch(() => ({ data: [] }))
        ]);

        // Extract Data
        const revenue = statsData?.revenue || 0;
        const orders = statsData?.orders || 0;
        const lowStock = statsData?.lowStock || 0;
        const activeCustomers = 142; // Mock for now until endpoint live

        const healthCount = healthRes.data ? healthRes.data.length : 0;
        const lifeCount = lifeRes.data ? lifeRes.data.length : 0;
        const motorCount = motorRes.data ? motorRes.data.length : 0;
        const wealthCount = wealthRes.data ? wealthRes.data.length : 0;

        // Update KPI Cards
        document.getElementById('val-revenue').textContent = `₹${revenue.toLocaleString()}`;
        document.getElementById('val-orders').textContent = orders;
        document.getElementById('val-customers').textContent = activeCustomers;
        document.getElementById('val-alerts').textContent = lowStock;

        // Update Lead Cards
        document.getElementById('val-health').textContent = healthCount;
        document.getElementById('val-life').textContent = lifeCount;
        document.getElementById('val-motor').textContent = motorCount;
        document.getElementById('val-wealth').textContent = wealthCount;

        // Build Alerts (Prioritize Leads)
        const alertsContainer = document.getElementById('alerts-container');
        let alertsHtml = '';

        if (healthCount > 0) alertsHtml += createAlert(healthCount, 'health', 'blue');
        if (lifeCount > 0) alertsHtml += createAlert(lifeCount, 'life', 'amber');
        if (motorCount > 0) alertsHtml += createAlert(motorCount, 'motor', 'indigo');
        if (wealthCount > 0) alertsHtml += createAlert(wealthCount, 'wealth', 'emerald');
        if (lowStock > 0) alertsHtml += createAlert(lowStock, 'stock', 'red', 'products below threshold');

        if (!alertsHtml) {
            alertsHtml = `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-500 text-sm font-medium border border-gray-100">
                    <span class="material-icons-round text-base text-gray-400">check_circle</span>
                    <span>All queues cleared. System operating normally.</span>
                </div>
            `;
        }

        alertsContainer.innerHTML = alertsHtml;

    } catch (err) {
        console.error("Dashboard Data Error", err);
    }
}

function createAlert(count, type, color, messageOverride) {
    const messages = {
        health: 'new health inquiries pending',
        life: 'new life insurance leads',
        motor: 'new motor insurance requests',
        wealth: 'new mutual fund inquiries'
    };

    return `
        <div class="flex items-center gap-3 p-3 bg-${color}-50 rounded-lg text-${color}-800 text-sm font-medium border border-${color}-100 mb-2">
            <span class="h-2 w-2 rounded-full bg-${color}-500"></span>
            <span>${count} ${messageOverride || messages[type]}</span>
        </div>
    `;
}
