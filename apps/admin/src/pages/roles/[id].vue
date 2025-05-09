<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from "../../composables/useTrpc";
import LoadingIcon from "../../components/LoadingIcon.vue";
import PageHeader from "../../components/common/header/PageHeader.vue";
import Swal from 'sweetalert2';
import {
  XIcon,
  SaveIcon,
  SaveAllIcon,
  ShieldIcon,
  UserIcon,
  SettingsIcon,
  LockIcon
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();
const roleId = route.params.id as string;

// Initialize currentTab from query params or default to 'info'
const currentTab = ref(route.query.tab?.toString() || 'info');

// Watch for tab changes and update URL
watch(currentTab, (newTab) => {
  router.replace({ 
    query: { 
      ...route.query,
      tab: newTab 
    }
  });
});

// Define tabs with icons
const tabs = [
  { 
    id: 'info', 
    name: 'Thông tin', 
    icon: UserIcon
  },
  { 
    id: 'permissions', 
    name: 'Quyền hạn', 
    icon: ShieldIcon
  },
  { 
    id: 'settings', 
    name: 'Cài đặt', 
    icon: SettingsIcon
  }
];

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
const saveRole = async (continueEditing = false) => {
  if (!isFormValid.value) {
    formError.value = 'Vui lòng điền đầy đủ các trường bắt buộc';
    return;
  }
  
  isSaving.value = true;
  saveAndContinue.value = continueEditing;
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
    
    // Hiển thị thông báo thành công
    Swal.fire({
      title: 'Thành công!',
      text: 'Cập nhật vai trò thành công',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    
    if (!continueEditing) {
      // Redirect to roles list
      router.push('/roles');
    }
    
  } catch (error: any) {
    console.error('Lỗi khi cập nhật vai trò:', error);
    formError.value = error.message || 'Không thể cập nhật vai trò. Vui lòng thử lại sau.';
    
    Swal.fire({
      title: 'Lỗi!',
      text: error.message || 'Không thể cập nhật vai trò',
      icon: 'error'
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
          <NuxtLink 
            to="/roles"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
          >
            <XIcon class="w-4 h-4 mr-2" />
            Hủy
          </NuxtLink>
          <button 
            @click="saveRole(true)" 
            :disabled="!isFormValid || !isRoleEditable || isSaving"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || !isRoleEditable || isSaving }"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
          >
            <SaveIcon class="w-4 h-4 mr-2" />
            {{ isSaving && saveAndContinue ? 'Đang lưu...' : 'Lưu & Tiếp tục' }}
          </button>
          <button 
            @click="saveRole(false)" 
            :disabled="!isFormValid || !isRoleEditable || isSaving"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || !isRoleEditable || isSaving }"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
          >
            <SaveAllIcon class="w-4 h-4 mr-2" />
            {{ isSaving && !saveAndContinue ? 'Đang lưu...' : 'Lưu & Quay lại' }}
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
      
      <div v-else>
        <!-- Tabs -->
        <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
            :class="{
              'bg-primary text-white': currentTab === tab.id,
              'text-slate-600 hover:text-slate-900 hover:bg-slate-50': currentTab !== tab.id
            }"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </nav>

        <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
          <!-- Thông báo lỗi và thành công -->
          <div v-if="formError" class="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {{ formError }}
          </div>
          <div v-if="formSuccess" class="mb-4 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
            {{ formSuccess }}
          </div>
          
          <!-- Tab Content -->
          <div>
            <!-- Thông tin cơ bản Tab -->
            <div v-show="currentTab === 'info'" class="space-y-6">
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
            </div>
            
            <!-- Phần quyền Tab -->
            <div v-show="currentTab === 'permissions'">
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
            
            <!-- Cài đặt Tab -->
            <div v-show="currentTab === 'settings'" class="space-y-6">
              <div class="border rounded-lg p-4 bg-gray-50 dark:bg-neutral-800">
                <h3 class="text-lg font-medium mb-4 flex items-center">
                  <LockIcon class="w-5 h-5 mr-2 text-gray-500" />
                  Trạng thái vai trò
                </h3>
                <div class="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                  <p>Ngày tạo: {{ role ? new Date(role.createdAt).toLocaleString() : 'N/A' }}</p>
                  <p>Cập nhật lần cuối: {{ role ? new Date(role.updatedAt).toLocaleString() : 'N/A' }}</p>
                </div>
                <div v-if="!isRoleEditable" class="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg">
                  Vai trò SUPER_ADMIN là vai trò mặc định và không thể chỉnh sửa.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.required::after {
  content: '*';
  @apply text-red-500 ml-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.error-message {
  @apply text-sm text-red-500 mt-1;
}

.input-error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}
</style> 