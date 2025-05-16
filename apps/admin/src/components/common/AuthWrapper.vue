<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useTrpc } from '../../composables/useTrpc';
import { useRouter } from 'vue-router';
import { useLocalization } from '../../composables/useLocalization';

const { t } = useLocalization();

const props = defineProps({
  /**
   * Whether authentication is required
   */
  requireAuth: {
    type: Boolean,
    default: true
  },
  /**
   * Redirect path if not authenticated
   */
  redirectPath: {
    type: String,
    default: '/auth/login'
  }
});

const emit = defineEmits(['auth-error', 'auth-success', 'loading-change']);

// Loading state
const isLoading = ref(true);
const isAuthenticated = ref(false);
const error = ref<string | null>(null);

// Access auth and trpc
const { user, checkAuth } = useAuth();
const trpc = useTrpc();
const router = useRouter();

// Load user information directly from API
const fetchUserData = async () => {
  try {
    console.log('AuthWrapper: Fetching user data from API...');
    const profileResponse = await trpc.profile.getMyProfile.query();
    console.log('AuthWrapper: User profile response:', profileResponse);
    
    // Force a checkAuth to update user data
    await checkAuth();
    
    // Check if data is fully loaded
    if (!user.value?.permissions || !user.value?.roles) {
      console.log('AuthWrapper: User data incomplete, waiting...');
      // Wait a bit to ensure data is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check again
      await checkAuth();
    }
    
    isAuthenticated.value = true;
    emit('auth-success', user.value);
    
    // Log user information for debugging
    console.log('AuthWrapper: Authentication successful', {
      user: user.value,
      role: user.value?.role,
      roles: user.value?.roles,
      permissions: user.value?.permissions
    });
    
    return true;
  } catch (err) {
    console.error('AuthWrapper: Error fetching user data:', err);
    error.value = err.message || t('messages.error');
    emit('auth-error', error.value);
    return false;
  }
};

// Initialize when component is mounted
onMounted(async () => {
  console.log('AuthWrapper mounted');
  isLoading.value = true;
  emit('loading-change', true);
  
  try {
    // Check authentication
    const authResult = await checkAuth();
    console.log('AuthWrapper: Initial auth check result:', authResult);
    
    if (!authResult && props.requireAuth) {
      console.log('AuthWrapper: Authentication required but not authenticated');
      router.push(props.redirectPath);
      return;
    }
    
    if (authResult) {
      // Load user data directly from API
      await fetchUserData();
    }
  } catch (error) {
    console.error('AuthWrapper: Error during authentication:', error);
  } finally {
    isLoading.value = false;
    emit('loading-change', false);
  }
});

// Watch for changes in user
watch(() => user.value, (newUser) => {
  console.log('AuthWrapper: User data changed:', newUser);
  isAuthenticated.value = !!newUser;
}, { deep: true });
</script>

<template>
  <div>
    <!-- Display spinner when loading -->
    <div v-if="isLoading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">{{ t('messages.loading') }}</span>
    </div>
    
    <!-- Display error if any -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
      <p>{{ error }}</p>
    </div>
    
    <!-- Display content if authenticated or auth not required -->
    <slot v-else-if="!requireAuth || isAuthenticated" />
    
    <!-- Display message if auth required but not authenticated -->
    <div v-else class="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
      <p>{{ t('components.common.authWrapper.mustLogin') }}</p>
      <p class="mt-2">{{ t('components.common.authWrapper.redirectingToLogin') }}</p>
    </div>
  </div>
</template> 