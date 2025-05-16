<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { usePermissions } from '../../composables/usePermissions';
import { useAuth } from '../../composables/useAuth';
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

// Use permissions composable
const { hasAnyPermission, isSuperAdmin } = usePermissions();
const { user, checkAuth } = useAuth();

// Loading state
const isLoading = ref(true);

// Wait for user data to be fully loaded
onMounted(async () => {
  console.log('PermissionGate mounted, checking auth...');
  try {
    await checkAuth();
    console.log('PermissionGate - Auth check completed');
    
    // Wait a bit to ensure data has been updated
    if (!user.value?.permissions) {
      console.log('PermissionGate - Waiting for user data to load...');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.error('PermissionGate - Error checking auth:', error);
  } finally {
    isLoading.value = false;
    console.log('PermissionGate - Loading completed, user data:', JSON.stringify(user.value, null, 2));
  }
});

// Watch for changes in user data
watch(() => user.value, (newUser) => {
  console.log('PermissionGate - User data changed:', newUser);
}, { deep: true });

// Check if user has access
const hasAccess = computed(() => {
  // Loading data
  if (isLoading.value) {
    console.log('PermissionGate - Still loading user data...');
    return false; // Don't show content while loading
  }
  
  // If disabled = true, always allow access
  if (props.disabled) {
    console.log('Permission check disabled, allowing access');
    return true;
  }
  
  // Check if user has information
  if (!user.value) {
    console.log('No user information available, denying access');
    return false;
  }
  
  // Log detailed user information when checking permissions
  console.log('PermissionGate - Checking permissions with user data:', {
    id: user.value.id,
    role: user.value.role,
    isSuperAdmin: isSuperAdmin.value,
    permissions: user.value.permissions,
    required: props.permissions
  });
  
  // SUPER_ADMIN has all permissions - use composable to check
  if (isSuperAdmin.value) {
    console.log('User is SUPER_ADMIN, allowing access to:', props.permissions);
    return true;
  }
  
  // If no permissions are required, allow access
  if (!props.permissions.length) {
    console.log('No permissions required, allowing access');
    return true;
  }
  
  // Check if user has at least one permission
  const result = hasAnyPermission(props.permissions);
  console.log(`Permission check result: ${result}`, {
    required: props.permissions,
    userPermissions: user.value?.permissions || [],
    userRole: user.value?.role
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
    <!-- Loading state -->
    <div v-if="isLoading" class="p-4 flex items-center justify-center">
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