<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTrpc } from '../../../composables/useTrpc';
import { useToast } from '../../../composables/useToast';
import { RefundStatus, RefundType, RefundReason, OrderType } from '@ew/shared';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import { Ticket, Search, FilterIcon, Plus, RefreshCw } from 'lucide-vue-next';

// Composables
const trpc = useTrpc();
const toast = useToast();

// State
const isLoading = ref(false);
const refunds = ref<any[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedStatus = ref<RefundStatus | null>(null);
const searchTerm = ref('');

// Computed
const refundStatusOptions = computed(() => {
  return Object.entries(RefundStatus).map(([key, value]) => ({
    label: getStatusLabel(value as RefundStatus),
    value: value,
  }));
});

// Methods
const getStatusLabel = (status: RefundStatus) => {
  const statusMap: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'Đang chờ xử lý',
    [RefundStatus.APPROVED]: 'Đã duyệt',
    [RefundStatus.REJECTED]: 'Từ chối',
    [RefundStatus.PROCESSING]: 'Đang xử lý',
    [RefundStatus.COMPLETED]: 'Hoàn tất',
    [RefundStatus.CANCELLED]: 'Đã hủy'
  };
  return statusMap[status] || status;
};

const getRefundTypeLabel = (type: RefundType) => {
  const typeMap: Record<RefundType, string> = {
    [RefundType.MONEY_REFUND]: 'Hoàn tiền',
    [RefundType.RESCHEDULE]: 'Đổi lịch',
    [RefundType.PRODUCT_EXCHANGE]: 'Đổi sản phẩm',
    [RefundType.STORE_CREDIT]: 'Hoàn tiền vào tài khoản'
  };
  return typeMap[type] || type;
};

const getRefundReasonLabel = (reason: RefundReason) => {
  const reasonMap: Record<RefundReason, string> = {
    [RefundReason.CHANGE_MIND]: 'Thay đổi ý định',
    [RefundReason.PRODUCT_DEFECT]: 'Sản phẩm lỗi',
    [RefundReason.WRONG_PRODUCT]: 'Sai sản phẩm',
    [RefundReason.SCHEDULE_CHANGE]: 'Thay đổi lịch trình',
    [RefundReason.OTHER]: 'Lý do khác'
  };
  return reasonMap[reason] || reason;
};

const getStatusColor = (status: RefundStatus) => {
  const colorMap: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [RefundStatus.APPROVED]: 'bg-blue-100 text-blue-800',
    [RefundStatus.REJECTED]: 'bg-red-100 text-red-800',
    [RefundStatus.PROCESSING]: 'bg-indigo-100 text-indigo-800',
    [RefundStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [RefundStatus.CANCELLED]: 'bg-gray-100 text-gray-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const loadRefunds = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.order.admin.getAllRefunds.query({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: selectedStatus.value || undefined,
      search: searchTerm.value || undefined
    });
    
    refunds.value = result.items;
    totalCount.value = result.total;
  } catch (error: any) {
    console.error('Error loading refunds:', error);
    toast.error(error.message || 'Lỗi tải dữ liệu');
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadRefunds();
};

const handleSearch = () => {
  currentPage.value = 1;
  loadRefunds();
};

const handleStatusChange = () => {
  currentPage.value = 1;
  loadRefunds();
};

const handleClearFilters = () => {
  selectedStatus.value = null;
  searchTerm.value = '';
  currentPage.value = 1;
  loadRefunds();
};

const refreshData = () => {
  loadRefunds();
};

// Lifecycle hooks
onMounted(() => {
  loadRefunds();
});
</script>

<template>
  <div>
    <PageHeader
      title="Quản lý đổi vé"
      description="Quản lý tất cả các yêu cầu đổi vé từ khách hàng"
    >
      <template #actions>
        <button
          @click="refreshData"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Làm mới
        </button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4 mt-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Mã đơn, tên khách hàng, số điện thoại..."
              class="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon class="h-4 w-4 text-gray-400" />
            </div>
            <select
              v-model="selectedStatus"
              class="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              @change="handleStatusChange"
            >
              <option :value="null">Tất cả trạng thái</option>
              <option v-for="option in refundStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex items-end">
          <button
            @click="handleSearch"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
          >
            <Search class="h-4 w-4 mr-1" />
            <span>Tìm kiếm</span>
          </button>
          
          <button
            @click="handleClearFilters"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã yêu cầu
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn hàng
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại đổi/trả
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày yêu cầu
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-if="isLoading">
              <tr>
                <td colspan="7" class="px-6 py-4 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="refunds.length === 0">
              <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy yêu cầu đổi/trả vé nào
                </td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="refund in refunds" :key="refund.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center">
                    <Ticket class="h-4 w-4 text-indigo-500 mr-2" />
                    {{ refund.refundCode }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ refund.order?.orderCode }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{{ refund.requesterName }}</div>
                  <div class="text-xs text-gray-400">{{ refund.requesterPhone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getRefundTypeLabel(refund.refundType) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(refund.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusColor(refund.status)"
                  >
                    {{ getStatusLabel(refund.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <NuxtLink
                    :to="`/orders/ticket-exchanges/${refund.id}`"
                    class="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Chi tiết
                  </NuxtLink>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage * pageSize >= totalCount"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Hiển thị
              <span class="font-medium">{{ ((currentPage - 1) * pageSize) + 1 }}</span>
              đến
              <span class="font-medium">{{ Math.min(currentPage * pageSize, totalCount) }}</span>
              trong
              <span class="font-medium">{{ totalCount }}</span>
              kết quả
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Trước</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                v-for="page in Math.min(5, Math.ceil(totalCount / pageSize))"
                :key="page"
                @click="handlePageChange(page)"
                :class="[
                  page === currentPage ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage * pageSize >= totalCount"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Sau</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 