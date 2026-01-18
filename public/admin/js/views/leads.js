import { useFetch } from '../useFetch.js';
import { getAdminToken } from '../adminAuth.js';

// Inject PDF Utils
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

export async function renderLeads(container, type = 'health') {
    // Inject Libs
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');

    const titles = {
        'health': 'Health Insurance Leads',
        'mutual-fund': 'Mutual Fund / Wealth Leads',
        'life': 'Life Insurance Leads',
        'motor': 'Motor Insurance Leads'
    };

    const title = titles[type] || 'Leads Management';

    const html = `
        <div class="flex flex-col h-full animate-fade-in">
            <header class="flex justify-between items-center mb-6">
                <!-- Title Section -->
                <h1 class="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    ${title}
                </h1>
                
                <!-- Actions -->
                <div class="flex gap-2">
                     <button id="btn-export" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg shadow-sm transition-colors text-sm font-medium">
                        <span class="material-icons-round text-sm">picture_as_pdf</span> Export
                    </button>
                    <button id="btn-refresh" class="p-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg hover:text-indigo-600 transition-colors shadow-sm">
                        <span class="material-icons-round text-lg">refresh</span>
                    </button>
                </div>
            </header>

            <!-- CARD Container -->
            <div class="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col flex-1">
                <!-- Header of Card -->
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="font-semibold text-gray-700">Inquiry Management</h3>
                    <span class="text-xs text-gray-400 font-medium" id="record-text">Loading...</span>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left" id="leads-table">
                        <thead class="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                            <!-- Injected via JS -->
                        </thead>
                        <tbody class="divide-y divide-gray-50 bg-white text-sm" id="leads-tbody">
                            <tr><td class="p-8 text-center text-gray-400">Fetching records...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    window.currentLeadsType = type;
    loadLeads(type);

    document.getElementById('btn-export').addEventListener('click', () => exportToPDF(type));
    document.getElementById('btn-refresh').addEventListener('click', () => loadLeads(type));
}

async function loadLeads(type) {
    const thead = document.getElementById('leads-table').querySelector('thead');
    const tbody = document.getElementById('leads-tbody');
    const countEl = document.getElementById('record-text');

    const endpointMap = {
        'health': '/admin/health-leads',
        'mutual-fund': '/admin/mutual-fund-leads',
        'life': '/admin/life-leads',
        'motor': '/admin/motor-insurance-leads'
    };
    const endpoint = endpointMap[type];

    try {
        const { data, error } = await useFetch(endpoint);

        if (error || !data) {
            tbody.innerHTML = `<tr><td colspan="10" class="p-8 text-center text-red-400 text-sm">Unable to load data</td></tr>`;
            countEl.textContent = '0 records';
            return;
        }

        countEl.textContent = `${data.length} records`;
        window.currentData = data;
        renderTable(type, data, thead, tbody);

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-8 text-center text-red-500">Error: ${e.message}</td></tr>`;
    }
}

function renderTable(type, data, thead, tbody) {
    // Definition for Mutual Funds matching user screenshot
    if (type === 'mutual-fund') {
        thead.innerHTML = `
            <tr>
                <th class="px-6 py-4">Client</th>
                <th class="px-6 py-4">Investment</th>
                <th class="px-6 py-4">Goal</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Action</th>
            </tr>
        `;

        tbody.innerHTML = data.map(row => {
            const initials = row.full_name ? row.full_name.substring(0, 2).toUpperCase() : 'NA';
            const date = new Date(row.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

            return `
            <tr class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold tracking-wide">
                            ${initials}
                        </div>
                        <div>
                            <div class="font-bold text-gray-800">${row.full_name}</div>
                            <div class="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                                <span class="material-icons-round text-[10px] text-gray-400">call</span>
                                ${row.mobile}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-900">SIP: ₹${(row.monthly_savings || 0).toLocaleString()}</div>
                    <div class="text-xs text-gray-500">${row.investment_type || 'N/A'}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium lowercase">
                        ${row.goal || 'wealth'}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-500 text-sm">
                    ${date}
                </td>
                <td class="px-6 py-4">
                    ${statusBadge(row.status)}
                </td>
                <td class="px-6 py-4 text-right">
                    ${actionBtn(row)}
                </td>
            </tr>
            `;
        }).join('');
        return;
    }

    // Default Rendering for other leads (Health, etc.)
    thead.innerHTML = `
        <tr>
            <th class="px-6 py-4">Client</th>
            <th class="px-6 py-4">Details</th>
            <th class="px-6 py-4">Date</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Action</th>
        </tr>
    `;

    tbody.innerHTML = data.map(row => {
        const initials = row.full_name ? row.full_name.substring(0, 2).toUpperCase() : 'NA';
        const date = new Date(row.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short' });

        const details = type === 'health' ?
            `<span class="text-gray-900 font-medium">${row.coverage_type || 'Plan'}</span><br><span class="text-xs text-gray-500">${row.city || ''}</span>` :
            `<span class="text-gray-500">-</span>`;

        return `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                            ${initials}
                        </div>
                        <div>
                            <div class="font-medium text-gray-800">${row.full_name}</div>
                            <div class="text-xs text-gray-500">${row.mobile}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm">${details}</td>
                <td class="px-6 py-4 text-gray-500 text-sm">${date}</td>
                <td class="px-6 py-4">${statusBadge(row.status)}</td>
                <td class="px-6 py-4 text-right">${actionBtn(row)}</td>
            </tr>
         `;
    }).join('');

    // Attach Listeners
    document.querySelectorAll('.btn-check').forEach(btn => {
        btn.addEventListener('click', (e) => toggleCheck(e.currentTarget.dataset.id, type));
    });
}

function statusBadge(status) {
    if (['checked', 'processed', 'scanned'].includes(status)) {
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">CHECKED</span>`;
    }
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">NEW</span>`;
}

function actionBtn(row) {
    if (['checked', 'processed'].includes(row.status)) {
        return `<span class="text-xs font-bold text-gray-300">COMPLETED</span>`;
    }
    return `
        <button class="btn-check px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors" data-id="${row.id}">
            Change Status
        </button>
    `;
}

// ... exportToPDF and toggleCheck implementation remains similar but updated to matched styles ...
// (Omitting full copy-paste of helpers if logic unchanged, but for artifact completeness I will include if needed. 
//  I'll skip full helper re-definition here to keep plan concise, assuming existing helpers in file or I rewrite entire file if overwriting).
//  Actually, since I'm overwriting, I must include them.

async function toggleCheck(id, type) {
    const endpointMap = {
        'health': `/admin/health-leads/${id}/status`,
        'mutual-fund': `/admin/mutual-fund-leads/${id}/status`,
        'life': `/admin/life-leads/${id}/status`,
        'motor': `/admin/motor-insurance-leads/${id}/status`
    };
    const url = endpointMap[type];

    try {
        const token = await getAdminToken();
        await fetch(`/api${url}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: 'checked' })
        });
        loadLeads(type);
    } catch (e) { console.error(e); }
}

async function exportToPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = window.currentData || [];
    if (!data.length) return alert("No Data");

    doc.text(`${type.toUpperCase()} REPORT`, 14, 20);
    doc.autoTable({
        head: [['Name', 'Contact', 'Status', 'Date']],
        body: data.map(r => [r.full_name, r.mobile, r.status, new Date(r.created_at).toLocaleDateString()]),
        startY: 30,
        theme: 'grid'
    });
    doc.save('report.pdf');
}
