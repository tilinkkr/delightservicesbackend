import { useFetch } from '../useFetch.js';

export async function renderHealthLeads(container) {
    container.innerHTML = `
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Health Insurance Leads</h1>
                <p class="text-sm text-gray-500 mt-1">Manage inbound inquiries and status</p>
            </div>
            <div class="flex gap-3">
                 <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
                    <span class="material-icons-round text-gray-500">picture_as_pdf</span> Export PDF
                </button>
            </div>
        </header>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                         <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr><td colspan="4" class="p-8 text-center text-gray-500">No leads founds.</td></tr>
                </tbody>
             </table>
        </div>
    `;
}
