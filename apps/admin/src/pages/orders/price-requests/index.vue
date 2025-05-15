<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useTrpc } from "../../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  MoreHorizontalIcon,
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import FilterContainer from '../../../components/common/filter/FilterContainer.vue';
import SearchFilter from '../../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../../components/common/filter/StatusFilter.vue';
import PageSizeFilter from '../../../components/common/filter/PageSizeFilter.vue';
import DataTable from '../../../components/common/table/DataTable.vue';
import PageHeader from '../../../components/common/header/PageHeader.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Quản lý yêu cầu báo giá - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Define PriceRequestStatus enum to match backend
enum PriceRequestStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface PriceRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  productId: number;
  productName: string;
  status: PriceRequestStatus;
  createdAt: string;
  updatedAt: string;
  product?: any;
}

const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const statusFilter = ref<PriceRequestStatus | undefined>(
  route.query.status ? route.query.status as PriceRequestStatus : undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const priceRequests = ref<{
  items: PriceRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1
});

// Capitalize the first letter of a string
const capitalize = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// Get status badge class
const getStatusBadgeClass = (status: PriceRequestStatus) => {
  switch (status) {
    case PriceRequestStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case PriceRequestStatus.PROCESSED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case PriceRequestStatus.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case PriceRequestStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Get status display name
const getStatusDisplayName = (status: PriceRequestStatus) => {
  switch (status) {
    case PriceRequestStatus.PENDING:
      return 'Đang chờ';
    case PriceRequestStatus.PROCESSED:
      return 'Đã xử lý';
    case PriceRequestStatus.COMPLETED:
      return 'Hoàn thành';
    case PriceRequestStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
};

// Fetch price requests with filters
const fetchPriceRequests = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
      search: search.value || undefined
    };

    // Update URL query params
    router.replace({
      query: {
        ...route.query,
        page: params.page.toString(),
        ...(params.status && { status: params.status }),
        ...(params.search && { search: params.search })
      }
    });

    const response = await trpc.admin.priceRequest.getAllPriceRequests.query(params);
    
    priceRequests.value = {
      items: response.items,
      total: response.total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(response.total / params.pageSize)
    };
  } catch (err) {
    console.error('Error fetching price requests:', err);
    error.value = 'Không thể tải yêu cầu báo giá. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

// Handle page change
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchPriceRequests();
};

// Handle page size change
const handlePageSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  page.value = 1; // Reset to first page when changing page size
  fetchPriceRequests();
};

// Handle search
const handleSearch = (searchTerm: string) => {
  search.value = searchTerm;
  page.value = 1; // Reset to first page when searching
  fetchPriceRequests();
};

// Handle status filter change
const handleStatusChange = (status: PriceRequestStatus | null) => {
  statusFilter.value = status || undefined;
  page.value = 1; // Reset to first page when changing filter
  fetchPriceRequests();
};

// Handle view price request details
const viewPriceRequest = (id: number) => {
  router.push(`/orders/price-requests/${id}`);
};

// Handle delete price request
const deletePriceRequest = async (id: number) => {
  try {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa yêu cầu báo giá này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      await trpc.admin.priceRequest.deletePriceRequest.mutate(id);
      
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Yêu cầu báo giá đã được xóa thành công.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchPriceRequests();
    }
  } catch (err) {
    console.error('Error deleting price request:', err);
    Swal.fire({
      title: 'Lỗi!',
      text: 'Không thể xóa yêu cầu báo giá. Vui lòng thử lại sau.',
      icon: 'error'
    });
  }
};

// Handle update status
const updateStatus = async (id: number, status: PriceRequestStatus) => {
  try {
    await trpc.admin.priceRequest.updatePriceRequestStatus.mutate({
      id,
      status
    });
    
    Swal.fire({
      title: 'Thành công!',
      text: 'Đã cập nhật trạng thái yêu cầu báo giá.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    
    fetchPriceRequests();
  } catch (err) {
    console.error('Error updating price request status:', err);
    Swal.fire({
      title: 'Lỗi!',
      text: 'Không thể cập nhật trạng thái yêu cầu báo giá. Vui lòng thử lại sau.',
      icon: 'error'
    });
  }
};

// Watch for route changes
watch(
  () => route.query,
  (newQuery) => {
    const newPage = Number(newQuery.page) || 1;
    const newStatus = newQuery.status as PriceRequestStatus | undefined;
    const newSearch = newQuery.search?.toString() || '';
    
    if (
      newPage !== page.value ||
      newStatus !== statusFilter.value ||
      newSearch !== search.value
    ) {
      page.value = newPage;
      statusFilter.value = newStatus;
      search.value = newSearch;
      fetchPriceRequests();
    }
  }
);

// Initialize data
onMounted(async () => {
  try {
    await checkAuth(); // Verify user is authenticated
    await fetchPriceRequests();
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = 'Vui lòng đăng nhập để tiếp tục.';
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
    <!-- Page header -->
    <PageHeader 
      title="Quản lý yêu cầu báo giá" 
      icon="ReceiptIcon" 
      description="Quản lý các yêu cầu báo giá từ khách hàng"
    />
    
    <!-- Filters -->
    <FilterContainer>
      <SearchFilter
        :value="search"
        @update:search="handleSearch"
        placeholder="Tìm theo tên, email, số điện thoại..."
      />
      <StatusFilter
        :value="statusFilter"
        :options="[
          { value: PriceRequestStatus.PENDING, label: 'Đang chờ' },
          { value: PriceRequestStatus.PROCESSED, label: 'Đã xử lý' },
          { value: PriceRequestStatus.COMPLETED, label: 'Hoàn thành' },
          { value: PriceRequestStatus.CANCELLED, label: 'Đã hủy' }
        ]"
        @update:status="handleStatusChange"
      />
      <PageSizeFilter
        :value="pageSize"
        @update:pageSize="handlePageSizeChange"
      />
    </FilterContainer>

    <!-- Table -->
    <DataTable
      :loading="isLoading"
      :error="error"
      :items="priceRequests.items"
      :total="priceRequests.total"
      :page="priceRequests.page"
      :pageSize="priceRequests.pageSize"
      :total-pages="priceRequests.totalPages"
      @page-change="handlePageChange"
    >
      <template #header>
        <tr>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
            ID
          </th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
            Khách hàng
          </th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
            Sản phẩm
          </th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
            Trạng thái
          </th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
            Ngày tạo
          </th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
            Thao tác
          </th>
        </tr>
      </template>
      
      <template #body>
        <tr v-for="item in priceRequests.items" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
          <td class="whitespace-nowrap py-4 px-3 text-sm text-gray-900 dark:text-white">
            {{ item.id }}
          </td>
          <td class="whitespace-nowrap py-4 px-3 text-sm text-gray-900 dark:text-white">
            <div class="font-medium">{{ item.fullName }}</div>
            <div class="text-gray-500 dark:text-gray-400">{{ item.email }}</div>
            <div class="text-gray-500 dark:text-gray-400">{{ item.phone }}</div>
          </td>
          <td class="whitespace-nowrap py-4 px-3 text-sm text-gray-900 dark:text-white">
            {{ item.productName }}
          </td>
          <td class="whitespace-nowrap py-4 px-3 text-sm">
            <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusBadgeClass(item.status)]">
              {{ getStatusDisplayName(item.status) }}
            </span>
          </td>
          <td class="whitespace-nowrap py-4 px-3 text-sm text-gray-900 dark:text-white">
            {{ formatDate(item.createdAt) }}
          </td>
          <td class="whitespace-nowrap py-4 px-3 text-sm">
            <div class="flex items-center space-x-2">
              <button 
                @click="viewPriceRequest(item.id)" 
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                title="Xem chi tiết"
              >
                <EyeIcon class="w-5 h-5" />
              </button>

              <Menu as="div" class="relative inline-block text-left">
                <MenuButton class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <MoreHorizontalIcon class="w-5 h-5" />
                </MenuButton>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button 
                          @click="updateStatus(item.id, PriceRequestStatus.PENDING)"
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                            'w-full text-left block px-4 py-2 text-sm'
                          ]"
                          :disabled="item.status === PriceRequestStatus.PENDING"
                        >
                          Chuyển sang "Đang chờ"
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button 
                          @click="updateStatus(item.id, PriceRequestStatus.PROCESSED)" 
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                            'w-full text-left block px-4 py-2 text-sm'
                          ]"
                          :disabled="item.status === PriceRequestStatus.PROCESSED"
                        >
                          Chuyển sang "Đã xử lý"
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button 
                          @click="updateStatus(item.id, PriceRequestStatus.COMPLETED)" 
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                            'w-full text-left block px-4 py-2 text-sm'
                          ]"
                          :disabled="item.status === PriceRequestStatus.COMPLETED"
                        >
                          Chuyển sang "Hoàn thành"
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button 
                          @click="updateStatus(item.id, PriceRequestStatus.CANCELLED)" 
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                            'w-full text-left block px-4 py-2 text-sm'
                          ]"
                          :disabled="item.status === PriceRequestStatus.CANCELLED"
                        >
                          Chuyển sang "Đã hủy"
                        </button>
                      </MenuItem>
                      <div class="border-t border-gray-200 dark:border-gray-700"></div>
                      <MenuItem v-slot="{ active }">
                        <button 
                          @click="deletePriceRequest(item.id)" 
                          :class="[
                            active ? 'bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400' : 'text-red-600 dark:text-red-400',
                            'w-full text-left block px-4 py-2 text-sm'
                          ]"
                        >
                          Xóa yêu cầu
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </td>
        </tr>
      </template>
      
      <template #empty>
        <tr>
          <td colspan="6" class="px-3 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
            Không tìm thấy yêu cầu báo giá nào
          </td>
        </tr>
      </template>
    </DataTable>
  </div>
</template> 