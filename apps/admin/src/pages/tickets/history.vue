<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '@/composables/useTrpc';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { navigateTo } from 'nuxt/app';
import { TicketIcon, HistoryIcon } from 'lucide-vue-next';
import PageHeader from '../../components/common/header/PageHeader.vue';

// Định nghĩa kiểu dữ liệu
interface ScanHistory {
  id: number;
  scannedAt: string;
  scannedBy: string;
  location?: string;
  orderItemId?: number;
  deviceInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  scanner?: {
    id?: string;
    email?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  orderItem?: any;
  isFirstScan?: boolean;
}

const { t } = useI18n();
const trpc = useTrpc();
const toast = useToast();

// Active tab for navigation
const activeTab = ref('history');

// Tab definitions
const tabs = [
  { id: 'scanner', name: 'Scanner', icon: TicketIcon },
  { id: 'history', name: 'Scan History', icon: HistoryIcon }
];

// Scan history pagination
const page = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const scanHistoryList = ref<ScanHistory[]>([]);
const isLoadingScanHistoryList = ref(false);
const searchQuery = ref('');
const dateRange = ref({
  start: null as string | null,
  end: null as string | null,
});

// Additional search filters
const scannerFilter = ref('');
const statusFilter = ref('all'); // 'all', 'first', 'used'

// Format date
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// Format tên người dùng từ user profile
const formatUserName = (history: ScanHistory) => {
  // Nếu có profile với first name và last name
  if (history.scanner?.profile?.firstName && history.scanner?.profile?.lastName) {
    return `${history.scanner.profile.firstName} ${history.scanner.profile.lastName}`;
  }
  
  // Nếu chỉ có first name
  if (history.scanner?.profile?.firstName) {
    return history.scanner.profile.firstName;
  }
  
  // Nếu chỉ có last name
  if (history.scanner?.profile?.lastName) {
    return history.scanner.profile.lastName;
  }
  
  // Nếu có email
  if (history.scanner?.email) {
    return history.scanner.email;
  }
  
  // Trường hợp mặc định hiển thị userId
  return history.scannedBy || t('Unknown');
};

// Handle pagination change
const onPageChange = (newPage: number) => {
  page.value = newPage;
  loadAllScanHistory();
};

// Handle search
const handleSearch = () => {
  page.value = 1; // Reset to first page
  loadAllScanHistory();
};

// Clear search
const clearSearch = () => {
  searchQuery.value = '';
  dateRange.value = { start: null, end: null };
  scannerFilter.value = '';
  statusFilter.value = 'all';
  handleSearch();
};

// Handle tab change
const switchTab = (tab: string) => {
  if (tab === 'scanner') {
    navigateTo('/tickets/scanner');
  } else if (tab === 'history') {
    navigateTo('/tickets/history');
  }
};

// Load all scan history with pagination
const loadAllScanHistory = async () => {
  isLoadingScanHistoryList.value = true;
  try {
    const result = await trpc.admin.ticketScanner.getAllTicketScans.query({
      page: page.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      scannerSearch: scannerFilter.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
      startDate: dateRange.value.start || undefined,
      endDate: dateRange.value.end || undefined,
    });
    
    scanHistoryList.value = result.items;
    totalItems.value = result.total;
  } catch (error) {
    console.error('Error loading all scan history:', error);
    toast.error(t('Failed to load scan history list'));
  } finally {
    isLoadingScanHistoryList.value = false;
  }
};

// Load history on mount
onMounted(() => {
  loadAllScanHistory();
});
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <PageHeader
      :title="t('Ticket Scanner')"
      :description="t('Scan tickets for admission and view scan history')"
    />

    <!-- Tabs -->
    <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="switchTab(tab.id)"
        class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
        :class="{
          'bg-primary text-white': activeTab === tab.id,
          'text-slate-600 hover:text-slate-900 hover:bg-slate-50': activeTab !== tab.id
        }"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ t(tab.name) }}
      </button>
    </nav>

    <!-- History Tab -->
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">{{ t('Scan History') }}</h2>
        
        <!-- Search and Filters -->
        <div class="mb-6 space-y-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[240px]">
              <label for="search-input" class="block text-sm font-bold text-gray-700 mb-1">
                {{ t('Search Product/QR') }}
              </label>
              <input
                id="search-input"
                v-model="searchQuery"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                :placeholder="t('Search by QR code or product')"
              />
            </div>
            
            <div class="flex-1 min-w-[240px]">
              <label for="scanner-filter" class="block text-sm font-bold text-gray-700 mb-1">
                {{ t('Scanner') }}
              </label>
              <input
                id="scanner-filter"
                v-model="scannerFilter"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                :placeholder="t('Filter by scanner name')"
              />
            </div>
            
            <div class="flex-1 min-w-[240px]">
              <label for="status-filter" class="block text-sm font-bold text-gray-700 mb-1">
                {{ t('Status') }}
              </label>
              <select
                id="status-filter"
                v-model="statusFilter"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">{{ t('All') }}</option>
                <option value="first">{{ t('First Use') }}</option>
                <option value="used">{{ t('Already Used') }}</option>
              </select>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[240px]">
              <label for="date-from" class="block text-sm font-bold text-gray-700 mb-1">
                {{ t('From Date') }}
              </label>
              <input
                id="date-from"
                v-model="dateRange.start"
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex-1 min-w-[240px]">
              <label for="date-to" class="block text-sm font-bold text-gray-700 mb-1">
                {{ t('To Date') }}
              </label>
              <input
                id="date-to"
                v-model="dateRange.end"
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex-1 min-w-[240px] flex items-end">
              <div class="flex space-x-3 w-full">
                <button
                  @click="clearSearch"
                  class="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  {{ t('Clear') }}
                </button>
                <button
                  @click="handleSearch"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-bold flex-1"
                >
                  {{ t('Search') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Scan History Table -->
        <div>
          <div v-if="isLoadingScanHistoryList" class="text-center py-8">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            {{ t('Loading...') }}
          </div>
          <div v-else-if="scanHistoryList.length === 0" class="text-center py-8 text-gray-500">
            {{ t('No scan history found') }}
          </div>
          <div v-else class="border rounded-md overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {{ t('Time') }}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {{ t('Product') }}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {{ t('QR Code') }}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {{ t('Scanned By') }}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {{ t('Status') }}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {{ t('Location') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="history in scanHistoryList" :key="history.id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ formatDate(history.scannedAt) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ history.orderItem?.product?.translations?.[0]?.title || t('Unknown Product') }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {{ history.orderItem?.qrCode || t('N/A') }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ formatUserName(history) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      :class="[
                        'px-2 py-1 font-bold rounded-full text-xs',
                        history.isFirstScan ? 'bg-green-100 text-green-800 border border-green-500' : 'bg-orange-100 text-orange-800 border border-orange-500'
                      ]"
                    >
                      {{ history.isFirstScan ? t('LẦN ĐẦU') : t('ĐÃ DÙNG') }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ history.location || t('Not specified') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalItems > 0" class="mt-4 flex justify-between items-center">
            <div class="text-sm text-gray-500">
              {{ t('Showing') + ' ' + ((page - 1) * pageSize + 1) + ' ' + t('to') + ' ' + Math.min(page * pageSize, totalItems) + ' ' + t('of') + ' ' + totalItems + ' ' + t('entries') }}
            </div>
            <div class="flex space-x-1">
              <button
                v-for="p in Math.ceil(totalItems / pageSize)"
                :key="p"
                @click="onPageChange(p)"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium',
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ p }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 