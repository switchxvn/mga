<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTrpc } from '../../../composables/useTrpc';
import { useAuth } from '../../../composables/useAuth';
import { useToast } from 'vue-toastification';
import {
  ArrowLeftIcon,
  FileTextIcon,
  PackageIcon,
  TruckIcon,
  CreditCardIcon,
  UsersIcon,
  SettingsIcon,
  ClipboardListIcon
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
  title: 'Edit Order - Admin Panel'
});

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();
const toast = useToast();

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

// Define tabs
const tabs = [
  { 
    id: 'details', 
    name: 'Order Details', 
    icon: FileTextIcon
  },
  { 
    id: 'customer', 
    name: 'Customer Info', 
    icon: UsersIcon
  },
  {
    id: 'items',
    name: 'Order Items',
    icon: ClipboardListIcon
  },
  {
    id: 'shipping',
    name: 'Shipping',
    icon: TruckIcon
  },
  {
    id: 'payment',
    name: 'Payment',
    icon: CreditCardIcon
  },
  { 
    id: 'status', 
    name: 'Status', 
    icon: SettingsIcon
  }
];

// State
const currentTab = ref('details');
const isLoading = ref(true);
const error = ref<string | null>(null);
const order = ref<Order | null>(null);

// Fetch order data
const fetchOrder = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const orderId = Number(route.params.id);
    
    if (isNaN(orderId)) {
      throw new Error('Invalid order ID');
    }
    
    const data = await trpc.admin.order.getOrderById.query(orderId);
    order.value = data;
  } catch (err: any) {
    console.error('Error fetching order:', err);
    error.value = err.message || 'Failed to fetch order';
    toast.error(error.value);
  } finally {
    isLoading.value = false;
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
    
    order.value.status = status;
    toast.success('Order status updated successfully');
  } catch (err: any) {
    console.error('Error updating order status:', err);
    toast.error(err.message || 'Failed to update order status');
  }
};

// Update payment status
const updatePaymentStatus = async (paymentStatus: PaymentStatus) => {
  if (!order.value) return;
  
  try {
    await trpc.admin.order.updatePaymentStatus.mutate({
      id: order.value.id,
      paymentStatus
    });
    
    order.value.paymentStatus = paymentStatus;
    toast.success('Payment status updated successfully');
  } catch (err: any) {
    console.error('Error updating payment status:', err);
    toast.error(err.message || 'Failed to update payment status');
  }
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// Capitalize the first letter of a string
const capitalize = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get status badge class
const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800';
    case OrderStatus.PROCESSING:
      return 'bg-purple-100 text-purple-800';
    case OrderStatus.SHIPPED:
      return 'bg-indigo-100 text-indigo-800';
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-800';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get payment status badge class
const getPaymentStatusBadgeClass = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case PaymentStatus.PAID:
      return 'bg-green-100 text-green-800';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800';
    case PaymentStatus.REFUNDED:
      return 'bg-gray-100 text-gray-800';
    case PaymentStatus.PARTIALLY_REFUNDED:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Go back to orders list
const goBack = () => {
  router.push('/orders');
};

// Initial load
onMounted(async () => {
  await checkAuth();
  fetchOrder();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Order {{ order?.orderCode }}
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Created on {{ order ? formatDate(order.createdAt) : 'Loading...' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <p>{{ error }}</p>
      <button @click="fetchOrder" class="mt-2 text-sm font-medium text-red-600 underline dark:text-red-500">
        Try Again
      </button>
    </div>

    <!-- Order Edit UI -->
    <div v-else-if="order" class="space-y-6">
      <!-- Status Overview -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Order Status</div>
          <div class="mt-2">
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="getStatusBadgeClass(order.status)"
            >
              {{ capitalize(order.status) }}
            </span>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</div>
          <div class="mt-2">
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="getPaymentStatusBadgeClass(order.paymentStatus)"
            >
              {{ capitalize(order.paymentStatus.replace('_', ' ')) }}
            </span>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ typeof order.totalAmount === 'number' ? formatCurrency(order.totalAmount) : order.totalAmount }}
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Items</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ order.items.length }}
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-800">
        <nav class="flex space-x-8" aria-label="Order sections">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
            :class="
              currentTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'
            "
          >
            <component :is="tab.icon" class="mr-2 h-5 w-5" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-900">
        <!-- Order Details Tab -->
        <div v-if="currentTab === 'details'" class="space-y-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Order Information</h2>
          
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.id }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Order Code</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.orderCode }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(order.createdAt) }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(order.updatedAt) }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.notes || 'No notes' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Customer Info Tab -->
        <div v-if="currentTab === 'customer'" class="space-y-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Customer Information</h2>
          
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Name</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.customerName || 'Guest Customer' }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.email || 'Not provided' }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.phoneCode }}{{ order.phoneNumber }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.userId || 'Guest Checkout' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Order Items Tab -->
        <div v-if="currentTab === 'items'" class="space-y-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Order Items</h2>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                <tr v-for="item in order.items" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ item.productSnapshot?.name || `Product #${item.productId}` }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          ID: {{ item.productId }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ typeof item.unitPrice === 'number' ? formatCurrency(item.unitPrice) : item.unitPrice }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ item.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ typeof item.totalPrice === 'number' ? formatCurrency(item.totalPrice) : item.totalPrice }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                    Total:
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ typeof order.totalAmount === 'number' ? formatCurrency(order.totalAmount) : order.totalAmount }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Shipping Tab -->
        <div v-if="currentTab === 'shipping'" class="space-y-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Shipping Information</h2>
          
          <div v-if="order.shippingAddress" class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Shipping Address</h3>
            <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>{{ order.shippingAddress.line1 }}</p>
              <p v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postal_code }}</p>
              <p>{{ order.shippingAddress.country }}</p>
            </div>
          </div>
          
          <div v-else class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p class="text-sm text-gray-500 dark:text-gray-400">No shipping address provided.</p>
          </div>
        </div>

        <!-- Payment Tab -->
        <div v-if="currentTab === 'payment'" class="space-y-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Payment Information</h2>
          
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ order.paymentMethod }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</dt>
              <dd class="mt-1">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="getPaymentStatusBadgeClass(order.paymentStatus)"
                >
                  {{ capitalize(order.paymentStatus.replace('_', ' ')) }}
                </span>
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ typeof order.totalAmount === 'number' ? formatCurrency(order.totalAmount) : order.totalAmount }}
              </dd>
            </div>
          </dl>
          
          <div v-if="order.billingAddress" class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Billing Address</h3>
            <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>{{ order.billingAddress.line1 }}</p>
              <p v-if="order.billingAddress.line2">{{ order.billingAddress.line2 }}</p>
              <p>{{ order.billingAddress.city }}, {{ order.billingAddress.state }} {{ order.billingAddress.postal_code }}</p>
              <p>{{ order.billingAddress.country }}</p>
            </div>
          </div>
        </div>

        <!-- Status Tab -->
        <div v-if="currentTab === 'status'" class="space-y-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Order Status</h2>
          
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">Update Order Status</h3>
              <div class="mt-4 space-y-2">
                <button
                  v-for="status in Object.values(OrderStatus)"
                  :key="status"
                  @click="updateOrderStatus(status)"
                  class="flex items-center justify-between rounded-lg border px-4 py-2 text-sm text-left w-full"
                  :class="[
                    order.status === status 
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                  ]"
                  :disabled="order.status === status"
                >
                  <span>{{ capitalize(status) }}</span>
                  <span v-if="order.status === status" class="text-xs">Current</span>
                </button>
              </div>
            </div>
            
            <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">Update Payment Status</h3>
              <div class="mt-4 space-y-2">
                <button
                  v-for="status in Object.values(PaymentStatus)"
                  :key="status"
                  @click="updatePaymentStatus(status)"
                  class="flex items-center justify-between rounded-lg border px-4 py-2 text-sm text-left w-full"
                  :class="[
                    order.paymentStatus === status 
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                  ]"
                  :disabled="order.paymentStatus === status"
                >
                  <span>{{ capitalize(status.replace('_', ' ')) }}</span>
                  <span v-if="order.paymentStatus === status" class="text-xs">Current</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 