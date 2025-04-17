<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import { CheckCircle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { t } = useLocalization();
const trpc = useTrpc();

const order = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchOrder = async () => {
  const orderId = route.query.order_id;
  if (!orderId) {
    error.value = t('checkout.noOrderId');
    isLoading.value = false;
    return;
  }

  try {
    const orderData = await trpc.order.getOrder.query(Number(orderId));
    order.value = orderData;
  } catch (err) {
    console.error('Error fetching order:', err);
    error.value = t('checkout.errorFetchingOrder');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchOrder();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            {{ t('checkout.loadingOrder') }}
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <span class="text-red-600 dark:text-red-400 text-2xl">×</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ t('checkout.error') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
          <UButton to="/tickets" color="primary">
            {{ t('checkout.backToTickets') }}
          </UButton>
        </div>

        <!-- Success State -->
        <div v-else class="space-y-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('checkout.orderSuccess') }}
          </h1>

          <p class="text-gray-600 dark:text-gray-400">
            {{ t('checkout.orderSuccessMessage') }}
          </p>

          <div v-if="order" class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-left">
            <div class="space-y-4">
              <div class="flex justify-between border-b dark:border-gray-700 pb-4">
                <span class="text-gray-600 dark:text-gray-400">{{ t('checkout.orderId') }}</span>
                <span class="font-medium text-gray-900 dark:text-white">#{{ order.id }}</span>
              </div>

              <div class="flex justify-between border-b dark:border-gray-700 pb-4">
                <span class="text-gray-600 dark:text-gray-400">{{ t('checkout.orderStatus') }}</span>
                <span class="font-medium text-green-600">{{ order.status }}</span>
              </div>

              <div class="flex justify-between border-b dark:border-gray-700 pb-4">
                <span class="text-gray-600 dark:text-gray-400">{{ t('checkout.paymentStatus') }}</span>
                <span class="font-medium text-green-600">{{ order.paymentStatus }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ t('checkout.totalAmount') }}</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-center gap-4 mt-8">
            <UButton to="/tickets" color="gray">
              {{ t('checkout.backToTickets') }}
            </UButton>
            <UButton to="/account/orders" color="primary">
              {{ t('checkout.viewOrders') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 