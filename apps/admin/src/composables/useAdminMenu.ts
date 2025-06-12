import { ref, computed, type Ref } from 'vue';
import { useTrpc } from './useTrpc';
import { useAuth } from './useAuth';
import { useUserStore } from '@/stores/useUserStore';
import { storeToRefs } from 'pinia';

// Define interfaces for menu items
export interface MenuItem {
  id: number;
  code: string;
  name: string;
  icon: string | null;
  path: string | null;
  parentId: number | null;
  order: number;
  isActive: boolean;
  availableForRoles: string | null;
}

export interface NavigationItem {
  label: string;
  icon: any;
  to?: string;
  children?: NavigationItem[];
  isOpen?: Ref<boolean>;
  availableForRoles?: string | null;
}

export const useAdminMenu = () => {
  const trpc = useTrpc();
  const auth = useAuth();
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  // Admin menu data from API
  const menuItems = ref<MenuItem[]>([]);
  const isLoadingMenu = ref(true);
  const menuError = ref<Error | null>(null);

  // Check if user has SUPER_ADMIN role
  const isSuperAdmin = computed(() => {
    // Kiểm tra từ user store
    if (user.value && user.value.roles) {
      // Nếu roles không phải là mảng hoặc mảng rỗng, chuyển sang kiểm tra auth
      if (!Array.isArray(user.value.roles) || user.value.roles.length === 0) {
        console.log('User roles not available in store or empty');
      } else {
        // Kiểm tra kiểu dữ liệu của roles
        if (typeof user.value.roles[0] === 'object') {
          // Trường hợp roles là mảng object
          if ((user.value.roles as any[]).some(role => role.code === 'SUPER_ADMIN')) {
            return true;
          }
        } else {
          // Trường hợp roles là mảng string
          if ((user.value.roles as string[]).some(role => role === 'SUPER_ADMIN')) {
            return true;
          }
        }
      }
    }
    
    // Kiểm tra từ auth composable nếu user store không có thông tin
    const authUser = auth.user.value;
    if (authUser && authUser.permissions) {
      return authUser.permissions.includes('SUPER_ADMIN');
    }
    
    return false;
  });

  // Filter items based on user roles
  const hasRequiredRole = (requiredRoles: string | null) => {
    // Nếu không có yêu cầu về vai trò (null hoặc empty string), cho phép tất cả người dùng
    if (!requiredRoles) {
      return true;
    }
    
    if (!user.value) {
      // Thử lấy user từ auth composable
      const authUser = auth.user.value;
      
      if (!authUser || !authUser.permissions) {
        return false;
      }
      
      // Kiểm tra quyền từ auth user
      if (authUser.permissions.includes('SUPER_ADMIN')) {
        return true;
      }
      
      const allowedRoles = requiredRoles.split(',');
      return allowedRoles.some(role => authUser.permissions && authUser.permissions.includes(role));
    }
    
    // Nếu không có roles hoặc roles là mảng rỗng
    if (!user.value.roles || !Array.isArray(user.value.roles) || user.value.roles.length === 0) {
      return false;
    }
    
    // Kiểm tra xem roles là mảng string hay mảng object
    const isRoleObject = typeof user.value.roles[0] === 'object';
    
    // SUPER_ADMIN có thể thấy tất cả các menu - xử lý cả hai trường hợp
    if (isRoleObject) {
      const hasAdmin = (user.value.roles as any[]).some(role => role.code === 'SUPER_ADMIN');
      if (hasAdmin) return true;
    } else {
      const hasAdmin = (user.value.roles as string[]).some(role => role === 'SUPER_ADMIN');
      if (hasAdmin) return true;
    }
    
    const allowedRoles = requiredRoles.split(',');
    
    // Kiểm tra phù hợp với kiểu dữ liệu của roles
    if (isRoleObject) {
      return (user.value.roles as any[]).some(role => allowedRoles.includes(role.code));
    } else {
      return (user.value.roles as string[]).some(role => allowedRoles.includes(role));
    }
  };

  // Load menu items from API
  const loadMenuItems = async (specificLocale?: string) => {
    isLoadingMenu.value = true;
    menuError.value = null; // Reset error
    
    try {
      // Kiểm tra xem có token không
      const storage = process.client ? localStorage : null; 
      const token = storage ? storage.getItem('accessToken') : null;
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }
      
      // Lấy ngôn ngữ hiện tại từ localStorage hoặc i18n locale
      let currentLocale = specificLocale || (storage ? storage.getItem('locale') : null);
      
      // If no locale in localStorage, try to get from current context
      if (!currentLocale) {
        // Try to get from document.documentElement.lang or default to 'en'
        currentLocale = (typeof document !== 'undefined' ? document.documentElement.lang : '') || 'en';
      }
      
      console.log('🚀 loadMenuItems called with locale:', currentLocale);
      console.log('📤 About to call tRPC API: admin.adminMenu.getAdminMenuItems');
      
      // Add timestamp to prevent caching and force fresh API call
      const timestamp = Date.now();
      
      // Sử dụng đúng endpoint từ adminMenuAdminRouter và truyền locale
      const response = await trpc.admin.adminMenu.getAdminMenuItems.query({ 
        includeInactive: false,
        locale: currentLocale, // Thêm locale vào query
        _timestamp: timestamp // Add timestamp to force fresh API call
      });
      
      console.log('📥 tRPC API response received:', { itemCount: response?.length, locale: currentLocale });
      
      if (response) {
        menuItems.value = response as MenuItem[];
        console.log('✅ Menu items updated in state:', response.length, 'items for locale:', currentLocale);
        
        // Log the first few menu item names to verify translation
        if (response.length > 0) {
          console.log('📝 Sample menu items:', response.slice(0, 3).map(item => ({ code: item.code, name: item.name })));
        }
      } else {
        throw new Error('API response is empty or invalid');
      }
    } catch (error) {
      menuError.value = error as Error;
      
      // Fallback to default menu if API fails
      menuItems.value = [
        {
          id: 1,
          code: 'dashboard',
          name: 'Dashboard',
          icon: 'Home',
          path: '/',
          parentId: null,
          order: 1,
          isActive: true,
          availableForRoles: null
        },
        {
          id: 2,
          code: 'settings',
          name: 'Settings',
          icon: 'Settings',
          path: '/settings',
          parentId: null,
          order: 99,
          isActive: true,
          availableForRoles: 'SUPER_ADMIN'
        }
      ];
    } finally {
      isLoadingMenu.value = false;
    }
  };

  // Original check permissions function
  const hasAnyPermission = (requiredRoles: string[]) => {
    if (!user.value || !user.value.roles) return false;
    
    // Kiểm tra xem roles có phải là mảng không và có rỗng không
    if (!Array.isArray(user.value.roles) || user.value.roles.length === 0) return false;
    
    // Kiểm tra xem roles là mảng object hay mảng string
    const isRoleObject = typeof user.value.roles[0] === 'object';
    
    // Kiểm tra quyền SUPER_ADMIN
    if (isRoleObject) {
      // Trường hợp roles là mảng object
      if ((user.value.roles as any[]).some(role => role.code === 'SUPER_ADMIN')) {
        return true;
      }
      
      // Kiểm tra các quyền yêu cầu
      return (user.value.roles as any[]).some(role => 
        requiredRoles.includes(role.code)
      );
    } else {
      // Trường hợp roles là mảng string
      if ((user.value.roles as string[]).some(role => role === 'SUPER_ADMIN')) {
        return true;
      }
      
      // Kiểm tra các quyền yêu cầu
      return (user.value.roles as string[]).some(role => 
        requiredRoles.includes(role)
      );
    }
  };

  return {
    menuItems,
    isLoadingMenu,
    menuError,
    isSuperAdmin,
    hasRequiredRole,
    loadMenuItems,
    hasAnyPermission
  };
}; 