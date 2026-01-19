import { useFetch } from '../useFetch.js';
import { getAdminToken } from '../adminAuth.js';

export async function renderOrders(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full animate-fade-in">
            <header class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-xl font-bold text-gray-800 tracking-tight">Orders</h1>
                    <p class="text-sm text-gray-500 mt-1">Manage customer orders and status.</p>
                </div>
                <button id="btn-refresh" class="p-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg hover:text-indigo-600 transition-colors shadow-sm">
                    <span class="material-icons-round text-lg">refresh</span>
                </button>
            </header>

            <div class="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col flex-1">
                 <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                            <tr>
                                <th class="px-6 py-4">Order ID</th>
                                <th class="px-6 py-4">Customer</th>
                                <th class="px-6 py-4">Items</th>
                                <th class="px-6 py-4">Total</th>
                                <th class="px-6 py-4">Date</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 bg-white text-sm" id="orders-table">
                            <tr><td colspan="7" class="p-8 text-center text-gray-400">Loading orders...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- DETAILS MODAL -->
        <div id="order-modal" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" id="modal-backdrop"></div>
            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative transform bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">
                        <!-- Modal Header -->
                        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 class="font-bold text-gray-800" id="modal-title">Order Details</h3>
                                <p class="text-xs text-gray-500" id="modal-subtitle">--</p>
                            </div>
                            <button id="btn-close-modal" class="text-gray-400 hover:text-gray-600 transition-colors">
                                <span class="material-icons-round">close</span>
                            </button>
                        </div>
                        
                        <!-- Modal Body -->
                        <div class="p-6">
                            <!-- Customer Info -->
                            <div class="flex items-start gap-4 mb-6 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                <div class="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    <span class="material-icons-round text-lg">person</span>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-900 text-sm" id="modal-customer">--</h4>
                                    <p class="text-xs text-gray-500" id="modal-email">--</p>
                                    <p class="text-xs text-gray-500 mt-1 font-mono">ID: <span id="modal-userid">--</span></p>
                                </div>
                            </div>

                            <!-- Items -->
                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                            <div class="border border-gray-100 rounded-lg overflow-hidden mb-6">
                                <table class="w-full text-sm text-left">
                                    <thead class="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th class="px-4 py-2">Product</th>
                                            <th class="px-4 py-2 text-right">Qty</th>
                                            <th class="px-4 py-2 text-right">Price</th>
                                            <th class="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100" id="modal-items">
                                        <!-- Items injected here -->
                                    </tbody>
                                    <tfoot class="bg-gray-50 font-bold text-gray-900">
                                        <tr>
                                            <td colspan="3" class="px-4 py-3 text-right">Grand Total</td>
                                            <td class="px-4 py-3 text-right" id="modal-total">--</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <!-- Controls -->
                            <div class="flex justify-between items-center">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Update Status</label>
                                    <div class="flex items-center gap-2">
                                        <select id="modal-status-select" class="block w-40 rounded-lg border-gray-300 border px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm">
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <button id="btn-update-status" class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                                            Save
                                        </button>
                                    </div>
                                </div>
                                <div id="status-msg" class="text-xs font-medium text-emerald-600 hidden">Updated!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-refresh').addEventListener('click', loadOrders);

    // Modal Close Events
    const closeModal = () => document.getElementById('order-modal').classList.add('hidden');
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);

    // Update Status Event
    document.getElementById('btn-update-status').addEventListener('click', updateStatus);

    loadOrders();
}

let activeOrderId = null;

async function loadOrders() {
    const table = document.getElementById('orders-table');
    const { data: orders, error } = await useFetch('/admin/orders');

    if (error || !orders) {
        table.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500">Failed to load orders.</td></tr>`;
        return;
    }

    if (orders.length === 0) {
        table.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">No orders found.</td></tr>`;
        return;
    }

    // Generate Sequential IDs (Total - Index) to simulate "Order 1, 2, 3..."
    // Assuming API returns newest first.
    const total = orders.length;

    table.innerHTML = orders.map((o, index) => {
        const date = new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const seqId = total - index; // 5, 4, 3, 2, 1

        return `
        <tr class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-4 font-mono font-medium text-gray-600">
                #${seqId}
                <span class="hidden text-xs text-gray-300 ml-1">${o.id.slice(0, 4)}</span>
            </td>
            <td class="px-6 py-4">
                <div class="font-medium text-gray-900">${o.profiles?.full_name || 'Guest'}</div>
                <div class="text-xs text-gray-500">${o.profiles?.email || 'No Email'}</div>
            </td>
            <td class="px-6 py-4 text-gray-500">${o.total_quantity || '?'} items</td>
            <td class="px-6 py-4 font-bold text-gray-900">₹${o.total_amount}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${date}</td>
            <td class="px-6 py-4">${getStatusBadge(o.status)}</td>
            <td class="px-6 py-4 text-right">
                <button class="btn-view px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors" data-id="${o.id}" data-seq="${seqId}">
                    View
                </button>
            </td>
        </tr>
    `}).join('');

    // Attach View Listeners
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.dataset.id, btn.dataset.seq));
    });
}

function getStatusBadge(status) {
    const styles = {
        'completed': 'bg-emerald-50 text-emerald-600',
        'pending': 'bg-amber-50 text-amber-600',
        'cancelled': 'bg-red-50 text-red-600',
        'shipped': 'bg-blue-50 text-blue-600',
        'processing': 'bg-indigo-50 text-indigo-600'
    };
    const style = styles[status] || 'bg-gray-50 text-gray-600';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${style}">${status}</span>`;
}

async function openModal(id, seqId) {
    activeOrderId = id;
    const modal = document.getElementById('order-modal');

    // Reset UI
    document.getElementById('modal-title').textContent = `Order #${seqId}`;
    document.getElementById('modal-subtitle').textContent = 'Loading details...';
    document.getElementById('modal-items').innerHTML = '<tr><td colspan="4" class="p-4 text-center">Loading...</td></tr>';

    modal.classList.remove('hidden');

    try {
        const { data, error } = await useFetch(`/admin/orders/${id}`);
        if (error || !data) throw new Error('Fetch failed');

        // Populate
        document.getElementById('modal-subtitle').textContent = `Ref: ${data.id}`;
        document.getElementById('modal-customer').textContent = data.profiles?.full_name || 'Guest User';
        document.getElementById('modal-email').textContent = data.profiles?.email || 'No email provided';
        document.getElementById('modal-userid').textContent = data.user_id || 'N/A';
        document.getElementById('modal-total').textContent = `₹${data.total_amount}`;
        document.getElementById('modal-status-select').value = data.status;

        // Render Items
        const itemsHtml = (data.order_items || []).map(item => {
            const total = item.quantity * item.price_at_purchase;
            return `
            <tr>
                <td class="px-4 py-2 font-medium text-gray-900">
                    <div class="flex items-center gap-2">
                         <div class="h-8 w-8 rounded bg-gray-100 border border-gray-200 flex-shrink-0">
                            <!-- Img placeholder -->
                         </div>
                         ${item.products?.name || 'Item'}
                    </div>
                </td>
                <td class="px-4 py-2 text-right text-gray-600">${item.quantity}</td>
                <td class="px-4 py-2 text-right text-gray-600">₹${item.price_at_purchase}</td>
                <td class="px-4 py-2 text-right font-medium text-gray-900">₹${total}</td>
            </tr>
            `;
        }).join('');

        document.getElementById('modal-items').innerHTML = itemsHtml;

    } catch (e) {
        console.error(e);
        document.getElementById('modal-items').innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">Failed to load details</td></tr>';
    }
}

async function updateStatus() {
    if (!activeOrderId) return;
    const btn = document.getElementById('btn-update-status');
    const msg = document.getElementById('status-msg');
    const status = document.getElementById('modal-status-select').value;

    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const token = await getAdminToken();
        const res = await fetch(`/api/admin/orders/${activeOrderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });

        if (!res.ok) throw new Error('Update failed');

        // Success
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 2000);

        // Refresh Table logic could go here, but avoiding full reload for now for simpler UX
        loadOrders();

    } catch (e) {
        alert(e.message);
    } finally {
        btn.textContent = 'Save';
        btn.disabled = false;
    }
}
