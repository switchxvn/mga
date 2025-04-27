<template>
  <div class="space-y-6">
    <!-- Payment Method -->
    <div class="space-y-1">
      <label for="payment_method" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Payment Method
      </label>
      <select
        id="payment_method"
        v-model="paymentMethodModel"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value="">Select payment method</option>
        <option v-for="method in paymentMethods" :key="method.id" :value="method.name">
          {{ method.name }}
        </option>
      </select>
    </div>

    <!-- Payment Status -->
    <div class="space-y-1">
      <label for="payment_status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Payment Status
      </label>
      <select
        id="payment_status"
        v-model="paymentStatusModel"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
        <option value="partially_refunded">Partially Refunded</option>
      </select>
    </div>

    <!-- Use Billing Address -->
    <div class="space-y-1">
      <div class="flex items-center">
        <input
          id="same_as_shipping"
          type="checkbox"
          v-model="sameAsShipping"
          class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
        />
        <label for="same_as_shipping" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Billing address same as shipping address
        </label>
      </div>
    </div>

    <!-- Billing Address -->
    <div v-if="!sameAsShipping" class="space-y-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Billing Address</h3>
      <OrderAddress v-model="billingAddressModel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTrpc } from '../../composables/useTrpc';
import OrderAddress from './OrderAddress.vue';

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const props = defineProps({
  paymentMethod: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    default: 'pending'
  },
  billingAddress: {
    type: Object as () => Address,
    default: null
  },
  shippingAddress: {
    type: Object as () => Address,
    default: null
  }
});

const emit = defineEmits([
  'update:paymentMethod',
  'update:paymentStatus',
  'update:billingAddress'
]);

// State
const sameAsShipping = ref(true);
const paymentMethods = ref<any[]>([]);
const trpc = useTrpc();

// Load payment methods
const loadPaymentMethods = async () => {
  try {
    const methods = await trpc.payment.getActivePaymentMethods.query();
    paymentMethods.value = methods;
  } catch (error) {
    console.error('Failed to load payment methods:', error);
  }
};

// Computed props for two-way binding
const paymentMethodModel = computed({
  get: () => props.paymentMethod,
  set: (value) => emit('update:paymentMethod', value)
});

const paymentStatusModel = computed({
  get: () => props.paymentStatus,
  set: (value) => emit('update:paymentStatus', value)
});

const billingAddressModel = computed({
  get: () => {
    if (sameAsShipping.value && props.shippingAddress) {
      return props.shippingAddress;
    }
    return props.billingAddress || {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    };
  },
  set: (value) => {
    if (!sameAsShipping.value) {
      emit('update:billingAddress', value);
    }
  }
});

// Watch for changes to sameAsShipping
watch(sameAsShipping, (newValue) => {
  if (newValue && props.shippingAddress) {
    emit('update:billingAddress', props.shippingAddress);
  }
});

// Watch for changes to shipping address
watch(() => props.shippingAddress, (newValue) => {
  if (sameAsShipping.value && newValue) {
    emit('update:billingAddress', newValue);
  }
}, { deep: true });

// Load payment methods on component mount
onMounted(() => {
  loadPaymentMethods();
  
  // Initialize same as shipping flag based on addresses
  if (props.billingAddress && props.shippingAddress) {
    const billing = JSON.stringify(props.billingAddress);
    const shipping = JSON.stringify(props.shippingAddress);
    sameAsShipping.value = billing === shipping;
  }
});
</script> 