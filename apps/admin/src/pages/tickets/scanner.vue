<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '@/composables/useTrpc';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { navigateTo } from 'nuxt/app';
import { TicketIcon, HistoryIcon, SearchIcon, UserIcon } from 'lucide-vue-next';
import { OrderStatus } from '@ew/shared';
import PageHeader from '../../components/common/header/PageHeader.vue';
import PhoneInput from '../../components/form/PhoneInput.vue';

// Định nghĩa kiểu dữ liệu
interface ScanResult {
  success: boolean;
  message: string;
  orderItem?: {
    id: number;
    qrCode: string;
    orderId: number;
    isUsed: boolean;
    travelDate?: string;
    productType?: string;
    product?: {
      translations?: {
        title: string;
      }[];
    };
    order?: {
      orderCode: string;
      status?: string;
    };
  };
  scanHistory?: any;
  isFirstScan?: boolean;
  scanCount?: number;
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

interface CustomerTicket {
  id: number;
  qrCode: string;
  orderId: number;
  isUsed: boolean;
  travelDate?: string;
  productType?: string;
  product?: {
    translations?: {
      title: string;
    }[];
  };
  order?: {
    orderCode: string;
    status: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    createdAt: string;
    paymentStatus: string;
  };
  scanCount?: number;
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
const errorMessage = ref('');

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

// Tìm kiếm khách hàng
const customerSearch = ref('');
const customerEmail = ref('');
const customerPhone = ref('');
const customerPhoneCode = ref('+84');
const isSearchingCustomer = ref(false);
const customerTickets = ref<CustomerTicket[]>([]);
const showCustomerSearch = ref(false);
const customerTip = ref(true);
const ticketStatus = ref('');
const orderDateRange = ref({
  start: null as string | null,
  end: null as string | null,
});

const debounceTimer = ref<NodeJS.Timeout | null>(null);

// Methods
const scanTicket = async () => {
  if (!qrCode.value) {
    toast.error(t('Please enter QR code'));
    return;
  }

  // Reset trạng thái lỗi và kết quả trước đó
  errorMessage.value = '';
  scanResult.value = null;

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
      // Kiểm tra trạng thái đơn hàng
      if (orderItem.order && orderItem.order.status !== OrderStatus.CONFIRMED) {
        // Không hiển thị modal và thông tin vé nếu đơn hàng chưa xác nhận
        errorMessage.value = t('Đơn hàng chưa được xác nhận. Vui lòng liên hệ admin để xác nhận đơn hàng.');
        toast.error(errorMessage.value);
        
        // Focus lại vào input sau khi hiển thị lỗi
        setTimeout(() => {
          const qrInput = document.getElementById('qr-input');
          if (qrInput) {
            qrInput.focus();
          }
        }, 100);
        
        return;
      }
      
      // Kiểm tra travel_date
      if (orderItem.travelDate) {
        const travelDate = new Date(orderItem.travelDate);
        const currentDate = new Date();
        
        // Reset thời gian về 00:00:00 để chỉ so sánh ngày
        currentDate.setHours(0, 0, 0, 0);
        travelDate.setHours(0, 0, 0, 0);
        
        if (travelDate < currentDate) {
          // Vé đã hết hạn - không hiển thị popup và thông tin vé
          const formattedDate = formatVietnameseDate(travelDate);
          errorMessage.value = t('Vé đã hết hạn sử dụng. Ngày đi: ') + formattedDate;
          toast.error(errorMessage.value);
          
          // Focus lại vào input sau khi hiển thị lỗi
          setTimeout(() => {
            const qrInput = document.getElementById('qr-input');
            if (qrInput) {
              qrInput.focus();
            }
          }, 100);
          
          return;
        }
      } else if (orderItem.productType === 'TICKET') {
        // Nếu là vé tham quan mà không có ngày đi - không hiển thị popup và thông tin vé
        errorMessage.value = t('Vé không có thông tin ngày đi. Vui lòng kiểm tra lại.');
        toast.warning(errorMessage.value);
        
        // Focus lại vào input sau khi hiển thị lỗi
        setTimeout(() => {
          const qrInput = document.getElementById('qr-input');
          if (qrInput) {
            qrInput.focus();
          }
        }, 100);
        
        return;
      }
      
      scanResult.value = {
        success: true,
        message: orderItem.isUsed 
          ? 'Vé hợp lệ nhưng đã được quét trước đó.'
          : 'Vé hợp lệ và đây là lần đầu tiên sử dụng.',
        orderItem: orderItem,
        isFirstScan: !orderItem.isUsed,
        scanCount: orderItem.scanCount || 0
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
      errorMessage.value = t('Không tìm thấy vé với mã QR này');
      toast.error(errorMessage.value);
    }
  } catch (error: any) {
    console.error('Error scanning ticket:', error);
    console.error('Error details:', error?.data?.httpStatus, error?.message);
    
    // Hiển thị thông báo lỗi cụ thể từ server nếu có
    let msg = t('Failed to scan ticket');
    
    if (error?.message) {
      // Hiển thị thông báo lỗi cụ thể từ server
      msg = error.message;
    } else if (error?.data?.message) {
      // Hiển thị thông báo lỗi từ TRPC response
      msg = error.data.message;
    }
    
    // Lưu thông báo lỗi để hiển thị trong UI
    errorMessage.value = msg;
    
    // Hiển thị thông báo trong toast nếu không phải lỗi vé chưa thanh toán
    if (!msg.includes('chưa được thanh toán')) {
      toast.error(msg);
    }
  } finally {
    isLoading.value = false;
    
    // Focus lại vào input sau khi xử lý xong
    if (!showConfirmModal.value) {
      setTimeout(() => {
        const qrInput = document.getElementById('qr-input');
        if (qrInput) {
          qrInput.focus();
        }
      }, 100);
    }
  }
};

// Tìm kiếm vé theo thông tin khách hàng (email hoặc số điện thoại)
const searchCustomerTickets = async () => {
  if (!customerEmail.value && !customerPhone.value) {
    toast.error(t('Vui lòng nhập email hoặc số điện thoại của khách hàng'));
    return;
  }

  customerTickets.value = [];
  isSearchingCustomer.value = true;
  errorMessage.value = '';

  try {
    const searchTerm = customerEmail.value || (customerPhone.value ? customerPhone.value : '');
    const result = await trpc.admin.ticketScanner.searchCustomerTickets.query({
      searchTerm: searchTerm,
      ticketStatus: ticketStatus.value || undefined,
      startOrderDate: orderDateRange.value.start || undefined,
      endOrderDate: orderDateRange.value.end || undefined
    });

    if (result && result.length > 0) {
      customerTickets.value = result as CustomerTicket[];
    } else {
      toast.warning(t('Không tìm thấy vé nào cho khách hàng này'));
    }
  } catch (error: any) {
    console.error('Error searching customer tickets:', error);
    let errorMsg = t('Lỗi khi tìm kiếm thông tin vé của khách hàng');
    
    if (error?.message) {
      errorMsg = error.message;
    } else if (error?.data?.message) {
      errorMsg = error.data.message;
    }
    
    toast.error(errorMsg);
  } finally {
    isSearchingCustomer.value = false;
  }
};

// Sử dụng vé được tìm thấy từ khách hàng
const useCustomerTicket = (ticketQrCode: string) => {
  qrCode.value = ticketQrCode;
  scanTicket();
};

// Toggle hiển thị phần tìm kiếm khách hàng
const toggleCustomerSearch = () => {
  showCustomerSearch.value = !showCustomerSearch.value;
  if (showCustomerSearch.value) {
    // Reset dữ liệu khi hiển thị form tìm kiếm
    customerEmail.value = '';
    customerPhone.value = '';
    customerTickets.value = [];
  }
};

// Đóng phần tip hướng dẫn
const closeTip = () => {
  customerTip.value = false;
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
const formatDate = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// Format ngày theo kiểu Việt Nam
const formatVietnameseDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Định dạng "22 tháng 03 năm 2023 (22/03/2023)"
  return `${day} tháng ${month < 10 ? '0' + month : month} năm ${year} (${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year})`;
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
      
      // Kiểm tra lại trạng thái đơn hàng trước khi gọi API (đề phòng trường hợp trạng thái đơn hàng bị thay đổi)
      const orderItem = await trpc.admin.ticketScanner.getTicketByQrCode.query({
        qrCode: currentQrCode.value
      });
      
      if (orderItem && orderItem.order && orderItem.order.status !== OrderStatus.CONFIRMED) {
        // Hiển thị lỗi nếu đơn hàng chưa xác nhận
        errorMessage.value = t('Đơn hàng chưa được xác nhận. Vui lòng liên hệ admin để xác nhận đơn hàng.');
        toast.error(errorMessage.value);
        isLoading.value = false;
        currentQrCode.value = '';
        return;
      }
      
      // Kiểm tra lại travel_date trước khi gọi API scan
      if (orderItem && orderItem.travelDate) {
        const travelDate = new Date(orderItem.travelDate);
        const currentDate = new Date();
        
        // Reset thời gian về 00:00:00 để chỉ so sánh ngày
        currentDate.setHours(0, 0, 0, 0);
        travelDate.setHours(0, 0, 0, 0);
        
        if (travelDate < currentDate) {
          // Vé đã hết hạn
          const formattedDate = formatVietnameseDate(travelDate);
          errorMessage.value = t('Vé đã hết hạn sử dụng. Ngày đi: ') + formattedDate;
          toast.error(errorMessage.value);
          isLoading.value = false;
          currentQrCode.value = '';
          return;
        }
      }
      
      // Gọi API để lưu log quét vé
      const result = await trpc.admin.ticketScanner.scanTicket.mutate({
        qrCode: currentQrCode.value,
        location: 'Admin Dashboard',
        deviceInfo
      });
      
      // Kiểm tra kết quả từ API
      if (result.success) {
        // Hiển thị thông báo thành công
        toast.success(t('Đã lưu thông tin quét vé thành công'));
        
        // Cập nhật lại kết quả với thông tin mới nhất
        scanResult.value = result;
        
        // Cập nhật scanCount trong customerTickets nếu vé được quét từ danh sách tìm kiếm khách hàng
        if (customerTickets.value.length > 0 && result.orderItem) {
          const ticketIndex = customerTickets.value.findIndex(ticket => ticket.qrCode === currentQrCode.value);
          if (ticketIndex !== -1) {
            // Cập nhật scanCount và isUsed cho vé tương ứng
            customerTickets.value[ticketIndex].scanCount = (result.scanCount || 0);
            customerTickets.value[ticketIndex].isUsed = true;
          }
        }
        
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
      } else {
        // Hiển thị thông báo lỗi
        errorMessage.value = result.message;
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error saving scan log:', error);
      
      // Xử lý thông báo lỗi
      let errorMsg = t('Lỗi khi lưu thông tin quét vé: ') + (error?.message || 'Unknown error');
      
      // Nếu lỗi có data.message thì hiển thị
      if (error?.data?.message) {
        errorMsg = error.data.message;
      }
      
      // Lưu và hiển thị thông báo lỗi
      errorMessage.value = errorMsg;
      toast.error(errorMsg);
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
  errorMessage.value = '';
  
  // Focus lại vào input sau khi đóng modal
  setTimeout(() => {
    const qrInput = document.getElementById('qr-input');
    if (qrInput) {
      qrInput.focus();
    }
  }, 100);
  
  // Vẫn giữ lịch sử quét hiển thị, không reset lại
  // Chỉ cần đảm bảo không gọi API lưu log
};

// Reset error message
const resetError = () => {
  errorMessage.value = '';
};

// Auto-scan on paste or when the value is long enough (for barcode scanners)
const handleInput = () => {
  // Reset error message khi người dùng nhập mã QR mới
  if (errorMessage.value) {
    resetError();
  }
  
  // Hủy timer cũ nếu có
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  
  // Chỉ tự động quét khi không có modal đang hiển thị và đủ số ký tự
  if (!showConfirmModal.value && qrCode.value.length >= 15) {
    // Đặt một timer để đợi máy quét hoàn thành (500ms)
    debounceTimer.value = setTimeout(() => {
      scanTicket();
    }, 500);
  }
};

// Thêm handler cho sự kiện keydown
const handleKeyDown = (e: KeyboardEvent) => {
  // Nếu nhấn Enter, thực hiện quét ngay lập tức
  if (e.key === 'Enter' && qrCode.value) {
    // Hủy timer debounce nếu có
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
      debounceTimer.value = null;
    }
    
    // Thực hiện quét ngay
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
  <div class="p-4 space-y-6">
    <!-- Header -->
    <PageHeader
      :title="t('Ticket Scanner')"
      :description="t('Scan tickets for admission and view scan history')"
    />

    <!-- Tabs -->
    <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
      <button
        v-for="tab in [
          { id: 'scanner', name: 'Scanner', icon: TicketIcon },
          { id: 'history', name: 'Scan History', icon: HistoryIcon }
        ]"
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
              @keydown="handleKeyDown"
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
          <p class="text-sm font-medium text-blue-600 mt-1">
            {{ t('Nếu sử dụng máy quét mã vạch, vui lòng nhấn Enter sau khi quét hoặc đợi hệ thống tự xử lý.') }}
          </p>
        </div>

        <!-- Nút chuyển đổi sang tìm kiếm theo thông tin khách hàng -->
        <button 
          @click="toggleCustomerSearch" 
          class="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <UserIcon class="w-4 h-4" />
          <span>{{ showCustomerSearch ? t('Quay lại quét mã QR') : t('Tìm theo thông tin khách hàng') }}</span>
        </button>

        <!-- Tìm kiếm theo thông tin khách hàng -->
        <div v-if="showCustomerSearch" class="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 class="text-lg font-semibold mb-4 text-blue-800">{{ t('Tìm vé theo thông tin khách hàng') }}</h3>
          
          <!-- Hướng dẫn nhân viên soát vé -->
          <div v-if="customerTip" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg relative">
            <button @click="closeTip" class="absolute top-2 right-2 text-yellow-500 hover:text-yellow-700">
              <span class="sr-only">Close</span>
              <i class="fas fa-times"></i>
            </button>
            <div class="flex items-start">
              <div class="flex-shrink-0 text-yellow-500">
                <i class="fas fa-lightbulb text-xl"></i>
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-bold text-yellow-800">{{ t('Mẹo cho nhân viên soát vé:') }}</h4>
                <ul class="mt-1 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  <li>{{ t('Yêu cầu khách hàng xuất trình CMND/CCCD để đối chiếu thông tin') }}</li>
                  <li>{{ t('Kiểm tra tên, email, SĐT trên đơn hàng có khớp với thông tin của khách') }}</li>
                  <li>{{ t('Chỉ sử dụng vé có trạng thái "Đã thanh toán"') }}</li>
                  <li>{{ t('Ưu tiên kiểm tra mã QR nếu khách hàng có mã') }}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Form tìm kiếm -->
          <div class="space-y-4">
            <p class="text-sm text-gray-600">{{ t('Nhập email hoặc số điện thoại để tìm vé, có thể tìm theo 1 trong 2 thông tin') }}</p>
            
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Email input -->
              <div>
                <label for="customer-email" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Email khách hàng') }}
                </label>
                <input
                  id="customer-email"
                  v-model="customerEmail"
                  type="email"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                  :placeholder="t('Nhập email khách hàng')"
                  :disabled="isSearchingCustomer"
                />
              </div>
              
              <!-- Phone input -->
              <div>
                <label for="customer-phone" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Số điện thoại khách hàng') }}
                </label>
                <PhoneInput
                  v-model="customerPhone"
                  v-model:phoneCode="customerPhoneCode"
                  :disabled="isSearchingCustomer"
                  :placeholder="t('Nhập số điện thoại')"
                  class="phone-input-scanner"
                />
              </div>
            </div>
            
            <!-- Bộ lọc bổ sung -->
            <div class="mt-4 border-t pt-4 border-blue-200">
              <h4 class="font-medium text-blue-800 mb-3">{{ t('Bộ lọc bổ sung') }}</h4>
              
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <!-- Trạng thái vé filter -->
                <div>
                  <label for="ticket-status" class="block text-sm font-medium text-gray-700 mb-1">
                    {{ t('Trạng thái vé') }}
                  </label>
                  <select
                    id="ticket-status"
                    v-model="ticketStatus"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                    :disabled="isSearchingCustomer"
                  >
                    <option value="">{{ t('Tất cả') }}</option>
                    <option value="used">{{ t('Đã sử dụng') }}</option>
                    <option value="unused">{{ t('Chưa sử dụng') }}</option>
                  </select>
                </div>
                
                <!-- Ngày đặt hàng filter -->
                <div>
                  <label for="order-date-from" class="block text-sm font-bold text-gray-700 mb-1">
                    {{ t('Từ ngày') }}
                  </label>
                  <input
                    id="order-date-from"
                    v-model="orderDateRange.start"
                    type="date"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                    :disabled="isSearchingCustomer"
                  />
                </div>
                
                <div>
                  <label for="order-date-to" class="block text-sm font-bold text-gray-700 mb-1">
                    {{ t('Đến ngày') }}
                  </label>
                  <input
                    id="order-date-to"
                    v-model="orderDateRange.end"
                    type="date"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                    :disabled="isSearchingCustomer"
                  />
                </div>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button
                @click="searchCustomerTickets"
                :disabled="isSearchingCustomer || (!customerEmail && !customerPhone)"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <span v-if="isSearchingCustomer">{{ t('Đang tìm...') }}</span>
                <span v-else>{{ t('Tìm kiếm') }}</span>
              </button>
            </div>
            
            <!-- Kết quả tìm kiếm -->
            <div v-if="customerTickets.length > 0" class="mt-4">
              <h4 class="font-semibold text-gray-700 mb-3">{{ t('Vé của khách hàng') }}</h4>
              <div class="border rounded-md overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Mã đơn hàng') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Sản phẩm') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Trạng thái vé') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Lượt quét') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Trạng thái đơn') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Ngày mua') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Thông tin KH') }}</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Hành động') }}</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="ticket in customerTickets" :key="ticket.id">
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ ticket.order?.orderCode || t('N/A') }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {{ ticket.product?.translations?.[0]?.title || t('Unknown Product') }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          :class="[
                            'px-2 py-1 rounded-full text-xs font-bold',
                            ticket.isUsed 
                              ? 'bg-orange-100 text-orange-800 border border-orange-500' 
                              : 'bg-green-100 text-green-800 border border-green-500'
                          ]"
                        >
                          {{ ticket.isUsed ? t('ĐÃ SỬ DỤNG') : t('CHƯA SỬ DỤNG') }}
                        </span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                        <span class="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          {{ ticket.scanCount || 0 }}
                        </span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          :class="[
                            'px-2 py-1 rounded-full text-xs font-bold',
                            ticket.order?.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          ]"
                        >
                          {{ ticket.order?.paymentStatus === 'paid' ? t('ĐÃ THANH TOÁN') : t('CHƯA THANH TOÁN') }}
                        </span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {{ formatDate(ticket.order?.createdAt) }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-500">
                        <div class="space-y-1">
                          <p class="font-medium">{{ ticket.order?.customerName || t('N/A') }}</p>
                          <p v-if="ticket.order?.customerEmail" class="text-xs">{{ ticket.order.customerEmail }}</p>
                          <p v-if="ticket.order?.customerPhone" class="text-xs">{{ ticket.order.customerPhone }}</p>
                        </div>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <button 
                          @click="useCustomerTicket(ticket.qrCode)"
                          :disabled="ticket.order?.paymentStatus !== 'paid'"
                          :class="[
                            'px-3 py-1 rounded text-white text-xs font-bold',
                            ticket.order?.paymentStatus === 'paid'
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-gray-400 cursor-not-allowed'
                          ]"
                        >
                          {{ t('Sử dụng vé này') }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Thông báo lỗi vé chưa thanh toán -->
        <div v-if="errorMessage" class="mb-6 p-4 rounded-lg border-2 border-red-500 bg-red-50 text-red-800">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-bold">
                {{ errorMessage.includes('chưa được thanh toán') ? 'VÉ CHƯA THANH TOÁN' : 'LỖI QUÉT VÉ' }}
              </h3>
              <p class="mt-1">{{ errorMessage }}</p>
              <p v-if="errorMessage.includes('chưa được thanh toán')" class="mt-2 font-semibold">
                Vui lòng kiểm tra trạng thái thanh toán của đơn hàng trước khi cho phép người dùng vào.
              </p>
            </div>
          </div>
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
              <div class="grid grid-cols-4 gap-6">
                <div class="border-r border-gray-200 pr-4">
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Product') }}</p>
                  <p class="font-medium text-base">{{ scanResult.orderItem.product?.translations?.[0]?.title || 'Unknown Product' }}</p>
                </div>
                <div class="border-r border-gray-200 pr-4">
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Order ID') }}</p>
                  <p class="font-medium text-base">#{{ scanResult.orderItem.order?.orderCode || scanResult.orderItem.orderId }}</p>
                </div>
                <div class="border-r border-gray-200 pr-4">
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
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Lượt quét') }}</p>
                  <p class="font-bold text-lg mt-1">
                    <span class="px-3 py-1 rounded-full text-base font-bold inline-block bg-blue-100 text-blue-800 border border-blue-500">
                      {{ scanResult.scanCount || 0 }}
                    </span>
                  </p>
                </div>
              </div>
              
              <!-- Hiển thị ngày đi cho vé -->
              <div v-if="scanResult.orderItem.travelDate" class="mt-2 border-t border-gray-200 pt-4">
                <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Ngày đi') }}</p>
                <p class="font-medium text-base">
                  {{ formatVietnameseDate(new Date(scanResult.orderItem.travelDate)) }}
                  <span 
                    v-if="new Date(scanResult.orderItem.travelDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)" 
                    class="ml-2 px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-500"
                  >
                    {{ t('HÔM NAY') }}
                  </span>
                </p>
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
                <p v-if="!scanResult?.isFirstScan" class="mt-3">
                  <strong class="mr-2">{{ t('Số lần quét trước đó') }}:</strong> 
                  <span class="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm border border-blue-300 ml-1 inline-block">
                    {{ scanResult?.scanCount || 0 }}
                  </span>
                </p>
                <!-- Hiển thị ngày đi trong modal xác nhận -->
                <p v-if="scanResult?.orderItem?.travelDate" class="mt-3">
                  <strong>{{ t('Ngày đi') }}:</strong> 
                  <span class="font-bold ml-1">
                    {{ formatVietnameseDate(new Date(scanResult.orderItem.travelDate)) }}
                  </span>
                  <span 
                    v-if="new Date(scanResult.orderItem.travelDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)" 
                    class="ml-2 px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-500"
                  >
                    {{ t('HÔM NAY') }}
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

<style scoped>
.phone-input-scanner :deep(input) {
  height: 42px !important;
}

.phone-input-scanner :deep(.phone-code-selector button) {
  height: 42px !important;
}
</style> 