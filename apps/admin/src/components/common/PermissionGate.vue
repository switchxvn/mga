<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { usePermissions } from '../../composables/usePermissions';
import { useAuth } from '../../composables/useAuth';
import AccessDenied from './AccessDenied.vue';

const props = defineProps({
  /**
   * Mảng các quyền cần kiểm tra.
   * Người dùng cần phải có ít nhất một quyền trong số này để xem nội dung.
   */
  permissions: {
    type: Array as () => string[],
    default: () => []
  },
  /**
   * Vô hiệu hóa việc kiểm tra quyền và luôn hiển thị nội dung.
   * Hữu ích cho việc phát triển hoặc trang không cần quyền.
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Ẩn component AccessDenied nếu không có quyền.
   * Nếu true, sẽ không hiển thị gì cả khi không có quyền.
   */
  hideAccessDenied: {
    type: Boolean,
    default: false
  },
  /**
   * Tiêu đề tùy chỉnh cho thông báo từ chối quyền truy cập.
   */
  accessDeniedTitle: {
    type: String,
    default: ''
  },
  /**
   * Mô tả tùy chỉnh cho thông báo từ chối quyền truy cập.
   */
  accessDeniedDescription: {
    type: String,
    default: ''
  }
});

// Sử dụng composable quyền
const { hasAnyPermission, isSuperAdmin } = usePermissions();
const { user, checkAuth } = useAuth();

// Trạng thái đang tải
const isLoading = ref(true);

// Chờ dữ liệu người dùng được tải đầy đủ
onMounted(async () => {
  console.log('PermissionGate mounted, checking auth...');
  try {
    await checkAuth();
    console.log('PermissionGate - Auth check completed');
    
    // Đợi một chút để đảm bảo dữ liệu đã được cập nhật
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

// Theo dõi sự thay đổi của dữ liệu người dùng
watch(() => user.value, (newUser) => {
  console.log('PermissionGate - User data changed:', newUser);
}, { deep: true });

// Kiểm tra xem người dùng có quyền truy cập không
const hasAccess = computed(() => {
  // Đang tải dữ liệu
  if (isLoading.value) {
    console.log('PermissionGate - Still loading user data...');
    return false; // Không hiển thị nội dung khi đang tải
  }
  
  // Nếu disabled = true, luôn cho phép truy cập
  if (props.disabled) {
    console.log('Permission check disabled, allowing access');
    return true;
  }
  
  // Kiểm tra xem người dùng có thông tin chưa
  if (!user.value) {
    console.log('No user information available, denying access');
    return false;
  }
  
  // Log chi tiết thông tin user khi kiểm tra quyền
  console.log('PermissionGate - Checking permissions with user data:', {
    id: user.value.id,
    role: user.value.role,
    isSuperAdmin: isSuperAdmin.value,
    permissions: user.value.permissions,
    required: props.permissions
  });
  
  // SUPER_ADMIN có tất cả quyền - sử dụng composable để kiểm tra
  if (isSuperAdmin.value) {
    console.log('User is SUPER_ADMIN, allowing access to:', props.permissions);
    return true;
  }
  
  // Nếu không có quyền nào được yêu cầu, cho phép truy cập
  if (!props.permissions.length) {
    console.log('No permissions required, allowing access');
    return true;
  }
  
  // Kiểm tra xem người dùng có ít nhất một quyền không
  const result = hasAnyPermission(props.permissions);
  console.log(`Permission check result: ${result}`, {
    required: props.permissions,
    userPermissions: user.value?.permissions || [],
    userRole: user.value?.role
  });
  return result;
});
</script>

<template>
  <div>
    <!-- Trạng thái đang tải -->
    <div v-if="isLoading" class="p-4 flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
    
    <!-- Hiển thị nội dung nếu có quyền truy cập -->
    <slot v-else-if="hasAccess" />
    
    <!-- Hiển thị thông báo từ chối quyền truy cập nếu không có quyền -->
    <AccessDenied
      v-else-if="!hideAccessDenied"
      :requiredPermissions="permissions"
      :title="accessDeniedTitle"
      :description="accessDeniedDescription"
    />
  </div>
</template> 