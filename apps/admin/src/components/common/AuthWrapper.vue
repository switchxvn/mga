<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useTrpc } from '../../composables/useTrpc';
import { useRouter } from 'vue-router';

const props = defineProps({
  /**
   * Có yêu cầu xác thực người dùng không
   */
  requireAuth: {
    type: Boolean,
    default: true
  },
  /**
   * Đường dẫn chuyển hướng nếu không có xác thực
   */
  redirectPath: {
    type: String,
    default: '/auth/login'
  }
});

const emit = defineEmits(['auth-error', 'auth-success', 'loading-change']);

// Trạng thái loading
const isLoading = ref(true);
const isAuthenticated = ref(false);
const error = ref<string | null>(null);

// Access auth and trpc
const { user, checkAuth } = useAuth();
const trpc = useTrpc();
const router = useRouter();

// Tải thông tin người dùng trực tiếp từ API
const fetchUserData = async () => {
  try {
    console.log('AuthWrapper: Fetching user data from API...');
    const profileResponse = await trpc.profile.getMyProfile.query();
    console.log('AuthWrapper: User profile response:', profileResponse);
    
    // Buộc một lần checkAuth để cập nhật dữ liệu người dùng
    await checkAuth();
    
    // Kiểm tra xem dữ liệu đã tải đầy đủ chưa
    if (!user.value?.permissions || !user.value?.roles) {
      console.log('AuthWrapper: User data incomplete, waiting...');
      // Đợi thêm một chút để đảm bảo dữ liệu được cập nhật
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Kiểm tra lại
      await checkAuth();
    }
    
    isAuthenticated.value = true;
    emit('auth-success', user.value);
    
    // Log thông tin người dùng để debug
    console.log('AuthWrapper: Authentication successful', {
      user: user.value,
      role: user.value?.role,
      roles: user.value?.roles,
      permissions: user.value?.permissions
    });
    
    return true;
  } catch (err) {
    console.error('AuthWrapper: Error fetching user data:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải dữ liệu người dùng';
    emit('auth-error', error.value);
    return false;
  }
};

// Khởi tạo khi component được mount
onMounted(async () => {
  console.log('AuthWrapper mounted');
  isLoading.value = true;
  emit('loading-change', true);
  
  try {
    // Kiểm tra xác thực
    const authResult = await checkAuth();
    console.log('AuthWrapper: Initial auth check result:', authResult);
    
    if (!authResult && props.requireAuth) {
      console.log('AuthWrapper: Authentication required but not authenticated');
      router.push(props.redirectPath);
      return;
    }
    
    if (authResult) {
      // Tải dữ liệu người dùng trực tiếp từ API
      await fetchUserData();
    }
  } catch (error) {
    console.error('AuthWrapper: Error during authentication:', error);
  } finally {
    isLoading.value = false;
    emit('loading-change', false);
  }
});

// Theo dõi sự thay đổi của user
watch(() => user.value, (newUser) => {
  console.log('AuthWrapper: User data changed:', newUser);
  isAuthenticated.value = !!newUser;
}, { deep: true });
</script>

<template>
  <div>
    <!-- Hiển thị spinner khi đang tải -->
    <div v-if="isLoading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">Đang tải...</span>
    </div>
    
    <!-- Hiển thị lỗi nếu có -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
      <p>{{ error }}</p>
    </div>
    
    <!-- Hiển thị nội dung nếu đã xác thực hoặc không yêu cầu xác thực -->
    <slot v-else-if="!requireAuth || isAuthenticated" />
    
    <!-- Hiển thị thông báo nếu yêu cầu xác thực nhưng chưa xác thực -->
    <div v-else class="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
      <p>Bạn cần đăng nhập để truy cập trang này.</p>
    </div>
  </div>
</template> 