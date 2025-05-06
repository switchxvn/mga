import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { Gallery, PaginatedResponse, CreateGalleryInput, UpdateGalleryInput } from '@ew/shared';
import { useTrpc } from './useTrpc';
import { useNotification } from './useNotification';
import Swal from 'sweetalert2';

export const useGallery = () => {
  const trpc = useTrpc();
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError, showWarning } = useNotification();

  // State
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const search = ref(route.query.search?.toString() || '');
  const activeFilter = ref<boolean | undefined>(
    route.query.active === 'true' ? true : 
    route.query.active === 'false' ? false : 
    undefined
  );
  const categoryId = ref<number | undefined>(
    route.query.categoryId ? Number(route.query.categoryId) : undefined
  );
  const page = ref(Number(route.query.page) || 1);
  const pageSize = ref(10);
  const galleries = ref<PaginatedResponse<Gallery>>({
    items: [],
    total: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 1
  });

  const categories = ref<{id: number, name: string}[]>([]);
  const selectedGalleries = ref<number[]>([]);
  const sortBy = ref('createdAt');
  const sortOrder = ref<'asc' | 'desc'>('desc');

  // Watch for changes in filters and update URL
  watch([page, search, activeFilter, categoryId], () => {
    updateQueryParams();
    
    // Only fetch when on client side
    if (process.client) {
      fetchGalleries();
    }
  }, { deep: true });

  /**
   * Update URL query parameters
   */
  const updateQueryParams = () => {
    const query: Record<string, string | undefined> = {
      page: page.value > 1 ? page.value.toString() : undefined,
      search: search.value || undefined,
      active: activeFilter.value !== undefined ? activeFilter.value.toString() : undefined,
      categoryId: categoryId.value !== undefined ? categoryId.value.toString() : undefined
    };

    // Remove undefined values
    Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

    router.replace({ query });
  };

  /**
   * Fetch galleries with current filters
   */
  const fetchGalleries = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Skip on server-side to avoid localStorage error
      if (!process.client) {
        console.log('Skip fetchGalleries on server side');
        return;
      }

      const result = await trpc.admin.galleries.getAll.query({
        page: page.value,
        limit: pageSize.value,
        search: search.value || undefined,
        isActive: activeFilter.value,
        categoryId: categoryId.value
      });

      // Convert data
      if (result && typeof result === 'object' && 'items' in result && 'total' in result) {
        const formattedItems = result.items.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }));
        
        galleries.value = {
          items: formattedItems,
          total: result.total,
          currentPage: result.currentPage,
          limit: result.limit,
          totalPages: result.totalPages
        };
      } else {
        console.error('Unknown response structure:', result);
        error.value = 'Không thể xử lý dữ liệu từ server';
        
        galleries.value = {
          items: [],
          total: 0,
          currentPage: 1,
          limit: 10,
          totalPages: 1
        };
      }
    } catch (err: any) {
      error.value = err.message || "Failed to load galleries";
      console.error("Error loading galleries:", err);
      
      // Reset to empty state on error
      galleries.value = {
        items: [],
        total: 0,
        currentPage: 1,
        limit: 10, 
        totalPages: 1
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch categories for gallery
   */
  const fetchCategories = async () => {
    try {
      // Skip on server-side to avoid localStorage error
      if (!process.client) {
        console.log('Skip fetchCategories on server side');
        return;
      }

      const result = await trpc.admin.category.getByType.query({
        type: 'gallery'
      });
      
      categories.value = result
        .filter(cat => cat !== null)
        .map(cat => ({
          id: cat.id,
          name: cat.translations && cat.translations[0]?.name || `Category ${cat.id}`
        }));
    } catch (err: any) {
      console.error("Error loading categories:", err);
    }
  };

  /**
   * Delete a gallery item
   */
  const deleteGallery = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Gallery Item?',
        text: 'Are you sure you want to delete this gallery item? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#DC2626',
      });

      if (!result.isConfirmed) return false;

      isLoading.value = true;
      await trpc.admin.galleries.delete.mutate(id);
      await fetchGalleries();
      
      showSuccess('Gallery item has been deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete gallery item";
      error.value = errorMessage;
      console.error("Error deleting gallery item:", err);
      
      showError(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Toggle active status of a gallery
   */
  const toggleActive = async (gallery: Gallery) => {
    const newStatus = !gallery.isActive;
    
    const result = await Swal.fire({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Gallery Item?`,
      text: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this gallery item?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus ? 'activate' : 'deactivate'} it!`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: newStatus ? '#10B981' : '#6B7280',
    });

    if (!result.isConfirmed) return false;

    try {
      isLoading.value = true;
      await trpc.admin.galleries.update.mutate({
        id: gallery.id,
        isActive: newStatus
      });
      
      gallery.isActive = newStatus;

      showSuccess(`Gallery item ${newStatus ? 'activated' : 'deactivated'} successfully`);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update gallery status";
      error.value = errorMessage;
      console.error("Error updating gallery status:", err);
      
      showError(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update categories for selected galleries
   */
  const updateCategories = async (galleryIds: number[], categoryIds: number[]) => {
    if (!galleryIds.length || !categoryIds.length) {
      showWarning('Please select galleries and categories to update');
      return false;
    }

    try {
      isLoading.value = true;
      
      // Update each gallery with the selected categories
      await Promise.all(
        galleryIds.map(galleryId => {
          return trpc.admin.galleries.update.mutate({
            id: galleryId,
            categoryIds: categoryIds
          });
        })
      );

      // Refresh galleries list
      await fetchGalleries();
      
      showSuccess(`Successfully updated categories for ${galleryIds.length} gallery items`);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update categories';
      error.value = errorMessage;
      console.error('Error updating categories:', err);
      
      showError(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Perform bulk actions on selected galleries
   */
  const bulkAction = async (action: 'activate' | 'deactivate' | 'delete', galleryIds: number[]) => {
    const selectedCount = galleryIds.length;
    if (!selectedCount) {
      showWarning('Please select items to perform this action');
      return false;
    }

    let confirmConfig: any = {
      icon: 'question' as const,
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      title: '',
      text: '',
      confirmButtonColor: ''
    };

    switch (action) {
      case 'activate':
        confirmConfig = {
          ...confirmConfig,
          title: 'Activate Selected Items?',
          text: `Are you sure you want to activate ${selectedCount} selected gallery items?`,
          confirmButtonColor: '#10B981',
          confirmButtonText: 'Yes, activate them'
        };
        break;
      case 'deactivate':
        confirmConfig = {
          ...confirmConfig,
          title: 'Deactivate Selected Items?',
          text: `Are you sure you want to deactivate ${selectedCount} selected gallery items?`,
          confirmButtonColor: '#6B7280',
          confirmButtonText: 'Yes, deactivate them'
        };
        break;
      case 'delete':
        confirmConfig = {
          ...confirmConfig,
          title: 'Delete Selected Items?',
          text: `Are you sure you want to permanently delete ${selectedCount} selected gallery items? This action cannot be undone.`,
          confirmButtonColor: '#DC2626',
          confirmButtonText: 'Yes, delete them',
          icon: 'warning' as const
        };
        break;
    }

    const result = await Swal.fire(confirmConfig);
    if (!result.isConfirmed) return false;

    try {
      isLoading.value = true;

      switch (action) {
        case 'activate':
        case 'deactivate':
          await Promise.all(
            galleryIds.map(galleryId => {
              return trpc.admin.galleries.update.mutate({
                id: galleryId,
                isActive: action === 'activate'
              });
            })
          );
          break;
        case 'delete':
          await Promise.all(
            galleryIds.map(galleryId => 
              trpc.admin.galleries.delete.mutate(galleryId)
            )
          );
          break;
      }

      // Refresh galleries list
      await fetchGalleries();

      showSuccess(`Successfully performed ${action} on ${selectedCount} gallery items`);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || `Failed to ${action} gallery items`;
      error.value = errorMessage;
      console.error(`Error performing ${action} on gallery items:`, err);
      
      showError(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create a new gallery item
   */
  const createGallery = async (data: CreateGalleryInput) => {
    try {
      isLoading.value = true;
      
      const result = await trpc.admin.galleries.create.mutate(data);
      
      showSuccess('Gallery item created successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create gallery item';
      error.value = errorMessage;
      console.error('Error creating gallery item:', err);
      
      showError(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update a gallery item
   */
  const updateGallery = async (id: number, data: UpdateGalleryInput) => {
    try {
      isLoading.value = true;
      
      const result = await trpc.admin.galleries.update.mutate({
        id,
        ...data
      });
      
      showSuccess('Gallery item updated successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update gallery item';
      error.value = errorMessage;
      console.error('Error updating gallery item:', err);
      
      showError(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get a gallery item by ID
   */
  const getGalleryById = async (id: number) => {
    try {
      // Skip on server-side to avoid localStorage error
      if (!process.client) {
        console.log('Skip getGalleryById on server side');
        return null;
      }
      
      isLoading.value = true;
      
      const result = await trpc.admin.galleries.getById.query(id);
      
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to get gallery item';
      console.error('Error getting gallery item:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Toggle selection functions
  const toggleSelectAll = (items: Gallery[]) => {
    if (selectedGalleries.value.length === items.length) {
      selectedGalleries.value = [];
    } else {
      selectedGalleries.value = items.map(gallery => gallery.id);
    }
  };

  const toggleGallerySelection = (galleryId: number) => {
    const index = selectedGalleries.value.indexOf(galleryId);
    if (index === -1) {
      selectedGalleries.value.push(galleryId);
    } else {
      selectedGalleries.value.splice(index, 1);
    }
  };

  // Helper functions
  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const getCategoryNames = (gallery: Gallery) => {
    if (!gallery.categories || gallery.categories.length === 0) {
      return '-';
    }
    
    return gallery.categories
      .map(cat => categories.value.find(c => c.id === cat.id)?.name || `Category ${cat.id}`)
      .join(', ');
  };

  return {
    // State
    isLoading,
    error,
    galleries,
    categories,
    selectedGalleries,
    search,
    activeFilter,
    categoryId,
    page,
    pageSize,
    sortBy,
    sortOrder,
    
    // Methods
    fetchGalleries,
    fetchCategories,
    deleteGallery,
    toggleActive,
    updateCategories,
    bulkAction,
    createGallery,
    updateGallery,
    getGalleryById,
    toggleSelectAll,
    toggleGallerySelection,
    formatDate,
    getCategoryNames,
    updateQueryParams
  };
};