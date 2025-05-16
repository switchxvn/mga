<template>
  <div class="space-y-6">
    <!-- Order Items Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('orders.items.product') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('orders.items.price') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('orders.items.quantity') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('orders.items.total') }}
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('orders.items.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
          <tr v-for="(item, index) in items" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getProductName(item) }}
                  </div>
                  <div v-if="item.productId" class="text-xs text-gray-500 dark:text-gray-400">
                    ID: {{ item.productId }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="number"
                v-model.number="item.unitPrice"
                class="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                step="0.01"
                min="0"
                @input="updateItemTotal(index)"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="number"
                v-model.number="item.quantity"
                class="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                min="1"
                @input="updateItemTotal(index)"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatCurrency(item.totalPrice) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="removeItem(index)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
              {{ t('orders.items.total') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
              {{ formatCurrency(calculateTotal) }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Add Product Button -->
    <div class="flex justify-center">
      <button
        @click="openProductSelector"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        {{ t('orders.items.addProduct') }}
      </button>
    </div>

    <!-- Product Selector Modal -->
    <div v-if="showProductModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showProductModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-gray-900">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-900">
            <div class="mb-4">
              <label for="product-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('orders.items.searchProducts') }}
              </label>
              <input
                id="product-search"
                type="text"
                v-model="productSearch"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                :placeholder="t('orders.items.searchPlaceholder')"
              />
            </div>

            <div class="max-h-60 overflow-y-auto">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                @click="selectProduct(product)"
                class="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md"
              >
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ product.name || product.title }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatCurrency(product.price) }} - {{ t('orders.items.sku') }}: {{ product.sku }}
                  </div>
                </div>
              </div>
              <div v-if="filteredProducts.length === 0" class="p-3 text-center text-gray-500 dark:text-gray-400">
                {{ t('orders.items.noProductsFound') }}
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-gray-800">
            <button
              type="button"
              @click="showProductModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {{ t('actions.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { TrashIcon, PlusIcon } from 'lucide-vue-next';
import { useTrpc } from '../../composables/useTrpc';
import { useLocalization } from '@/composables/useLocalization';

const { t } = useLocalization();

// Interface for order item
interface OrderItem {
  productId?: number;
  productName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// Props
const props = defineProps({
  modelValue: {
    type: Array as () => OrderItem[],
    default: () => []
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'update:totalAmount']);

// State
const items = ref<OrderItem[]>([...props.modelValue]);
const showProductModal = ref(false);
const productSearch = ref('');
const availableProducts = ref<any[]>([]);
const trpc = useTrpc();

// Computed
const calculateTotal = computed(() => {
  return items.value.reduce((total, item) => total + item.totalPrice, 0);
});

const filteredProducts = computed(() => {
  if (!productSearch.value) return availableProducts.value;
  
  const search = productSearch.value.toLowerCase();
  return availableProducts.value.filter(product => {
    const name = (product.name || product.title || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();
    return name.includes(search) || sku.includes(search);
  });
});

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const updateItemTotal = (index: number) => {
  const item = items.value[index];
  item.totalPrice = item.unitPrice * item.quantity;
  updateModelValue();
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
  updateModelValue();
};

const updateModelValue = () => {
  emit('update:modelValue', [...items.value]);
  emit('update:totalAmount', calculateTotal.value);
};

const openProductSelector = () => {
  showProductModal.value = true;
  loadProducts();
};

const loadProducts = async () => {
  try {
    const result = await trpc.admin.products.getAllProducts.query({
      page: 1,
      pageSize: 50
    });
    availableProducts.value = result.items;
  } catch (error) {
    console.error('Failed to load products:', error);
  }
};

const selectProduct = (product: any) => {
  const newItem: OrderItem = {
    productId: product.id,
    productName: product.name || product.title,
    unitPrice: product.price,
    quantity: 1,
    totalPrice: product.price
  };
  
  items.value.push(newItem);
  updateModelValue();
  showProductModal.value = false;
};

const getProductName = (item: OrderItem) => {
  return item.productName || `Product #${item.productId}`;
};

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(items.value)) {
    items.value = [...newValue];
  }
}, { deep: true });

// Update parent on mount (in case default values change the total)
onMounted(() => {
  updateModelValue();
});
</script> 