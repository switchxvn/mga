<template>
  <div class="grid gap-6">
    <!-- Variants Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Product Variants</h3>
        <p class="text-sm text-slate-500">Manage your product's variants and options</p>
      </div>
      <div class="p-6">
        <div class="grid gap-6">
          <!-- Has Variants Toggle -->
          <div class="flex items-center justify-between">
            <div class="grid gap-1.5">
              <label
                for="hasVariants"
                class="text-sm font-medium text-slate-900"
              >
                This product has multiple options
              </label>
              <p class="text-sm text-slate-500">
                Like different sizes or colors
              </p>
            </div>
            <Switch
              id="hasVariants"
              :model-value="hasVariants"
              @update:model-value="$emit('update:has-variants', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="hasVariants ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Toggle variants</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="hasVariants ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>

          <!-- Variant Options -->
          <template v-if="hasVariants">
            <div class="grid gap-4">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium">Options</h4>
                <button
                  type="button"
                  @click="addOption"
                  class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  <PlusIcon class="h-4 w-4" />
                  Add Option
                </button>
              </div>

              <!-- Option List -->
              <div class="grid gap-4">
                <div
                  v-for="(option, index) in options"
                  :key="index"
                  class="grid gap-4 rounded-lg border border-slate-200 p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="grid gap-2">
                      <input
                        type="text"
                        v-model="option.name"
                        placeholder="Option name (e.g. Size, Color)"
                        class="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      @click="removeOption(index)"
                      class="rounded-full p-2 hover:bg-slate-100"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>

                  <!-- Option Values -->
                  <div class="grid gap-2">
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="(value, valueIndex) in option.values"
                        :key="valueIndex"
                        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm"
                      >
                        <span>{{ value }}</span>
                        <button
                          type="button"
                          @click="removeValue(index, valueIndex)"
                          class="rounded-full p-0.5 hover:bg-slate-200 transition-colors"
                        >
                          <XIcon class="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <!-- Add Value Input -->
                    <div class="flex gap-2">
                      <input
                        type="text"
                        v-model="option.newValue"
                        placeholder="Enter value and press Enter"
                        @keydown.enter="addValue(index)"
                        class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <button
                        type="button"
                        @click="addValue(index)"
                        class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Generated Variants -->
            <div v-if="displayVariants.length > 0" class="grid gap-4">
              <h4 class="text-sm font-medium">Variants</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-200">
                      <th class="px-4 py-2 text-left font-medium">Variant</th>
                      <th class="px-4 py-2 text-left font-medium">Price</th>
                      <th class="px-4 py-2 text-left font-medium">SKU</th>
                      <th class="px-4 py-2 text-left font-medium">Stock</th>
                      <th class="px-4 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(variant, index) in displayVariants"
                      :key="index"
                      class="border-b border-slate-200"
                    >
                      <td class="px-4 py-2">{{ variant.name }}</td>
                      <td class="px-4 py-2">
                        <div class="relative w-32">
                          <span class="absolute left-3 top-2.5 text-slate-500">$</span>
                          <input
                            type="number"
                            v-model="variant.price"
                            class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          v-model="variant.sku"
                          class="flex h-10 w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          v-model.number="variant.stock"
                          @change="onStockInputChange(variant)"
                          class="flex h-10 w-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          min="0"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <div class="flex items-center space-x-2">
                          <button v-if="variant.id" @click="openStockHistoryModal(variant)" class="rounded-md p-2 hover:bg-slate-100">
                            <div class="flex items-center text-xs text-primary">
                              <PackageIcon class="h-4 w-4 mr-1" />
                              <span>Stock History</span>
                            </div>
                          </button>
                          <div v-else class="relative group">
                            <button disabled class="rounded-md p-2 text-slate-400 cursor-not-allowed">
                              <div class="flex items-center text-xs">
                                <PackageIcon class="h-4 w-4 mr-1" />
                                <span>Stock History</span>
                              </div>
                            </button>
                            <div class="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                              Stock history will be available after product creation.
                            </div>
                          </div>
                          <button @click="removeVariant(variant)" class="rounded-md p-2 hover:bg-red-50 text-red-500">
                            <TrashIcon class="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Add stock history modal -->
    <div v-if="stockHistoryModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-medium">Stock History for {{ stockHistoryModal.variant.options ? Object.values(stockHistoryModal.variant.options).join(' / ') : 'Variant' }}</h3>
          <button @click="closeStockHistoryModal" class="text-slate-500 hover:text-slate-700">
            <XIcon class="h-5 w-5" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Stock adjustment form -->
          <div class="mb-6 bg-slate-50 p-4 rounded-lg">
            <h4 class="text-md font-medium mb-4">Adjust Stock</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-group">
                <label class="block text-sm font-medium text-slate-700 mb-1">Current Quantity</label>
                <div class="bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-700">
                  {{ stockHistoryModal.variant.quantity || stockHistoryModal.variant.stock || 0 }}
                </div>
              </div>
              
              <div class="form-group">
                <label class="block text-sm font-medium text-slate-700 mb-1">Adjustment</label>
                <input 
                  type="number" 
                  v-model="stockHistoryModal.adjustmentQuantity" 
                  class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Enter positive or negative value"
                >
              </div>
              
              <div class="form-group">
                <label class="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <input 
                  type="text" 
                  v-model="stockHistoryModal.adjustmentNote" 
                  class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Reason for adjustment"
                >
              </div>
            </div>
            
            <div class="mt-4 flex justify-end">
              <button 
                @click="applyVariantStockAdjustment" 
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                :disabled="stockHistoryModal.adjustmentQuantity === 0 || !stockHistoryModal.variant.id"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
          
          <!-- Stock history table -->
          <div>
            <h4 class="text-md font-medium mb-4">Stock Movement History</h4>
            
            <div v-if="stockHistoryModal.loading" class="flex justify-center py-8">
              <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <div v-else-if="!stockHistoryModal.history.length" class="text-center py-8 text-slate-500">
              <div v-if="stockHistoryModal.variant.id">
                No stock history found for this variant.
              </div>
              <div v-else>
                Stock history will be available after product creation.
              </div>
            </div>
            
            <div v-else class="overflow-x-auto">
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
                  <tr v-for="item in stockHistoryModal.history" :key="item.id" class="hover:bg-slate-50">
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
          </div>
        </div>
        
        <div class="p-4 border-t flex justify-end">
          <button @click="closeStockHistoryModal" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef } from 'vue'
import { PlusIcon, TrashIcon, XIcon, PackageIcon } from 'lucide-vue-next'
import { Switch } from '@headlessui/vue'
import { useRoute } from 'vue-router'
import { useTrpc } from '../../composables/useTrpc'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { useProductVariantsStore, VariantItem } from '../../stores/productVariantsStore'

// Khởi tạo các composable
const route = useRoute()
const trpc = useTrpc()
const toast = useToast()
const variantsStore = useProductVariantsStore()

interface Option {
  name: string
  values: string[]
  newValue: string
}

const props = defineProps<{
  hasVariants: boolean
  modelValue: VariantItem[]
}>()

const emit = defineEmits<{
  'update:has-variants': [value: boolean]
  'update:modelValue': [value: VariantItem[]]
}>()

const options = ref<Option[]>([])

// Process existing variants to extract options when component mounts
const processExistingVariants = () => {
  if (!props.modelValue || props.modelValue.length === 0) return
  
  // Không log trong production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Processing existing variants')
  }
  
  // Extract all option names and values from variants
  const optionMap = new Map<string, Set<string>>()
  
  // Go through all variants and collect unique option names and values
  props.modelValue.forEach(variant => {
    Object.entries(variant.options).forEach(([name, value]) => {
      if (!optionMap.has(name)) {
        optionMap.set(name, new Set<string>())
      }
      optionMap.get(name)!.add(value)
    })
  })
  
  // Convert to options array
  const extractedOptions = Array.from(optionMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
    newValue: ''
  }))
  
  options.value = extractedOptions
}

// Chỉ gọi processExistingVariants một lần khi component mounts
let processedVariants = false
onMounted(() => {
  if (!processedVariants && props.hasVariants && props.modelValue && props.modelValue.length > 0) {
    processExistingVariants()
    processedVariants = true
  }
  
  // Khởi tạo store với modelValue một lần duy nhất
  variantsStore.initVariants(props.modelValue)
})

// Thay đổi cách watch modelValue để tránh re-renders không cần thiết
watch(() => props.modelValue, (newValue, oldValue) => {
  // Chỉ thực hiện khi modelValue thay đổi thực sự
  if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return

  // Ngăn xử lý nếu đã xử lý
  if (!processedVariants && options.value.length === 0 && newValue && newValue.length > 0) {
    processExistingVariants()
    processedVariants = true
  }
  
  // Cập nhật store
  variantsStore.updateAllVariants(newValue)
}, { deep: true })

// Watch hasVariants để xử lý chỉ khi thay đổi thật sự
watch(() => props.hasVariants, (hasVariants, oldValue) => {
  if (hasVariants === oldValue) return
  
  if (hasVariants && !processedVariants && options.value.length === 0 && props.modelValue && props.modelValue.length > 0) {
    processExistingVariants()
    processedVariants = true
  }
}, { immediate: false })

// Add new option
const addOption = () => {
  options.value.push({
    name: '',
    values: [],
    newValue: ''
  })
}

// Remove option
const removeOption = (index: number) => {
  options.value.splice(index, 1)
}

// Add value to option
const addValue = (optionIndex: number) => {
  const option = options.value[optionIndex]
  if (option.newValue && !option.values.includes(option.newValue)) {
    option.values.push(option.newValue)
    option.newValue = ''
  }
}

// Remove value from option
const removeValue = (optionIndex: number, valueIndex: number) => {
  options.value[optionIndex].values.splice(valueIndex, 1)
}

// Generate all possible variants from options - Cải thiện để tránh tính toán lại liên tục
// Sử dụng shallowRef để tránh reactivity sâu không cần thiết
const variantCombinations = shallowRef<Record<string, string>[]>([])

// Chỉ tính toán lại khi options thay đổi thật sự
watch(() => options.value, () => {
  if (!options.value.length) {
    variantCombinations.value = []
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('Recalculating variant combinations')
  }
  
  const generateCombinations = (
    optionIndex: number,
    current: Record<string, string>
  ): Record<string, string>[] => {
    if (optionIndex === options.value.length) {
      return [current]
    }

    const option = options.value[optionIndex]
    const combinations: Record<string, string>[] = []

    for (const value of option.values) {
      combinations.push(
        ...generateCombinations(optionIndex + 1, {
          ...current,
          [option.name]: value
        })
      )
    }

    return combinations
  }

  variantCombinations.value = generateCombinations(0, {})
}, { deep: true })

// Sử dụng computed đơn giản hơn để thay thế variants
const variants = computed(() => {
  if (!options.value.length) {
    return props.modelValue || []
  }

  if (!variantCombinations.value.length) {
    return props.modelValue || []
  }
  
  return variantCombinations.value.map(combo => {
    const existingVariant = props.modelValue.find(v => {
      return Object.entries(combo).every(
        ([key, value]) => v.options[key] === value
      )
    })

    const name = Object.entries(combo)
      .map(([key, value]) => `${value}`)
      .join(' / ')

    return existingVariant || {
      name,
      price: 0,
      sku: '',
      stock: 0,
      options: combo
    }
  })
})

// Gửi cập nhật variants đến parent chỉ khi có thay đổi thực sự
let previousVariantsJson = ''
watch(variants, (newVariants) => {
  const newVariantsJson = JSON.stringify(newVariants)
  if (newVariantsJson !== previousVariantsJson) {
    previousVariantsJson = newVariantsJson
    emit('update:modelValue', newVariants)
  }
}, { deep: true })

// Computed để hiển thị variants (từ dynamic combinations hoặc từ props)
const displayVariants = computed(() => {
  // Nếu có options, sử dụng variants từ combinations
  if (options.value.length > 0) {
    return variants.value
  }
  
  // Nếu không có options nhưng có modelValue, trả về modelValue trực tiếp
  if (props.modelValue && props.modelValue.length > 0) {
    return props.modelValue
  }
  
  return []
})

// Function to load variant stock history - Thêm debounce để tránh gọi nhiều lần
const loadVariantStockHistory = (() => {
  let lastCallTime = 0;
  const DEBOUNCE_TIME = 500; // ms
  
  return async (variantId: number) => {
    if (!variantId) return [];
    
    const now = Date.now();
    if (now - lastCallTime < DEBOUNCE_TIME) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Debouncing stock history call');
      }
      return [];
    }
    
    lastCallTime = now;
    
    try {
      const response = await trpc.admin.products.getVariantStockHistory.query({
        variantId,
        limit: 10,
        offset: 0
      })
      
      return response.data || []
    } catch (error) {
      console.error('Error loading variant stock history');
      return []
    }
  }
})();

// Format date function
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch (e) {
    return dateString
  }
}

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
  }
  
  return labels[type] || type
}

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
  }
  
  return classes[type] || 'bg-slate-100 text-slate-800'
}

// Stock history modal với kiểm soát mở/đóng tốt hơn
let isModalOpen = false;

// Định nghĩa stockHistoryModal đã bị xóa nhầm
const stockHistoryModal = ref({
  show: false,
  variant: {} as VariantItem,
  adjustmentQuantity: 0,
  adjustmentNote: '',
  history: [] as any[],
  loading: false
});

const openStockHistoryModal = async (variant: VariantItem) => {
  // Tránh mở lại modal khi đã mở
  if (isModalOpen) return;
  isModalOpen = true;
  
  // Reset modal state trước khi mở
  stockHistoryModal.value = {
    show: true,
    variant: { ...variant }, // Clone variant để tránh tham chiếu trực tiếp
    adjustmentQuantity: 0,
    adjustmentNote: '',
    history: [],
    loading: true
  };
  
  try {
    if (variant.id) {
      // Kiểm tra xem variant có trong store không và lấy dữ liệu mới nhất từ store
      const storeVariant = variantsStore.getVariantById(variant.id)
      if (storeVariant) {
        // Cập nhật lại variant trong modal với dữ liệu mới nhất từ store
        stockHistoryModal.value.variant = { ...storeVariant }
      }
      
      // Tải lịch sử stock
      const history = await loadVariantStockHistory(variant.id)
      stockHistoryModal.value.history = history || []
      
      // Cập nhật giá trị quantity từ lịch sử nếu có
      if (history && history.length > 0) {
        // Lấy bản ghi gần nhất để biết stock hiện tại
        const latestRecord = history[0];
        if (latestRecord && typeof latestRecord.quantityAfter === 'number') {
          // Cập nhật lại quantity trong variant
          stockHistoryModal.value.variant.quantity = latestRecord.quantityAfter;
          stockHistoryModal.value.variant.stock = latestRecord.quantityAfter;
          
          // Đồng bộ giá trị từ history vào store
          if (variant.id) {
            variantsStore.updateVariantStock(variant.id, latestRecord.quantityAfter);
          }
        }
      }
    } else {
      stockHistoryModal.value.history = [];
    }
  } catch (error) {
    console.error('Error loading variant data');
  } finally {
    stockHistoryModal.value.loading = false
  }
}

const closeStockHistoryModal = () => {
  if (!stockHistoryModal.value.show) return;
  
  stockHistoryModal.value.show = false
  isModalOpen = false;
  
  // Đảm bảo giá trị stock được cập nhật trên UI
  if (stockHistoryModal.value.variant.id) {
    // Lấy variant mới nhất từ store
    const updatedVariant = variantsStore.getVariantById(stockHistoryModal.value.variant.id)
    
    if (updatedVariant) {
      // Kiểm tra xem có thực sự thay đổi không
      let hasChanges = false;
      
      const updatedVariants = props.modelValue.map(v => {
        if (v.id === updatedVariant.id && 
            (v.stock !== updatedVariant.stock || v.quantity !== updatedVariant.stock)) {
          hasChanges = true;
          return {...v, stock: updatedVariant.stock, quantity: updatedVariant.stock};
        }
        return v;
      });
      
      // Chỉ emit nếu có thay đổi thực sự
      if (hasChanges) {
        // Đảm bảo chỉ emit một lần sau khi đóng modal
        nextTick(() => {
          emit('update:modelValue', updatedVariants);
        });
      }
    }
  }
  
  // Reset modal data
  setTimeout(() => {
    if (!stockHistoryModal.value.show) {
      stockHistoryModal.value.adjustmentQuantity = 0;
      stockHistoryModal.value.adjustmentNote = '';
      stockHistoryModal.value.history = [];
      stockHistoryModal.value.variant = {} as VariantItem;
    }
  }, 200);
}

const applyVariantStockAdjustment = async () => {
  // Tránh gọi nhiều lần khi đang xử lý
  if (stockHistoryModal.value.loading) return;
  stockHistoryModal.value.loading = true;
  
  // Lưu lại ID của variant đang xử lý
  const variantId = stockHistoryModal.value.variant.id;
  if (!variantId) {
    toast.error('Invalid variant ID');
    stockHistoryModal.value.loading = false;
    return;
  }
  
  // Lưu lại adjustmentQuantity trước khi bất kỳ API calls nào
  const adjustmentQuantity = stockHistoryModal.value.adjustmentQuantity;
  
  // Sử dụng store để adjust stock
  try {
    const result = await variantsStore.adjustVariantStock(
      variantId, 
      adjustmentQuantity, 
      stockHistoryModal.value.adjustmentNote
    );
    
    if (result) {
      // Cập nhật giá trị của variant hiện tại
      const currentQuantity = stockHistoryModal.value.variant.quantity || stockHistoryModal.value.variant.stock || 0;
      const newQuantity = currentQuantity + adjustmentQuantity;
      
      // Cập nhật cả stock và quantity trong variant hiện tại trong modal
      stockHistoryModal.value.variant.stock = newQuantity;
      stockHistoryModal.value.variant.quantity = newQuantity;
      
      // Kiểm tra xem đã có thay đổi thực sự chưa
      let hasChanges = false;
      
      // Cập nhật tất cả các variant trong modelValue
      const updatedVariants = props.modelValue.map(v => {
        if (v.id === variantId && (v.stock !== newQuantity || v.quantity !== newQuantity)) {
          hasChanges = true;
          return {
            ...v,
            stock: newQuantity,
            quantity: newQuantity
          };
        }
        return v;
      });
      
      // Chỉ emit nếu có thay đổi thực sự
      if (hasChanges) {
        emit('update:modelValue', updatedVariants);
      }
      
      // Hiển thị thông báo thành công
      toast.success(`Stock adjusted to ${newQuantity}`);
      
      // Tải lại history
      const history = await loadVariantStockHistory(variantId);
      stockHistoryModal.value.history = history || [];
    }
  } catch (error) {
    console.error('Error adjusting stock');
    toast.error('Failed to adjust stock');
  } finally {
    stockHistoryModal.value.loading = false;
    stockHistoryModal.value.adjustmentQuantity = 0;
    stockHistoryModal.value.adjustmentNote = '';
  }
}

const removeVariant = (variant: VariantItem) => {
  // Implement the logic to remove the variant
  if (process.env.NODE_ENV !== 'production') {
    console.log('Removing variant');
  }
}

// Tránh việc gọi emit liên tục trong onStockInputChange
const onStockInputChange = (variant: VariantItem) => {
  if (variant.id) {
    // Cập nhật trong store
    variantsStore.updateVariantStock(variant.id, variant.stock);
    
    // Đồng bộ giá trị quantity với stock
    variant.quantity = variant.stock;
    
    // Đảm bảo chỉ gọi emit một lần sau khi DOM cập nhật
    nextTick(() => {
      // Clone array để tạo một reference mới
      const updatedVariants = props.modelValue.map(v => 
        v.id === variant.id ? {...v, stock: variant.stock, quantity: variant.stock} : {...v}
      );
      
      // Kiểm tra khác biệt trước khi emit
      const currentJson = JSON.stringify(props.modelValue)
      const newJson = JSON.stringify(updatedVariants)
      
      if (currentJson !== newJson) {
        emit('update:modelValue', updatedVariants);
      }
    });
  } else {
    // Nếu không có ID (variant mới), đồng bộ quantity với stock
    variant.quantity = variant.stock;
  }
}

// Expose functions to template
defineExpose({
  loadVariantStockHistory,
  formatDate,
  getAdjustmentTypeLabel,
  getAdjustmentTypeClass
})
</script> 