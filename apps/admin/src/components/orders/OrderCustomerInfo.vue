<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Customer Name -->
      <div class="space-y-1">
        <label for="customer_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.customer.name') }}
        </label>
        <input
          id="customer_name"
          type="text"
          v-model="customerNameModel"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.customer.namePlaceholder')"
        />
      </div>

      <!-- Customer Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.customer.email') }}
        </label>
        <input
          id="email"
          type="email"
          v-model="emailModel"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.customer.emailPlaceholder')"
        />
      </div>
    </div>

    <!-- Phone Number -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="space-y-1">
        <label for="phone_code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.customer.countryCode') }}
        </label>
        <input
          id="phone_code"
          type="text"
          v-model="phoneCodeModel"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.customer.countryCodePlaceholder')"
        />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label for="phone_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.customer.phoneNumber') }}
        </label>
        <input
          id="phone_number"
          type="text"
          v-model="phoneNumberModel"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.customer.phoneNumberPlaceholder')"
        />
      </div>
    </div>

    <!-- User ID (Optional) -->
    <div class="space-y-1">
      <label for="user_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('orders.customer.userId') }}
      </label>
      <input
        id="user_id"
        type="text"
        v-model="userIdModel"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        :placeholder="t('orders.customer.userIdPlaceholder')"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ t('orders.customer.userIdDescription') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocalization } from '@/composables/useLocalization';

const { t } = useLocalization();

const props = defineProps({
  customerName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phoneCode: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'update:customerName',
  'update:email',
  'update:phoneCode',
  'update:phoneNumber',
  'update:userId'
]);

// Two-way binding
const customerNameModel = computed({
  get: () => props.customerName,
  set: (value) => emit('update:customerName', value)
});

const emailModel = computed({
  get: () => props.email,
  set: (value) => emit('update:email', value)
});

const phoneCodeModel = computed({
  get: () => props.phoneCode,
  set: (value) => emit('update:phoneCode', value)
});

const phoneNumberModel = computed({
  get: () => props.phoneNumber,
  set: (value) => emit('update:phoneNumber', value)
});

const userIdModel = computed({
  get: () => props.userId,
  set: (value) => emit('update:userId', value)
});
</script> 