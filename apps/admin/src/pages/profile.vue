<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Page Header -->
    <PageHeader
      title="Thông tin cá nhân"
      description="Quản lý thông tin cá nhân và bảo mật tài khoản của bạn"
    />

    <!-- Main Content -->
    <div class="py-8">
      <div class=" mx-auto">
        <!-- Profile Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 sm:p-8">
            <div class="space-y-8">
              <!-- Profile Info -->
              <div>
                <div class="flex items-center gap-4 mb-6">
                  <div class="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <span class="text-2xl font-semibold text-gray-600">
                      {{ getUserInitials() }}
                    </span>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900">
                      {{ getFullName() || userData?.name || 'Admin' }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ userData?.email || 'admin@example.com' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Profile Form -->
              <div class="bg-white">
                <ProfileForm />
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Settings Section -->
        <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 sm:p-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Cài đặt bổ sung
            </h3>
            <div class="space-y-4">
              <!-- Email Notifications -->
              <div class="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Thông báo qua email</h4>
                  <p class="text-sm text-gray-500">Nhận thông báo về các hoạt động quan trọng</p>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 bg-gray-200"
                  role="switch"
                  aria-checked="false"
                >
                  <span class="translate-x-0 pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
                    <span class="opacity-0 duration-100 ease-out absolute inset-0 flex h-full w-full items-center justify-center transition-opacity" aria-hidden="true">
                      <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>

              <!-- Two-Factor Authentication -->
              <div class="flex items-center justify-between py-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Xác thực hai yếu tố</h4>
                  <p class="text-sm text-gray-500">Tăng cường bảo mật cho tài khoản của bạn</p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Thiết lập
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
import { onMounted, ref } from 'vue';
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import ProfileForm from '@/components/profile/ProfileForm.vue';
import PageHeader from '@/components/common/header/PageHeader.vue';
import { User } from '@/types/user';

const router = useRouter();
const { user, checkAuth } = useAuth();
const userData = ref<User | null>(null);

// Thêm các hàm helper để hiển thị tên
const getUserInitials = () => {
  if (userData.value?.profile?.firstName && userData.value?.profile?.lastName) {
    return `${userData.value.profile.firstName.charAt(0)}${userData.value.profile.lastName.charAt(0)}`.toUpperCase();
  }
  if (userData.value?.name) {
    return userData.value.name.charAt(0).toUpperCase();
  }
  if (userData.value?.email) {
    return userData.value.email.charAt(0).toUpperCase();
  }
  return 'A';
};

const getFullName = () => {
  if (userData.value?.profile) {
    if (userData.value.profile.lastName && userData.value.profile.firstName) {
      return `${userData.value.profile.lastName} ${userData.value.profile.firstName}`.trim();
    } else if (userData.value.profile.lastName) {
      return userData.value.profile.lastName;
    } else if (userData.value.profile.firstName) {
      return userData.value.profile.firstName;
    }
  }
  return null;
};

// @ts-ignore
definePageMeta({
  middleware: ["auth"],
});

// @ts-ignore
useHead({
  title: 'Profile - Admin Panel'
})

onMounted(async () => {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    userData.value = user.value;
    console.log('User profile data:', userData.value?.profile); // Kiểm tra dữ liệu profile
  } catch (err) {
    console.error("Error checking auth:", err);
  }
});
</script>

<style scoped>
.bg-gray-50\/50 {
  background-color: rgb(249 250 251 / 0.5);
}
</style>