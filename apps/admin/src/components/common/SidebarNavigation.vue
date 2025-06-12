<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/useUserStore';
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { ChevronDown } from 'lucide-vue-next';
import { useAdminMenu } from '@/composables/useAdminMenu';
import { useNavigationMenu, type ExtendedNavigationItem } from '@/composables/useNavigationMenu';
import { useLocalization } from '@/composables/useLocalization';
import type { NavigationItem } from '@/composables/useAdminMenu';

const { t, locale: i18nLocale } = useI18n();
const { locale } = useLocalization();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const isLanguageUpdating = ref(false);

// Sử dụng các composable mới
const {
  menuItems,
  isLoadingMenu,
  menuError,
  isSuperAdmin,
  hasRequiredRole,
  loadMenuItems
} = useAdminMenu();

const {
  currentPath,
  processMenuItems,
  isActive,
  toggleMenu,
  expandActiveMenus,
  getTranslatedLabel
} = useNavigationMenu();

// Create a reactive locale ref for tracking changes
const currentLocale = ref('en');

// Debug function for manual testing
const debugReloadMenu = async (testLocale?: string) => {
  const localeToUse = testLocale || currentLocale.value;
  console.log('Manual reload menu with locale:', localeToUse);
  
  try {
    isLanguageUpdating.value = true;
    await loadMenuItems(localeToUse);
    console.log('Manual menu reload successful');
  } catch (error) {
    console.error('Manual menu reload failed:', error);
  } finally {
    isLanguageUpdating.value = false;
  }
};

// Expose debug function to window for testing
if (process.client) {
  (window as any).debugReloadMenu = debugReloadMenu;
}

// Function to get translated menu label - now reactive to locale changes
const getMenuLabel = (item: ExtendedNavigationItem): string => {
  return getTranslatedLabel(item, t);
};

// Xử lý menu từ API (reactive to locale changes)
const navigation = computed<ExtendedNavigationItem[]>(() => {
  // If menu items are loading or there's an error, use default items
  if (isLoadingMenu.value || menuError.value || !menuItems.value || menuItems.value.length === 0) {
    const defaultItems: ExtendedNavigationItem[] = [
      { 
        label: 'Dashboard', 
        translationKey: 'menu.dashboard',
        originalName: 'Dashboard',
        icon: 'Home', 
        to: '/',
        isOpen: ref(false)
      }
    ];
    
    // Only show Settings for SUPER_ADMIN
    if (isSuperAdmin.value) {
      defaultItems.push({ 
        label: 'Settings', 
        translationKey: 'menu.settings',
        originalName: 'Settings',
        icon: 'Settings', 
        to: '/settings',
        isOpen: ref(false)
      });
    }
    
    return defaultItems;
  }
  
  // Process API menu items with parent-child structure
  const processedItems = processMenuItems(menuItems.value);
  
  // Nếu là SUPER_ADMIN, trả về tất cả menu không lọc
  if (isSuperAdmin.value) {
    // Always include dashboard as first item if not already included
    const hasDashboard = processedItems.some(item => item.to === '/');
    if (!hasDashboard) {
      processedItems.unshift({ 
        label: 'Dashboard', 
        translationKey: 'menu.dashboard',
        originalName: 'Dashboard',
        icon: 'Home', 
        to: '/', 
        isOpen: ref(false)
      });
    }
    
    return processedItems;
  }
  
  // Đối với người dùng thường, vẫn áp dụng bộ lọc
  // Filter items based on user roles
  const filteredItems = processedItems.filter(item => {
    // Filter by role if availableForRoles is specified and user is logged in
    if (item.availableForRoles) {
      const hasRole = hasRequiredRole(item.availableForRoles);
      return hasRole;
    }
    return true;
  });
  
  // Always include dashboard as first item if not already included
  const hasDashboard = filteredItems.some(item => item.to === '/');
  if (!hasDashboard) {
    filteredItems.unshift({ 
      label: 'Dashboard', 
      translationKey: 'menu.dashboard',
      originalName: 'Dashboard',
      icon: 'Home', 
      to: '/', 
      isOpen: ref(false)
    });
  }

  return filteredItems;
});

// Watch for i18n locale changes to reload menu  
watch(i18nLocale, async (newLocale, oldLocale) => {
  console.log('🔄 i18nLocale changed from', oldLocale, 'to', newLocale);
  
  if (newLocale && newLocale !== oldLocale && auth.isAuthenticated()) {
    try {
      isLanguageUpdating.value = true;
      console.log('🚀 Starting menu reload for locale:', newLocale);
      
      // Make sure new locale is saved to localStorage
      if (process.client) {
        localStorage.setItem('locale', newLocale);
        console.log('💾 Saved locale to localStorage:', newLocale);
      }
      
      // Update current locale ref
      currentLocale.value = newLocale;
      
      // Clear menu items first to force visual refresh
      console.log('🗑️ Clearing existing menu items');
      menuItems.value = [];
      
      console.log('📡 Calling loadMenuItems with locale:', newLocale);
      await loadMenuItems(newLocale);
      console.log('✅ Menu items reloaded successfully for locale:', newLocale);
      
      // Set initial state based on current route
      expandActiveMenus(navigation.value);
    } catch (error) {
      console.error('❌ Failed to reload menu after language change:', error);
    } finally {
      isLanguageUpdating.value = false;
    }
  }
}, { immediate: false });

// Watch localStorage changes as a fallback detection method
if (process.client) {
  const checkLocaleChanges = () => {
    const newLocale = localStorage.getItem('locale') || 'en';
    if (newLocale !== currentLocale.value && auth.isAuthenticated()) {
      console.log('localStorage locale changed to:', newLocale);
      currentLocale.value = newLocale;
      debugReloadMenu(newLocale);
    }
  };
  
  // Check every 1 second for locale changes
  setInterval(checkLocaleChanges, 1000);
}

// Watch for route changes and initialize data
onMounted(() => {
  currentPath.value = route.path;
  
  // Listen to route changes
  router.afterEach((to) => {
    currentPath.value = to.path;
  });
  
  // Kiểm tra xác thực trước khi tải menu
  const initialize = async () => {
    try {
      const isAuthenticated = await auth.checkAuth();
      
      // User data will be loaded by useAuth.checkAuth() automatically
      
      // Chỉ tải menu khi đã xác thực
      if (isAuthenticated) {
        await loadMenuItems();
        
        // Set initial state based on current route
        expandActiveMenus(navigation.value);
      } else {
        // Đặt menu mặc định cho người dùng chưa xác thực
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
          }
        ];
      }
    } catch (error) {
      console.error('SidebarNavigation: Failed to initialize:', error);
    }
  };
  
  // Khởi tạo với độ trễ ngắn để đảm bảo các store đã được tải
  setTimeout(initialize, 300);
  
  // Update on route changes
  router.afterEach(() => {
    expandActiveMenus(navigation.value);
  });
});
</script>

<template>
  <!-- Navigation Links -->
  <div>
    <!-- Loading state for menu -->
    <div v-if="isLoadingMenu" class="animate-pulse space-y-2 px-4 py-2">
      <div v-for="i in 7" :key="i" class="flex items-center space-x-3">
        <div class="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="menuError" class="px-4 py-3 text-sm text-red-600 dark:text-red-400">
      Failed to load menu. Please try again later.
    </div>
    
    <!-- Language change notification -->
    <div v-if="isLanguageUpdating" class="px-4 py-2 mb-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 rounded">
      {{ t('common.loading_menu_items') }}...
    </div>
    
    <!-- Loaded menu items -->
    <template v-else>
      <!-- API-driven menu items -->
      <template v-for="(item, i) in navigation" :key="`${i}-${currentLocale}`">
        <!-- Single Item (no children) -->
        <template v-if="!item.children || item.children.length === 0">
          <!-- Link if has path -->
          <NuxtLink 
            v-if="item.to" 
            :to="item.to" 
            class="flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
            :class="[
              isActive(item.to) 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            ]"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5 flex-shrink-0" 
              :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : ''"
            />
            {{ getMenuLabel(item) }}
          </NuxtLink>
          
          <!-- Non-link if no path -->
          <div 
            v-else
            class="flex items-center px-4 py-2.5 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5 flex-shrink-0"
            />
            {{ getMenuLabel(item) }}
          </div>
        </template>
        
        <!-- Menu with children -->
        <div v-else class="mb-1">
          <div 
            class="flex items-center justify-between px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
            @click="() => { if (item.isOpen) item.isOpen.value = !item.isOpen.value }"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
              {{ getMenuLabel(item) }}
            </div>
            <ChevronDown 
              class="h-4 w-4 transition-transform" 
              :class="{ 'transform rotate-180': item.isOpen?.value }"
            />
          </div>
          
          <!-- Submenu -->
          <div v-if="item.isOpen && item.isOpen.value" class="pl-4 mt-1">
            <template v-for="(child, j) in item.children" :key="j">
              <!-- Link if has path -->
              <NuxtLink 
                v-if="child.to"
                :to="child.to" 
                class="flex items-center px-4 py-2 text-sm transition-colors rounded-md"
                :class="[
                  isActive(child.to) 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                ]"
              >
                <component 
                  :is="child.icon" 
                  class="mr-3 h-4 w-4 flex-shrink-0" 
                  :class="isActive(child.to) ? 'text-primary-600 dark:text-primary-400' : ''"
                />
                {{ getMenuLabel(child) }}
              </NuxtLink>
              
              <!-- Child item with its own children (3rd level) -->
              <div v-else-if="child.children && child.children.length > 0" class="mb-1">
                <div 
                  class="flex items-center justify-between px-4 py-2 text-sm transition-colors rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
                  @click="toggleMenu(child)"
                >
                  <div class="flex items-center">
                    <component 
                      :is="child.icon" 
                      class="mr-3 h-4 w-4"
                    />
                    {{ getMenuLabel(child) }}
                  </div>
                  <ChevronDown 
                    class="h-3 w-3 transition-transform" 
                    :class="{ 'transform rotate-180': child.isOpen?.value }"
                  />
                </div>
                
                <!-- 3rd level items -->
                <div v-if="child.isOpen && child.isOpen.value" class="pl-4 mt-1">
                  <template v-for="(grandchild, k) in child.children" :key="k">
                    <NuxtLink 
                      v-if="grandchild.to"
                      :to="grandchild.to" 
                      class="flex items-center px-4 py-1.5 text-xs transition-colors rounded-md"
                      :class="[
                        isActive(grandchild.to) 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      ]"
                    >
                      <span class="w-1.5 h-1.5 mr-2 rounded-full bg-current"></span>
                      {{ getMenuLabel(grandchild) }}
                    </NuxtLink>
                  </template>
                </div>
              </div>
              
              <!-- Non-link if no path and no children -->
              <div 
                v-else
                class="flex items-center px-4 py-2 text-sm transition-colors rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
              >
                <component 
                  :is="child.icon" 
                  class="mr-3 h-4 w-4"
                />
                {{ getMenuLabel(child) }}
              </div>
            </template>
          </div>
        </div>
      </template>
    </template>
  </div>
</template> 