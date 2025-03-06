import { useTrpc } from './useTrpc';
import { ref, computed } from 'vue';

// Định nghĩa kiểu dữ liệu Category
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  parentId?: number | null;
  isFeatured?: boolean;
  active?: boolean;
  children?: Category[];
  posts?: any[];
}

/**
 * Composable để quản lý và truy xuất dữ liệu danh mục
 * @returns Các phương thức và dữ liệu liên quan đến danh mục
 */
export function useCategory() {
  const trpc = useTrpc();
  
  // State
  const categories = ref<Category[]>([]);
  const featuredCategories = ref<Category[]>([]);
  const popularCategories = ref<Category[]>([]);
  const hotCategories = ref<Category[]>([]);
  const categoryTree = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Lấy tất cả danh mục
   */
  const fetchAllCategories = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      categories.value = await trpc.category.all.query();
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      error.value = err.message || 'Có lỗi xảy ra khi tải danh mục';
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy danh mục theo ID
   * @param id ID của danh mục
   */
  const fetchCategoryById = async (id: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      return await trpc.category.byId.query(id);
    } catch (err: any) {
      console.error(`Error fetching category by ID ${id}:`, err);
      error.value = err.message || 'Có lỗi xảy ra khi tải chi tiết danh mục';
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy danh mục theo slug
   * @param slug Slug của danh mục
   */
  const fetchCategoryBySlug = async (slug: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      return await trpc.category.bySlug.query(slug);
    } catch (err: any) {
      console.error(`Error fetching category by slug ${slug}:`, err);
      error.value = err.message || 'Có lỗi xảy ra khi tải chi tiết danh mục';
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy danh mục nổi bật (featured)
   */
  const fetchFeaturedCategories = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      featuredCategories.value = await trpc.category.featured.query();
    } catch (err: any) {
      console.error('Error fetching featured categories:', err);
      error.value = err.message || 'Có lỗi xảy ra khi tải danh mục nổi bật';
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy danh mục phổ biến (popular)
   * @param limit Số lượng danh mục cần lấy
   */
  const fetchPopularCategories = async (limit = 5) => {
    loading.value = true;
    error.value = null;
    
    try {
      popularCategories.value = await trpc.category.popular.query({ limit });
    } catch (err: any) {
      console.error('Error fetching popular categories:', err);
      error.value = err.message || 'Có lỗi xảy ra khi tải danh mục phổ biến';
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy danh mục hot (có bài viết mới nhất)
   * @param limit Số lượng danh mục cần lấy
   */
  const fetchHotCategories = async (limit = 5) => {
    loading.value = true;
    error.value = null;
    
    try {
      hotCategories.value = await trpc.category.hot.query({ limit });
    } catch (err: any) {
      console.error('Error fetching hot categories:', err);
      error.value = err.message || 'Có lỗi xảy ra khi tải danh mục hot';
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy cây danh mục
   */
  const fetchCategoryTree = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      categoryTree.value = await trpc.category.tree.query();
    } catch (err: any) {
      console.error('Error fetching category tree:', err);
      error.value = err.message || 'Có lỗi xảy ra khi tải cây danh mục';
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Lấy danh sách danh mục gốc (không có parent)
   */
  const rootCategories = computed(() => {
    return categories.value.filter(cat => !cat.parentId);
  });
  
  /**
   * Lấy danh sách danh mục con của một danh mục
   * @param parentId ID của danh mục cha
   */
  const getChildCategories = (parentId: number) => {
    return categories.value.filter(cat => cat.parentId === parentId);
  };
  
  return {
    // State
    categories,
    featuredCategories,
    popularCategories,
    hotCategories,
    categoryTree,
    loading,
    error,
    
    // Computed
    rootCategories,
    
    // Methods
    fetchAllCategories,
    fetchCategoryById,
    fetchCategoryBySlug,
    fetchFeaturedCategories,
    fetchPopularCategories,
    fetchHotCategories,
    fetchCategoryTree,
    getChildCategories
  };
} 