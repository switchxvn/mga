<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-8">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Thông tin cá nhân
        </h2>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-neutral-800 shadow sm:rounded-lg p-6">
      <div class="animate-pulse flex space-x-4">
        <div class="rounded-full bg-gray-200 dark:bg-neutral-700 h-24 w-24"></div>
        <div class="flex-1 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="h-8 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-8 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-8 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-8 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="bg-white dark:bg-neutral-800 shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="space-y-6">
          <!-- Profile Information -->
          <div class="flex flex-col sm:flex-row gap-6">
            <!-- Avatar Section -->
            <div class="flex-shrink-0">
              <div class="relative">
                <div class="relative w-24 h-24 overflow-hidden bg-gray-100 dark:bg-neutral-700 rounded-full ring-2 ring-white dark:ring-neutral-600">
                  <img
                    v-if="user?.avatar"
                    :src="user.avatar"
                    :alt="userDisplayName"
                    class="w-full h-full object-cover"
                  />
                  <svg
                    v-else
                    class="absolute w-full h-full text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                    />
                    <path
                      d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  class="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Camera class="w-4 h-4 text-white" />
                  <span class="sr-only">Change avatar</span>
                </button>
              </div>
            </div>

            <!-- User Information -->
            <div class="flex-1">
              <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Họ và tên
                  </label>
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="userInfo.name"
                      class="block w-full rounded-md border-gray-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-neutral-700"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <div class="mt-1">
                    <input
                      type="email"
                      v-model="userInfo.email"
                      disabled
                      class="block w-full rounded-md border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Số điện thoại
                  </label>
                  <div class="mt-1">
                    <input
                      type="tel"
                      v-model="userInfo.phone"
                      class="block w-full rounded-md border-gray-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-neutral-700"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Ngày sinh
                  </label>
                  <div class="mt-1">
                    <input
                      type="date"
                      v-model="userInfo.birthdate"
                      class="block w-full rounded-md border-gray-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-neutral-700"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  @click="saveProfile"
                >
                  <Save class="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { Camera, Save } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile'
});

const { user, checkAuth } = useAuth();
const isLoading = ref(true);

const userDisplayName = computed(() => {
  if (!user.value) return '';
  return user.value.profile?.firstName || user.value.email;
});

const userInfo = ref({
  name: '',
  email: '',
  phone: '',
  birthdate: ''
});

onMounted(async () => {
  try {
    isLoading.value = true;
    await checkAuth();
    
    // Populate user info from auth state
    if (user.value) {
      console.log('User data:', user.value); // Debug log
      userInfo.value = {
        name: user.value.profile?.firstName || '',
        email: user.value.email || '',
        phone: user.value.profile?.phoneNumber || '',
        birthdate: user.value.profile?.birthdate || ''
      };
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  } finally {
    isLoading.value = false;
  }
});

const saveProfile = async () => {
  // Implement save profile logic here
  console.log('Saving profile:', userInfo.value);
};
</script> 