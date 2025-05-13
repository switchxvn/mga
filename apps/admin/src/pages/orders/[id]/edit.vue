<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useTrpc } from "../../../composables/useTrpc";
import { useRoute, useRouter } from "vue-router";
import { 
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline';
import {
  PackageIcon,
  SaveIcon,
  XIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import PageHeader from '../../../components/common/header/PageHeader.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

// Define OrderStatus and PaymentStatus enums to match backend
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

interface Address {
  city: string;
  country: string;
  line1: string;
  line2?: string;
  postal_code: string;
  state: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: any;
  createdAt: string;
  updatedAt: string;
  product?: any;
}

interface Order {
  id: number;
  orderCode: string;
  userId?: string;
  phoneCode: string;
  phoneNumber: string;
  email?: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();
const { checkAuth } = useAuth();
const trpc = useTrpc();

const orderId = ref<number>(parseInt(route.params.id as string));
const originalOrder = ref<Order | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isSaving = ref(false);
const paymentMethods = ref<Array<{id: number, name: string, code: string}>>([]);

// Form data
const formData = ref({
  customerName: '',
  email: '',
  phoneCode: '',
  phoneNumber: '',
  status: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.PENDING,
  paymentMethod: '',
  notes: '',
  
  // Shipping address
  shippingAddress: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  },
  
  // Billing address
  billingAddress: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  }
});

// Set page title dynamically
useHead({
  title: () => `Edit Order #${orderId.value} - Admin Panel`
});

// Format address for display
const formatAddress = (address: Address | undefined): string => {
  if (!address) return 'No address provided';
  
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postal_code}`,
    address.country
  ].filter(part => part); // Remove empty parts
  
  return parts.join(', ');
};

// Fetch order details
const fetchOrderDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const data = await trpc.admin.order.getOrderById.query(orderId.value);
    console.log('Order details:', data);
    
    if (data) {
      originalOrder.value = data;
      // Initialize form data with order values
      formData.value = {
        customerName: data.customerName || '',
        email: data.email || '',
        phoneCode: data.phoneCode || '',
        phoneNumber: data.phoneNumber || '',
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod || '',
        notes: data.notes || '',
        
        // Shipping address
        shippingAddress: data.shippingAddress ? {
          line1: data.shippingAddress.line1 || '',
          line2: data.shippingAddress.line2 || '',
          city: data.shippingAddress.city || '',
          state: data.shippingAddress.state || '',
          postal_code: data.shippingAddress.postal_code || '',
          country: data.shippingAddress.country || ''
        } : {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        },
        
        // Billing address
        billingAddress: data.billingAddress ? {
          line1: data.billingAddress.line1 || '',
          line2: data.billingAddress.line2 || '',
          city: data.billingAddress.city || '',
          state: data.billingAddress.state || '',
          postal_code: data.billingAddress.postal_code || '',
          country: data.billingAddress.country || ''
        } : {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        }
      };
    } else {
      error.value = 'Order not found';
    }
  } catch (err: any) {
    console.error('Error fetching order details:', err);
    error.value = err.message || 'Failed to fetch order details';
  } finally {
    isLoading.value = false;
  }
};

// Fetch payment methods
const fetchPaymentMethods = async () => {
  try {
    const methods = await trpc.admin.payment.getActivePaymentMethods.query();
    paymentMethods.value = methods;
  } catch (err: any) {
    console.error('Error fetching payment methods:', err);
  }
};

// Get payment method name by code
const getPaymentMethodName = (code: string): string => {
  const method = paymentMethods.value.find(m => m.code === code);
  return method ? method.name : code;
};

// Submit form
const saveOrder = async () => {
  try {
    isSaving.value = true;
    
    // Cập nhật toàn bộ thông tin đơn hàng một lúc
    await trpc.admin.order.updateOrderDetails.mutate({
      id: orderId.value,
      customerName: formData.value.customerName,
      email: formData.value.email,
      phoneCode: formData.value.phoneCode,
      phoneNumber: formData.value.phoneNumber,
      notes: formData.value.notes,
      shippingAddress: formData.value.shippingAddress,
      billingAddress: formData.value.billingAddress,
      paymentMethod: formData.value.paymentMethod
    });
    
    // Nếu orderStatus hoặc paymentStatus thay đổi, chúng vẫn cần được cập nhật riêng
    if (originalOrder.value?.status !== formData.value.status) {
      await trpc.admin.order.updateOrderStatus.mutate({
        id: orderId.value,
        status: formData.value.status
      });
    }
    
    // Cập nhật paymentStatus nếu thay đổi
    if (originalOrder.value?.paymentStatus !== formData.value.paymentStatus) {
      await trpc.admin.order.updatePaymentStatus.mutate({
        id: orderId.value,
        paymentStatus: formData.value.paymentStatus
      });
    }
    
    // Show success message
    Swal.fire({
      title: 'Success!',
      text: 'Order has been updated.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    });
    
    // Navigate back to order details
    router.push(`/orders/${orderId.value}`);
  } catch (err: any) {
    console.error('Error saving order:', err);
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to update order',
      icon: 'error',
      confirmButtonColor: '#4f46e5'
    });
  } finally {
    isSaving.value = false;
  }
};

// Cancel editing
const cancelEdit = () => {
  router.push(`/orders/${orderId.value}`);
};

onMounted(async () => {
  await checkAuth();
  await fetchOrderDetails();
  await fetchPaymentMethods();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      :title="`Edit Order ${originalOrder?.orderCode ? `#${originalOrder.orderCode}` : ''}`"
      description="Modify order information"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <button
            @click="cancelEdit"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <XIcon class="h-4 w-4 mr-2" />
            Cancel
          </button>
          
          <button
            @click="saveOrder"
            :disabled="isSaving"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon class="h-4 w-4 mr-2" />
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading order details</h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button
              @click="router.push('/orders')"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order edit form -->
    <div v-else-if="originalOrder" class="space-y-6">
      <!-- Order Information -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Order Information</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            ID: {{ originalOrder.id }} | Created on: {{ new Date(originalOrder.createdAt).toLocaleString() }}
          </p>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Customer Name -->
            <div class="sm:col-span-3">
              <label for="customer-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="customer-name"
                  v-model="formData.customerName"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Customer name"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="sm:col-span-3">
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div class="mt-1">
                <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <!-- Phone Code -->
            <div class="sm:col-span-2">
              <label for="phone-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Code</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="phone-code"
                  v-model="formData.phoneCode"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+84"
                />
              </div>
            </div>

            <!-- Phone Number -->
            <div class="sm:col-span-4">
              <label for="phone-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="phone-number"
                  v-model="formData.phoneNumber"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <!-- Payment Method -->
            <div class="sm:col-span-3">
              <label for="payment-method" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
              <div class="mt-1">
                <select
                  id="payment-method"
                  v-model="formData.paymentMethod"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option v-for="method in paymentMethods" :key="method.id" :value="method.code">
                    {{ method.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Status -->
            <div class="sm:col-span-3">
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Status</label>
              <div class="mt-1">
                <select
                  id="status"
                  v-model="formData.status"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option v-for="status in Object.values(OrderStatus)" :key="status" :value="status">
                    {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="sm:col-span-3">
              <label for="payment-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
              <div class="mt-1">
                <select
                  id="payment-status"
                  v-model="formData.paymentStatus"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option v-for="status in Object.values(PaymentStatus)" :key="status" :value="status">
                    {{ status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div class="sm:col-span-6">
              <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <div class="mt-1">
                <textarea
                  id="notes"
                  v-model="formData.notes"
                  rows="3"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Order notes"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Shipping Address</h3>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Address Line 1 -->
            <div class="sm:col-span-6">
              <label for="shipping-line1" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="shipping-line1"
                  v-model="formData.shippingAddress.line1"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Street address or P.O. box"
                />
              </div>
            </div>

            <!-- Address Line 2 -->
            <div class="sm:col-span-6">
              <label for="shipping-line2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="shipping-line2"
                  v-model="formData.shippingAddress.line2"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Apt, suite, unit, building, floor, etc."
                />
              </div>
            </div>

            <!-- City -->
            <div class="sm:col-span-2">
              <label for="shipping-city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="shipping-city"
                  v-model="formData.shippingAddress.city"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="City"
                />
              </div>
            </div>

            <!-- State -->
            <div class="sm:col-span-2">
              <label for="shipping-state" class="block text-sm font-medium text-gray-700 dark:text-gray-300">State / Province</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="shipping-state"
                  v-model="formData.shippingAddress.state"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="State/Province"
                />
              </div>
            </div>

            <!-- Postal Code -->
            <div class="sm:col-span-2">
              <label for="shipping-postal-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP / Postal Code</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="shipping-postal-code"
                  v-model="formData.shippingAddress.postal_code"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="ZIP/Postal code"
                />
              </div>
            </div>

            <!-- Country -->
            <div class="sm:col-span-3">
              <label for="shipping-country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="shipping-country"
                  v-model="formData.shippingAddress.country"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Address -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Billing Address</h3>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Address Line 1 -->
            <div class="sm:col-span-6">
              <label for="billing-line1" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="billing-line1"
                  v-model="formData.billingAddress.line1"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Street address or P.O. box"
                />
              </div>
            </div>

            <!-- Address Line 2 -->
            <div class="sm:col-span-6">
              <label for="billing-line2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="billing-line2"
                  v-model="formData.billingAddress.line2"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Apt, suite, unit, building, floor, etc."
                />
              </div>
            </div>

            <!-- City -->
            <div class="sm:col-span-2">
              <label for="billing-city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="billing-city"
                  v-model="formData.billingAddress.city"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="City"
                />
              </div>
            </div>

            <!-- State -->
            <div class="sm:col-span-2">
              <label for="billing-state" class="block text-sm font-medium text-gray-700 dark:text-gray-300">State / Province</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="billing-state"
                  v-model="formData.billingAddress.state"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="State/Province"
                />
              </div>
            </div>

            <!-- Postal Code -->
            <div class="sm:col-span-2">
              <label for="billing-postal-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP / Postal Code</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="billing-postal-code"
                  v-model="formData.billingAddress.postal_code"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="ZIP/Postal code"
                />
              </div>
            </div>

            <!-- Country -->
            <div class="sm:col-span-3">
              <label for="billing-country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="billing-country"
                  v-model="formData.billingAddress.country"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items (Read-only) -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <PackageIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Order Items</h3>
          </div>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Order items cannot be modified from this screen
          </p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in originalOrder.items" :key="item.id">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded">
                      <img 
                        v-if="item.productSnapshot?.images?.length" 
                        :src="item.productSnapshot.images[0]" 
                        class="h-10 w-10 object-cover rounded"
                        alt=""
                      />
                      <div v-else class="flex items-center justify-center h-full w-full">
                        <PackageIcon class="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ item.productSnapshot?.title || `Product #${item.productId}` }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        ID: {{ item.productId }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                  {{ typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : item.unitPrice }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                  {{ typeof item.totalPrice === 'number' ? item.totalPrice.toFixed(2) : item.totalPrice }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right" colspan="3">
                  Total:
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                  {{ typeof originalOrder.totalAmount === 'number' ? originalOrder.totalAmount.toFixed(2) : originalOrder.totalAmount }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="cancelEdit"
          class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="saveOrder"
          :disabled="isSaving"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg p-10 text-center">
      <PackageIcon class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Order not found</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        The order you are trying to edit does not exist or has been deleted.
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/orders"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon class="-ml-1 mr-2 h-5 w-5" />
          Back to Orders
        </NuxtLink>
      </div>
    </div>
  </div>
</template> 