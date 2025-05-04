import { computed, ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocalization } from './useLocalization';
import { useTrpc } from './useTrpc';
import type { Seo, ReviewStatus } from '@ew/shared';

interface ReviewTranslation {
  id: number;
  locale: string;
  title?: string;
  content: string;
  reviewId: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewServiceType {
  id: number;
  slug: string;
  translations: {
    locale: string;
    name: string;
  }[];
}

interface Review {
  id: number;
  authorName: string;
  authorAvatar?: string;
  profession?: string;
  rating: number;
  serviceTypeId?: number;
  serviceType?: ReviewServiceType;
  visitDate?: string;
  featured: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  translations: ReviewTranslation[];
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useReviews() {
  const route = useRoute();
  const router = useRouter();
  const trpc = useTrpc();
  const { t, locale } = useLocalization();

  // Create computed for current locale
  const currentLocale = computed(() => {
    return typeof locale === 'object' && 'value' in locale ? locale.value : 'en';
  });

  // State
  const isLoading = ref(true);
  const reviews = ref<Review[]>([]);
  const averageRating = ref<string>('0.0');
  const totalReviews = ref<number>(0);
  const ratingDistribution = ref<Record<string, number>>({
    '5': 0,
    '4': 0,
    '3': 0,
    '2': 0,
    '1': 0,
  });

  // Selected review for modal
  const selectedReview = ref<Review | null>(null);
  const showModal = ref(false);
  const expandedContents = ref<Record<number, boolean>>({});

  // Pagination
  const pagination = reactive({
    page: 1,
    limit: 9,
    totalPages: 1,
    total: 0,
  });

  // Filters
  const filters = reactive({
    sortBy: 'latest',
    minRating: 0,
    serviceTypeId: 0,
  });

  // Service types
  const serviceTypes = ref<ReviewServiceType[]>([]);

  // SEO data
  const seoData = ref<Seo | null>(null);

  // Initialize filters and pagination from URL query parameters
  const initializeFromQuery = () => {
    const query = route.query;
    
    // Initialize pagination
    if (query.page && !isNaN(Number(query.page))) {
      pagination.page = Number(query.page);
    } else {
      pagination.page = 1; // Default to page 1
    }
    
    // Initialize filters
    if (query.sortBy && ['latest', 'highest_rating', 'lowest_rating'].includes(query.sortBy as string)) {
      filters.sortBy = query.sortBy as string;
    } else {
      filters.sortBy = 'latest'; // Default sort
    }
    
    if (query.minRating && !isNaN(Number(query.minRating))) {
      filters.minRating = Number(query.minRating);
    } else {
      filters.minRating = 0; // Default min rating
    }
    
    if (query.serviceTypeId && !isNaN(Number(query.serviceTypeId))) {
      filters.serviceTypeId = Number(query.serviceTypeId);
    } else {
      filters.serviceTypeId = 0; // Default service type
    }
  };

  // Load reviews
  const loadReviews = async () => {
    isLoading.value = true;
    
    try {
      // Lấy giá trị page từ URL (hoặc sử dụng 1 nếu không có)
      const currentPage = route.query.page ? Number(route.query.page) : 1;
      
      // Cập nhật state để đồng bộ với URL
      pagination.page = currentPage;
      
      const result = await trpc.review.list.query({
        page: currentPage,
        limit: pagination.limit,
        locale: currentLocale.value,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        serviceTypeId: filters.serviceTypeId > 0 ? filters.serviceTypeId : undefined,
        sortBy: filters.sortBy as any,
      });
      
      // Extract data from the correct structure
      let reviewsData = null;
      let metaData = null;
      
      // Case 1: Array format with result[0].result.data structure
      if (Array.isArray(result) && result[0]?.result?.data) {
        reviewsData = result[0].result.data.data;
        metaData = result[0].result.data.meta;
      }
      // Case 2: Object with result.data structure 
      else if (result?.data?.data) {
        reviewsData = result.data.data;
        metaData = result.data.meta;
      }
      // Case 3: Direct result structure
      else if (result?.data) {
        reviewsData = result.data;
        metaData = result.meta;
      }
      // Case 4: Direct array
      else if (Array.isArray(result)) {
        reviewsData = result;
      }
      
      // Ensure we have valid data
      reviews.value = Array.isArray(reviewsData) ? reviewsData : [];
      
      if (metaData) {
        pagination.total = metaData.total || 0;
        pagination.totalPages = metaData.totalPages || 1;
      }
      
      await loadRatingStats();
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Reset to empty state on error
      reviews.value = [];
      pagination.total = 0;
      pagination.totalPages = 1;
    } finally {
      isLoading.value = false;
    }
  };

  // Load service types
  const loadServiceTypes = async () => {
    try {
      const result = await trpc.review.getServiceTypes.query({ locale: currentLocale.value });
      
      let serviceTypesData = null;
      
      // Case 1: Array format with result[0].result.data structure
      if (Array.isArray(result) && result[0]?.result?.data) {
        serviceTypesData = result[0].result.data;
      }
      // Case 2: Object with result.data structure
      else if (result?.data) {
        serviceTypesData = result.data;
      }
      // Case 3: Direct result
      else {
        serviceTypesData = result;
      }
      
      serviceTypes.value = Array.isArray(serviceTypesData) ? serviceTypesData : [];
    } catch (error) {
      console.error('Error loading service types:', error);
      serviceTypes.value = [];
    }
  };

  // Load rating stats
  const loadRatingStats = async () => {
    try {
      const serviceTypeId = filters.serviceTypeId > 0 ? filters.serviceTypeId : undefined;
      
      // Get average rating
      const ratingResult = await trpc.review.getAverageRating.query({ serviceTypeId });
      
      let ratingStatsData = null;
      
      // Case 1: Array format with result[0].result.data structure
      if (Array.isArray(ratingResult) && ratingResult[0]?.result?.data) {
        ratingStatsData = ratingResult[0].result.data;
      }
      // Case 2: Object with result.data structure
      else if (ratingResult?.data) {
        ratingStatsData = ratingResult.data;
      }
      // Case 3: Direct result
      else {
        ratingStatsData = ratingResult;
      }
      
      averageRating.value = ratingStatsData?.averageRating || '0.0';
      totalReviews.value = ratingStatsData?.totalReviews || 0;
      
      // Get rating distribution
      const distResult = await trpc.review.getRatingDistribution.query({ serviceTypeId });
      
      let distributionData = null;
      
      // Case 1: Array format with result[0].result.data structure
      if (Array.isArray(distResult) && distResult[0]?.result?.data) {
        distributionData = distResult[0].result.data;
      }
      // Case 2: Object with result.data structure
      else if (distResult?.data) {
        distributionData = distResult.data;
      }
      // Case 3: Direct result
      else {
        distributionData = distResult;
      }
      
      ratingDistribution.value = distributionData || {
        '5': 0, '4': 0, '3': 0, '2': 0, '1': 0
      };
    } catch (error) {
      console.error('Error loading rating stats:', error);
      // Reset to default values on error
      averageRating.value = '0.0';
      totalReviews.value = 0;
      ratingDistribution.value = {
        '5': 0, '4': 0, '3': 0, '2': 0, '1': 0
      };
    }
  };

  // Filter handlers
  const applyFilters = () => {
    // Tạo query mới với page=1 (reset về trang đầu tiên)
    const query: Record<string, string> = { page: '1' };
    
    // Thêm các filter params
    if (filters.sortBy !== 'latest') {
      query.sortBy = filters.sortBy;
    }
    
    if (filters.minRating > 0) {
      query.minRating = filters.minRating.toString();
    }
    
    if (filters.serviceTypeId > 0) {
      query.serviceTypeId = filters.serviceTypeId.toString();
    }
    
    // Cập nhật URL
    router.push({ query }).catch(err => {
      console.error('Router navigation error after applying filters:', err);
    });
  };

  const clearFilters = () => {
    // Reset các giá trị filter trong state (cần thiết để UI cập nhật)
    filters.sortBy = 'latest';
    filters.minRating = 0;
    filters.serviceTypeId = 0;
    
    // Chỉ giữ lại tham số page=1 và xóa tất cả filter khác
    const query: Record<string, string> = { page: '1' };
    
    // Cập nhật URL
    router.push({ query }).catch(err => {
      console.error('Router navigation error after clearing filters:', err);
    });
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    // Lấy trang hiện tại từ URL thay vì từ state
    const currentPageFromURL = route.query.page ? Number(route.query.page) : 1;
    
    if (currentPageFromURL === page) {
      return;
    }
    
    // Cập nhật URL trước (không cập nhật state pagination.page)
    const query = { ...route.query, page: String(page) };
    
    // Thay router.replace bằng router.push
    router.push({ query }).catch(err => {
      console.error('Router navigation error:', err);
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLocale.value === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Calculate rating percentage
  const getRatingPercentage = (rating: number) => {
    if (totalReviews.value === 0) return 0;
    return (ratingDistribution.value[rating] / totalReviews.value) * 100;
  };

  // Get rating stars array
  const getStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  };

  // Get service type name
  const getServiceTypeName = (serviceType: ReviewServiceType | undefined) => {
    if (!serviceType) return '';
    
    const translation = serviceType.translations.find(t => t.locale === currentLocale.value);
    return translation?.name || serviceType.translations[0]?.name || '';
  };

  // Modal handlers
  const openAvatarModal = (review: Review) => {
    selectedReview.value = review;
    showModal.value = true;
    document.body.classList.add('overflow-hidden');
  };

  const closeAvatarModal = () => {
    showModal.value = false;
    document.body.classList.remove('overflow-hidden');
  };

  // Content expansion handlers
  const toggleContent = (reviewId: number) => {
    expandedContents.value[reviewId] = !expandedContents.value[reviewId];
  };

  const isContentExpanded = (reviewId: number) => {
    return !!expandedContents.value[reviewId];
  };

  const contentNeedsExpansion = (content?: string) => {
    return content && content.length > 150;
  };

  // Watch for route query changes
  watch(() => route.query, (newQuery) => {
    const newPage = newQuery.page ? Number(newQuery.page) : 1;
    const newSortBy = newQuery.sortBy as string || 'latest';
    const newMinRating = newQuery.minRating ? Number(newQuery.minRating) : 0;
    const newServiceTypeId = newQuery.serviceTypeId ? Number(newQuery.serviceTypeId) : 0;
    
    const hasChanged = 
      newPage !== pagination.page ||
      newSortBy !== filters.sortBy ||
      newMinRating !== filters.minRating ||
      newServiceTypeId !== filters.serviceTypeId;
    
    if (hasChanged) {
      initializeFromQuery();
      loadReviews();
    }
  }, { deep: true });

  // Watch for locale changes
  watch(currentLocale, () => {
    loadReviews();
    loadServiceTypes();
  });
  
  // Setup initial data
  const setupInitialData = () => {
    initializeFromQuery();
    loadReviews();
    loadServiceTypes();
  };

  return {
    reviews,
    isLoading,
    pagination,
    filters,
    serviceTypes,
    averageRating,
    totalReviews,
    ratingDistribution,
    selectedReview,
    showModal,
    expandedContents,
    currentLocale,
    seoData,
    
    // Methods
    initializeFromQuery,
    loadReviews,
    loadServiceTypes,
    applyFilters,
    clearFilters,
    goToPage,
    formatDate,
    getRatingPercentage,
    getStars,
    getServiceTypeName,
    openAvatarModal,
    closeAvatarModal,
    toggleContent,
    isContentExpanded,
    contentNeedsExpansion,
    setupInitialData
  };
} 