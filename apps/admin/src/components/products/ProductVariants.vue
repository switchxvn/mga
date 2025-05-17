<template>
  <div class="grid gap-6">
    <!-- Variants Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Biến thể sản phẩm</h3>
        <p class="text-sm text-slate-500">Quản lý biến thể và tùy chọn sản phẩm của bạn</p>
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
                Sản phẩm này có nhiều tùy chọn
              </label>
              <p class="text-sm text-slate-500">
                Như các kích cỡ hoặc màu sắc khác nhau
              </p>
            </div>
            <Switch
              id="hasVariants"
              :model-value="hasVariants"
              @update:model-value="$emit('update:has-variants', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="hasVariants ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Bật/tắt biến thể</span>
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
                <h4 class="text-sm font-medium">Tùy chọn</h4>
                <button
                  type="button"
                  @click="addOption"
                  class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  <PlusIcon class="h-4 w-4" />
                  Thêm tùy chọn
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
                        placeholder="Tên tùy chọn (VD: Kích thước, Màu sắc)"
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
                        placeholder="Nhập giá trị và nhấn Enter"
                        @keydown.enter="addValue(index)"
                        class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <button
                        type="button"
                        @click="addValue(index)"
                        class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Generated Variants -->
            <div v-if="displayVariants.length > 0" class="grid gap-4">
              <h4 class="text-sm font-medium">Biến thể</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-200">
                      <th class="px-4 py-2 text-left font-medium">Biến thể</th>
                      <th class="px-4 py-2 text-left font-medium">Giá</th>
                      <th class="px-4 py-2 text-left font-medium">Mã SKU</th>
                      <th class="px-4 py-2 text-left font-medium">Tồn kho</th>
                      <th class="px-4 py-2 text-left font-medium">Thao tác</th>
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
                          <div class="flex items-center mb-2">
                            <input
                              type="checkbox"
                              :id="`isContactPrice-${index}`"
                              :checked="variant.price === null"
                              @change="onToggleContactPrice(variant)"
                              class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <label :for="`isContactPrice-${index}`" class="ml-2 text-xs font-medium text-slate-900">
                              Giá liên hệ
                            </label>
                          </div>
                          <div v-if="variant.price === null" class="text-sm font-medium text-primary">
                            Giá liên hệ
                          </div>
                          <div v-else class="relative">
                            <span class="absolute left-3 top-2.5 text-slate-500">$</span>
                            <input
                              type="number"
                              v-model.number="variant.price"
                              @input="onPriceInput(variant, $event)"
                              class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              min="0"
                              step="0.01"
                              :disabled="variant.price === null"
                            />
                          </div>
                        </div>
                        
                        <!-- Compare at Price -->
                        <div v-if="variant.price !== null" class="relative w-32 mt-2">
                          <label class="block text-xs font-medium text-slate-500 mb-1">Giá so sánh</label>
                          <div class="relative">
                            <span class="absolute left-3 top-2.5 text-slate-500">$</span>
                            <input
                              type="number"
                              v-model.number="variant.comparePrice"
                              @input="onComparePriceInput(variant, $event)"
                              class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          v-model="variant.sku"
                          @input="onSkuInput(variant, $event)"
                          class="flex h-10 w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          v-model.number="variant.stock"
                          @input="onStockInput(variant, $event)"
                          class="flex h-10 w-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          min="0"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <div class="flex items-center space-x-2">
                          <button v-if="variant.id" @click="openStockHistoryModal(variant)" class="rounded-md p-2 hover:bg-slate-100">
                            <div class="flex items-center text-xs text-primary">
                              <PackageIcon class="h-4 w-4 mr-1" />
                              <span>Lịch sử tồn kho</span>
                            </div>
                          </button>
                          <div v-else class="relative group">
                            <button disabled class="rounded-md p-2 text-slate-400 cursor-not-allowed">
                              <div class="flex items-center text-xs">
                                <PackageIcon class="h-4 w-4 mr-1" />
                                <span>Lịch sử tồn kho</span>
                              </div>
                            </button>
                            <div class="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                              Lịch sử tồn kho sẽ có sau khi tạo sản phẩm.
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
    <StockHistoryModal 
      v-if="stockHistoryModal.show" 
      :variant="stockHistoryModal.variant"
      :loading="stockHistoryModal.loading"
      :history="stockHistoryModal.history"
      :adjustment-quantity="stockHistoryModal.adjustmentQuantity"
      :adjustment-note="stockHistoryModal.adjustmentNote"
      @close="closeStockHistoryModal"
      @apply-adjustment="applyVariantStockAdjustment"
      @update:adjustment-quantity="stockHistoryModal.adjustmentQuantity = $event"
      @update:adjustment-note="stockHistoryModal.adjustmentNote = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef } from 'vue'
import { PlusIcon, TrashIcon, XIcon, PackageIcon } from 'lucide-vue-next'
import { Switch } from '@headlessui/vue'
import { useRoute } from 'vue-router'
import { useTrpc } from '../../composables/useTrpc'
import { useToast } from '../../composables/useToast'
import { format } from 'date-fns'
import { useProductVariants } from '../../composables/useProductVariants'
import { ProductVariant } from '@ew/shared/lib/interfaces/product-variant.interface'
import StockHistoryModal from './StockHistoryModal.vue'

// Khởi tạo các composable
const route = useRoute()
const trpc = useTrpc()
const { success, error: showError, warning, info } = useToast()

// Định nghĩa hàm cartesian để tạo tổ hợp
const cartesian = (...args: any[][]): any[][] => {
  const result: any[][] = [];
  const max = args.length - 1;
  
  function helper(arr: any[], i: number) {
    for (let j = 0; j < args[i].length; j++) {
      const a = arr.slice(0);
      a.push(args[i][j]);
      if (i === max) {
        result.push(a);
      } else {
        helper(a, i + 1);
      }
    }
  }
  
  helper([], 0);
  return result;
};

// Thêm variantCombinations ref
const variantCombinations = ref<Record<string, string>[]>([]);

interface Option {
  name: string
  values: string[]
  newValue: string
}

const props = defineProps<{
  hasVariants: boolean
  modelValue: ProductVariant[]
}>()

const emit = defineEmits<{
  'update:has-variants': [value: boolean]
  'update:modelValue': [value: ProductVariant[]]
}>()

// Sử dụng composable để quản lý variants
const { 
  variants,
  loading,
  initializeVariants,
  updateVariantPrice,
  updateVariantComparePrice,
  updateVariantSku,
  updateVariantStock,
  toggleContactPrice,
  adjustVariantStockAPI,
  loadVariantStockHistory
} = useProductVariants(props.modelValue, {
  onVariantsUpdate: (updatedVariants) => {
    emit('update:modelValue', updatedVariants)
  }
})

const options = ref<Option[]>([])

// Parse variants from props
const processExistingVariants = () => {
  // Only process if hasVariants and modelValue has items
  if (props.hasVariants && props.modelValue && props.modelValue.length > 0) {
    // Reset options first
    options.value = [];
    
    // Analyze first variant to determine option structure
    const firstVariant = props.modelValue[0];
    if (firstVariant && firstVariant.options) {
      // Extract option names from first variant
      Object.keys(firstVariant.options).forEach(optionName => {
        // Add option if it doesn't exist yet
        if (!options.value.find(o => o.name === optionName)) {
          options.value.push({
            name: optionName,
            values: [],
            newValue: ''
          });
        }
      });
      
      // Now go through all variants to collect unique option values
      props.modelValue.forEach(variant => {
        if (variant.options) {
          // For each option in this variant
          Object.entries(variant.options).forEach(([optionName, optionValue]) => {
            // Find this option in our options array
            const option = options.value.find(o => o.name === optionName);
            if (option && optionValue) {
              // If this value doesn't exist in the option values, add it
              if (!option.values.includes(optionValue as string)) {
                option.values.push(optionValue as string);
              }
            }
          });
        }
      });
    }
    
    // Make sure to recalculate combinations after processing variants
    recalculateVariantCombinations();
  }
};

// Chỉ gọi processExistingVariants một lần khi component mounts
let processedVariants = false
onMounted(() => {
  if (!processedVariants && props.hasVariants && props.modelValue && props.modelValue.length > 0) {
    processExistingVariants()
    processedVariants = true
  }
  
  // Khởi tạo composable với modelValue một lần duy nhất
  initializeVariants(props.modelValue)
})

// Watch for changes in modelValue (variants)
watch(
  () => props.modelValue,
  (newVariants, oldVariants) => {
    // Check if the length changed
    if (newVariants?.length !== oldVariants?.length) {
      // Need to reinitialize
      initializeVariants(newVariants);
    } else if (newVariants && oldVariants) {
      // Check if the variant IDs changed
      const newIds = new Set(newVariants.map(v => v.id).filter(Boolean));
      const oldIds = new Set(oldVariants.map(v => v.id).filter(Boolean));
      
      if (newIds.size !== oldIds.size || 
          [...newIds].some(id => !oldIds.has(id)) || 
          [...oldIds].some(id => !newIds.has(id))) {
        // IDs changed, need to reinitialize
        initializeVariants(newVariants);
      }
    }
  },
  { deep: true }
);

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

// Generate all possible combinations of option values
const recalculateVariantCombinations = () => {
  // Get all options that have values
  const optionsWithValues = options.value.filter(o => o.values.length > 0);
  
  // If no options with values, no combinations possible
  if (optionsWithValues.length === 0) {
    variantCombinations.value = [];
    return;
  }
  
  // Generate combinations
  const valueSets = optionsWithValues.map(o => o.values);
  const result = cartesian(...valueSets);
  
  // Format combinations with option names
  variantCombinations.value = result.map(combination => {
    const combinationObj: Record<string, string> = {};
    
    combination.forEach((value, index) => {
      combinationObj[optionsWithValues[index].name] = value;
    });
    
    return combinationObj;
  });
  
  // Sync variants with combinations
  syncVariantsWithCombinations();
};

// Computed để tạo variants từ combinations
const generatedVariants = computed(() => {
  if (!options.value.length || !variantCombinations.value.length) {
    return [];
  }
  
  return variantCombinations.value.map(combo => {
    // Tìm variant hiện có trong danh sách với các options khớp
    const existingVariant = props.modelValue.find(v => {
      return v.options && Object.entries(combo).every(
        ([key, value]) => v.options?.[key] === value
      )
    });

    // Tạo tên hiển thị
    const name = Object.entries(combo)
      .map(([_, value]) => `${value}`)
      .join(' / ');

    // Nếu có variant hiện có, sử dụng nó, nếu không tạo mới
    return existingVariant || {
      name,
      price: 0,
      sku: '',
      stock: 0,
      quantity: 0,
      options: combo,
      comparePrice: null
    };
  });
});

// Computed để hiển thị variants (từ dynamic combinations hoặc từ props)
const displayVariants = computed(() => {
  // Nếu có options, sử dụng variants từ combinations
  if (options.value.length > 0) {
    return generatedVariants.value;
  }
  
  // Nếu không có options nhưng có modelValue, trả về modelValue
  return variants.value;
});

// Event handlers cho các thao tác trên form
const onPriceInput = (variant: ProductVariant, event: Event) => {
  // Log trước thay đổi
  console.log(`Updating variant price: ${variant.id}, current: ${variant.price}, new: ${(event.target as HTMLInputElement).value}`);
  
  const target = event.target as HTMLInputElement;
  const newPrice = target.value ? Number(target.value) : 0;
  
  if (variant.id) {
    // Cập nhật thông qua composable nếu đã có ID
    updateVariantPrice(variant.id, newPrice);
  } else {
    // Cập nhật trực tiếp cho variants mới
    variant.price = newPrice;
    // Đảm bảo emit event để cập nhật form
    emit('update:modelValue', [...variants.value]);
  }
};

const onComparePriceInput = (variant: ProductVariant, event: Event) => {
  // Log trước thay đổi
  console.log(`Updating variant comparePrice: ${variant.id}, current: ${variant.comparePrice}, new: ${(event.target as HTMLInputElement).value}`);
  
  const target = event.target as HTMLInputElement;
  const newComparePrice = target.value ? Number(target.value) : null;
  
  if (variant.id) {
    // Cập nhật thông qua composable nếu đã có ID
    updateVariantComparePrice(variant.id, newComparePrice);
  } else {
    // Cập nhật trực tiếp cho variants mới
    variant.comparePrice = newComparePrice;
    // Đảm bảo emit event để cập nhật form
    emit('update:modelValue', [...variants.value]);
  }
};

const onSkuInput = (variant: ProductVariant, event: Event) => {
  // Log trước thay đổi
  console.log(`Updating variant SKU: ${variant.id}, current: ${variant.sku}, new: ${(event.target as HTMLInputElement).value}`);
  
  const target = event.target as HTMLInputElement;
  
  if (variant.id) {
    // Cập nhật thông qua composable nếu đã có ID
    updateVariantSku(variant.id, target.value);
  } else {
    // Cập nhật trực tiếp cho variants mới
    variant.sku = target.value;
    // Đảm bảo emit event để cập nhật form
    emit('update:modelValue', [...variants.value]);
  }
};

const onStockInput = (variant: ProductVariant, event: Event) => {
  // Log trước thay đổi
  console.log(`Updating variant stock: ${variant.id}, current: ${variant.stock}, new: ${(event.target as HTMLInputElement).value}`);
  
  const target = event.target as HTMLInputElement;
  const newStock = target.value ? Number(target.value) : 0;
  
  if (variant.id) {
    // Cập nhật thông qua composable nếu đã có ID
    updateVariantStock(variant.id, newStock);
  } else {
    // Cập nhật trực tiếp cho variants mới
    variant.stock = newStock;
    variant.quantity = newStock; // Đồng bộ cả stock và quantity
    // Đảm bảo emit event để cập nhật form
    emit('update:modelValue', [...variants.value]);
  }
};

const onToggleContactPrice = (variant: ProductVariant) => {
  // Log trước thay đổi
  console.log(`Toggling contact price for variant: ${variant.id}, current price: ${variant.price}`);
  
  if (variant.id) {
    // Cập nhật thông qua composable nếu đã có ID
    toggleContactPrice(variant.id);
  } else {
    // Cập nhật trực tiếp cho variants mới
    if (variant.price === null) {
      // Đang ở trạng thái "Giá liên hệ", chuyển về giá bình thường
      variant.price = variant._tempPrice !== undefined ? variant._tempPrice : 0;
      variant.comparePrice = variant._tempComparePrice !== undefined ? variant._tempComparePrice : null;
      
      // Xóa giá tạm
      delete variant._tempPrice;
      delete variant._tempComparePrice;
    } else {
      // Đang có giá, chuyển sang "Giá liên hệ"
      variant._tempPrice = variant.price;
      variant._tempComparePrice = variant.comparePrice;
      
      variant.price = null;
      variant.comparePrice = null;
    }
    
    // Đảm bảo emit event để cập nhật form
    emit('update:modelValue', [...variants.value]);
  }
};

// Remove variant
const removeVariant = (variant: ProductVariant) => {
  // Implement the logic to remove the variant
  if (process.env.NODE_ENV !== 'production') {
    console.log('Removing variant');
  }
}

// Stock history modal, simplified
const stockHistoryModal = ref({
  show: false,
  variant: {} as ProductVariant,
  adjustmentQuantity: 0,
  adjustmentNote: '',
  history: [] as any[],
  loading: false
});

const openStockHistoryModal = async (variant: ProductVariant) => {
  stockHistoryModal.value = {
    show: true,
    variant: JSON.parse(JSON.stringify(variant)),
    adjustmentQuantity: 0,
    adjustmentNote: '',
    history: [],
    loading: true
  };
  
  try {
    if (variant.id) {
      const history = await loadVariantStockHistory(variant.id);
      stockHistoryModal.value.history = history || [];
    }
  } catch (error) {
    console.error('Error loading variant data');
  } finally {
    stockHistoryModal.value.loading = false;
  }
}

const closeStockHistoryModal = () => {
  stockHistoryModal.value.show = false;
}

const applyVariantStockAdjustment = async () => {
  if (stockHistoryModal.value.loading) return;
  stockHistoryModal.value.loading = true;
  
  const variantId = stockHistoryModal.value.variant.id;
  if (!variantId) {
    showError('Invalid variant ID');
    stockHistoryModal.value.loading = false;
    return;
  }
  
  try {
    const result = await adjustVariantStockAPI(
      variantId, 
      stockHistoryModal.value.adjustmentQuantity, 
      stockHistoryModal.value.adjustmentNote
    );
    
    if (result) {
      success(`Stock adjusted successfully`);
      const history = await loadVariantStockHistory(variantId);
      stockHistoryModal.value.history = history || [];
    }
  } catch (error) {
    console.error('Error adjusting stock');
    showError('Failed to adjust stock');
  } finally {
    stockHistoryModal.value.loading = false;
    stockHistoryModal.value.adjustmentQuantity = 0;
    stockHistoryModal.value.adjustmentNote = '';
  }
}

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
    'ADMIN_ADJUSTMENT': 'Điều chỉnh bởi Admin',
    'CUSTOMER_ORDER': 'Đơn hàng khách',
    'REFUND': 'Hoàn tiền',
    'INVENTORY_CHECK': 'Kiểm kê kho',
    'RETURN': 'Trả hàng',
    'DAMAGED': 'Hàng hỏng',
    'INITIAL_STOCK': 'Tồn kho ban đầu'
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

// Sync variants with combinations
const syncVariantsWithCombinations = () => {
  // Cập nhật variants dựa trên các tổ hợp mới
  console.log('syncVariantsWithCombinations - Current variants:', variants.value.length);
  console.log('syncVariantsWithCombinations - Current combinations:', variantCombinations.value.length);
  
  // Đồng bộ và emit event để thông báo thay đổi
  nextTick(() => {
    // Đảm bảo gửi thông báo cập nhật sau khi đồng bộ
    console.log('Emitting update after syncing variants');
    emit('update:modelValue', [...variants.value]);
  });
};

const notifyVariantsUpdated = () => {
  if (options?.onVariantsUpdate) {
    const clonedVariants = deepClone(variants.value);
    console.log('ProductVariants: Emitting variants update with', clonedVariants.length, 'variants');
    options.onVariantsUpdate(clonedVariants);
  }
  
  // Emit update:modelValue event directly
  console.log('ProductVariants: Emitting update:modelValue with', variants.value.length, 'variants');
  emit('update:modelValue', deepClone(variants.value));
};

// Expose functions to template
defineExpose({
  loadVariantStockHistory,
  formatDate,
  getAdjustmentTypeLabel,
  getAdjustmentTypeClass
})
</script> 