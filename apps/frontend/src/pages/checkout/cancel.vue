<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useLocalization } from '~/composables/useLocalization';
import { XCircle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { t } = useLocalization();

const orderId = route.query.order_id;
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto text-center">
        <div class="space-y-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <XCircle class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('checkout.orderCancelled') }}
          </h1>

          <p class="text-gray-600 dark:text-gray-400">
            {{ t('checkout.orderCancelledMessage') }}
          </p>

          <div v-if="orderId" class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-left">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ t('checkout.orderId') }}</span>
                <span class="font-medium text-gray-900 dark:text-white">#{{ orderId }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-center gap-4 mt-8">
            <UButton to="/tickets" color="gray">
              {{ t('checkout.backToTickets') }}
            </UButton>
            <UButton to="/checkout/ticket" color="primary">
              {{ t('checkout.tryAgain') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 