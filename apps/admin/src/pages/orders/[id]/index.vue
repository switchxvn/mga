<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useTrpc } from "../../../composables/useTrpc";
import { useRoute, useRouter } from "vue-router";
import { 
  ArrowLeftIcon, 
  PrinterIcon 
} from '@heroicons/vue/24/outline';
import {
  PackageIcon,
  TruckIcon,
  CreditCardIcon,
  FileTextIcon,
  ShoppingCartIcon,
  UserIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import { OrderStatus, PaymentStatus } from '@ew/shared';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

// Define local PaymentStatus UI values
enum PaymentStatusUI {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// Define interfaces to match the backend structure
interface Address {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
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
const order = ref<Order | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const paymentMethods = ref<Array<{id: number, name: string, code: string}>>([]);

// Set page title dynamically
useHead({
  title: () => `Order #${orderId.value} - Admin Panel`
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

// Get order status badge class
const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case OrderStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case OrderStatus.PROCESSING:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case OrderStatus.SHIPPED:
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Get payment status badge class
const getPaymentStatusBadgeClass = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case PaymentStatus.PAID:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Update order status
const updateOrderStatus = async (status: OrderStatus) => {
  if (!order.value) return;
  
  try {
    await trpc.admin.order.updateOrderStatus.mutate({ 
      id: order.value.id, 
      status 
    });
    
    // Update local state
    order.value.status = status;
    
    Swal.fire({
      title: 'Updated!',
      text: 'Order status has been updated.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to update order status',
      icon: 'error',
      confirmButtonColor: '#4f46e5'
    });
  }
};

// Update payment status - convert UI string to PaymentStatus value
const updatePaymentStatus = async (status: string) => {
  if (!order.value) return;
  
  try {
    let paymentStatus: PaymentStatus;
    
    // Map UI values to backend enum values
    switch (status) {
      case PaymentStatusUI.PENDING:
        paymentStatus = PaymentStatus.PENDING;
        break;
      case PaymentStatusUI.PAID:
        paymentStatus = PaymentStatus.PAID;
        break;
      case PaymentStatusUI.FAILED:
        paymentStatus = PaymentStatus.FAILED;
        break;
      default:
        console.error('Invalid payment status:', status);
        Swal.fire({
          title: 'Error!',
          text: 'Invalid payment status. Only pending, paid, and failed are supported',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
        return;
    }
    
    // Call API
    await trpc.admin.order.updatePaymentStatus.mutate({ 
      id: order.value.id, 
      paymentStatus
    });
    
    // Update local state after successful API call
    order.value.paymentStatus = paymentStatus;
    
    Swal.fire({
      title: 'Updated!',
      text: 'Payment status has been updated.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    });
  } catch (err: any) {
    console.error('Error updating payment status:', err);
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to update payment status',
      icon: 'error',
      confirmButtonColor: '#4f46e5'
    });
  }
};

// Delete order
const deleteOrder = async () => {
  if (!order.value) return;

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.order.deleteOrder.mutate(order.value.id);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Order has been deleted.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
      
      // Navigate back to orders list
      router.push('/orders');
    } catch (err: any) {
      console.error('Error deleting order:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete order',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  }
};

// Print invoice
const printInvoice = () => {
  window.print();
};

// Fetch order details
const fetchOrderDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const data = await trpc.admin.order.getOrderById.query(orderId.value);
    console.log('Order details:', data);
    
    if (data) {
      // Use type assertion để tránh lỗi type mismatch
      order.value = data as unknown as Order;
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

// Order Status and Payment Status for UI interactions
const orderStatusSelected = ref<OrderStatus>(OrderStatus.PENDING);
const paymentStatusSelected = ref<string>(PaymentStatusUI.PENDING);
const hasChanges = ref(false);

// Kiểm tra nếu có thay đổi
const checkChanges = () => {
  return Boolean(
    (orderStatusSelected.value && orderStatusSelected.value !== order.value?.status) || 
    (paymentStatusSelected.value && paymentStatusSelected.value !== order.value?.paymentStatus)
  );
};

// Save changes to order
const saveChanges = async () => {
  if (!order.value) return;
  
  try {
    // Update order status if changed
    if (orderStatusSelected.value && orderStatusSelected.value !== order.value.status) {
      await updateOrderStatus(orderStatusSelected.value);
    }
    
    // Update payment status if changed
    if (paymentStatusSelected.value && paymentStatusSelected.value !== order.value.paymentStatus) {
      await updatePaymentStatus(paymentStatusSelected.value);
    }
    
    // Reset selected values after update
    orderStatusSelected.value = order.value.status;
    paymentStatusSelected.value = order.value.paymentStatus;
    hasChanges.value = false;
    
    Swal.fire({
      title: 'Saved!',
      text: 'Changes have been saved.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    });
  } catch (err: any) {
    console.error('Error saving changes:', err);
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to save changes',
      icon: 'error',
      confirmButtonColor: '#4f46e5'
    });
  }
};

// Watch for order to update UI selects
watch(order, (newOrder) => {
  if (newOrder) {
    orderStatusSelected.value = newOrder.status;
    paymentStatusSelected.value = newOrder.paymentStatus;
  }
}, { immediate: true });

// Watch for changes
watch([orderStatusSelected, paymentStatusSelected], () => {
  hasChanges.value = checkChanges();
});

onMounted(async () => {
  await checkAuth();
  await fetchOrderDetails();
  await fetchPaymentMethods();
});
</script>

<template>
  <div class="space-y-6 print:p-0 print:m-0">
    <!-- Header -->
    <PageHeader
      :title="`${$t('orders.orderDetails')} ${order?.orderCode ? `#${order.orderCode}` : ''}`"
      :description="$t('orders.viewAndManage')"
      class="print:hidden"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <button
            @click="router.back()"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            {{ $t('orders.back') }}
          </button>
          
          <button
            @click="printInvoice"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <PrinterIcon class="h-4 w-4 mr-2" />
            {{ $t('orders.print') }}
          </button>
          
          <NuxtLink
            v-if="order"
            :to="`/orders/${order.id}/edit`"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ $t('orders.editOrder') }}
          </NuxtLink>
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
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">{{ $t('orders.errorLoadingOrder') }}</h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order details -->
    <div v-else-if="order" class="space-y-6">
      <!-- Order summary -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">{{ $t('orders.orderSummary') }}</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {{ $t('orders.createdOn') }} {{ formatDate(order.createdAt) }}
            </p>
          </div>
          
          <div class="flex space-x-3">
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusBadgeClass(order.status)">
              {{ capitalize(order.status) }}
            </div>
            
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getPaymentStatusBadgeClass(order.paymentStatus)">
              {{ capitalize(order.paymentStatus.replace('_', ' ')) }}
            </div>
          </div>
        </div>
        
        <div class="px-4 py-5 sm:p-6">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div class="sm:col-span-1">
              <div class="flex items-center mb-2">
                <ShoppingCartIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.orderNumber') }}</dt>
              </div>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.orderCode }}</dd>
            </div>
            
            <div class="sm:col-span-1">
              <div class="flex items-center mb-2">
                <UserIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.customer') }}</dt>
              </div>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ order.customerName || $t('orders.guestCustomer') }}<br>
                <span class="text-gray-500 dark:text-gray-400">
                  {{ order.email || `${order.phoneCode}${order.phoneNumber}` }}
                </span>
              </dd>
            </div>
            
            <div class="sm:col-span-1">
              <div class="flex items-center mb-2">
                <CreditCardIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.paymentMethod') }}</dt>
              </div>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ getPaymentMethodName(order.paymentMethod) }}</dd>
            </div>
            
            <div class="sm:col-span-1">
              <div class="flex items-center mb-2">
                <FileTextIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.totalAmount') }}</dt>
              </div>
              <dd class="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {{ typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Address Information -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <!-- Shipping Address -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <TruckIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">{{ $t('orders.shippingAddress') }}</h3>
            </div>
          </div>
          
          <div class="px-4 py-5 sm:p-6">
            <div v-if="order.shippingAddress" class="text-sm text-gray-900 dark:text-white">
              <p>{{ order.shippingAddress.address }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
              <p>{{ order.shippingAddress.country }}</p>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('orders.noShippingAddress') }}
            </div>
          </div>
        </div>
        
        <!-- Billing Address -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <FileTextIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">{{ $t('orders.billingAddress') }}</h3>
            </div>
          </div>
          
          <div class="px-4 py-5 sm:p-6">
            <div v-if="order.billingAddress" class="text-sm text-gray-900 dark:text-white">
              <p>{{ order.billingAddress.address }}</p>
              <p>{{ order.billingAddress.city }}, {{ order.billingAddress.state }} {{ order.billingAddress.postalCode }}</p>
              <p>{{ order.billingAddress.country }}</p>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('orders.noBillingAddress') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <PackageIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">{{ $t('orders.orderItems') }}</h3>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('orders.product') }}
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('orders.price') }}
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('orders.quantity') }}
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('orders.total') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in order.items" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
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
                  {{ $t('orders.total') }}:
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                  {{ typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Additional Notes -->
      <div v-if="order.notes" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <FileTextIcon class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">{{ $t('orders.orderNotes') }}</h3>
          </div>
        </div>
        
        <div class="px-4 py-5 sm:p-6">
          <p class="text-sm text-gray-900 dark:text-white whitespace-pre-line">{{ order.notes }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden print:hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">{{ $t('orders.actions') }}</h3>
        </div>
        
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Order Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('orders.updateOrderStatus') }}</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <select
                  id="status"
                  class="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  v-model="orderStatusSelected"
                >
                  <option v-for="status in Object.values(OrderStatus)" :key="status" :value="status">
                    {{ capitalize(status) }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Payment Status -->
            <div>
              <label for="payment-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('orders.updatePaymentStatus') }}</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <select
                  id="payment-status"
                  class="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  v-model="paymentStatusSelected"
                >
                  <option :value="PaymentStatusUI.PENDING">{{ $t('orders.pending') }}</option>
                  <option :value="PaymentStatusUI.PAID">{{ $t('orders.paid') }}</option>
                  <option :value="PaymentStatusUI.FAILED">{{ $t('orders.failed') }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              v-if="hasChanges"
              @click="saveChanges"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ $t('orders.saveChanges') }}
            </button>
            
            <NuxtLink
              :to="`/orders/${order.id}/edit`"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ $t('orders.editFullOrder') }}
            </NuxtLink>
            
            <button
              @click="deleteOrder"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {{ $t('orders.deleteOrder') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg p-10 text-center">
      <PackageIcon class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('orders.orderNotFound') }}</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('orders.orderNotFoundDesc') }}
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/orders"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon class="-ml-1 mr-2 h-5 w-5" />
          {{ $t('orders.backToOrders') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    margin: 1cm;
  }
  
  body {
    background: #fff !important;
    color: #000 !important;
  }
  
  /* Hide navigation and other non-essential elements */
  header, footer, nav, .print:hidden {
    display: none !important;
  }
  
  /* Ensure content fills the page */
  .print\:p-0 {
    padding: 0 !important;
  }
  
  .print\:m-0 {
    margin: 0 !important;
  }
}
</style> 