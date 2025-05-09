<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useTrpc } from '../../../composables/useTrpc';
import { useToast } from '../../../composables/useToast';
import { useConfirm } from '../../../composables/useConfirm';
import { useRoute, useRouter } from 'vue-router';
import { RefundStatus, RefundType, RefundReason, OrderType } from '@ew/shared';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import { Ticket, ArrowLeft, Check, X, Save, AlertTriangle, ShieldAlert, RefreshCw, Calendar, FileCheck } from 'lucide-vue-next';

// Composables
const trpc = useTrpc();
const toast = useToast();
const confirm = useConfirm();
const route = useRoute();
const router = useRouter();

// State
const isLoading = ref(false);
const isUpdating = ref(false);
const refund = ref<any | null>(null);
const newStatus = ref<RefundStatus | null>(null);
const adminNotes = ref('');
const newOrder = ref<any | null>(null);
const showNewOrder = ref(false);

// Get refund ID from route
const refundId = computed(() => parseInt(route.params.id as string));

// Computed
const statusOptions = computed(() => {
  return Object.entries(RefundStatus).map(([key, value]) => ({
    label: getStatusLabel(value as RefundStatus),
    value: value,
  }));
});

// Check if status can be updated
const canUpdateStatus = computed(() => {
  if (!refund.value) return false;
  
  // Cannot update if already completed or cancelled
  if (
    refund.value.status === RefundStatus.COMPLETED || 
    refund.value.status === RefundStatus.CANCELLED
  ) {
    return false;
  }
  
  // Không thể thay đổi trạng thái nếu đã duyệt đổi vé và đã tạo đơn hàng mới
  if (
    refund.value.refundType === RefundType.RESCHEDULE &&
    refund.value.status === RefundStatus.APPROVED &&
    refund.value.newOrderId
  ) {
    return false;
  }
  
  return true;
});

// Check if new order exists
const hasNewOrder = computed(() => {
  return !!refund.value?.newOrderId;
});

// Get actions based on status
const getAvailableActions = computed(() => {
  if (!refund.value) return [];
  
  const actions = [];
  
  // For rescue and already approved/completed and has newOrderId
  if (refund.value.refundType === RefundType.RESCHEDULE && 
      (refund.value.status === RefundStatus.APPROVED || refund.value.status === RefundStatus.COMPLETED) &&
      refund.value.newOrderId) {
    actions.push({
      label: 'Xem đơn hàng mới',
      icon: FileCheck,
      action: () => showNewOrderDetails()
    });
  }
  
  return actions;
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

const getStatusIcon = (status: RefundStatus) => {
  if (status === RefundStatus.APPROVED || status === RefundStatus.COMPLETED) {
    return Check;
  } else if (status === RefundStatus.REJECTED || status === RefundStatus.CANCELLED) {
    return X;
  } else if (status === RefundStatus.PENDING) {
    return AlertTriangle;
  } else {
    return RefreshCw;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '–';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDateOnly = (dateString: string) => {
  if (!dateString) return '–';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const formatCurrency = (amount: number) => {
  if (amount === null || amount === undefined) return '–';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Load refund details
const loadRefundDetails = async () => {
  if (!refundId.value) return;
  
  isLoading.value = true;
  console.log('Loading refund details for ID:', refundId.value);
  
  try {
    console.log('Sending request to getRefundById:', refundId.value);
    const result = await trpc.order.admin.getRefundById.query(refundId.value);
    console.log('Received refund data:', JSON.stringify(result, null, 2));
    
    // Kiểm tra kết quả
    if (!result) {
      console.error('Received empty result from API');
      toast.error('Không tìm thấy dữ liệu yêu cầu đổi vé');
      router.push('/orders/ticket-exchanges');
      return;
    }
    
    // Kiểm tra trạng thái
    if (result.status === undefined) {
      console.error('Missing status in result:', result);
      toast.error('Dữ liệu yêu cầu đổi vé không hợp lệ');
      router.push('/orders/ticket-exchanges');
      return;
    }
    
    refund.value = result;
    console.log('Refund data set:', refund.value);
    console.log('Refund status:', refund.value.status);
    
    // Initialize form values
    newStatus.value = result.status;
    adminNotes.value = result.adminNotes || '';
    
    // Load new order if exists
    if (result.newOrderId) {
      await loadNewOrder(result.newOrderId);
    }
  } catch (error: any) {
    console.error('Error loading refund details:', error);
    toast.error(error.message || 'Lỗi tải dữ liệu yêu cầu đổi vé');
    router.push('/orders/ticket-exchanges');
  } finally {
    console.log('Setting isLoading to false');
    isLoading.value = false;
  }
};

// Load new order details
const loadNewOrder = async (orderId: number) => {
  try {
    const result = await trpc.order.admin.getOrderById.query(orderId);
    newOrder.value = result;
  } catch (error: any) {
    console.error('Error loading new order details:', error);
    toast.error('Lỗi tải thông tin đơn hàng mới');
  }
};

// Show new order details
const showNewOrderDetails = () => {
  if (refund.value?.newOrderId) {
    router.push(`/orders/${refund.value.newOrderId}`);
  } else {
    showNewOrder.value = true;
  }
};

// Update refund status
const updateStatus = async () => {
  if (!refundId.value || !newStatus.value || isUpdating.value) return;
  
  isUpdating.value = true;
  try {
    await trpc.order.admin.updateRefundStatus.mutate({
      id: refundId.value,
      status: newStatus.value,
      adminNotes: adminNotes.value
    });
    
    toast.success('Cập nhật trạng thái thành công');
    
    // Reload data (to get newOrderId if created)
    await loadRefundDetails();
  } catch (error: any) {
    console.error('Error updating refund status:', error);
    toast.error(error.message || 'Lỗi cập nhật trạng thái');
  } finally {
    isUpdating.value = false;
  }
};

// Confirm status update
const confirmStatusUpdate = () => {
  if (!newStatus.value || !refund.value) {
    console.log('Cannot update status: newStatus or refund is missing', { 
      newStatus: newStatus.value, 
      hasRefund: !!refund.value 
    });
    return;
  }
  
  const statusLabel = getStatusLabel(newStatus.value);
  let message = `Bạn có chắc chắn muốn cập nhật trạng thái thành "${statusLabel}" không?`;
  
  // Thêm thông báo đặc biệt khi duyệt đổi vé
  if (newStatus.value === RefundStatus.APPROVED && refund.value.refundType === RefundType.RESCHEDULE) {
    message = `Khi bạn duyệt yêu cầu đổi vé, hệ thống sẽ tự động tạo một đơn hàng mới với vé có ngày mới. Bạn có muốn tiếp tục không?`;
  }
  
  confirm.show({
    title: 'Xác nhận cập nhật trạng thái',
    message,
    confirmText: 'Xác nhận',
    onConfirm: updateStatus
  });
};

// Go back to list
const goBack = () => {
  router.push('/orders/ticket-exchanges');
};

// Refresh data
const refreshData = () => {
  loadRefundDetails();
};

// Lifecycle hooks
onMounted(() => {
  loadRefundDetails();
});

// Watch for changes to refundId
watch(refundId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadRefundDetails();
  }
});
</script>

<template>
  <div>
    <PageHeader
      title="Chi tiết yêu cầu đổi vé"
      :description="refund?.refundCode ? `Mã yêu cầu: ${refund.refundCode}` : 'Đang tải dữ liệu...'"
    >
      <template #actions>
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft class="h-4 w-4 mr-2" />
          Quay lại
        </button>
        <button v-for="action in getAvailableActions" :key="action.label"
          @click="action.action"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <component :is="action.icon" class="h-4 w-4 mr-2" />
          {{ action.label }}
        </button>
        <button
          @click="refreshData"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Làm mới
        </button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>

    <div v-else-if="!refund" class="bg-white rounded-lg shadow p-6 my-6">
      <p class="text-center text-gray-500">Không tìm thấy thông tin yêu cầu đổi vé</p>
    </div>

    <div v-else class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Thông tin yêu cầu đổi vé -->
      <div class="bg-white rounded-lg shadow p-6 col-span-2">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <Ticket class="h-5 w-5 text-indigo-500 mr-2" />
          Thông tin yêu cầu đổi vé
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">Mã yêu cầu</p>
            <p class="font-medium">{{ refund?.refundCode || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Mã đơn hàng</p>
            <p class="font-medium">{{ refund?.order?.orderCode || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Loại đổi/trả</p>
            <p class="font-medium">{{ refund?.refundType ? getRefundTypeLabel(refund.refundType) : 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Ngày yêu cầu</p>
            <p class="font-medium">{{ refund?.createdAt ? formatDate(refund.createdAt) : 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Trạng thái</p>
            <div class="flex items-center" v-if="refund?.status">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-1"
                :class="getStatusColor(refund.status)"
              >
                <component :is="getStatusIcon(refund.status)" class="h-3.5 w-3.5 mr-1" />
                {{ getStatusLabel(refund.status) }}
              </span>
            </div>
            <p v-else>N/A</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Lý do đổi/trả</p>
            <p class="font-medium">{{ refund?.refundReason ? getRefundReasonLabel(refund.refundReason) : 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Số tiền hoàn trả</p>
            <p class="font-medium">{{ formatCurrency(refund?.refundAmount || 0) }}</p>
          </div>
          <div v-if="hasNewOrder">
            <p class="text-sm text-gray-500">Mã đơn mới</p>
            <p class="font-medium flex items-center text-indigo-600">
              <Calendar class="h-4 w-4 mr-1" />
              {{ newOrder?.orderCode || refund?.newOrderId }}
            </p>
          </div>
        </div>
        
        <div class="mb-6">
          <p class="text-sm text-gray-500 mb-1">Ghi chú của khách hàng</p>
          <div class="p-3 bg-gray-50 rounded border border-gray-200">
            <p class="text-sm">{{ refund?.details || 'Không có ghi chú' }}</p>
          </div>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 mb-1">Ghi chú của admin</p>
          <div class="p-3 bg-gray-50 rounded border border-gray-200">
            <p class="text-sm">{{ refund?.adminNotes || 'Không có ghi chú' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Thông tin đơn hàng -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
        
        <div v-if="refund?.order" class="mb-6">
          <div class="mb-4">
            <p class="text-sm text-gray-500">Mã đơn hàng</p>
            <p class="font-medium">{{ refund.order.orderCode }}</p>
          </div>
          <div class="mb-4">
            <p class="text-sm text-gray-500">Tổng tiền</p>
            <p class="font-medium">{{ formatCurrency(refund.order.totalAmount) }}</p>
          </div>
          <div class="mb-4">
            <p class="text-sm text-gray-500">Khách hàng</p>
            <p class="font-medium">{{ refund.order.customerName }}</p>
            <p class="text-sm text-gray-500">{{ refund.order.phoneCode }} {{ refund.order.phoneNumber }}</p>
            <p class="text-sm text-gray-500">{{ refund.order.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Ngày đặt hàng</p>
            <p class="font-medium">{{ formatDate(refund.order.createdAt) }}</p>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          Không tìm thấy thông tin đơn hàng
        </div>
      </div>
      
      <!-- Vé cần đổi -->
      <div v-if="refund?.items?.length" class="bg-white rounded-lg shadow p-6 col-span-3">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <Calendar class="h-5 w-5 text-indigo-500 mr-2" />
          Vé cần đổi
        </h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn giá
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày cũ
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày mới
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in refund?.items || []" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    {{ item.orderItem?.product?.translations?.find((t: any) => t.locale === 'vi')?.title || 
                       item.orderItem?.product?.title || 
                       'Sản phẩm không xác định' }}
                  </div>
                  <div v-if="item.orderItem?.variantName" class="text-xs text-gray-500">
                    {{ item.orderItem.variantName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(item.orderItem?.unitPrice) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="item.orderItem?.travelDate" class="text-gray-700">
                    {{ formatDateOnly(item.orderItem.travelDate) }}
                  </div>
                  <div v-else>–</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="item.newDate" class="text-green-700 font-medium flex items-center">
                    <Calendar class="h-4 w-4 mr-1" />
                    {{ formatDateOnly(item.newDate) }}
                  </div>
                  <div v-else class="text-red-500">Chưa có ngày mới</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Cập nhật trạng thái -->
      <div class="bg-white rounded-lg shadow p-6 col-span-3">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <ShieldAlert class="h-5 w-5 text-indigo-500 mr-2" />
          Cập nhật trạng thái
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái mới</label>
            <select
              v-model="newStatus"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              :disabled="!canUpdateStatus"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p v-if="!canUpdateStatus && (refund?.status === RefundStatus.COMPLETED || refund?.status === RefundStatus.CANCELLED)" class="mt-1 text-sm text-red-500">
              Không thể cập nhật trạng thái khi đã hoàn tất hoặc đã hủy
            </p>
            <p v-else-if="!canUpdateStatus && refund?.refundType === RefundType.RESCHEDULE && refund?.status === RefundStatus.APPROVED && refund?.newOrderId" class="mt-1 text-sm text-red-500">
              Không thể thay đổi trạng thái vì đã duyệt đổi vé và tạo đơn hàng mới
            </p>
            
            <div v-if="refund?.refundType === RefundType.RESCHEDULE && newStatus === RefundStatus.APPROVED" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p class="text-sm text-blue-800">
                <AlertTriangle class="h-4 w-4 inline-block mr-1" />
                Khi duyệt đổi vé, hệ thống sẽ tự động tạo một đơn hàng mới với vé có ngày mới.
              </p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú của admin</label>
            <textarea
              v-model="adminNotes"
              rows="4"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              :disabled="!canUpdateStatus"
              placeholder="Nhập ghi chú của admin"
            ></textarea>
          </div>
        </div>
        
        <div class="mt-4 flex justify-end">
          <button
            @click="confirmStatusUpdate"
            :disabled="!canUpdateStatus || isUpdating || !newStatus"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save class="h-4 w-4 mr-2" />
            <span v-if="isUpdating">Đang cập nhật...</span>
            <span v-else>Cập nhật trạng thái</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 