import { ref, computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useTrpc } from './useTrpc';

export interface MenuItemTranslation {
  id?: number;
  label: string;
  href: string;
  locale: string;
}

export interface MenuItem {
  id: number;
  defaultLocale: string;
  icon: string | null;
  order: number;
  level: number;
  isActive: boolean;
  parentId: number | null;
  parent: MenuItem | null;
  children: MenuItem[];
  translations: MenuItemTranslation[];
  createdAt: string;
  updatedAt: string;
  isLoadingChildren?: boolean;
}

export interface MenuItemFormData {
  id?: number;
  defaultLocale: string;
  icon: string | undefined;
  order: number;
  isActive: boolean;
  parentId: number | null;
  translations: Record<string, {
    label: string;
    href: string;
  }>;
}

export interface MenuItemFilter {
  page: number;
  limit: number;
  search: string;
  isActive: boolean | null;
  locale: string | null;
}

export function useMenuItem() {
  const router = useRouter();
  const trpc = useTrpc();
  
  const menuItems = ref<MenuItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalItems = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  
  const filter = ref<MenuItemFilter>({
    page: 1,
    limit: 10,
    search: '',
    isActive: null,
    locale: null
  });

  const form = ref<MenuItemFormData>({
    defaultLocale: 'vi',
    icon: undefined,
    order: 0,
    isActive: true,
    parentId: null,
    translations: {}
  });

  const errors = reactive({
    defaultLocale: '',
    icon: '',
    translations: ''
  });

  const selectedLanguage = ref<string>('vi');
  
  const currentTranslation = computed(() => {
    if (!selectedLanguage.value || !form.value.translations[selectedLanguage.value]) {
      return { label: '', href: '' };
    }
    return form.value.translations[selectedLanguage.value];
  });

  // Watch for language changes
  watch(selectedLanguage, (newLang, oldLang) => {
    if (!newLang || !form.value.id) return;

    if (oldLang && form.value.translations[oldLang]) {
      // Save current content to translations before switching
      form.value.translations[oldLang] = {
        label: currentTranslation.value.label,
        href: currentTranslation.value.href
      };
    }
    
    // Load content for new language
    if (form.value.translations[newLang]) {
      // If we have translations for this language, no need to fetch
    } else {
      // Initialize empty translation for this language
      form.value.translations[newLang] = {
        label: '',
        href: ''
      };
    }
  });

  // Fetch all menu items
  const fetchMenuItems = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const result = await trpc.admin.menuItems.getAllMenuItems.query({
        page: filter.value.page,
        limit: filter.value.limit,
        search: filter.value.search,
        isActive: filter.value.isActive,
        locale: filter.value.locale
      });

      menuItems.value = result.items;
      totalItems.value = result.total;
      totalPages.value = result.totalPages;
      currentPage.value = result.currentPage;
    } catch (err: any) {
      console.error('Failed to fetch menu items:', err);
      error.value = err.message || 'Failed to fetch menu items';
    } finally {
      isLoading.value = false;
    }
  };

  // Get a single menu item
  const getMenuItem = async (id: number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const menuItem = await trpc.admin.menuItems.getMenuItemById.query(id);
      
      // Populate form with menu item data
      form.value = {
        id: menuItem.id,
        defaultLocale: menuItem.defaultLocale,
        icon: menuItem.icon,
        order: menuItem.order,
        isActive: menuItem.isActive,
        parentId: menuItem.parentId,
        translations: {}
      };

      // Convert translations array to record
      if (menuItem.translations && menuItem.translations.length > 0) {
        menuItem.translations.forEach((translation: any) => {
          form.value.translations[translation.locale] = {
            label: translation.label,
            href: translation.href
          };
        });
      }

      // Set selected language to default locale if not already set
      if (!selectedLanguage.value) {
        selectedLanguage.value = menuItem.defaultLocale;
      }
      
      return menuItem;
    } catch (err: any) {
      console.error(`Failed to fetch menu item with ID ${id}:`, err);
      error.value = err.message || `Failed to fetch menu item with ID ${id}`;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch menu item for the selected language
  const fetchMenuItem = async (id: number) => {
    try {
      if (!selectedLanguage.value) return;
      
      // Save current content to translations before switching
      if (form.value.id) {
        const currentLang = Object.keys(form.value.translations).find(
          lang => form.value.translations[lang] && 
                 form.value.translations[lang].label === currentTranslation.value.label &&
                 form.value.translations[lang].href === currentTranslation.value.href
        );
        
        if (currentLang) {
          form.value.translations[currentLang] = {
            label: currentTranslation.value.label,
            href: currentTranslation.value.href
          };
        }
      }
      
      // Load content for selected language
      if (form.value.translations[selectedLanguage.value]) {
        // If we have translations for this language, use them
        const translation = form.value.translations[selectedLanguage.value];
        currentTranslation.value.label = translation.label;
        currentTranslation.value.href = translation.href;
      } else {
        // Reset form for new translation
        currentTranslation.value.label = '';
        currentTranslation.value.href = '';
        
        // Initialize empty translation for this language
        form.value.translations[selectedLanguage.value] = {
          label: '',
          href: ''
        };
      }
    } catch (err: any) {
      console.error(`Failed to fetch menu item for language ${selectedLanguage.value}:`, err);
      error.value = err.message || `Failed to fetch menu item for language ${selectedLanguage.value}`;
    }
  };

  // Create a new menu item
  const createMenuItem = async () => {
    try {
      if (!validateForm()) {
        return false;
      }

      isLoading.value = true;
      error.value = null;

      // Save current translation before submitting
      if (selectedLanguage.value && form.value.translations[selectedLanguage.value]) {
        form.value.translations[selectedLanguage.value] = {
          label: currentTranslation.value.label,
          href: currentTranslation.value.href
        };
      }

      // Convert translations from label to name format for backend
      const transformedTranslations: Record<string, { name: string; url?: string; description?: string }> = {};
      
      Object.entries(form.value.translations).forEach(([locale, translation]) => {
        transformedTranslations[locale] = {
          name: translation.label,
          url: translation.href
        };
      });

      await trpc.admin.menuItems.createMenuItem.mutate({
        defaultLocale: form.value.defaultLocale,
        icon: form.value.icon,
        order: form.value.order,
        isActive: form.value.isActive,
        parentId: form.value.parentId,
        translations: transformedTranslations
      });

      Swal.fire({
        title: 'Success!',
        text: 'Menu item created successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      router.push('/menu-items');
      return true;
    } catch (err: any) {
      console.error('Failed to create menu item:', err);
      error.value = err.message || 'Failed to create menu item';
      
      Swal.fire({
        title: 'Error!',
        text: error.value,
        icon: 'error'
      });
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Update an existing menu item
  const updateMenuItem = async (id: number) => {
    try {
      if (!validateForm()) {
        return false;
      }

      isLoading.value = true;
      error.value = null;

      // Save current translation before submitting
      if (selectedLanguage.value && form.value.translations[selectedLanguage.value]) {
        form.value.translations[selectedLanguage.value] = {
          label: currentTranslation.value.label,
          href: currentTranslation.value.href
        };
      }

      // Convert translations from label to name format for backend
      const transformedTranslations: Record<string, { name: string; url?: string; description?: string }> = {};
      
      Object.entries(form.value.translations).forEach(([locale, translation]) => {
        transformedTranslations[locale] = {
          name: translation.label,
          url: translation.href
        };
      });

      await trpc.admin.menuItems.updateMenuItem.mutate({
        id,
        data: {
          defaultLocale: form.value.defaultLocale,
          icon: form.value.icon,
          order: form.value.order,
          isActive: form.value.isActive,
          parentId: form.value.parentId,
          translations: transformedTranslations
        }
      });

      Swal.fire({
        title: 'Success!',
        text: 'Menu item updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      router.push('/menu-items');
      return true;
    } catch (err: any) {
      console.error(`Failed to update menu item with ID ${id}:`, err);
      error.value = err.message || `Failed to update menu item with ID ${id}`;
      
      Swal.fire({
        title: 'Error!',
        text: error.value,
        icon: 'error'
      });
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Delete a menu item
  const deleteMenuItem = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        isLoading.value = true;
        error.value = null;

        await trpc.admin.menuItems.deleteMenuItem.mutate(id);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Menu item has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Refresh the list
        await fetchMenuItems();
      }
      
      return true;
    } catch (err: any) {
      console.error(`Failed to delete menu item with ID ${id}:`, err);
      error.value = err.message || `Failed to delete menu item with ID ${id}`;
      
      Swal.fire({
        title: 'Error!',
        text: error.value,
        icon: 'error'
      });
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Update menu items order
  const updateMenuItemsOrder = async (items: { id: number; order: number; parentId: number | null }[]) => {
    try {
      isLoading.value = true;
      error.value = null;

      await trpc.admin.menuItems.updateMenuItemOrder.mutate(items);
      
      Swal.fire({
        title: 'Success!',
        text: 'Menu item order updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Refresh the list
      await fetchMenuItems();
      
      return true;
    } catch (err: any) {
      console.error('Failed to update menu items order:', err);
      error.value = err.message || 'Failed to update menu items order';
      
      Swal.fire({
        title: 'Error!',
        text: error.value,
        icon: 'error'
      });
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Toggle menu item active status
  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Convert translations to required format
      const transformedTranslations: Record<string, { name: string; url?: string; description?: string }> = {};
      
      await trpc.admin.menuItems.updateMenuItem.mutate({
        id,
        data: { 
          isActive: !isActive,
          translations: transformedTranslations
        }
      });
      
      // Refresh the list
      await fetchMenuItems();
      
      return true;
    } catch (err: any) {
      console.error(`Failed to toggle active status for menu item with ID ${id}:`, err);
      error.value = err.message || `Failed to toggle active status for menu item with ID ${id}`;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Apply filter
  const applyFilter = () => {
    filter.value.page = 1; // Reset to first page
    fetchMenuItems();
  };

  // Reset filter
  const resetFilter = () => {
    filter.value = {
      page: 1,
      limit: 10,
      search: '',
      isActive: null,
      locale: null
    };
    fetchMenuItems();
  };

  // Change page
  const changePage = (page: number) => {
    filter.value.page = page;
    fetchMenuItems();
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    errors.defaultLocale = '';
    errors.icon = '';
    errors.translations = '';

    if (!form.value.defaultLocale) {
      errors.defaultLocale = 'Default locale is required';
      isValid = false;
    }

    // Check if at least one translation exists
    const hasTranslations = Object.keys(form.value.translations).length > 0;
    if (!hasTranslations) {
      errors.translations = 'At least one translation is required';
      isValid = false;
    } else {
      // Check if current translation has a label
      if (selectedLanguage.value && 
          form.value.translations[selectedLanguage.value] &&
          !form.value.translations[selectedLanguage.value].label) {
        errors.translations = 'Label is required';
        isValid = false;
      }
    }

    return isValid;
  };

  // Fetch menu item children
  const fetchMenuItemChildren = async (parentId: number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const result = await trpc.admin.menuItems.getMenuItemChildren.query({
        parentId,
        locale: filter.value.locale
      });

      // Find the parent menu item and update its children
      const parentIndex = menuItems.value.findIndex(item => item.id === parentId);
      if (parentIndex !== -1) {
        menuItems.value[parentIndex].children = result;
      }
      
      return result;
    } catch (err: any) {
      console.error(`Failed to fetch children for menu item with ID ${parentId}:`, err);
      error.value = err.message || `Failed to fetch children for menu item with ID ${parentId}`;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    menuItems,
    isLoading,
    error,
    filter,
    totalItems,
    totalPages,
    currentPage,
    form,
    errors,
    selectedLanguage,
    currentTranslation,
    fetchMenuItems,
    fetchMenuItemChildren,
    getMenuItem,
    fetchMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateMenuItemsOrder,
    toggleActive,
    applyFilter,
    resetFilter,
    changePage,
    validateForm
  };
} 