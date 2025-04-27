<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <div class="p-6">
      <h3 class="text-lg font-medium text-slate-900 mb-4">Inventory Management</h3>
      
      <!-- Stock Management Form -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="track_inventory" class="block text-sm font-medium text-slate-700 mb-1">
              Track Inventory
            </label>
            <div class="flex items-center space-x-2">
              <div class="form-check">
                <input 
                  type="checkbox" 
                  id="track_inventory"
                  v-model="trackInventoryModel"
                  class="rounded border-slate-300 text-primary focus:ring-primary"
                  :disabled="hasVariants"
                >
              </div>
              <div class="text-sm text-slate-500">
                Keep track of stock quantities
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="stock_status" class="block text-sm font-medium text-slate-700 mb-1">
              Stock Status
            </label>
            <select 
              id="stock_status" 
              v-model="stockStatusModel" 
              class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
              :disabled="hasVariants"
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="on_backorder">On Backorder</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="form-group">
            <label for="quantity" class="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>
            <input 
              type="number" 
              id="quantity" 
              v-model="quantityModel" 
              min="0" 
              :disabled="!trackInventoryModel || hasVariants"
              class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
            >
          </div>
          
          <div class="form-group">
            <label for="low_stock_threshold" class="block text-sm font-medium text-slate-700 mb-1">
              Low Stock Threshold
            </label>
            <input 
              type="number" 
              id="low_stock_threshold" 
              v-model="lowStockThresholdModel" 
              min="0" 
              :disabled="!trackInventoryModel || hasVariants"
              class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
            >
          </div>
          
          <div class="form-group">
            <label for="allow_backorders" class="block text-sm font-medium text-slate-700 mb-1">
              Allow Backorders
            </label>
            <div class="flex items-center space-x-2">
              <div class="form-check">
                <input 
                  type="checkbox" 
                  id="allow_backorders"
                  v-model="allowBackordersModel"
                  class="rounded border-slate-300 text-primary focus:ring-primary"
                  :disabled="!trackInventoryModel || hasVariants"
                >
              </div>
              <div class="text-sm text-slate-500">
                Allow customers to purchase even when out of stock
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Adjustment Section (if not variants) -->
        <div v-if="trackInventoryModel && !hasVariants" class="mt-6 border-t border-slate-200 pt-6">
          <h4 class="text-md font-medium text-slate-900 mb-4">Adjust Stock</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="form-group">
              <label for="adjustment_quantity" class="block text-sm font-medium text-slate-700 mb-1">
                Adjustment Quantity
              </label>
              <input 
                type="number" 
                id="adjustment_quantity" 
                v-model="adjustmentQuantity" 
                class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Enter positive or negative value"
              >
            </div>
            
            <div class="form-group">
              <label for="adjustment_note" class="block text-sm font-medium text-slate-700 mb-1">
                Note
              </label>
              <input 
                type="text" 
                id="adjustment_note" 
                v-model="adjustmentNote" 
                class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Reason for adjustment"
              >
            </div>
            
            <div class="flex items-end">
              <button 
                @click="adjustStock" 
                class="h-10 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock History -->
      <div class="mt-8 border-t border-slate-200 pt-6">
        <div class="flex flex-wrap items-center justify-between mb-4">
          <h4 class="text-md font-medium text-slate-900">Stock Movement History</h4>
          
          <div class="flex items-center space-x-2 mt-2 md:mt-0">
            <select 
              v-model="historyFilter" 
              class="rounded-md border-slate-300 focus:border-primary focus:ring-primary text-sm"
            >
              <option value="all">All Activities</option>
              <option value="ADMIN_ADJUSTMENT">Admin Adjustments</option>
              <option value="CUSTOMER_ORDER">Customer Orders</option>
              <option value="REFUND">Refunds</option>
              <option value="INVENTORY_CHECK">Inventory Checks</option>
              <option value="RETURN">Returns</option>
              <option value="DAMAGED">Damaged Items</option>
              <option value="INITIAL_STOCK">Initial Stock</option>
            </select>
            
            <button 
              @click="loadStockHistory" 
              class="h-9 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <RefreshCcwIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Previous
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Change
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  New
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Note
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-4 text-center text-sm text-slate-500">
                  Loading history...
                </td>
              </tr>
              <tr v-else-if="!stockHistory.length">
                <td colspan="7" class="px-6 py-4 text-center text-sm text-slate-500">
                  No stock history found.
                </td>
              </tr>
              <tr v-for="item in stockHistory" :key="item.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getAdjustmentTypeClass(item.adjustmentType)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getAdjustmentTypeLabel(item.adjustmentType) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {{ item.quantityBefore }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="item.adjustmentQuantity > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ item.adjustmentQuantity > 0 ? '+' : '' }}{{ item.adjustmentQuantity }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {{ item.quantityAfter }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 max-w-xs truncate">
                  {{ item.note || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <a v-if="item.referenceType === 'order' && item.referenceId" 
                     :href="`/orders/${item.referenceId}`" 
                     class="text-primary hover:underline">
                    Order #{{ item.referenceId }}
                  </a>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="stockHistory.length && totalStockHistory > 10" class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div class="flex flex-1 justify-between sm:hidden">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              Previous
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage >= totalPages"
              class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-slate-700">
                Showing <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> to <span class="font-medium">{{ Math.min(currentPage * pageSize, totalStockHistory) }}</span> of <span class="font-medium">{{ totalStockHistory }}</span> results
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                
                <button 
                  v-for="page in paginationRange" 
                  :key="page" 
                  @click="goToPage(page)"
                  :disabled="page === currentPage"
                  :class="[
                    page === currentPage ? 'bg-primary text-white' : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
                    'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20'
                  ]"
                >
                  {{ page }}
                </button>
                
                <button 
                  @click="nextPage" 
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { useToast } from 'vue-toastification';
import { RefreshCcwIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { format } from 'date-fns';

const props = defineProps({
  trackInventory: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  stockStatus: {
    type: String,
    default: 'in_stock'
  },
  allowBackorders: {
    type: Boolean,
    default: false
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  stockMovements: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'update:trackInventory',
  'update:quantity',
  'update:lowStockThreshold',
  'update:stockStatus',
  'update:allowBackorders'
]);

// Computed properties for v-model
const trackInventoryModel = computed({
  get: () => props.trackInventory,
  set: (value) => emit('update:trackInventory', value)
});

const quantityModel = computed({
  get: () => props.quantity,
  set: (value) => emit('update:quantity', value)
});

const lowStockThresholdModel = computed({
  get: () => props.lowStockThreshold,
  set: (value) => emit('update:lowStockThreshold', value)
});

const stockStatusModel = computed({
  get: () => props.stockStatus,
  set: (value) => emit('update:stockStatus', value)
});

const allowBackordersModel = computed({
  get: () => props.allowBackorders,
  set: (value) => emit('update:allowBackorders', value)
});

// Stock adjustment form
const adjustmentQuantity = ref(0);
const adjustmentNote = ref('');

// Stock history state
const stockHistory = ref<any[]>([]);
const loading = ref(false);
const totalStockHistory = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const historyFilter = ref('all');

const trpc = useTrpc();
const route = useRoute();
const toast = useToast();

// Load stock history
const loadStockHistory = async () => {
  try {
    loading.value = true;
    const productId = Number(route.params.id);
    
    // Calculate offset based on current page
    const offset = (currentPage.value - 1) * pageSize.value;
    
    const response = await trpc.admin.products.getProductStockHistory.query({
      productId,
      limit: pageSize.value,
      offset
    });
    
    // Apply filter if not 'all'
    stockHistory.value = historyFilter.value === 'all' 
      ? response.data 
      : response.data.filter(item => item.adjustmentType === historyFilter.value);
    
    totalStockHistory.value = response.total;
  } catch (error) {
    console.error('Error loading stock history:', error);
    toast.error('Failed to load stock history.');
  } finally {
    loading.value = false;
  }
};

// Handle stock adjustment
const adjustStock = async () => {
  try {
    if (adjustmentQuantity.value === 0) {
      toast.warning('Please enter a non-zero adjustment quantity.');
      return;
    }
    
    const productId = Number(route.params.id);
    
    await trpc.admin.products.adjustProductStock.mutate({
      productId,
      adjustmentQuantity: adjustmentQuantity.value,
      note: adjustmentNote.value || undefined
    });
    
    // Update quantity model
    quantityModel.value += adjustmentQuantity.value;
    
    // Reset form
    adjustmentQuantity.value = 0;
    adjustmentNote.value = '';
    
    // Reload history
    loadStockHistory();
    
    toast.success('Stock adjusted successfully.');
  } catch (error) {
    console.error('Error adjusting stock:', error);
    toast.error('Failed to adjust stock.');
  }
};

// Format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return dateString;
  }
};

// Get adjustment type label
const getAdjustmentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'ADMIN_ADJUSTMENT': 'Admin Adjustment',
    'CUSTOMER_ORDER': 'Customer Order',
    'REFUND': 'Refund',
    'INVENTORY_CHECK': 'Inventory Check',
    'RETURN': 'Return',
    'DAMAGED': 'Damaged',
    'INITIAL_STOCK': 'Initial Stock'
  };
  
  return labels[type] || type;
};

// Get class for adjustment type
const getAdjustmentTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    'ADMIN_ADJUSTMENT': 'bg-blue-100 text-blue-800',
    'CUSTOMER_ORDER': 'bg-red-100 text-red-800',
    'REFUND': 'bg-green-100 text-green-800',
    'INVENTORY_CHECK': 'bg-purple-100 text-purple-800',
    'RETURN': 'bg-amber-100 text-amber-800',
    'DAMAGED': 'bg-rose-100 text-rose-800',
    'INITIAL_STOCK': 'bg-slate-100 text-slate-800'
  };
  
  return classes[type] || 'bg-slate-100 text-slate-800';
};

// Pagination
const totalPages = computed(() => Math.ceil(totalStockHistory.value / pageSize.value));

const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  
  let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1);
  
  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }
  
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  
  return range;
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadStockHistory();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadStockHistory();
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
  loadStockHistory();
};

// Watch for filter changes
watch(historyFilter, () => {
  currentPage.value = 1; // Reset to first page
  loadStockHistory();
});

// Load initial data
onMounted(() => {
  if (!props.hasVariants) {
    loadStockHistory();
  }
});
</script> 