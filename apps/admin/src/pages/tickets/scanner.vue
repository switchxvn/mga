<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '@/composables/useTrpc';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { navigateTo } from 'nuxt/app';

// Định nghĩa kiểu dữ liệu
interface ScanResult {
  success: boolean;
  message: string;
  orderItem?: {
    id: number;
    qrCode: string;
    orderId: number;
    isUsed: boolean;
    product?: {
      translations?: {
        title: string;
      }[];
    };
    order?: {
      orderCode: string;
    };
  };
  scanHistory?: any;
  isFirstScan?: boolean;
}

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

// State refs
const qrCode = ref('');
const isLoading = ref(false);
const scanResult = ref<ScanResult | null>(null);
const showHistory = ref(false);
const scanHistories = ref<ScanHistory[]>([]);
const historyOrderItemId = ref<number | null>(null);
const isLoadingHistory = ref(false);
const showConfirmModal = ref(false);
const currentQrCode = ref('');

// Trang hiển thị trong tab
const activeTab = ref('scanner');

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

// History pagination
const historyPage = ref(1);
const historyPageSize = ref(10);
const historyTotalItems = ref(0);
const historySearchQuery = ref('');
const historyScanDateRange = ref({
  start: null as string | null,
  end: null as string | null,
});

// Methods
const scanTicket = async () => {
  if (!qrCode.value) {
    toast.error(t('Please enter QR code'));
    return;
  }

  console.log('Scanning QR code:', qrCode.value);
  isLoading.value = true;
  try {
    // Lấy thông tin thiết bị
    const deviceInfo = {
      name: navigator.userAgent,
      type: 'Browser',
      os: navigator.platform,
      browser: navigator.appName,
    };

    console.log('Calling API with:', { qrCode: qrCode.value, deviceInfo });
    
    // Kiểm tra vé trước, không lưu log ngay
    const orderItem = await trpc.admin.ticketScanner.getTicketByQrCode.query({
      qrCode: qrCode.value
    });
    
    if (orderItem) {
      scanResult.value = {
        success: true,
        message: orderItem.isUsed 
          ? 'Vé hợp lệ nhưng đã được quét trước đó.'
          : 'Vé hợp lệ và đây là lần đầu tiên sử dụng.',
        orderItem: orderItem,
        isFirstScan: !orderItem.isUsed
      };
      
      // Lưu QR code hiện tại để khi xác nhận mới lưu log
      currentQrCode.value = qrCode.value;
      
      // Hiển thị modal xác nhận
      showConfirmModal.value = true;
      
      // Reset QR code input
      qrCode.value = '';
      
      // Luôn tải lịch sử quét của vé này để hiển thị
      if (orderItem.id) {
        historyOrderItemId.value = orderItem.id;
        loadScanHistory(orderItem.id);
        showHistory.value = true;
      }
    } else {
      toast.error(t('Không tìm thấy vé với mã QR này'));
    }
  } catch (error: any) {
    console.error('Error scanning ticket:', error);
    console.error('Error details:', error?.data?.httpStatus, error?.message);
    toast.error(t('Failed to scan ticket: ') + (error?.message || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

// Load scan history for a specific ticket
const loadScanHistory = async (orderItemId: number) => {
  if (!orderItemId) return;
  
  historyOrderItemId.value = orderItemId;
  loadHistoryScanHistory();
};

// Load history scan history with pagination
const loadHistoryScanHistory = async () => {
  if (!historyOrderItemId.value) return;
  
  isLoadingHistory.value = true;
  try {
    const result = await trpc.admin.ticketScanner.getTicketScanHistory.query({
      orderItemId: historyOrderItemId.value,
      page: historyPage.value,
      pageSize: historyPageSize.value,
      scannerSearch: historySearchQuery.value || undefined,
      startDate: historyScanDateRange.value.start || undefined,
      endDate: historyScanDateRange.value.end || undefined,
    });
    
    scanHistories.value = result.items;
    historyTotalItems.value = result.total;
  } catch (error) {
    console.error('Error loading history scan history:', error);
    toast.error(t('Failed to load history scan history'));
  } finally {
    isLoadingHistory.value = false;
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
      scannerSearch: undefined,
      status: undefined,
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

// Format date
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
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

    // Đóng confirm modal và thực hiện quét vé (lưu log)
const closeConfirmModal = async () => {
  showConfirmModal.value = false;
  
  if (scanResult.value?.success && currentQrCode.value) {
    try {
      isLoading.value = true;
      // Lấy thông tin thiết bị
      const deviceInfo = {
        name: navigator.userAgent,
        type: 'Browser',
        os: navigator.platform,
        browser: navigator.appName,
      };
      
      // Gọi API để lưu log quét vé
      const result = await trpc.admin.ticketScanner.scanTicket.mutate({
        qrCode: currentQrCode.value,
        location: 'Admin Dashboard',
        deviceInfo
      });
      
      // Hiển thị thông báo thành công
      toast.success(t('Đã lưu thông tin quét vé thành công'));
      
      // Cập nhật lại kết quả với thông tin mới nhất
      scanResult.value = result;
      
      // Tự động lấy lịch sử quét của vé này
      if (result.orderItem) {
        historyOrderItemId.value = result.orderItem.id;
        loadScanHistory(result.orderItem.id);
        showHistory.value = true;
      }
      
      // Reset focus về ô input sau khi đóng modal để sẵn sàng quét tiếp
      setTimeout(() => {
        const qrInput = document.getElementById('qr-input');
        if (qrInput) {
          qrInput.focus();
        }
      }, 100);
    } catch (error: any) {
      console.error('Error saving scan log:', error);
      toast.error(t('Lỗi khi lưu thông tin quét vé: ') + (error?.message || 'Unknown error'));
    } finally {
      isLoading.value = false;
      currentQrCode.value = '';
    }
  }
};

// Đóng modal và hủy quy trình quét vé (không lưu log)
const cancelAction = () => {
  showConfirmModal.value = false;
  toast.warning(t('Đã hủy quét vé - không lưu thông tin'));
  currentQrCode.value = '';
  
  // Vẫn giữ lịch sử quét hiển thị, không reset lại
  // Chỉ cần đảm bảo không gọi API lưu log
};

// Auto-scan on paste or when the value is long enough (for barcode scanners)
const handleInput = () => {
  // Chỉ tự động quét khi không có modal đang hiển thị
  if (qrCode.value.length > 10 && !showConfirmModal.value) {
    scanTicket();
  }
};

// Auto-focus on QR input when component is mounted
onMounted(() => {
  const qrInput = document.getElementById('qr-input');
  if (qrInput) {
    qrInput.focus();
  }
});

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

// Handle history pagination change
const onHistoryPageChange = (newPage: number) => {
  historyPage.value = newPage;
  loadHistoryScanHistory();
};

// Handle history search
const searchHistoryScans = () => {
  historyPage.value = 1; // Reset to first page
  loadHistoryScanHistory();
};

// Clear history search
const clearHistorySearch = () => {
  historySearchQuery.value = '';
  historyScanDateRange.value = { start: null, end: null };
  searchHistoryScans();
};
</script>

<template>
  <div class="p-4">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-4">{{ t('Ticket Scanner') }}</h1>
      <p class="text-gray-600">{{ t('Scan tickets for admission') }}</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <ul class="flex flex-wrap -mb-px">
        <li class="mr-2">
          <a
            @click="switchTab('scanner')"
            :class="[
              'inline-block p-4 cursor-pointer',
              activeTab === 'scanner'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ t('Scanner') }}
          </a>
        </li>
        <li class="mr-2">
          <a
            @click="switchTab('history')"
            :class="[
              'inline-block p-4 cursor-pointer',
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ t('Scan History') }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Scanner Tab -->
    <div v-if="activeTab === 'scanner'" class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">{{ t('Scan QR Code') }}</h2>
        
        <div class="mb-6">
          <label for="qr-input" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('Enter QR Code') }}
          </label>
          <div class="flex space-x-2">
            <input
              id="qr-input"
              v-model="qrCode"
              @input="handleInput"
              type="text"
              class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              :placeholder="t('Enter or scan QR code')"
              :disabled="isLoading || showConfirmModal"
            />
            <button
              @click="scanTicket"
              :disabled="isLoading || !qrCode || showConfirmModal"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span v-if="isLoading">{{ t('Scanning...') }}</span>
              <span v-else>{{ t('Scan') }}</span>
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            {{ t('Use a QR code scanner or manually enter the code') }}
          </p>
        </div>

        <!-- Scan Result -->
        <div v-if="scanResult" class="mt-6">
          <div
            :class="[
              'p-4 mb-4 rounded-md border-2',
              scanResult.success 
                ? scanResult.isFirstScan 
                  ? 'bg-green-50 text-green-800 border-green-500' 
                  : 'bg-orange-50 text-orange-800 border-orange-500'
                : 'bg-red-50 text-red-800 border-red-500'
            ]"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <i
                  :class="[
                    'text-2xl',
                    scanResult.success 
                      ? scanResult.isFirstScan 
                        ? 'fas fa-check-circle text-green-600' 
                        : 'fas fa-exclamation-triangle text-orange-600'
                      : 'fas fa-times-circle text-red-600'
                  ]"
                ></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-bold">{{ scanResult.message }}</h3>
              </div>
            </div>
          </div>

          <!-- Ticket Details (if success) -->
          <div v-if="scanResult.success && scanResult.orderItem" class="bg-gray-50 p-6 rounded-md border border-gray-200">
            <h3 class="font-bold text-xl mb-4">{{ t('Ticket Details') }}</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-6">
                <div class="border-r border-gray-200 pr-4">
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Product') }}</p>
                  <p class="font-medium text-base">{{ scanResult.orderItem.product?.translations?.[0]?.title || 'Unknown Product' }}</p>
                </div>
                <div class="border-r border-gray-200 pr-4">
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Order ID') }}</p>
                  <p class="font-medium text-base">#{{ scanResult.orderItem.order?.orderCode || scanResult.orderItem.orderId }}</p>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Status') }}</p>
                  <div class="mt-1">
                    <span 
                      :class="[
                        'px-3 py-1 rounded-full text-base font-bold inline-block',
                        scanResult.isFirstScan ? 'bg-green-100 text-green-800 border border-green-500' : 'bg-orange-100 text-orange-800 border border-orange-500'
                      ]"
                    >
                      {{ scanResult.isFirstScan ? t('LẦN ĐẦU SỬ DỤNG') : t('ĐÃ SỬ DỤNG TRƯỚC ĐÓ') }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <button
                  @click="showHistory = !showHistory"
                  class="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <span>{{ showHistory ? t('Hide Scan History') : t('Show Scan History') }}</span>
                  <i :class="['ml-1 fas', showHistory ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </button>
                
                <!-- Scan History -->
                <div v-if="showHistory" class="mt-3">
                  <div class="mb-4 bg-white p-4 rounded-md border border-gray-200">
                    <h4 class="font-bold text-lg mb-3">{{ t('Scan History') }}</h4>
                    
                    <!-- Tìm kiếm và lọc -->
                    <div class="mb-4 space-y-4">
                      <div class="flex flex-wrap gap-3">
                        <div class="flex-1 min-w-[200px]">
                          <label class="block text-sm font-bold text-gray-700 mb-1">{{ t('Search Scanner') }}</label>
                          <input 
                            v-model="historySearchQuery" 
                            type="text" 
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            :placeholder="t('Search by name or email')"
                          />
                        </div>
                        
                        <div class="flex-1 min-w-[200px]">
                          <label class="block text-sm font-bold text-gray-700 mb-1">{{ t('Date Range') }}</label>
                          <div class="flex items-center space-x-2">
                            <input 
                              v-model="historyScanDateRange.start" 
                              type="date" 
                              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span class="text-gray-500">-</span>
                            <input 
                              v-model="historyScanDateRange.end" 
                              type="date" 
                              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex justify-end space-x-2">
                        <button
                          @click="clearHistorySearch"
                          class="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {{ t('Clear') }}
                        </button>
                        <button
                          @click="searchHistoryScans"
                          class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {{ t('Search') }}
                        </button>
                      </div>
                    </div>
                  
                    <div v-if="isLoadingHistory" class="text-center py-3">
                      <i class="fas fa-spinner fa-spin mr-2"></i>
                      {{ t('Loading...') }}
                    </div>
                    <div v-else-if="scanHistories.length === 0" class="text-gray-500 text-sm text-center py-4">
                      {{ t('No scan history found') }}
                    </div>
                    <div v-else class="border rounded-md overflow-hidden">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {{ t('Time') }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {{ t('Scanned By') }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {{ t('Location') }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {{ t('Status') }}
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="history in scanHistories" :key="history.id">
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {{ formatDate(history.scannedAt) }}
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {{ formatUserName(history) }}
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {{ history.location || t('Not specified') }}
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              <span
                                :class="[
                                  'px-2 py-1 rounded-full text-xs font-bold',
                                  history.isFirstScan ? 'bg-green-100 text-green-800 border border-green-500' : 'bg-orange-100 text-orange-800 border border-orange-500'
                                ]"
                              >
                                {{ history.isFirstScan ? t('LẦN ĐẦU') : t('ĐÃ DÙNG') }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Phân trang cho history -->
                    <div v-if="historyTotalItems > 0" class="mt-4 flex justify-between items-center">
                      <div class="text-sm text-gray-500">
                        {{ t('Showing {0} to {1} of {2} entries', [
                          (historyPage - 1) * historyPageSize + 1,
                          Math.min(historyPage * historyPageSize, historyTotalItems),
                          historyTotalItems
                        ]) }}
                      </div>
                      <div class="flex space-x-1">
                        <button
                          v-for="p in Math.ceil(historyTotalItems / historyPageSize)"
                          :key="p"
                          @click="onHistoryPageChange(p)"
                          :class="[
                            'px-3 py-1 rounded-md text-sm font-medium',
                            p === historyPage
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
          </div>
        </div>
      </div>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'" class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">{{ t('Scan History') }}</h2>
        
        <!-- Search and Filters -->
        <div class="mb-6 space-y-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[240px]">
              <label for="search-input" class="block text-sm font-bold text-gray-700 mb-1">
                {{ t('Search') }}
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
          </div>
          
          <div class="flex justify-end space-x-3">
            <button
              @click="clearSearch"
              class="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              {{ t('Clear') }}
            </button>
            <button
              @click="handleSearch"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-bold"
            >
              {{ t('Search') }}
            </button>
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
              {{ t('Showing {0} to {1} of {2} entries', [
                (page - 1) * pageSize + 1,
                Math.min(page * pageSize, totalItems),
                totalItems
              ]) }}
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

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ t('Ticket scan result') }}
          </h3>
          <button @click="closeConfirmModal" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="mb-6">
          <div 
            :class="[
              'rounded-lg p-4 mb-4',
              scanResult?.isFirstScan ? 'bg-green-50' : 'bg-orange-50'
            ]"
          >
            <div class="flex">
              <i 
                :class="[
                  'text-2xl mr-3',
                  scanResult?.isFirstScan ? 'fas fa-check-circle text-green-600' : 'fas fa-exclamation-triangle text-orange-600'
                ]"
              ></i>
              <div>
                <p class="font-bold text-lg">
                  {{ scanResult?.message }}
                </p>
                <p v-if="scanResult?.orderItem" class="mt-2">
                  <strong>{{ t('Product') }}:</strong> {{ scanResult.orderItem.product?.translations?.[0]?.title }}
                </p>
                <p v-if="scanResult?.orderItem" class="mt-1">
                  <strong>{{ t('Ticket status') }}:</strong> 
                  <span 
                    :class="[
                      'font-bold',
                      scanResult.isFirstScan ? 'text-green-600' : 'text-orange-600'
                    ]"
                  >
                    {{ scanResult.isFirstScan ? t('LẦN ĐẦU SỬ DỤNG') : t('ĐÃ SỬ DỤNG TRƯỚC ĐÓ') }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelAction"
            class="px-5 py-2 border border-transparent rounded-md font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {{ t('Không tiếp tục') }}
          </button>
          
          <button
            @click="closeConfirmModal"
            class="px-5 py-2 bg-blue-600 border border-transparent rounded-md font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ t('Tiếp tục') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 