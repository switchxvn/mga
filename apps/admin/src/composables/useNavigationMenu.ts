import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MenuItem, NavigationItem } from './useAdminMenu';
import {
  Home,
  FileText,
  ShoppingBag,
  ShoppingCart,
  Users,
  Star,
  Tag,
  Settings,
  Folder,
  Image,
  Palette,
  UserCircle,
  Menu,
  List,
  Plus
} from 'lucide-vue-next';

export const useNavigationMenu = () => {
  const route = useRoute();
  const router = useRouter();
  const currentPath = ref(route.path);

  // Function to map icon string to icon component
  const getIconComponent = (iconName: string | null) => {
    const iconMap: Record<string, any> = {
      'Home': Home,
      'FileText': FileText,
      'ShoppingBag': ShoppingBag,
      'ShoppingCart': ShoppingCart,
      'Users': Users,
      'Star': Star,
      'Tag': Tag,
      'Settings': Settings,
      'Folder': Folder,
      'Image': Image,
      'Palette': Palette,
      'UserCircle': UserCircle,
      'Menu': Menu,
      'List': List,
      'Plus': Plus
    };
    
    if (!iconName) return Home;
    return iconMap[iconName] || Home; // Default to Home icon if not found
  };

  // Group menu items by parent
  const processMenuItems = (items: MenuItem[]): NavigationItem[] => {
    // First, filter to get only active items
    const activeItems = items.filter(item => item.isActive);
    
    // Find root items (no parent)
    const rootItems = activeItems.filter(item => !item.parentId);
    
    // Create a map of child items by parentId
    const childItemsByParent: Record<number, MenuItem[]> = {};
    activeItems.forEach(item => {
      if (item.parentId) {
        if (!childItemsByParent[item.parentId]) {
          childItemsByParent[item.parentId] = [];
        }
        childItemsByParent[item.parentId].push(item);
      }
    });
    
    // Sort children by order
    Object.keys(childItemsByParent).forEach(parentId => {
      childItemsByParent[Number(parentId)].sort((a, b) => a.order - b.order);
    });
    
    // Function to recursively build menu tree
    const buildMenuItem = (item: MenuItem): NavigationItem => {
      const menuItem: NavigationItem = {
        label: item.name,
        icon: getIconComponent(item.icon),
        to: item.path || undefined,
        isOpen: ref(false), // For expandable state
        availableForRoles: item.availableForRoles || undefined
      };
      
      // Add children if any
      const children = childItemsByParent[item.id];
      if (children && children.length > 0) {
        menuItem.children = children.map(child => buildMenuItem(child));
      }
      
      return menuItem;
    };
    
    // Sort root items by order
    rootItems.sort((a, b) => a.order - b.order);
    
    // Build the full menu tree
    return rootItems.map(item => buildMenuItem(item));
  };

  // Recursive isActive function to handle nested routes
  const isActive = (path: string | undefined) => {
    if (!path) return false;
    
    if (path === '/') {
      return currentPath.value === '/';
    }
    
    // Xử lý chính xác cho từng đường dẫn cụ thể
    if (path === '/products') {
      return currentPath.value === '/products' || currentPath.value === '/products/';
    }
    
    if (path === '/products/create') {
      return currentPath.value === '/products/create';
    }
    
    if (path === '/reviews') {
      return currentPath.value === '/reviews' || currentPath.value === '/reviews/';
    }
    
    if (path === '/reviews/add') {
      return currentPath.value === '/reviews/add';
    }
    
    if (path === '/reviews/service-types') {
      return currentPath.value === '/reviews/service-types' || 
             currentPath.value === '/reviews/service-types/';
    }
    
    if (path === '/reviews/service-types/add') {
      return currentPath.value === '/reviews/service-types/add';
    }
    
    if (path === '/orders') {
      return currentPath.value === '/orders' || currentPath.value === '/orders/';
    }
    
    // Nếu đường dẫn chứa các tham số động (như ID), xử lý riêng
    if (path === '/products/edit') {
      return currentPath.value.startsWith('/products/edit/');
    }
    
    if (path === '/reviews/edit') {
      return currentPath.value.startsWith('/reviews/edit/');
    }
    
    // Mặc định cho các đường dẫn khác
    return currentPath.value === path;
  };

  // Function to toggle a menu item's open state
  const toggleMenu = (item: NavigationItem) => {
    if (item.isOpen) {
      item.isOpen.value = !item.isOpen.value;
    }
  };

  // Function to expand active menu items
  const expandActiveMenus = (processedItems: NavigationItem[]) => {
    // Trước tiên, đóng tất cả menu (reset state)
    const resetAllMenus = (items: NavigationItem[]) => {
      items.forEach(item => {
        if (item.isOpen) {
          item.isOpen.value = false;
        }
        if (item.children) {
          resetAllMenus(item.children);
        }
      });
    };
    
    resetAllMenus(processedItems);
    
    // Hàm đệ quy để tìm và mở menu tương ứng
    const findAndExpandActiveMenu = (items: NavigationItem[]) => {
      for (const item of items) {
        // Kiểm tra xem item hiện tại có phù hợp với path hiện tại
        if (item.to && isActive(item.to)) {
          // Tìm item cha và mở nó
          const findParentAndExpand = (allItems: NavigationItem[], targetItem: NavigationItem): boolean => {
            for (const parentItem of allItems) {
              if (parentItem.children) {
                // Kiểm tra xem targetItem có phải là con của parentItem
                const isChild = parentItem.children.some(child => child === targetItem);
                if (isChild && parentItem.isOpen) {
                  parentItem.isOpen.value = true;
                  return true;
                }
                
                // Tìm kiếm đệ quy trong các con của parentItem
                const foundInChildren = findParentAndExpand(parentItem.children, targetItem);
                if (foundInChildren && parentItem.isOpen) {
                  parentItem.isOpen.value = true;
                  return true;
                }
              }
            }
            return false;
          };
          
          findParentAndExpand(processedItems, item);
        }
        
        // Kiểm tra xem con của item hiện tại có phù hợp với path hiện tại không
        if (item.children) {
          const hasActiveChild = item.children.some(child => {
            if (child.to && isActive(child.to)) {
              return true;
            }
            if (child.children) {
              return child.children.some(grandchild => grandchild.to && isActive(grandchild.to));
            }
            return false;
          });
          
          if (hasActiveChild && item.isOpen) {
            item.isOpen.value = true;
          }
          
          // Tiếp tục tìm kiếm đệ quy trong các con
          findAndExpandActiveMenu(item.children);
        }
      }
    };
    
    findAndExpandActiveMenu(processedItems);
  };

  // Update current path when route changes
  const updateCurrentPath = (path: string) => {
    currentPath.value = path;
  };

  return {
    currentPath,
    getIconComponent,
    processMenuItems,
    isActive,
    toggleMenu,
    expandActiveMenus,
    updateCurrentPath
  };
}; 