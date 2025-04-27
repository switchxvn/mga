<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import { useNotification } from '~/composables/useNotification';
import { RefundReason, RefundType, ProductType, Order } from '@ew/shared';
import PhoneInput from '~/components/form/PhoneInput.vue';
import { useRoute, useRouter } from 'vue-router';

const { t } = useLocalization();
const trpc = useTrpc();
const notification = useNotification();
const route = useRoute();
const router = useRouter();

// Trạng thái
const step = ref(1);
const isLoading = ref(false);
const isSubmitting = ref(false);
const order = ref<Order | null>(null);
const hotlineNumber = ref('');
const orderItems = ref<any[]>([]);
const selectedItems = ref<{orderItemId: number, quantity: number, reason?: string}[]>([]);

// Form data
const orderLookupForm = reactive({
  orderCode: '',
  phoneNumber: '',
  phoneCode: '+84',
});

const refundForm = reactive({
  requesterName: '',
  requesterPhone: '',
  requesterPhoneCode: '+84',
  requesterEmail: '',
  refundReason: '' as RefundReason,
  refundType: '' as RefundType,
  details: '',
  items: [] as { orderItemId: number, quantity: number, reason?: string }[]
});

// Computed
const canProceedToRefund = computed(() => {
  return order.value && orderItems.value && orderItems.value.length > 0;
});

const canSubmitRefund = computed(() => {
  return refundForm.requesterName && 
         refundForm.requesterPhone && 
         refundForm.refundReason && 
         refundForm.refundType && 
         selectedItems.value.length > 0;
});

const refundReasons = [
  { label: 'Đổi ý/Không hài lòng', value: RefundReason.CHANGE_MIND },
  { label: 'Sản phẩm lỗi', value: RefundReason.PRODUCT_DEFECT },
  { label: 'Sản phẩm không đúng mô tả', value: RefundReason.WRONG_PRODUCT },
  { label: 'Cần thay đổi lịch', value: RefundReason.SCHEDULE_CHANGE },
  { label: 'Lý do khác', value: RefundReason.OTHER },
];

const refundTypes = [
  { label: 'Hoàn tiền', value: RefundType.MONEY_REFUND },
  { label: 'Đổi lịch (đối với vé)', value: RefundType.RESCHEDULE },
  { label: 'Đổi sản phẩm', value: RefundType.PRODUCT_EXCHANGE },
  { label: 'Tín dụng cửa hàng', value: RefundType.STORE_CREDIT },
];

// Xử lý URL params
const updateUrlParams = () => {
  if (step.value === 1) {
    router.replace({ query: {} });
  } else if (step.value === 2 && order.value) {
    router.replace({
      query: {
        step: '2',
        orderCode: orderLookupForm.orderCode,
        phoneNumber: orderLookupForm.phoneNumber,
        phoneCode: orderLookupForm.phoneCode
      }
    });
  } else if (step.value === 3) {
    router.replace({
      query: { 
        step: '3'
      }
    });
  }
};

// Khôi phục trạng thái từ URL
const restoreFromUrl = async () => {
  const { step: urlStep, orderCode, phoneNumber, phoneCode } = route.query;
  
  if (urlStep === '2' && orderCode && phoneNumber) {
    step.value = 1; // Tạm đặt step = 1 để hiển thị loading
    orderLookupForm.orderCode = orderCode as string;
    orderLookupForm.phoneNumber = phoneNumber as string;
    orderLookupForm.phoneCode = (phoneCode as string) || '+84';
    
    await validateOrder();
  } else if (urlStep === '3') {
    step.value = 3;
  }
};

// Theo dõi thay đổi step để cập nhật URL
watch(() => step.value, () => {
  updateUrlParams();
});

// Phương thức
const fetchHotline = async () => {
  try {
    const setting = await trpc.settings.getPublicSettingByKey.query('hotline');
    if (setting?.value) {
      hotlineNumber.value = setting.value;
    }
  } catch (error) {
    console.error('Error fetching hotline number:', error);
  }
};

const validateOrder = async () => {
  if (!orderLookupForm.orderCode || !orderLookupForm.phoneNumber) {
    notification.error({ title: 'Vui lòng nhập đầy đủ thông tin' });
    return;
  }

  isLoading.value = true;
  try {
    const result = await trpc.order.validateOrder.query({
      orderCode: orderLookupForm.orderCode,
      phoneNumber: orderLookupForm.phoneNumber
    });
    
    order.value = result;
    orderItems.value = result.items.map(item => ({
      ...item,
      selected: false,
      refundQuantity: 1,
      reason: '',
      variantName: item.productSnapshot?.variant?.name || '',
      productName: getLocalizedName(item.productSnapshot)
    }));
    
    // Tự động điền thông tin người yêu cầu
    refundForm.requesterName = result.shippingAddress?.fullName || '';
    refundForm.requesterPhone = result.phoneNumber;
    refundForm.requesterPhoneCode = result.phoneCode || '+84';
    refundForm.requesterEmail = result.email || '';
    
    step.value = 2;
    updateUrlParams(); // Cập nhật URL sau khi chuyển step
  } catch (error) {
    console.error('Error validating order:', error);
    notification.error({ 
      title: 'Không tìm thấy đơn hàng', 
      description: 'Vui lòng kiểm tra lại mã đơn hàng và số điện thoại' 
    });
  } finally {
    isLoading.value = false;
  }
};

const getLocalizedName = (productSnapshot) => {
  if (!productSnapshot) return 'Sản phẩm không xác định';
  
  const viTranslation = productSnapshot.translations?.find(t => t.locale === 'vi');
  return viTranslation?.title || productSnapshot.title || 'Sản phẩm không xác định';
};

const toggleProductSelection = (item: any) => {
  item.selected = !item.selected;
  updateSelectedItems();
};

const updateItemQuantity = (item, value) => {
  if (value > 0 && value <= item.quantity) {
    item.refundQuantity = value;
    updateSelectedItems();
  }
};

const updateSelectedItems = () => {
  selectedItems.value = orderItems.value
    .filter(item => item.selected)
    .map(item => ({
      orderItemId: item.id,
      quantity: item.refundQuantity,
      reason: item.reason
    }));
};

const submitRefundRequest = async () => {
  if (!canSubmitRefund.value || !order.value) {
    notification.error({ title: 'Vui lòng điền đầy đủ thông tin' });
    return;
  }

  isSubmitting.value = true;
  try {
    // Cập nhật lại danh sách sản phẩm hoàn trả từ các item đã chọn
    refundForm.items = selectedItems.value;
    
    const result = await trpc.order.createRefundRequest.mutate({
      orderCode: order.value.orderCode,
      ...refundForm
    });
    
    notification.success({ 
      title: 'Yêu cầu hoàn trả đã được tạo', 
      description: `Mã yêu cầu hoàn trả của bạn là: ${result.refundCode}` 
    });
    
    step.value = 3;
    updateUrlParams(); // Cập nhật URL sau khi chuyển step
  } catch (error: any) {
    console.error('Error submitting refund request:', error);
    notification.error({ 
      title: 'Không thể tạo yêu cầu hoàn trả', 
      description: error.message || 'Đã xảy ra lỗi, vui lòng thử lại sau' 
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Khởi tạo
onMounted(() => {
  fetchHotline();
  restoreFromUrl();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12 space-y-3">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Yêu cầu hoàn trả đơn hàng
          </h1>
          <div class="w-24 h-1 bg-primary-500 mx-auto rounded-full"></div>
          <p class="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Vui lòng nhập thông tin đơn hàng của bạn để bắt đầu quy trình hoàn trả
          </p>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center">
            <div 
              class="rounded-full h-8 w-8 flex items-center justify-center font-semibold text-white"
              :class="step >= 1 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'"
            >
              1
            </div>
            <div 
              class="h-1 w-12 mx-1"
              :class="step >= 2 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'"
            ></div>
            <div 
              class="rounded-full h-8 w-8 flex items-center justify-center font-semibold text-white"
              :class="step >= 2 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'"
            >
              2
            </div>
            <div 
              class="h-1 w-12 mx-1"
              :class="step >= 3 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'"
            ></div>
            <div 
              class="rounded-full h-8 w-8 flex items-center justify-center font-semibold text-white"
              :class="step >= 3 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'"
            >
              3
            </div>
          </div>
        </div>

        <!-- Step 1: Order Lookup -->
        <div v-if="step === 1" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Thông tin đơn hàng
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mã đơn hàng <span class="text-red-500">*</span>
              </label>
              <input
                v-model="orderLookupForm.orderCode"
                type="text"
                placeholder="Nhập mã đơn hàng của bạn"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại đặt hàng <span class="text-red-500">*</span>
              </label>
              <PhoneInput
                v-model="orderLookupForm.phoneNumber"
                v-model:phoneCode="orderLookupForm.phoneCode"
                placeholder="Nhập số điện thoại khi đặt hàng"
              />
            </div>
            
            <div v-if="hotlineNumber" class="text-sm text-gray-600 dark:text-gray-400 italic">
              Nếu bạn không nhớ thông tin đơn hàng, vui lòng liên hệ hotline: <a :href="`tel:${hotlineNumber}`" class="text-primary-600 dark:text-primary-400 font-medium">{{ hotlineNumber }}</a>
            </div>
          </div>
          
          <div class="mt-6">
            <button
              @click="validateOrder"
              :disabled="isLoading"
              class="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">
                <span class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></span>
                Đang kiểm tra...
              </span>
              <span v-else>Tiếp tục</span>
            </button>
          </div>
        </div>
        
        <!-- Step 2: Refund Form -->
        <div v-else-if="step === 2" class="space-y-6">
          <!-- Order Summary -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin đơn hàng #{{ order?.orderCode }}
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Ngày đặt hàng</p>
                <p class="font-medium">{{ new Date(order?.createdAt).toLocaleDateString('vi-VN') }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Tổng đơn hàng</p>
                <p class="font-medium">{{ Number(order?.totalAmount).toLocaleString('vi-VN') }}đ</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Trạng thái đơn hàng</p>
                <p class="font-medium">{{ order?.status }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Trạng thái thanh toán</p>
                <p class="font-medium">{{ order?.paymentStatus }}</p>
              </div>
            </div>
          </div>
          
          <!-- Select Items to Refund -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Chọn sản phẩm cần hoàn trả
            </h2>
            
            <div class="space-y-4">
              <div v-for="item in orderItems" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div @click="toggleProductSelection(item)" class="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 rounded-md -mx-2">
                  <div class="relative flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      :id="`item-${item.id}`"
                      v-model="item.selected"
                      class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      @click.stop
                    />
                  </div>
                  
                  <div class="flex-grow">
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ item.productName }}
                      <span v-if="item.variantName" class="text-gray-500 dark:text-gray-400">
                        ({{ item.variantName }})
                      </span>
                    </div>
                    
                    <div class="flex flex-wrap items-center gap-4 mt-2">
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Đơn giá: {{ Number(item.unitPrice).toLocaleString('vi-VN') }}đ
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Số lượng: {{ item.quantity }}
                      </p>
                      <p class="text-sm font-medium">
                        Thành tiền: {{ Number(item.totalPrice).toLocaleString('vi-VN') }}đ
                      </p>
                    </div>
                    
                    <div v-if="item.selected" class="mt-3 space-y-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Số lượng cần hoàn trả
                        </label>
                        <div class="flex items-center">
                          <button
                            @click.stop="updateItemQuantity(item, item.refundQuantity - 1)"
                            class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            :disabled="item.refundQuantity <= 1"
                          >-</button>
                          <input
                            type="number"
                            v-model.number="item.refundQuantity"
                            min="1"
                            :max="item.quantity"
                            @input="updateSelectedItems"
                            @click.stop
                            class="w-16 px-2 py-1 text-center border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            @click.stop="updateItemQuantity(item, item.refundQuantity + 1)"
                            class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            :disabled="item.refundQuantity >= item.quantity"
                          >+</button>
                        </div>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Lý do hoàn trả sản phẩm này (tùy chọn)
                        </label>
                        <input
                          type="text"
                          v-model="item.reason"
                          @input="updateSelectedItems"
                          @click.stop
                          placeholder="Lý do cụ thể cho sản phẩm này"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p v-if="selectedItems.length === 0" class="mt-4 text-sm text-amber-600 dark:text-amber-400">
              Vui lòng chọn ít nhất một sản phẩm để hoàn trả
            </p>
          </div>
          
          <!-- Refund Request Details -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin yêu cầu hoàn trả
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ tên người yêu cầu <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="refundForm.requesterName"
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại liên hệ <span class="text-red-500">*</span>
                </label>
                <PhoneInput
                  v-model="refundForm.requesterPhone"
                  v-model:phoneCode="refundForm.requesterPhoneCode"
                  placeholder="Nhập số điện thoại liên hệ"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (tùy chọn)
                </label>
                <input
                  v-model="refundForm.requesterEmail"
                  type="email"
                  placeholder="Nhập email của bạn"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lý do hoàn trả <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="refundForm.refundReason"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="" disabled>Chọn lý do hoàn trả</option>
                  <option v-for="reason in refundReasons" :key="reason.value" :value="reason.value">
                    {{ reason.label }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phương thức hoàn trả <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="refundForm.refundType"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="" disabled>Chọn phương thức hoàn trả</option>
                  <option v-for="type in refundTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chi tiết bổ sung (tùy chọn)
                </label>
                <textarea
                  v-model="refundForm.details"
                  rows="4"
                  placeholder="Nhập thông tin bổ sung cho yêu cầu hoàn trả của bạn"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-wrap gap-4 justify-end">
            <button
              @click="step = 1"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Quay lại
            </button>
            
            <button
              @click="submitRefundRequest"
              :disabled="!canSubmitRefund || isSubmitting"
              class="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">
                <span class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></span>
                Đang xử lý...
              </span>
              <span v-else>Gửi yêu cầu hoàn trả</span>
            </button>
          </div>
        </div>
        
        <!-- Step 3: Confirmation -->
        <div v-else-if="step === 3" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Yêu cầu hoàn trả đã được gửi thành công!
          </h2>
          
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Chúng tôi đã nhận được yêu cầu hoàn trả của bạn và sẽ xử lý trong thời gian sớm nhất. Bạn sẽ được thông báo qua email hoặc số điện thoại đã cung cấp về trạng thái yêu cầu.
          </p>
          
          <div class="flex flex-wrap justify-center gap-4 mt-6">
            <a href="/" class="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Quay lại trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 