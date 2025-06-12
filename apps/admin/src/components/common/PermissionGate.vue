<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { usePermissions } from '../../composables/usePermissions';
import { useUserStore } from '../../stores/useUserStore';
import { useLocalization } from '../../composables/useLocalization';
import AccessDenied from './AccessDenied.vue';

const { t } = useLocalization();

const props = defineProps({
  /**
   * Array of permissions to check.
   * User needs at least one of these permissions to view content.
   */
  permissions: {
    type: Array as () => string[],
    default: () => []
  },
  /**
   * Disable permission checking and always show content.
   * Useful for development or pages that don't require permissions.
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Hide the AccessDenied component if no permissions.
   * If true, will show nothing when access is denied.
   */
  hideAccessDenied: {
    type: Boolean,
    default: false
  },
  /**
   * Custom title for access denied message.
   */
  accessDeniedTitle: {
    type: String,
    default: ''
  },
  /**
   * Custom description for access denied message.
   */
  accessDeniedDescription: {
    type: String,
    default: ''
  }
});

// Use permissions composable and user store
const { hasAnyPermission, isSuperAdmin } = usePermissions();
const userStore = useUserStore();

// Check if user is loaded
const isUserLoaded = computed(() => !!userStore.user);

// Wait for user data to be available
onMounted(() => {
  console.log('🔒 PermissionGate: Mounted, checking user store...');
  console.log('🔒 PermissionGate: User data:', {
    hasUser: !!userStore.user,
    userId: userStore.user?.id,
    role: userStore.user?.role,
    isSuperAdmin: userStore.isSuperAdmin,
    permissions: userStore.user?.permissions
  });
});

// Watch for changes in user data
watch(() => userStore.user, (newUser) => {
  console.log('🔒 PermissionGate: User data changed:', {
    hasUser: !!newUser,
    userId: newUser?.id,
    role: newUser?.role,
    isSuperAdmin: userStore.isSuperAdmin
  });
}, { deep: true });

// Check if user has access
const hasAccess = computed(() => {
  // If disabled = true, always allow access
  if (props.disabled) {
    console.log('🔒 PermissionGate: Check disabled, allowing access');
    return true;
  }
  
  // Check if user has information
  if (!userStore.user) {
    console.log('🔒 PermissionGate: No user data in store, denying access');
    return false;
  }
  
  // Log detailed user information when checking permissions
  console.log('🔒 PermissionGate: Checking permissions:', {
    userId: userStore.user.id,
    role: userStore.user.role,
    isSuperAdmin: userStore.isSuperAdmin,
    permissions: userStore.user.permissions,
    requiredPermissions: props.permissions
  });
  
  // SUPER_ADMIN has all permissions
  if (userStore.isSuperAdmin) {
    console.log('🔒 PermissionGate: User is SUPER_ADMIN, granting access');
    return true;
  }
  
  // If no permissions are required, allow access
  if (!props.permissions.length) {
    console.log('🔒 PermissionGate: No permissions required, allowing access');
    return true;
  }
  
  // Check if user has at least one permission
  const result = userStore.hasAnyPermission(props.permissions);
  console.log(`🔒 PermissionGate: Permission check result: ${result}`, {
    required: props.permissions,
    userPermissions: userStore.user.permissions || []
  });
  return result;
});

// Default title based on translations
const defaultAccessDeniedTitle = computed(() => {
  return props.accessDeniedTitle || t('components.common.permissionGate.unauthorized');
});

// Default description based on translations
const defaultAccessDeniedDescription = computed(() => {
  return props.accessDeniedDescription || t('components.common.permissionGate.missingPermissions');
});
</script>

<template>
  <div>
    <!-- Loading state - wait for user to load -->
    <div v-if="!isUserLoaded" class="p-4 flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
    
    <!-- Show content if has access -->
    <slot v-else-if="hasAccess" />
    
    <!-- Show access denied message if no permission -->
    <AccessDenied
      v-else-if="!hideAccessDenied"
      :requiredPermissions="permissions"
      :title="defaultAccessDeniedTitle"
      :description="defaultAccessDeniedDescription"
    />
  </div>
</template> 