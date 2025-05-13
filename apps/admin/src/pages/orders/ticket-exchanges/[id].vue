<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useTrpc } from '../../../composables/useTrpc';
import { useToast } from '../../../composables/useToast';
import { useConfirm } from '../../../composables/useConfirm';
import { useRoute, useRouter } from 'vue-router';
import { RefundStatus, RefundType, RefundReason, OrderType } from '@ew/shared';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import { Ticket, ArrowLeft, Check, X, Save, AlertTriangle, ShieldAlert, RefreshCw, Calendar, FileCheck, Clock, CircleX, CircleCheck } from 'lucide-vue-next';

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

// Thêm hàm để lấy icon và màu sắc cho mỗi button trạng thái
const getStatusButtonConfig = (status: RefundStatus) => {
  const configs = {
    [RefundStatus.PENDING]: {
      icon: Clock,
      color: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      textColor: 'text-white'
    },
    [RefundStatus.APPROVED]: {
      icon: CircleCheck,
      color: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      textColor: 'text-white'
    },
    [RefundStatus.REJECTED]: {
      icon: CircleX,
      color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      textColor: 'text-white'
    },
    [RefundStatus.PROCESSING]: {
      icon: RefreshCw,
      color: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      textColor: 'text-white'
    },
    [RefundStatus.COMPLETED]: {
      icon: FileCheck,
      color: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      textColor: 'text-white'
    },
    [RefundStatus.CANCELLED]: {
      icon: X,
      color: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
      textColor: 'text-white'
    }
  };
  return configs[status] || configs[RefundStatus.PENDING];
};

// Lọc các trạng thái có thể cập nhật dựa trên trạng thái hiện tại
const availableStatuses = computed(() => {
  if (!refund.value || !canUpdateStatus.value) return [];
  
  const currentStatus = refund.value.status;
  
  // Các trạng thái có thể chuyển đổi từ PENDING
  if (currentStatus === RefundStatus.PENDING) {
    return [RefundStatus.APPROVED, RefundStatus.REJECTED, RefundStatus.PROCESSING];
  }
  
  // Các trạng thái có thể chuyển đổi từ PROCESSING
  if (currentStatus === RefundStatus.PROCESSING) {
    return [RefundStatus.COMPLETED, RefundStatus.CANCELLED];
  }
  
  // Các trạng thái có thể chuyển đổi từ APPROVED
  if (currentStatus === RefundStatus.APPROVED) {
    return [RefundStatus.PROCESSING, RefundStatus.COMPLETED, RefundStatus.CANCELLED];
  }
  
  // Nếu trạng thái hiện tại đã là COMPLETED hoặc CANCELLED, không còn trạng thái nào có thể chuyển
  return [];
});

// Methods
const getStatusLabel = (status: RefundStatus) => {
  const statusMap: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'Đang chờ xử lý',
    [RefundStatus.APPROVED]: 'Duyệt',
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
const updateStatus = async (statusToUpdate: RefundStatus) => {
  if (!refundId.value || isUpdating.value) return;
  
  isUpdating.value = true;
  try {
    await trpc.order.admin.updateRefundStatus.mutate({
      id: refundId.value,
      status: statusToUpdate,
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
const confirmStatusUpdate = (statusToUpdate: RefundStatus) => {
  if (!refund.value) {
    console.log('Cannot update status: refund is missing');
    return;
  }
  
  const statusLabel = getStatusLabel(statusToUpdate);
  let message = `Bạn có chắc chắn muốn cập nhật trạng thái thành "${statusLabel}" không?`;
  
  // Thêm thông báo đặc biệt khi duyệt đổi vé
  if (statusToUpdate === RefundStatus.APPROVED && refund.value.refundType === RefundType.RESCHEDULE) {
    message = `Khi bạn duyệt yêu cầu đổi vé, hệ thống sẽ tự động tạo một đơn hàng mới với vé có ngày mới. Bạn có muốn tiếp tục không?`;
  }
  
  confirm.show({
    title: 'Xác nhận cập nhật trạng thái',
    message,
    confirmText: 'Xác nhận',
    onConfirm: () => updateStatus(statusToUpdate)
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
          Thông tin vé cần đổi
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
                  Ngày/Vé cũ
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày/Vé mới
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in refund?.items || []" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="font-medium">
                    {{ item.orderItem?.product?.translations?.find((t: any) => t.locale === 'vi')?.title || 
                       item.orderItem?.product?.title || 
                       item.orderItem?.productSnapshot?.translations?.find((t: any) => t.locale === 'vi')?.title ||
                       item.orderItem?.productSnapshot?.title ||
                       'Sản phẩm không xác định' }}
                  </div>
                  
                  <!-- Variant Info - Làm nổi bật hơn -->
                  <div v-if="item.orderItem?.variantName || item.orderItem?.productSnapshot?.variant?.name" 
                    class="mt-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded inline-flex items-center">
                    <span class="text-xs font-medium text-indigo-700">
                      {{ item.orderItem?.variantName || item.orderItem?.productSnapshot?.variant?.name }}
                    </span>
                  </div>
                  
                  <div v-if="item.orderItem?.productCode" class="text-xs text-gray-500 mt-1">
                    Mã: {{ item.orderItem.productCode }}
                  </div>
                  <div v-if="item.orderItem?.productType" class="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium"
                    :class="{
                      'bg-blue-100 text-blue-800': item.orderItem.productType === 'TICKET',
                      'bg-green-100 text-green-800': item.orderItem.productType === 'PHYSICAL',
                      'bg-purple-100 text-purple-800': item.orderItem.productType === 'DIGITAL'
                    }">
                    {{ item.orderItem.productType === 'TICKET' ? 'Vé' : 
                      item.orderItem.productType === 'PHYSICAL' ? 'Sản phẩm vật lý' : 'Sản phẩm số' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="font-medium">{{ formatCurrency(item.orderItem?.unitPrice || item.orderItem?.productSnapshot?.variant?.price || 0) }}</div>
                  <div v-if="item.orderItem?.productSnapshot?.variant?.price && item.orderItem?.unitPrice !== item.orderItem?.productSnapshot?.variant?.price" 
                    class="text-xs text-gray-500 mt-1">
                    Giá gốc: {{ formatCurrency(item.orderItem?.productSnapshot?.variant?.price) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="font-medium">{{ item.quantity }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="item.orderItem?.travelDate" class="font-medium flex items-center">
                    <Calendar class="h-4 w-4 mr-1 text-blue-600" />
                    <span class="text-blue-600">{{ formatDateOnly(item.orderItem.travelDate) }}</span>
                  </div>
                  <div v-if="item.orderItem?.ticketCode" class="text-xs text-gray-600 mt-1">
                    Mã vé: {{ item.orderItem.ticketCode }}
                  </div>
                  <div v-else-if="item.orderItem?.productCode && item.orderItem?.productType === 'TICKET'" class="text-xs text-gray-600 mt-1">
                    Mã vé: {{ item.orderItem.productCode }}
                  </div>
                  <div v-if="item.orderItem?.seatInfo" class="text-xs text-gray-600 mt-1 px-2 py-0.5 bg-gray-100 rounded inline-block">
                    Ghế: <span class="font-medium">{{ item.orderItem.seatInfo }}</span>
                  </div>
                  <div v-if="item.orderItem?.qrCode" class="text-xs text-gray-600 mt-1">
                    QR Code: {{ item.orderItem.qrCode?.substring(0, 8) }}...
                  </div>
                  <div v-if="item.orderItem?.isUsed" class="text-xs text-red-600 mt-1 font-medium">
                    ĐÃ SỬ DỤNG
                  </div>
                  <div v-if="!item.orderItem?.travelDate && item.orderItem?.productType === 'TICKET'">Chưa có ngày</div>
                  <div v-if="item.orderItem?.productType !== 'TICKET'" class="text-xs text-gray-500">Không áp dụng</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="item.newDate" class="font-medium flex items-center">
                    <Calendar class="h-4 w-4 mr-1 text-green-600" />
                    <span class="text-green-600">{{ formatDateOnly(item.newDate) }}</span>
                  </div>
                  <div v-if="item.newTicketCode" class="text-xs text-green-600 mt-1">
                    Mã vé mới: <span class="font-medium">{{ item.newTicketCode }}</span>
                  </div>
                  <div v-if="item.newSeatInfo" class="text-xs text-green-600 mt-1 px-2 py-0.5 bg-green-50 rounded inline-block">
                    Ghế mới: <span class="font-medium">{{ item.newSeatInfo }}</span>
                  </div>
                  <div v-if="!item.newDate" class="text-red-500">Chưa có ngày mới</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <AlertTriangle class="h-4 w-4 mr-1 text-amber-500" />
            Thông tin bổ sung
          </h3>
          <ul class="ml-5 list-disc text-sm text-gray-600 space-y-1">
            <li v-if="refund?.refundType === RefundType.RESCHEDULE">
              Yêu cầu đổi vé với ngày/lịch trình mới
            </li>
            <li v-if="refund?.refundType === RefundType.PRODUCT_EXCHANGE">
              Yêu cầu đổi sản phẩm/vé khác
            </li>
            <li v-if="refund?.refundReason">
              Lý do: <span class="font-medium">{{ getRefundReasonLabel(refund.refundReason) }}</span>
            </li>
            <li v-if="refund?.order?.orderType">
              Loại đơn hàng: <span class="font-medium">{{ refund.order.orderType }}</span>
            </li>
            <li v-if="refund?.order?.exchangeForOrderId">
              Đơn hàng trao đổi từ: <span class="font-medium">#{{ refund.order.exchangeForOrderId }}</span>
            </li>
            <li v-if="refund?.order?.paymentMethod">
              Phương thức thanh toán: <span class="font-medium">{{ refund.order.paymentMethod }}</span>
            </li>
            <li v-if="refund?.order?.paymentStatus">
              Trạng thái thanh toán: <span class="font-medium">{{ refund.order.paymentStatus }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Cập nhật trạng thái -->
      <div class="bg-white rounded-lg shadow p-6 col-span-3">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <ShieldAlert class="h-5 w-5 text-indigo-500 mr-2" />
          Cập nhật trạng thái
        </h2>
        
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Chọn trạng thái mới</label>
            
            <div v-if="!canUpdateStatus" class="text-sm text-red-500 mb-3">
              <p v-if="refund?.status === RefundStatus.COMPLETED || refund?.status === RefundStatus.CANCELLED">
                Không thể cập nhật trạng thái khi đã hoàn tất hoặc đã hủy
              </p>
              <p v-else-if="refund?.refundType === RefundType.RESCHEDULE && refund?.status === RefundStatus.APPROVED && refund?.newOrderId">
                Không thể thay đổi trạng thái vì đã duyệt đổi vé và tạo đơn hàng mới
              </p>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <button
                v-for="status in availableStatuses"
                :key="status"
                @click="confirmStatusUpdate(status)"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 relative"
                :class="[getStatusButtonConfig(status).color, getStatusButtonConfig(status).textColor]"
                :disabled="isUpdating"
              >
                <div v-if="isUpdating" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <component :is="getStatusButtonConfig(status).icon" class="h-4 w-4 mr-2" />
                {{ getStatusLabel(status) }}
              </button>
            </div>
            
            <div v-if="refund?.refundType === RefundType.RESCHEDULE && availableStatuses.includes(RefundStatus.APPROVED)" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
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
              :disabled="!canUpdateStatus || isUpdating"
              placeholder="Nhập ghi chú của admin"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 