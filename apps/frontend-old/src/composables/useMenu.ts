import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  children?: MenuItem[];
  translations?: {
    [key: string]: {
      label: string;
      href: string;
    };
  };
}

export function useMenu() {
  const { locale } = useI18n();
  const menuItems = ref<MenuItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const processedMenuItems = computed(() => {
    return menuItems.value.map(item => ({
      ...item,
      label: item.translations?.[locale.value]?.label || item.label,
      href: item.translations?.[locale.value]?.href || item.href,
      children: item.children?.map(child => ({
        ...child,
        label: child.translations?.[locale.value]?.label || child.label,
        href: child.translations?.[locale.value]?.href || child.href,
      })),
    }));
  });

  const fetchMenuItems = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      // TODO: Implement API call to fetch menu items
      // For now, return mock data
      menuItems.value = [
        {
          id: 'home',
          label: 'Trang chủ',
          href: '/',
        },
        {
          id: 'products',
          label: 'Sản phẩm',
          href: '/products',
          children: [
            {
              id: 'all-products',
              label: 'Tất cả sản phẩm',
              href: '/products',
            },
            {
              id: 'new-products',
              label: 'Sản phẩm mới',
              href: '/products/new',
            },
          ],
        },
        {
          id: 'about',
          label: 'Về chúng tôi',
          href: '/about',
        },
        {
          id: 'contact',
          label: 'Liên hệ',
          href: '/contact',
        },
      ];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải menu';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    menuItems,
    processedMenuItems,
    isLoading,
    error,
    fetchMenuItems,
  };
} 