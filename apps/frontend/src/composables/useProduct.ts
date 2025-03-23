import { computed, ref, watch } from 'vue';
import type { Product, ProductTranslation } from '@ew/shared';
import { useLocalization } from './useLocalization';
import { getLocalizedRoute } from '../utils/routes';
import { useTrpc } from './useTrpc';

export type ProductSortBy = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export interface ProductFilter {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categories?: number[];
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  includeNullPrice?: boolean;
  sortBy?: ProductSortBy;
  page: number;
  limit?: number;
  locale?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useProduct(initialFilters?: ProductFilter) {
  const { locale } = useLocalization();
  const trpc = useTrpc();

  // Filter state
  const filters = ref<ProductFilter>({
    search: initialFilters?.search || '',
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    categories: initialFilters?.categories || [],
    isFeatured: initialFilters?.isFeatured,
    isNew: initialFilters?.isNew,
    isSale: initialFilters?.isSale,
    includeNullPrice: true,
    sortBy: initialFilters?.sortBy || 'newest',
    page: initialFilters?.page || 1,
    limit: initialFilters?.limit || 12,
    locale: initialFilters?.locale || locale.value
  });

  // Products state
  const products = ref<Product[]>([]);
  const totalProducts = ref(0);
  const totalPages = ref(0);
  const isLoadingProducts = ref(false);

  // Price range state
  const priceRange = ref<PriceRange>({ min: 0, max: 1000000 });
  const isLoadingPriceRange = ref(true);

  // Search state
  const isSearching = ref(false);
  const searchTimeout = ref<NodeJS.Timeout | null>(null);

  /**
   * Get translation by locale
   */
  const getTranslationByLocale = (product: Product, targetLocale: string = locale.value): ProductTranslation | null => {
    if (!product.translations || product.translations.length === 0) {
      return null;
    }

    const found = product.translations.find(t => t.locale === targetLocale);
    return found || product.translations[0];
  };

  /**
   * Get product URL based on locale
   */
  const getProductUrl = (product: Product): string => {
    const translation = getTranslationByLocale(product);
    const slug = translation?.slug || product.id.toString();
    return getLocalizedRoute('PRODUCT_DETAIL', locale.value, { slug });
  };

  /**
   * Format price in VND
   */
  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  /**
   * Format price without currency symbol
   */
  const formatPriceSimple = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price);
  };

  /**
   * Parse price input (remove currency formatting)
   */
  const parsePriceInput = (value: string): number | null => {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue ? Number(numericValue) : null;
  };

  /**
   * Calculate discount percentage
   */
  const calculateDiscountPercentage = (price: number | null, comparePrice: number | null): number | null => {
    if (!comparePrice || !price) return null;
    const discount = ((comparePrice - price) / comparePrice) * 100;
    return Math.round(discount);
  };

  /**
   * Fetch price range from API
   */
  const fetchPriceRange = async () => {
    isLoadingPriceRange.value = true;
    try {
      const result = await trpc.product.getMinMaxPrice.query();
      priceRange.value = result;
      
      // Only update filter price range if not already set
      if (!initialFilters?.minPrice && !initialFilters?.maxPrice) {
        filters.value.minPrice = result.min;
        filters.value.maxPrice = result.max;
      }
    } catch (error) {
      console.error('Error fetching price range:', error);
      // Fallback to default values
      priceRange.value = { min: 0, max: 10000000 };
      if (!initialFilters?.minPrice && !initialFilters?.maxPrice) {
        filters.value.minPrice = 0;
        filters.value.maxPrice = 10000000;
      }
    } finally {
      isLoadingPriceRange.value = false;
    }
  };

  /**
   * Fetch products from API
   */
  const fetchProducts = async () => {
    isLoadingProducts.value = true;
    try {
      // Chỉ gửi các tham số filter khi chúng được chọn
      const filterParams = {
        locale: locale.value,
        search: filters.value.search || undefined,
        minPrice: typeof filters.value.minPrice === 'number' ? filters.value.minPrice : undefined,
        maxPrice: typeof filters.value.maxPrice === 'number' ? filters.value.maxPrice : undefined,
        categories: filters.value.categories?.length ? filters.value.categories : undefined,
        isFeatured: filters.value.isFeatured || undefined,
        isNew: filters.value.isNew || undefined,
        isSale: filters.value.isSale || undefined,
        includeNullPrice: filters.value.includeNullPrice,
        sortBy: filters.value.sortBy,
        page: filters.value.page,
        limit: filters.value.limit
      };

      const result = await trpc.product.getAll.query(filterParams);
      
      products.value = result.items;
      totalProducts.value = result.total;
      totalPages.value = result.totalPages;
    } catch (error) {
      console.error('Error fetching products:', error);
      products.value = [];
      totalProducts.value = 0;
      totalPages.value = 0;
    } finally {
      isLoadingProducts.value = false;
    }
  };

  /**
   * Update price range in filters
   */
  const updatePriceRange = (min: number, max: number) => {
    filters.value.minPrice = min;
    filters.value.maxPrice = max;
  };

  /**
   * Handle search input with debounce
   */
  const handleSearch = (search: string) => {
    isSearching.value = true;
    filters.value.search = search;
    
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }
    
    searchTimeout.value = setTimeout(() => {
      isSearching.value = false;
    }, 500);
  };

  /**
   * Toggle category selection
   */
  const toggleCategory = (categoryId: number) => {
    const categories = filters.value.categories || [];
    const index = categories.indexOf(categoryId);
    
    if (index === -1) {
      filters.value.categories = [...categories, categoryId];
    } else {
      categories.splice(index, 1);
      filters.value.categories = categories;
    }
  };

  /**
   * Reset all filters to default values
   */
  const resetFilters = () => {
    filters.value = {
      search: '',
      minPrice: priceRange.value.min,
      maxPrice: priceRange.value.max,
      categories: [],
      isFeatured: undefined,
      isNew: undefined,
      isSale: undefined,
      includeNullPrice: true,
      sortBy: 'newest',
      page: 1,
      limit: 12,
      locale: locale.value
    };
  };

  // Watch for filter changes and refetch products
  watch(filters, () => {
    fetchProducts();
  }, { deep: true });

  // Watch for locale changes
  watch(locale, () => {
    filters.value.locale = locale.value;
  });

  return {
    // State
    filters,
    products,
    totalProducts,
    totalPages,
    isLoadingProducts,
    priceRange,
    isLoadingPriceRange,
    isSearching,
    
    // Methods
    getTranslationByLocale,
    getProductUrl,
    formatPrice,
    formatPriceSimple,
    parsePriceInput,
    calculateDiscountPercentage,
    fetchPriceRange,
    fetchProducts,
    updatePriceRange,
    handleSearch,
    toggleCategory,
    resetFilters
  };
} 