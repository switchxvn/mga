<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import { useCategory, CategoryType } from '~/composables/useCategory';
import { 
  Search, 
  DollarSign, 
  LayoutGrid, 
  Tag, 
  Star, 
  Sparkles, 
  Flame, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw 
} from 'lucide-vue-next';
import Slider from '@vueform/slider';
import '@vueform/slider/themes/default.css';

const { t, locale } = useLocalization();
const trpc = useTrpc();
const categoryComposable = useCategory();
const { loading: categoriesLoading } = categoryComposable;
const productCategories = ref([]);

// Computed để lọc và gộp các danh mục trùng tên
const uniqueCategories = computed(() => {
  if (!productCategories.value || productCategories.value.length === 0) {
    return [];
  }
  
  // Tạo map để gộp các danh mục theo slug
  const categoryMap = new Map();
  
  productCategories.value.forEach(category => {
    const existingCategory = categoryMap.get(category.slug);
    
    if (existingCategory) {
      // Nếu danh mục đã tồn tại, gộp số lượng sản phẩm
      const combinedProducts = [...(existingCategory.products || []), ...(category.products || [])];
      categoryMap.set(category.slug, {
        ...category,
        products: combinedProducts
      });
    } else {
      categoryMap.set(category.slug, category);
    }
  });
  
  // Chuyển map thành mảng và sắp xếp theo tên
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
});

const props = defineProps<{
  initialFilters?: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    categories?: number[];
    isFeatured?: boolean;
    isNew?: boolean;
    isSale?: boolean;
  };
}>();

const emit = defineEmits<{
  (e: 'filter-change', filters: any): void;
}>();

// Filter state
const search = ref(props.initialFilters?.search || '');
const priceRange = ref<[number, number]>([
  props.initialFilters?.minPrice || 0,
  props.initialFilters?.maxPrice || 1000000,
]);
const selectedCategories = ref<number[]>(props.initialFilters?.categories || []);
const isFeatured = ref(props.initialFilters?.isFeatured || false);
const isNew = ref(props.initialFilters?.isNew || false);
const isSale = ref(props.initialFilters?.isSale || false);

// UI state
const expandedSections = ref({
  priceRange: true,
  categories: true,
  productType: true
});

// Price range data
const minMaxPrice = ref<{ min: number; max: number }>({ min: 0, max: 1000000 });
const isLoadingPriceRange = ref(true);

// Custom price range inputs
const minPriceInput = ref('');
const maxPriceInput = ref('');

// Search state
const isSearching = ref(false);
const searchTimeout = ref<NodeJS.Timeout | null>(null);

// Categories data
// const categories = ref<{ id: number; name: string; count: number }[]>([]);
const isLoadingCategories = ref(true);

// Computed percentage values for slider positioning
const minPercentage = computed(() => {
  return ((priceRange.value[0] - minMaxPrice.value.min) / (minMaxPrice.value.max - minMaxPrice.value.min)) * 100;
});

const maxPercentage = computed(() => {
  return ((priceRange.value[1] - minMaxPrice.value.min) / (minMaxPrice.value.max - minMaxPrice.value.min)) * 100;
});

// Slider options
const sliderOptions = computed(() => ({
  connect: true,
  range: {
    'min': minMaxPrice.value.min,
    'max': minMaxPrice.value.max
  },
  step: 10000,
  tooltips: false,
  pips: false
}));

// Handle price range change from slider
const handlePriceRangeChange = (values: number[]) => {
  if (Array.isArray(values) && values.length === 2) {
    priceRange.value = [values[0], values[1]];
    updatePriceInputs();
  }
};

// Fetch price range
const fetchPriceRange = async () => {
  isLoadingPriceRange.value = true;
  try {
    const result = await trpc.product.getMinMaxPrice.query();
    minMaxPrice.value = result;
    
    // Only update price range if not already set by user
    if (!props.initialFilters?.minPrice && !props.initialFilters?.maxPrice) {
      priceRange.value = [result.min, result.max];
      updatePriceInputs();
    } else {
      priceRange.value = [
        props.initialFilters?.minPrice || result.min,
        props.initialFilters?.maxPrice || result.max
      ];
      updatePriceInputs();
    }
  } catch (error) {
    console.error('Error fetching price range:', error);
    // Fallback to default values
    minMaxPrice.value = { min: 0, max: 10000000 };
    priceRange.value = [0, 10000000];
    updatePriceInputs();
  } finally {
    isLoadingPriceRange.value = false;
  }
};

// Update price inputs when range changes
const updatePriceInputs = () => {
  minPriceInput.value = formatPriceSimple(priceRange.value[0]);
  maxPriceInput.value = formatPriceSimple(priceRange.value[1]);
};

// Update range when inputs change
const updatePriceRange = () => {
  const min = parsePriceInput(minPriceInput.value);
  const max = parsePriceInput(maxPriceInput.value);
  
  if (min !== null && max !== null) {
    // Ensure min <= max
    if (min <= max) {
      priceRange.value = [min, max];
    } else {
      // If min > max, swap values
      priceRange.value = [max, min];
      updatePriceInputs();
    }
  }
};

// Handle search input
const handleSearchInput = () => {
  isSearching.value = true;
  
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Set new timeout to apply search after typing stops
  searchTimeout.value = setTimeout(() => {
    applyFilters();
    isSearching.value = false;
  }, 500);
};

// Parse price input (remove currency formatting)
const parsePriceInput = (value: string): number | null => {
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue ? Number(numericValue) : null;
};

// Fetch categories from API
const fetchCategories = async () => {
  isLoadingCategories.value = true;
  try {
    // Lấy danh mục sản phẩm
    const result = await categoryComposable.fetchProductCategories();
    
    // Lọc các danh mục trùng lặp dựa trên slug
    const uniqueSlugs = new Set();
    const filteredCategories = [];
    
    for (const category of result) {
      if (!uniqueSlugs.has(category.slug)) {
        uniqueSlugs.add(category.slug);
        filteredCategories.push(category);
      }
    }
    
    // Cập nhật danh sách danh mục
    productCategories.value = filteredCategories;
  } catch (error) {
    console.error('Error fetching product categories:', error);
  } finally {
    isLoadingCategories.value = false;
  }
};

// Format price for display
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Format price without currency symbol for input
const formatPriceSimple = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price);
};

// Apply filters
const applyFilters = () => {
  emit('filter-change', {
    search: search.value,
    minPrice: priceRange.value[0],
    maxPrice: priceRange.value[1],
    includeNullPrice: true,
    categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
    isFeatured: isFeatured.value ? true : undefined,
    isNew: isNew.value ? true : undefined,
    isSale: isSale.value ? true : undefined,
  });
};

// Reset filters
const resetFilters = () => {
  search.value = '';
  priceRange.value = [minMaxPrice.value.min, minMaxPrice.value.max];
  updatePriceInputs();
  selectedCategories.value = [];
  isFeatured.value = false;
  isNew.value = false;
  isSale.value = false;
  
  applyFilters();
};

// Toggle category selection
const toggleCategory = (categoryId: number) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index === -1) {
    selectedCategories.value.push(categoryId);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

// Toggle section expansion
const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

// Watch for changes and apply filters
watch([selectedCategories, isFeatured, isNew, isSale], () => {
  applyFilters();
}, { deep: true });

// Watch price range changes
watch(priceRange, () => {
  updatePriceInputs();
  applyFilters();
}, { deep: true });

// Watch for search changes
watch(search, () => {
  handleSearchInput();
});

// Initialize
onMounted(() => {
  fetchPriceRange();
  fetchCategories();
});
</script>

<template>
  <div class="product-sidebar">
    <!-- Single Card Container -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <!-- Search -->
      <div class="p-4">
        <div class="relative">
          <div class="custom-input-container">
            <UInput
              v-model="search"
              :placeholder="t('products.searchPlaceholder')"
              class="w-full search-input"
              size="md"
              :loading="isSearching"
            >
              <template #leading>
                <div class="leading-icon-wrapper">
                  <Search class="h-4 w-4 text-gray-500" />
                </div>
              </template>
            </UInput>
          </div>
          <div v-if="search" class="mt-2 text-xs text-gray-500">
            {{ t('products.searchingFor') }}: <span class="font-medium">{{ search }}</span>
          </div>
        </div>
      </div>
      
      <hr class="border-gray-200 dark:border-gray-700 mx-4">
      
      <!-- Price Range -->
      <div>
        <div 
          @click="toggleSection('priceRange')"
          class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center gap-2.5">
            <DollarSign class="h-5 w-5 text-primary-500" />
            <h3 class="font-medium text-gray-900 dark:text-white">{{ t('products.priceRange') }}</h3>
          </div>
          <component 
            :is="expandedSections.priceRange ? ChevronUp : ChevronDown" 
            class="h-5 w-5 text-gray-500"
          />
        </div>
        
        <div v-if="expandedSections.priceRange" class="px-4 pb-4">
          <div v-if="isLoadingPriceRange" class="flex justify-center py-4">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
          </div>
          
          <div v-else>
            <!-- Price Range Display -->
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-sky-500 dark:text-sky-400">
                {{ formatPrice(priceRange[0]) }}
              </span>
              <span class="text-sm font-medium text-sky-500 dark:text-sky-400">
                {{ formatPrice(priceRange[1]) }}
              </span>
            </div>
            
            <!-- Vueform Slider -->
            <div class="mb-6 mt-6 px-2">
              <Slider
                v-model="priceRange"
                :options="sliderOptions"
                class="slider-primary"
                @update="handlePriceRangeChange"
              />
            </div>
            
            <!-- Price Inputs -->
            <div class="mt-4 flex items-center justify-between gap-4">
              <div class="w-1/2">
                <div class="custom-input-container">
                  <UInput
                    v-model="minPriceInput"
                    class="w-full price-input"
                    size="md"
                    @blur="updatePriceRange"
                    @keyup.enter="updatePriceRange"
                  >
                    <template #leading>
                      <div class="leading-icon-wrapper">
                        <span class="text-xs text-gray-500">₫</span>
                      </div>
                    </template>
                  </UInput>
                </div>
              </div>
              <div class="text-gray-400">-</div>
              <div class="w-1/2">
                <div class="custom-input-container">
                  <UInput
                    v-model="maxPriceInput"
                    class="w-full price-input"
                    size="md"
                    @blur="updatePriceRange"
                    @keyup.enter="updatePriceRange"
                  >
                    <template #leading>
                      <div class="leading-icon-wrapper">
                        <span class="text-xs text-gray-500">₫</span>
                      </div>
                    </template>
                  </UInput>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <hr class="border-gray-200 dark:border-gray-700 mx-4">
      
      <!-- Categories -->
      <div>
        <div 
          @click="toggleSection('categories')"
          class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center gap-2.5">
            <LayoutGrid class="h-5 w-5 text-primary-500" />
            <h3 class="font-medium text-gray-900 dark:text-white">{{ t('products.categories') }}</h3>
          </div>
          <component 
            :is="expandedSections.categories ? ChevronUp : ChevronDown" 
            class="h-5 w-5 text-gray-500"
          />
        </div>
        
        <div v-if="expandedSections.categories" class="px-4 pb-4">
          <div v-if="isLoadingCategories" class="flex justify-center py-4">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
          </div>
          
          <div v-else-if="uniqueCategories.length === 0" class="py-2 text-sm text-gray-500 text-center">
            {{ t('products.noCategories') || 'Không có danh mục nào' }}
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="category in uniqueCategories" 
              :key="category.id"
              class="flex items-center"
            >
              <UCheckbox
                :model-value="selectedCategories.includes(category.id)"
                @update:model-value="toggleCategory(category.id)"
                :name="`category-${category.id}`"
                color="primary"
              />
              <label :for="`category-${category.id}`" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                {{ category.name }} 
                <span class="text-xs text-gray-500">({{ category.products?.length || 0 }})</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <hr class="border-gray-200 dark:border-gray-700 mx-4">
      
      <!-- Product Flags -->
      <div>
        <div 
          @click="toggleSection('productType')"
          class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center gap-2.5">
            <Tag class="h-5 w-5 text-primary-500" />
            <h3 class="font-medium text-gray-900 dark:text-white">{{ t('products.productType') }}</h3>
          </div>
          <component 
            :is="expandedSections.productType ? ChevronUp : ChevronDown" 
            class="h-5 w-5 text-gray-500"
          />
        </div>
        
        <div v-if="expandedSections.productType" class="px-4 pb-4">
          <div class="space-y-2">
            <div class="flex items-center">
              <UCheckbox
                v-model="isFeatured"
                name="featured"
                color="primary"
              />
              <label for="featured" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Star class="h-4 w-4 text-amber-500" />
                {{ t('products.featured') }}
              </label>
            </div>
            
            <div class="flex items-center">
              <UCheckbox
                v-model="isNew"
                name="new"
                color="primary"
              />
              <label for="new" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles class="h-4 w-4 text-blue-500" />
                {{ t('products.new') }}
              </label>
            </div>
            
            <div class="flex items-center">
              <UCheckbox
                v-model="isSale"
                name="sale"
                color="primary"
              />
              <label for="sale" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Flame class="h-4 w-4 text-red-500" />
                {{ t('products.sale') }}
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <hr class="border-gray-200 dark:border-gray-700 mx-4">
      
      <!-- Reset Filters -->
      <div class="p-4">
        <UButton
          @click="resetFilters"
          variant="ghost"
          color="gray"
          block
          size="sm"
          class="mt-0"
        >
          <template #leading>
            <RotateCcw class="h-4 w-4 mr-1.5" />
          </template>
          {{ t('products.resetFilters') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for @vueform/slider */
.slider-primary {
  --slider-connect-bg: #0ea5e9;
  --slider-handle-ring-color: #0ea5e9;
  --slider-handle-bg: white;
  --slider-handle-border-color: #0ea5e9;
  --slider-handle-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --slider-handle-width: 18px;
  --slider-handle-height: 18px;
  --slider-bg: #e5e7eb;
  --slider-height: 8px;
  --slider-touch-area-bg: rgba(14, 165, 233, 0.15);
  --slider-touch-area-width: 40px;
  --slider-touch-area-height: 40px;
}

/* Dark mode adjustments */
:deep(.dark) .slider-primary {
  --slider-connect-bg: #38bdf8;
  --slider-handle-ring-color: #38bdf8;
  --slider-handle-bg: #1f2937;
  --slider-handle-border-color: #38bdf8;
  --slider-bg: #374151;
  --slider-touch-area-bg: rgba(56, 189, 248, 0.2);
}

/* Custom input container */
.custom-input-container {
  position: relative;
}

/* Leading icon wrapper */
.leading-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  margin-right: 12px;
}

/* Adjust input padding */
:deep(.search-input), :deep(.price-input) {
  padding: 0.5rem 0rem;
}

/* Adjust input field padding */
:deep(.search-input input), :deep(.price-input input) {
  padding-left: 36px !important;
}

/* Position the leading icon */
:deep(.u-input-leading) {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

/* Ensure the input form has proper spacing */
:deep(.u-input-form) {
  position: relative;
}

.product-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style> 