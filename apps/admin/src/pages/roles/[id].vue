<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from "../../composables/useTrpc";
import LoadingIcon from "../../components/LoadingIcon.vue";
import PageHeader from "../../components/common/header/PageHeader.vue";

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();
const roleId = route.params.id as string;

interface Permission {
  id: string;
  name: string;
  code: string;
  groupName: string;
  description: string;
  selected?: boolean;
}

interface Role {
  id: string;
  name: string;
  code: string;
  groupName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

const role = ref<Role | null>(null);
const allPermissions = ref<Permission[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const formError = ref('');
const formSuccess = ref('');

// Form fields
const name = ref('');
const code = ref('');
const groupName = ref('');
const description = ref('');
const selectedPermissionIds = ref<string[]>([]);

// Group permissions by their groupName
const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {};
  
  allPermissions.value.forEach(permission => {
    if (!groups[permission.groupName]) {
      groups[permission.groupName] = [];
    }
    groups[permission.groupName].push(permission);
  });
  
  // Sort each group's permissions
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  return groups;
});

// Get sorted group names
const sortedGroupNames = computed(() => {
  return Object.keys(groupedPermissions.value).sort();
});

// Check if form is valid
const isFormValid = computed(() => {
  return name.value.trim() !== '' && 
         code.value.trim() !== '' && 
         groupName.value.trim() !== '';
});

// Check if role is editable (SUPER_ADMIN shouldn't be editable)
const isRoleEditable = computed(() => {
  return role.value?.code !== 'SUPER_ADMIN';
});

// Load role and permissions data
const fetchRoleData = async () => {
  isLoading.value = true;
  
  try {
    // Get role details
    const roleData = await trpc.admin.roles.getRoleById.query(roleId);
    role.value = roleData;
    
    // Get all permissions
    const permissionsData = await trpc.admin.roles.getAllPermissions.query();
    allPermissions.value = permissionsData;
    
    // Fill form fields
    name.value = roleData.name;
    code.value = roleData.code;
    groupName.value = roleData.groupName;
    description.value = roleData.description || '';
    
    // Mark selected permissions
    selectedPermissionIds.value = roleData.permissions.map((p: Permission) => p.id);
    
  } catch (error: any) {
    console.error('Lỗi khi tải dữ liệu vai trò:', error);
    formError.value = 'Không thể tải dữ liệu vai trò. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

// Toggle permission selection
const togglePermission = (permissionId: string) => {
  if (selectedPermissionIds.value.includes(permissionId)) {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => id !== permissionId);
  } else {
    selectedPermissionIds.value.push(permissionId);
  }
};

// Toggle all permissions in a group
const toggleGroupPermissions = (groupName: string, selected: boolean) => {
  const groupPermissionIds = groupedPermissions.value[groupName].map(p => p.id);
  
  if (selected) {
    // Add all group permissions not already selected
    groupPermissionIds.forEach(id => {
      if (!selectedPermissionIds.value.includes(id)) {
        selectedPermissionIds.value.push(id);
      }
    });
  } else {
    // Remove all group permissions
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !groupPermissionIds.includes(id));
  }
};

// Check if all permissions in a group are selected
const isGroupSelected = (groupName: string): boolean => {
  const groupPermissionIds = groupedPermissions.value[groupName].map(p => p.id);
  return groupPermissionIds.every(id => selectedPermissionIds.value.includes(id));
};

// Check if some permissions in a group are selected
const isGroupIndeterminate = (groupName: string): boolean => {
  const groupPermissionIds = groupedPermissions.value[groupName].map(p => p.id);
  const selectedInGroup = groupPermissionIds.filter(id => selectedPermissionIds.value.includes(id));
  return selectedInGroup.length > 0 && selectedInGroup.length < groupPermissionIds.length;
};

// Save role changes
const saveRole = async () => {
  if (!isFormValid.value) {
    formError.value = 'Vui lòng điền đầy đủ các trường bắt buộc';
    return;
  }
  
  isSaving.value = true;
  formError.value = '';
  formSuccess.value = '';
  
  try {
    await trpc.admin.roles.updateRole.mutate({
      id: roleId,
      name: name.value,
      code: code.value,
      groupName: groupName.value,
      description: description.value,
      permissionIds: selectedPermissionIds.value
    });
    
    formSuccess.value = 'Cập nhật vai trò thành công';
    setTimeout(() => {
      formSuccess.value = '';
    }, 3000);
    
  } catch (error: any) {
    console.error('Lỗi khi cập nhật vai trò:', error);
    formError.value = error.message || 'Không thể cập nhật vai trò. Vui lòng thử lại sau.';
  } finally {
    isSaving.value = false;
  }
};

// Go back to roles list
const goBack = () => {
  router.push('/roles');
};

onMounted(() => {
  fetchRoleData();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-900">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div class="flex flex-col items-center gap-2">
        <LoadingIcon size="lg" />
        <p class="text-sm text-slate-500 dark:text-neutral-400">Đang tải...</p>
      </div>
    </div>

    <!-- Content Area -->
    <div v-else class="container mx-auto py-6 space-y-6">
      <!-- Header -->
      <PageHeader 
        title="Chi tiết vai trò" 
        :description="role?.name ?? 'Không tìm thấy vai trò'"
      >
        <template #actions>
          <button 
            @click="goBack"
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-600"
          >
            <i class="fas fa-arrow-left mr-2"></i>Quay lại
          </button>
        </template>
      </PageHeader>
      
      <div v-if="!role" class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6 text-center py-16">
        <i class="fas fa-exclamation-triangle text-yellow-400 text-5xl mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400 text-lg">Không tìm thấy vai trò</p>
        <button 
          @click="goBack"
          class="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Quay lại danh sách
        </button>
      </div>
      
      <div v-else class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
        <!-- Thông báo lỗi và thành công -->
        <div v-if="formError" class="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {{ formError }}
        </div>
        <div v-if="formSuccess" class="mb-4 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          {{ formSuccess }}
        </div>
        
        <!-- Form chính sách vai trò -->
        <form @submit.prevent="saveRole" class="space-y-6">
          <!-- Thông tin cơ bản -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tên vai trò <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                v-model="name"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                placeholder="Tên vai trò"
                required
                :disabled="!isRoleEditable"
              />
            </div>
            
            <div>
              <label for="code" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Mã vai trò <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                v-model="code"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                placeholder="Mã vai trò (ví dụ: CONTENT_MANAGER)"
                required
                :disabled="!isRoleEditable"
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Mã vai trò sẽ được sử dụng trong hệ thống, nên là chữ in hoa và gạch dưới.</p>
            </div>
            
            <div>
              <label for="group" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nhóm <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="group"
                v-model="groupName"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                placeholder="Nhóm vai trò (ví dụ: Content, System, Users)"
                required
                :disabled="!isRoleEditable"
              />
            </div>
            
            <div>
              <label for="description" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
              <input
                type="text"
                id="description"
                v-model="description"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                placeholder="Mô tả vai trò"
                :disabled="!isRoleEditable"
              />
            </div>
          </div>
          
          <!-- Phần quyền -->
          <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quyền hạn</h2>
            
            <div v-if="!isRoleEditable" class="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg">
              Vai trò này không thể chỉnh sửa quyền vì nó là vai trò hệ thống.
            </div>
            
            <div v-for="groupName in sortedGroupNames" :key="groupName" class="mb-6">
              <div class="flex items-center space-x-2 mb-2 p-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                <input
                  type="checkbox"
                  :id="'group-' + groupName"
                  :checked="isGroupSelected(groupName)"
                  :indeterminate="isGroupIndeterminate(groupName)"
                  @change="(e) => toggleGroupPermissions(groupName, (e.target as HTMLInputElement).checked)"
                  class="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-indigo-500"
                  :disabled="!isRoleEditable"
                />
                <label :for="'group-' + groupName" class="font-medium text-gray-900 dark:text-white">{{ groupName }}</label>
              </div>
              
              <div class="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div v-for="permission in groupedPermissions[groupName]" :key="permission.id" class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    :id="'permission-' + permission.id"
                    :checked="selectedPermissionIds.includes(permission.id)"
                    @change="togglePermission(permission.id)"
                    class="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-indigo-500"
                    :disabled="!isRoleEditable"
                  />
                  <label :for="'permission-' + permission.id" class="text-sm text-gray-900 dark:text-gray-300">
                    {{ permission.name }}
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ permission.code }})</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Nút lưu -->
          <div class="flex justify-end space-x-2 mt-8">
            <button 
              type="button"
              @click="goBack"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
            >
              Hủy
            </button>
            <button 
              type="submit"
              :disabled="!isFormValid || !isRoleEditable || isSaving"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || !isRoleEditable || isSaving }"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i v-if="isSaving" class="fas fa-spinner fa-spin mr-2"></i>
              <span v-else class="mr-2">
                <i class="fas fa-save"></i>
              </span>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 