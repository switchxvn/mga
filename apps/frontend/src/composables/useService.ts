import { ref } from 'vue';
import { useTrpc } from './useTrpc';

export type ServiceSortBy = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

export interface ServiceFilter {
  search?: string;
  categories?: number[];
  isFeatured?: boolean;
  isNew?: boolean;
  sortBy?: ServiceSortBy;
  page?: number;
  limit?: number;
  locale?: string;
}

export function useService(initialFilters: ServiceFilter = {}) {
  const trpc = useTrpc();

  // State
  const filters = ref<ServiceFilter>(initialFilters);
  const services = ref<any[]>([]);
  const totalServices = ref(0);
  const totalPages = ref(0);
  const isLoadingServices = ref(false);

  // Fetch services
  const fetchServices = async () => {
    try {
      isLoadingServices.value = true;
      const result = await trpc.service.list.query({
        ...filters.value,
        page: filters.value.page || 1,
        limit: filters.value.limit || 12,
      });

      services.value = result.items;
      totalServices.value = result.total;
      totalPages.value = Math.ceil(result.total / (filters.value.limit || 12));
    } catch (error) {
      console.error('Error fetching services:', error);
      services.value = [];
      totalServices.value = 0;
      totalPages.value = 0;
    } finally {
      isLoadingServices.value = false;
    }
  };

  return {
    // State
    filters,
    services,
    totalServices,
    totalPages,
    isLoadingServices,

    // Actions
    fetchServices,
  };
} 