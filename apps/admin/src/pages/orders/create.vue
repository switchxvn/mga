<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { useAuth } from '../../composables/useAuth';
import { useToast } from 'vue-toastification';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  UsersIcon,
  PackageIcon,
  TruckIcon,
  CreditCardIcon,
  SettingsIcon
} from 'lucide-vue-next';
import OrderCustomerInfo from '../../components/orders/OrderCustomerInfo.vue';
import OrderItems from '../../components/orders/OrderItems.vue';
import OrderAddress from '../../components/orders/OrderAddress.vue';
import OrderPayment from '../../components/orders/OrderPayment.vue';
import OrderStatus from '../../components/orders/OrderStatus.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Create Order - Admin Panel'
});

const router = useRouter();
const { checkAuth } = useAuth();
const trpc = useTrpc();
const toast = useToast();

// Define tabs
const tabs = [
  { id: 'customer', name: 'Customer Info', icon: UsersIcon },
  { id: 'items', name: 'Order Items', icon: PackageIcon },
  { id: 'shipping', name: 'Shipping', icon: TruckIcon },
  { id: 'payment', name: 'Payment', icon: CreditCardIcon },
  { id: 'status', name: 'Status', icon: SettingsIcon }
];

// State
const currentTab = ref('customer');
const isSubmitting = ref(false);

// Form data
const orderForm = reactive({
  customerName: '',
  email: '',
  phoneCode: '',
  phoneNumber: '',
  userId: '',
  items: [],
  totalAmount: 0,
  shippingAddress: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  },
  paymentMethod: '',
  paymentStatus: 'pending',
  billingAddress: null,
  status: 'pending',
  notes: ''
});

// Go back to orders list
const goBack = () => {
  router.push('/orders');
};

// Initial load
onMounted(async () => {
  await checkAuth();
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Order
        </h1>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Creating...</span>
        <span v-else>Create Order</span>
      </button>
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
      <!-- Customer Info Tab -->
      <div v-if="currentTab === 'customer'" class="space-y-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Customer Information</h2>
        <OrderCustomerInfo
          v-model:customerName="orderForm.customerName"
          v-model:email="orderForm.email"
          v-model:phoneCode="orderForm.phoneCode"
          v-model:phoneNumber="orderForm.phoneNumber"
          v-model:userId="orderForm.userId"
        />
      </div>

      <!-- Order Items Tab -->
      <div v-if="currentTab === 'items'" class="space-y-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Order Items</h2>
        <OrderItems
          v-model="orderForm.items"
          @update:totalAmount="orderForm.totalAmount = $event"
        />
      </div>

      <!-- Shipping Tab -->
      <div v-if="currentTab === 'shipping'" class="space-y-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Shipping Information</h2>
        <OrderAddress
          v-model="orderForm.shippingAddress"
        />
      </div>

      <!-- Payment Tab -->
      <div v-if="currentTab === 'payment'" class="space-y-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Payment Information</h2>
        <OrderPayment
          v-model:paymentMethod="orderForm.paymentMethod"
          v-model:paymentStatus="orderForm.paymentStatus"
          v-model:billingAddress="orderForm.billingAddress"
          :shippingAddress="orderForm.shippingAddress"
        />
      </div>

      <!-- Status Tab -->
      <div v-if="currentTab === 'status'" class="space-y-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Order Status</h2>
        <OrderStatus
          v-model:orderStatus="orderForm.status"
          v-model:notes="orderForm.notes"
        />
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between">
      <button
        v-if="currentTab !== tabs[0].id"
        @click="currentTab = tabs[tabs.findIndex(t => t.id === currentTab) - 1].id"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Previous
      </button>
      <div></div>
      <button
        v-if="currentTab !== tabs[tabs.length - 1].id"
        @click="currentTab = tabs[tabs.findIndex(t => t.id === currentTab) + 1].id"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Next
        <ArrowRightIcon class="h-4 w-4" />
      </button>
      <button
        v-else
        :disabled="isSubmitting"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">Creating...</span>
        <span v-else>Create Order</span>
      </button>
    </div>
  </div>
</template> 