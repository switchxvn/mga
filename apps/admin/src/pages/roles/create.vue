<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTrpc } from "../../composables/useTrpc";
import { useToast } from 'vue-toastification';
import LoadingIcon from "../../components/LoadingIcon.vue";
import PageHeader from "../../components/common/header/PageHeader.vue";

const router = useRouter();
const trpc = useTrpc();
const toast = useToast();

interface Permission {
  id: string;
  name: string;
  code: string;
  groupName: string;
  description: string;
  selected?: boolean;
}

const allPermissions = ref<Permission[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const formError = ref('');
const saveAndContinue = ref(false);

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

// Format code as uppercase with underscores
const formatCode = () => {
  code.value = code.value.toUpperCase().replace(/\s+/g, '_');
};

// Load all permissions
const fetchPermissions = async () => {
  isLoading.value = true;
  
  try {
    const permissionsData = await trpc.admin.roles.getAllPermissions.query();
    allPermissions.value = permissionsData;
  } catch (error: any) {
    console.error('Lỗi khi tải danh sách quyền:', error);
    formError.value = 'Không thể tải danh sách quyền. Vui lòng thử lại sau.';
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

// Save new role
const createRole = async (continueEditing = false) => {
  if (!isFormValid.value) {
    formError.value = 'Vui lòng điền đầy đủ các trường bắt buộc';
    return;
  }
  
  isSaving.value = true;
  saveAndContinue.value = continueEditing;
  formError.value = '';
  
  try {
    const newRole = await trpc.admin.roles.createRole.mutate({
      name: name.value,
      code: code.value,
      groupName: groupName.value,
      description: description.value,
      permissionIds: selectedPermissionIds.value
    });
    
    toast.success('Tạo vai trò thành công!');
    
    if (continueEditing) {
      // Redirect to role edit page
      router.push(`/roles/edit/${newRole.id}`);
    } else {
      // Redirect to role list page
      router.push('/roles');
    }
    
  } catch (error: any) {
    console.error('Lỗi khi tạo vai trò mới:', error);
    formError.value = error.message || 'Không thể tạo vai trò mới. Vui lòng thử lại sau.';
    
    toast.error(formError.value, {
      timeout: 8000,
      position: 'top-right',
      closeButton: true
    });
  } finally {
    isSaving.value = false;
    saveAndContinue.value = false;
  }
};

// Go back to roles list
const goBack = () => {
  router.push('/roles');
};

onMounted(() => {
  fetchPermissions();
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
        title="Tạo vai trò mới" 
        description="Tạo vai trò và chỉ định các quyền hạn"
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
      
      <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
        <!-- Thông báo lỗi -->
        <div v-if="formError" class="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {{ formError }}
        </div>
        
        <!-- Form tạo vai trò -->
        <form @submit.prevent="createRole(false)" class="space-y-6">
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
                @blur="formatCode"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                placeholder="Mã vai trò (ví dụ: CONTENT_MANAGER)"
                required
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
              />
            </div>
          </div>
          
          <!-- Phần quyền -->
          <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quyền hạn</h2>
            
            <div v-for="groupName in sortedGroupNames" :key="groupName" class="mb-6">
              <div class="flex items-center space-x-2 mb-2 p-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                <input
                  type="checkbox"
                  :id="'group-' + groupName"
                  :checked="isGroupSelected(groupName)"
                  :indeterminate="isGroupIndeterminate(groupName)"
                  @change="(e) => toggleGroupPermissions(groupName, (e.target as HTMLInputElement).checked)"
                  class="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-indigo-500"
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
              type="button"
              @click="createRole(true)"
              :disabled="!isFormValid || isSaving"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSaving }"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
            >
              <i v-if="isSaving && saveAndContinue" class="fas fa-spinner fa-spin mr-2"></i>
              <span v-else class="mr-2">
                <i class="fas fa-save"></i>
              </span>
              Lưu & Tiếp tục
            </button>
            <button 
              type="submit"
              :disabled="!isFormValid || isSaving"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSaving }"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i v-if="isSaving && !saveAndContinue" class="fas fa-spinner fa-spin mr-2"></i>
              <span v-else class="mr-2">
                <i class="fas fa-save"></i>
              </span>
              Lưu & Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 