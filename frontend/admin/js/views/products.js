import { useFetch } from '../useFetch.js';
import { getAdminToken } from '../adminAuth.js';

let productsMap = {};

export async function renderProducts(container) {
    const html = `
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Product Inventory</h1>
                <p class="text-sm text-gray-500 mt-1">Manage catalog, pricing, and stock levels.</p>
            </div>
            <button id="btn-add-product" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors font-medium">
                <span class="material-icons-round text-sm">add</span> Add Product
            </button>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody id="products-table" class="bg-white divide-y divide-gray-200">
                    <tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- MODAL (Hidden by default) -->
        <div id="product-modal" class="fixed inset-0 z-50 hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>
            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative transform bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200">
                        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-gray-900" id="modal-title">Add New Product</h3>
                            <button id="btn-close-modal" class="text-gray-400 hover:text-gray-600"><span class="material-icons-round">close</span></button>
                        </div>
                        
                        <form id="product-form" class="p-6 space-y-4">
                            <input type="hidden" id="prod-id">

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" id="prod-name" required class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 shadow-sm">
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select id="prod-category" class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 shadow-sm">
                                        <option value="Perfumes">Perfumes</option>
                                        <option value="Incense">Incense</option>
                                        <option value="Essentials">Essentials</option>
                                        <option value="Gift Sets">Gift Sets</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input type="number" id="prod-price" required min="0" class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 shadow-sm">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input type="number" id="prod-stock" required min="0" class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 shadow-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select id="prod-active" class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 shadow-sm">
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <div class="flex gap-2">
                                    <input type="url" id="prod-image" placeholder="https://..." class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm">
                                    <button type="button" id="btn-preview" class="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs font-bold text-gray-600">Check</button>
                                </div>
                                <img id="preview-img" class="mt-2 h-20 w-20 rounded-lg border border-gray-200 object-cover hidden">
                            </div>

                            <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                <button type="button" id="btn-cancel" class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">Cancel</button>
                                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach Events
    setupEvents(container);

    // Initial Load
    loadProducts();
}

function setupEvents(container) {
    // Add Button
    container.querySelector('#btn-add-product').addEventListener('click', () => openModal());

    // Close Buttons
    container.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    container.querySelector('#btn-cancel').addEventListener('click', closeModal);

    // Preview
    const previewBtn = container.querySelector('#btn-preview');
    if (previewBtn) previewBtn.addEventListener('click', previewImage);

    // Form Submit
    container.querySelector('#product-form').addEventListener('submit', handleSave);
}

async function loadProducts() {
    const table = document.getElementById('products-table');
    const { data, error } = await useFetch('/products');

    if (error) {
        table.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-500">Error loading inventory.</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No products found.</td></tr>`;
        return;
    }

    // Refresh Map
    productsMap = data.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

    table.innerHTML = data.map(p => `
        <tr class="hover:bg-gray-50 transition-colors">
             <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="h-10 w-10 rounded-lg object-cover border border-gray-200" src="${p.image_url || 'https://placehold.co/100?text=No+Img'}">
                    <div class="ml-4 font-medium text-gray-900">${p.name}</div>
                </div>
             </td>
             <td class="px-6 py-4 text-sm text-gray-500">${p.category}</td>
             <td class="px-6 py-4 text-sm font-mono font-medium">₹${p.price}</td>
             <td class="px-6 py-4 text-sm ${p.stock < 10 ? 'text-amber-600 font-bold' : 'text-gray-900'}">${p.stock}</td>
             <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}">
                    ${p.active ? 'Active' : 'Inactive'}
                </span>
             </td>
             <td class="px-6 py-4 text-right">
                <button class="bg-white border border-gray-200 p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors btn-edit" data-id="${p.id}">
                    <span class="material-icons-round text-sm">edit</span>
                </button>
             </td>
        </tr>
    `).join('');

    // Attach Edit Listeners to new elements
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
}

function openModal() {
    const form = document.getElementById('product-form');
    form.reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Product';
    document.getElementById('preview-img').classList.add('hidden');
    document.getElementById('product-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function previewImage() {
    const url = document.getElementById('prod-image').value;
    const img = document.getElementById('preview-img');
    if (url) {
        img.src = url;
        img.classList.remove('hidden');
    }
}

function editProduct(id) {
    const p = productsMap[id];
    if (!p) return;

    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-active').value = p.active.toString();
    document.getElementById('prod-image').value = p.image_url || '';

    if (p.image_url) previewImage();

    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-modal').classList.remove('hidden');
}

async function handleSave(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const id = document.getElementById('prod-id').value;
        const payload = {
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            stock: parseInt(document.getElementById('prod-stock').value),
            active: document.getElementById('prod-active').value === 'true',
            image_url: document.getElementById('prod-image').value
        };

        const token = await getAdminToken();
        const url = id ? `/api/admin/products/${id}` : `/api/admin/products`;
        const method = id ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Save failed');

        closeModal();
        loadProducts();

    } catch (err) {
        alert(err.message);
    } finally {
        btn.textContent = oldText;
        btn.disabled = false;
    }
}
