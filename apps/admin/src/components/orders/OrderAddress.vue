<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Address Line 1 -->
      <div class="space-y-1 md:col-span-2">
        <label for="line1" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.address.line1') }}
        </label>
        <input
          id="line1"
          type="text"
          v-model="addressModel.line1"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.address.line1Placeholder')"
        />
      </div>

      <!-- Address Line 2 -->
      <div class="space-y-1 md:col-span-2">
        <label for="line2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.address.line2') }}
        </label>
        <input
          id="line2"
          type="text"
          v-model="addressModel.line2"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.address.line2Placeholder')"
        />
      </div>

      <!-- City -->
      <div class="space-y-1">
        <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.address.city') }}
        </label>
        <input
          id="city"
          type="text"
          v-model="addressModel.city"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.address.cityPlaceholder')"
        />
      </div>

      <!-- State / Province -->
      <div class="space-y-1">
        <label for="state" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.address.state') }}
        </label>
        <input
          id="state"
          type="text"
          v-model="addressModel.state"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.address.statePlaceholder')"
        />
      </div>

      <!-- Postal Code -->
      <div class="space-y-1">
        <label for="postal_code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.address.postalCode') }}
        </label>
        <input
          id="postal_code"
          type="text"
          v-model="addressModel.postal_code"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.address.postalCodePlaceholder')"
        />
      </div>

      <!-- Country -->
      <div class="space-y-1">
        <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('orders.address.country') }}
        </label>
        <input
          id="country"
          type="text"
          v-model="addressModel.country"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :placeholder="t('orders.address.countryPlaceholder')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useLocalization } from '@/composables/useLocalization';

const { t } = useLocalization();

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const props = defineProps({
  modelValue: {
    type: Object as () => Address,
    default: () => ({
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    })
  }
});

const emit = defineEmits(['update:modelValue']);

// Create a reactive copy of the address
const addressModel = reactive<Address>({
  line1: props.modelValue?.line1 || '',
  line2: props.modelValue?.line2 || '',
  city: props.modelValue?.city || '',
  state: props.modelValue?.state || '',
  postal_code: props.modelValue?.postal_code || '',
  country: props.modelValue?.country || ''
});

// Watch for changes to the model and emit updates
watch(addressModel, (newValue) => {
  emit('update:modelValue', { ...newValue });
}, { deep: true });

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    addressModel.line1 = newValue.line1 || '';
    addressModel.line2 = newValue.line2 || '';
    addressModel.city = newValue.city || '';
    addressModel.state = newValue.state || '';
    addressModel.postal_code = newValue.postal_code || '';
    addressModel.country = newValue.country || '';
  }
}, { deep: true });
</script> 