<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
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
const categories = ref<{ id: number; name: string; count: number }[]>([]);
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
  tooltips: [
    {
      to: (value: number) => formatPriceSimple(value),
      from: (value: string) => parsePriceInput(value) || 0
    },
    {
      to: (value: number) => formatPriceSimple(value),
      from: (value: string) => parsePriceInput(value) || 0
    }
  ],
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

// Fetch categories (placeholder - replace with actual category fetching)
const fetchCategories = async () => {
  isLoadingCategories.value = true;
  try {
    // This is a placeholder - replace with actual category fetching
    // const result = await trpc.category.all.query();
    // categories.value = result;
    
    // Placeholder data
    categories.value = [
      { id: 1, name: 'Điện thoại', count: 12 },
      { id: 2, name: 'Laptop', count: 8 },
      { id: 3, name: 'Máy tính bảng', count: 5 },
      { id: 4, name: 'Phụ kiện', count: 20 },
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
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
const toggleSection = (section) => {
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
  <div class="product-sidebar rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <!-- Search -->
    <div class="p-4">
      <div class="relative">
        <UInput
          v-model="search"
          :placeholder="t('products.searchPlaceholder')"
          class="w-full search-input"
          :ui="{
            wrapper: 'relative',
            base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0',
            form: 'group flex items-center',
            input: 'w-full px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-0 appearance-none disabled:cursor-not-allowed disabled:opacity-75',
            inputSize: {
              '2xs': 'text-xs',
              'xs': 'text-xs',
              'sm': 'text-sm',
              'md': 'text-sm',
              'lg': 'text-sm',
              'xl': 'text-base'
            }
          }"
        >
          <template #leading>
            <Search class="h-4 w-4 text-gray-500" />
          </template>
          <template #trailing v-if="isSearching">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
          </template>
        </UInput>
        <div v-if="search" class="mt-2 text-xs text-gray-500">
          {{ t('products.searchingFor') }}: <span class="font-medium">{{ search }}</span>
        </div>
      </div>
    </div>
    
    <!-- Price Range -->
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div 
        @click="toggleSection('priceRange')"
        class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div class="flex items-center gap-2">
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
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ formatPrice(priceRange[0]) }}
            </span>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label class="mb-1 block text-xs text-gray-500">{{ t('products.minPrice') }}</label>
              <UInput
                v-model="minPriceInput"
                class="w-full price-input"
                :ui="{
                  wrapper: 'relative',
                  base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0',
                  form: 'group flex items-center',
                  input: 'w-full px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-0 appearance-none disabled:cursor-not-allowed disabled:opacity-75',
                  inputSize: {
                    '2xs': 'text-xs',
                    'xs': 'text-xs',
                    'sm': 'text-sm',
                    'md': 'text-sm',
                    'lg': 'text-sm',
                    'xl': 'text-base'
                  }
                }"
                @blur="updatePriceRange"
                @keyup.enter="updatePriceRange"
              >
                <template #leading>
                  <span class="text-xs text-gray-500">₫</span>
                </template>
              </UInput>
            </div>
            <div class="text-gray-400">-</div>
            <div class="w-1/2">
              <label class="mb-1 block text-xs text-gray-500">{{ t('products.maxPrice') }}</label>
              <UInput
                v-model="maxPriceInput"
                class="w-full price-input"
                :ui="{
                  wrapper: 'relative',
                  base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0',
                  form: 'group flex items-center',
                  input: 'w-full px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-0 appearance-none disabled:cursor-not-allowed disabled:opacity-75',
                  inputSize: {
                    '2xs': 'text-xs',
                    'xs': 'text-xs',
                    'sm': 'text-sm',
                    'md': 'text-sm',
                    'lg': 'text-sm',
                    'xl': 'text-base'
                  }
                }"
                @blur="updatePriceRange"
                @keyup.enter="updatePriceRange"
              >
                <template #leading>
                  <span class="text-xs text-gray-500">₫</span>
                </template>
              </UInput>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Categories -->
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div 
        @click="toggleSection('categories')"
        class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div class="flex items-center gap-2">
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
        
        <div v-else class="space-y-2">
          <div 
            v-for="category in categories" 
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
              <span class="text-xs text-gray-500">({{ category.count }})</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Product Flags -->
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div 
        @click="toggleSection('productType')"
        class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div class="flex items-center gap-2">
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
            <label for="featured" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
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
            <label for="new" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
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
            <label for="sale" class="ml-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Flame class="h-4 w-4 text-red-500" />
              {{ t('products.sale') }}
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reset Filters -->
    <div class="border-t border-gray-200 p-4 dark:border-gray-700">
      <UButton
        @click="resetFilters"
        variant="ghost"
        color="gray"
        block
        size="sm"
      >
        <template #leading>
          <RotateCcw class="h-4 w-4" />
        </template>
        {{ t('products.resetFilters') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for @vueform/slider */
.slider-primary {
  --slider-connect-bg: rgb(240 5.9% 10%);
  --slider-tooltip-bg: rgb(240 5.9% 10%);
  --slider-handle-ring-color: rgb(240 5.9% 10%);
  --slider-handle-bg: white;
  --slider-handle-border-color: rgb(240 5.9% 10%);
  --slider-handle-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --slider-handle-width: 18px;
  --slider-handle-height: 18px;
  --slider-bg: #e5e7eb;
  --slider-height: 8px;
  --slider-tooltip-color: white;
  --slider-tooltip-font-size: 0.75rem;
  --slider-tooltip-py: 0.25rem;
  --slider-tooltip-px: 0.5rem;
  --slider-tooltip-arrow-size: 0.5rem;
}

/* Dark mode adjustments */
:deep(.dark) .slider-primary {
  --slider-connect-bg: rgb(0 0% 100%);
  --slider-tooltip-bg: rgb(0 0% 100%);
  --slider-handle-ring-color: rgb(0 0% 100%);
  --slider-handle-bg: #1f2937;
  --slider-handle-border-color: rgb(0 0% 100%);
  --slider-bg: #374151;
}

/* Custom input styles */
:deep(.search-input), :deep(.price-input) {
  padding: 0.5rem 0.75rem;
}

:deep(.search-input .u-input-leading), :deep(.price-input .u-input-leading) {
  margin-right: 0.75rem;
}

:deep(.u-input-leading) {
  padding-left: 0.75rem;
}
</style> 