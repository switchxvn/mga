<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useTrpc } from "../../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import Swal from 'sweetalert2';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import {
  ArrowLeftIcon,
  TrashIcon,
  ClipboardCopyIcon,
  MailIcon,
  PhoneIcon,
  ShoppingCartIcon,
  MessageSquareIcon
} from 'lucide-vue-next';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Chi tiết yêu cầu báo giá - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Price request status enum
enum PriceRequestStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Price request interface
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
const priceRequest = ref<PriceRequest | null>(null);

// Get the price request ID from the route
const priceRequestId = Number(route.params.id);

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

// Fetch price request data
const fetchPriceRequest = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    priceRequest.value = await trpc.admin.priceRequest.getPriceRequestById.query(priceRequestId);
  } catch (err) {
    console.error('Error fetching price request details:', err);
    error.value = 'Không thể tải thông tin yêu cầu báo giá. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

// Handle update status
const updateStatus = async (status: PriceRequestStatus) => {
  try {
    if (!priceRequest.value) return;
    
    await trpc.admin.priceRequest.updatePriceRequestStatus.mutate({
      id: priceRequest.value.id,
      status
    });
    
    Swal.fire({
      title: 'Thành công!',
      text: 'Đã cập nhật trạng thái yêu cầu báo giá.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Refresh the data
    await fetchPriceRequest();
  } catch (err) {
    console.error('Error updating price request status:', err);
    Swal.fire({
      title: 'Lỗi!',
      text: 'Không thể cập nhật trạng thái yêu cầu báo giá. Vui lòng thử lại sau.',
      icon: 'error'
    });
  }
};

// Handle delete price request
const deletePriceRequest = async () => {
  try {
    if (!priceRequest.value) return;
    
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
      await trpc.admin.priceRequest.deletePriceRequest.mutate(priceRequest.value.id);
      
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Yêu cầu báo giá đã được xóa thành công.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Navigate back to the list
      router.push('/orders/price-requests');
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

// Initialize data
onMounted(async () => {
  try {
    await checkAuth(); // Verify user is authenticated
    await fetchPriceRequest();
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = 'Vui lòng đăng nhập để tiếp tục.';
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
    <!-- Back Button -->
    <div class="mb-6">
      <button 
        @click="router.push('/orders/price-requests')" 
        class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeftIcon class="w-4 h-4 mr-1" />
        Quay lại danh sách
      </button>
    </div>
    
    <!-- Page header -->
    <PageHeader 
      title="Chi tiết yêu cầu báo giá" 
      icon="ReceiptIcon" 
      description="Xem thông tin và quản lý yêu cầu báo giá"
    />
    
    <!-- Loading or Error State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent align-middle"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Đang tải...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-800 dark:text-red-300">{{ error }}</p>
    </div>
    
    <!-- Price Request Details -->
    <div v-else-if="priceRequest" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="md:col-span-2 grid gap-6">
        <!-- Status and Actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Thông tin yêu cầu</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ priceRequest.id }}</p>
            </div>
            <div>
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusBadgeClass(priceRequest.status)]">
                {{ getStatusDisplayName(priceRequest.status) }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <button 
                @click="updateStatus(PriceRequestStatus.PENDING)"
                :disabled="priceRequest.status === PriceRequestStatus.PENDING"
                :class="[
                  priceRequest.status === PriceRequestStatus.PENDING 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900/70',
                  'px-3 py-2 rounded-md text-sm font-medium'
                ]"
              >
                Đánh dấu Đang chờ
              </button>
              
              <button 
                @click="updateStatus(PriceRequestStatus.PROCESSED)"
                :disabled="priceRequest.status === PriceRequestStatus.PROCESSED"
                :class="[
                  priceRequest.status === PriceRequestStatus.PROCESSED 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70',
                  'px-3 py-2 rounded-md text-sm font-medium'
                ]"
              >
                Đánh dấu Đã xử lý
              </button>
              
              <button 
                @click="updateStatus(PriceRequestStatus.COMPLETED)"
                :disabled="priceRequest.status === PriceRequestStatus.COMPLETED"
                :class="[
                  priceRequest.status === PriceRequestStatus.COMPLETED 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70',
                  'px-3 py-2 rounded-md text-sm font-medium'
                ]"
              >
                Đánh dấu Hoàn thành
              </button>
              
              <button 
                @click="updateStatus(PriceRequestStatus.CANCELLED)"
                :disabled="priceRequest.status === PriceRequestStatus.CANCELLED"
                :class="[
                  priceRequest.status === PriceRequestStatus.CANCELLED 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70',
                  'px-3 py-2 rounded-md text-sm font-medium'
                ]"
              >
                Đánh dấu Đã hủy
              </button>
            </div>
            
            <button 
              @click="deletePriceRequest"
              class="mt-4 w-full flex justify-center items-center px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md text-sm font-medium"
            >
              <TrashIcon class="w-4 h-4 mr-1" />
              Xóa yêu cầu
            </button>
          </div>
        </div>
        
        <!-- Message -->
        <div v-if="priceRequest.message" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <MessageSquareIcon class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Tin nhắn</h2>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ priceRequest.message }}</p>
          </div>
        </div>
      </div>
      
      <!-- Sidebar Info -->
      <div class="space-y-6">
        <!-- Customer Info -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin khách hàng</h2>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Họ tên</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white font-medium">{{ priceRequest.fullName }}</p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
              <div class="mt-1 flex items-center">
                <MailIcon class="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                <a
                  :href="`mailto:${priceRequest.email}`"
                  class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{ priceRequest.email }}
                </a>
              </div>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</p>
              <div class="mt-1 flex items-center">
                <PhoneIcon class="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                <a
                  :href="`tel:${priceRequest.phone}`"
                  class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{ priceRequest.phone }}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Product Info -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <ShoppingCartIcon class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Sản phẩm</h2>
          </div>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tên sản phẩm</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white font-medium">{{ priceRequest.productName }}</p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">ID sản phẩm</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ priceRequest.productId }}</p>
            </div>
            
            <div>
              <router-link 
                :to="`/products/view/${priceRequest.productId}`"
                class="mt-2 w-full flex justify-center items-center px-3 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md text-sm font-medium"
              >
                Xem chi tiết sản phẩm
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- Timestamps -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Thời gian</h2>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(priceRequest.createdAt) }}</p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(priceRequest.updatedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 