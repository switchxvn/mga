<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTrpc } from "../../composables/useTrpc";
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import LoadingIcon from "../../components/LoadingIcon.vue";
import PageHeader from "../../components/common/header/PageHeader.vue";
import { useLocalization } from "../../composables/useLocalization";
import {
  XIcon,
  SaveIcon,
  SaveAllIcon
} from 'lucide-vue-next';

const router = useRouter();
const trpc = useTrpc();
const toast = useToast();
const { t } = useLocalization();

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
    formError.value = t('roles.loadError') || 'Không thể tải danh sách quyền. Vui lòng thử lại sau.';
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
    formError.value = t('roles.requiredFields');
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
    
    // Hiển thị thông báo thành công bằng SweetAlert2
    Swal.fire({
      title: t('messages.success'),
      text: t('roles.createSuccess'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    
    if (continueEditing) {
      // Redirect to role edit page
      router.push(`/roles/${newRole.id}`);
    } else {
      // Redirect to role list page
      router.push('/roles');
    }
    
  } catch (error: any) {
    console.error('Lỗi khi tạo vai trò mới:', error);
    formError.value = error.message || t('roles.createError');
    
    // Hiển thị thông báo lỗi bằng SweetAlert2
    Swal.fire({
      title: t('messages.error'),
      text: error.message || t('roles.createError'),
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
  fetchPermissions();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-900">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div class="flex flex-col items-center gap-2">
        <LoadingIcon size="lg" />
        <p class="text-sm text-slate-500 dark:text-neutral-400">{{ t('roles.loading') }}</p>
      </div>
    </div>

    <!-- Content Area -->
    <div v-else class="container mx-auto py-6 space-y-6">
      <!-- Header -->
      <PageHeader 
        :title="t('roles.createRole')" 
        :description="t('roles.description')"
      >
        <template #actions>
          <NuxtLink 
            to="/roles"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
          >
            <XIcon class="w-4 h-4 mr-2" />
            {{ t('roles.cancel') }}
          </NuxtLink>
          <button 
            @click="createRole(true)" 
            :disabled="!isFormValid || isSaving"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSaving }"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
          >
            <SaveIcon class="w-4 h-4 mr-2" />
            {{ isSaving && saveAndContinue ? t('common.saving') : t('roles.saveAndContinue') }}
          </button>
          <button 
            @click="createRole(false)" 
            :disabled="!isFormValid || isSaving"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSaving }"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
          >
            <SaveAllIcon class="w-4 h-4 mr-2" />
            {{ isSaving && !saveAndContinue ? t('common.saving') : t('roles.saveAndBack') }}
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
                {{ t('roles.name') }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                v-model="name"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                :placeholder="t('roles.namePlaceholder')"
                required
              />
            </div>
            
            <div>
              <label for="code" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('roles.code') }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                v-model="code"
                @blur="formatCode"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                :placeholder="t('roles.codePlaceholder')"
                required
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('roles.codeHelp') }}</p>
            </div>
            
            <div>
              <label for="group" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('roles.group') }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="group"
                v-model="groupName"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                :placeholder="t('roles.groupPlaceholder')"
                required
              />
            </div>
            
            <div>
              <label for="description" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('roles.description') }}</label>
              <input
                type="text"
                id="description"
                v-model="description"
                class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                :placeholder="t('roles.descriptionPlaceholder')"
              />
            </div>
          </div>
          
          <!-- Phần quyền -->
          <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('roles.permissions') }}</h2>
            
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
        </form>
      </div>
    </div>
  </div>
</template> 