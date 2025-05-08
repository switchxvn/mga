<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/useUserStore';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

interface UserRole {
  code: string;
  name: string;
}

const { t } = useI18n();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

// Check permissions function
const hasAnyPermission = (requiredRoles: string[]) => {
  if (!user.value || !user.value.roles) return false;
  
  // Type assertion để tránh lỗi TypeScript
  const roles = user.value.roles as unknown as UserRole[];
  
  // Check if user has SUPER_ADMIN role (can access everything)
  if (roles.some(role => role.code === 'SUPER_ADMIN')) {
    return true;
  }
  
  // Check if user has any of the required roles
  return roles.some(role => requiredRoles.includes(role.code));
};

// Check if current route matches the given path
const isActive = (path: string) => {
  return window.location.pathname.startsWith(path);
};
</script>

<template>
  <!-- E-commerce Section -->
  <template v-if="hasAnyPermission(['SUPER_ADMIN', 'ADMIN', 'STAFF'])">
    <div class="px-3 py-2 text-xs font-medium uppercase text-gray-500">
      {{ t('E-commerce') }}
    </div>
    <ul class="mt-2 space-y-1">
      <li>
        <NuxtLink
          to="/products"
          class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': isActive('/products') }"
        >
          <div class="flex items-center gap-2">
            <i class="fas fa-box"></i>
            <span>{{ t('Products') }}</span>
          </div>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink
          to="/orders"
          class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': isActive('/orders') }"
        >
          <div class="flex items-center gap-2">
            <i class="fas fa-shopping-cart"></i>
            <span>{{ t('Orders') }}</span>
          </div>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink
          to="/tickets/scanner"
          class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': isActive('/tickets/scanner') }"
        >
          <div class="flex items-center gap-2">
            <i class="fas fa-qrcode"></i>
            <span>{{ t('Ticket Scanner') }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </template>
</template> 