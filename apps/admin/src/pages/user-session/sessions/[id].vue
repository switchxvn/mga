<template>
  <AuthWrapper>
    <PermissionGate :permissions="[]">
      <div class="min-h-screen bg-gray-50">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div class="flex flex-col items-center gap-3">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
            <p class="text-sm font-medium text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>

        <!-- Not Found State -->
        <div v-else-if="!session" class="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div class="bg-white shadow rounded-lg p-8 max-w-md">
            <div class="flex flex-col items-center gap-5">
              <div class="p-3 bg-amber-100 rounded-full">
                <AlertCircleIcon class="h-12 w-12 text-amber-500" />
              </div>
              <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-900">Không tìm thấy thông tin phiên</h3>
                <p class="mt-2 text-gray-600">Phiên người dùng này không tồn tại hoặc đã bị xóa.</p>
              </div>
              <NuxtLink 
                to="/user-session" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-5 py-2 shadow-sm"
              >
                <ArrowLeftIcon class="w-4 h-4 mr-2" />
                Quay lại danh sách
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div v-else class="container mx-auto px-4 py-6 max-w-7xl">
          <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white shadow rounded-lg p-6">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-100 rounded-lg">
                      <UserIcon class="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-bold text-gray-900">Chi tiết phiên người dùng</h2>
                      <p class="mt-1 text-sm text-gray-500 flex items-center gap-2">
                        <InfoIcon class="h-4 w-4" />
                        <span>ID: <span class="font-medium text-indigo-600">{{ session.sessionId }}</span></span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span 
                    class="px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-1.5"
                    :class="!session.isActive ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'"
                  >
                    <span class="relative flex h-2 w-2">
                      <span :class="session.isActive ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' : ''"></span>
                      <span :class="session.isActive ? 'relative inline-flex rounded-full h-2 w-2 bg-emerald-500' : 'relative inline-flex rounded-full h-2 w-2 bg-gray-500'"></span>
                    </span>
                    {{ session.isActive ? 'Đang hoạt động' : 'Đã kết thúc' }}
                  </span>
                  <NuxtLink 
                    to="/user-session" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 h-9 px-4"
                  >
                    <ArrowLeftIcon class="w-4 h-4 mr-2" />
                    Quay lại
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Session Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- User Info Card -->
              <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="bg-indigo-600 px-6 py-4">
                  <h3 class="text-lg font-medium text-white flex items-center gap-2">
                    <UserIcon class="h-5 w-5" />
                    Thông tin người dùng
                  </h3>
                </div>
                <div class="p-6">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {{ session.user ? session.user.email.charAt(0).toUpperCase() : 'G' }}
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900">
                        <template v-if="session.user">
                          {{ session.user.email }}
                        </template>
                        <span v-else>Khách</span>
                      </h4>
                      <p class="text-sm text-gray-500">
                        <template v-if="session.user">
                          ID: {{ session.userId }}
                        </template>
                        <span v-else>Phiên không xác thực</span>
                      </p>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span class="text-sm font-medium text-gray-500">Thời gian bắt đầu:</span>
                      <span class="text-sm text-gray-900 font-medium">{{ formatDate(session.startTime) }}</span>
                    </div>
                    <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span class="text-sm font-medium text-gray-500">Hoạt động cuối:</span>
                      <span class="text-sm text-gray-900 font-medium">{{ formatDate(session.lastActivity) }}</span>
                    </div>
                    <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span class="text-sm font-medium text-gray-500">Hết hạn:</span>
                      <span class="text-sm text-gray-900 font-medium">{{ formatDate(session.expireAt) || 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-gray-500">Tổng thời gian:</span>
                      <span class="text-sm font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                        {{ formatDuration(session.totalTime) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Device Info Card -->
              <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="bg-indigo-600 px-6 py-4">
                  <h3 class="text-lg font-medium text-white flex items-center gap-2">
                    <TabletIcon class="h-5 w-5" />
                    Thông tin thiết bị
                  </h3>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
                      <div class="p-1.5 bg-indigo-100 rounded-md">
                        <MapPinIcon class="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ session.ipAddress || 'Không có' }}</p>
                        <p class="text-xs text-gray-500">Địa chỉ IP</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
                      <div class="p-1.5 bg-indigo-100 rounded-md">
                        <GlobeIcon class="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ session.country || 'Không xác định' }}</p>
                        <p class="text-xs text-gray-500">Quốc gia</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="p-1.5 bg-indigo-100 rounded-md">
                        <MonitorIcon class="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 break-words">{{ formatUserAgent(session.userAgent) || 'Không xác định' }}</p>
                        <p class="text-xs text-gray-500">Trình duyệt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions Card -->
              <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="bg-indigo-600 px-6 py-4">
                  <h3 class="text-lg font-medium text-white flex items-center gap-2">
                    <SettingsIcon class="h-5 w-5" />
                    Thao tác
                  </h3>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <button 
                      v-if="session.isActive"
                      @click="endSession" 
                      class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 h-10 px-4 py-2"
                      :disabled="loading"
                    >
                      <StopCircleIcon class="h-4 w-4 mr-2" />
                      Kết thúc phiên
                    </button>
                    <button 
                      @click="deleteSession" 
                      class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 h-10 px-4 py-2"
                      :disabled="loading"
                    >
                      <TrashIcon class="h-4 w-4 mr-2" />
                      Xóa phiên
                    </button>
                  </div>
                  
                  <div class="mt-6 pt-6 border-t border-gray-100">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Thông tin chi tiết</h4>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">ID phiên:</span>
                        <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{{ session.id }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">Session ID:</span>
                        <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">{{ session.sessionId }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Device Info Expanded -->
            <div v-if="session.deviceInfo" class="bg-white shadow rounded-lg overflow-hidden">
              <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <ServerIcon class="h-5 w-5 text-indigo-600" />
                  Thông tin thiết bị chi tiết
                </h3>
              </div>
              <div class="p-6">
                <pre class="bg-gray-50 p-4 rounded text-sm text-gray-800 overflow-x-auto border border-gray-200">{{ JSON.stringify(session.deviceInfo, null, 2) }}</pre>
              </div>
            </div>

            <!-- Page Visits -->
            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <HistoryIcon class="h-5 w-5 text-indigo-600" />
                    Lịch sử duyệt trang
                  </h3>
                  <span class="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {{ pageVisits.length }} trang
                  </span>
                </div>
              </div>
              
              <div v-if="pageVisitsLoading" class="flex items-center justify-center h-40">
                <div class="flex flex-col items-center gap-3">
                  <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
                  <p class="text-sm font-medium text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
              
              <div v-else-if="!pageVisits.length" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="p-3 bg-gray-100 rounded-full">
                    <InboxIcon class="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <h3 class="text-base font-medium text-gray-900">Không có dữ liệu</h3>
                    <p class="mt-1 text-sm text-gray-500">Không có dữ liệu lịch sử duyệt trang cho phiên này.</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr class="bg-gray-50">
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trang</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nguồn</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian vào</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian ra</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian trên trang</th>
                      <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trang đầu</th>
                      <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trang cuối</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="visit in pageVisits" :key="visit.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <LinkIcon class="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <div class="truncate max-w-[200px] text-sm font-medium text-gray-900">
                            {{ visit.pageUrl }}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="truncate max-w-[150px] text-sm text-gray-500">
                          {{ visit.referrer || '-' }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ formatDate(visit.entryTime) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ visit.exitTime ? formatDate(visit.exitTime) : '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                          {{ formatDuration(visit.timeOnPage) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div class="flex justify-center">
                          <CheckCircleIcon v-if="visit.isLandingPage" class="h-5 w-5 text-emerald-500" />
                          <span v-else class="text-gray-400">-</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div class="flex justify-center">
                          <CheckCircleIcon v-if="visit.isExitPage" class="h-5 w-5 text-emerald-500" />
                          <span v-else class="text-gray-400">-</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  </AuthWrapper>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserSession } from '../../../composables/useUserSession';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  InfoIcon, 
  ClipboardIcon, 
  TabletIcon,
  HistoryIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  InboxIcon,
  TrashIcon,
  StopCircleIcon,
  MapPinIcon,
  GlobeIcon,
  MonitorIcon,
  SettingsIcon,
  ServerIcon,
  LinkIcon
} from 'lucide-vue-next';
import AuthWrapper from '../../../components/common/AuthWrapper.vue';
import PermissionGate from '../../../components/common/PermissionGate.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Chi tiết phiên người dùng - Admin Panel'
});

const route = useRoute();
const { 
  loading, 
  pageVisitsLoading, 
  session, 
  pageVisits, 
  fetchSessionData, 
  endSession, 
  deleteSession,
  formatDate,
  formatDuration,
  formatUserAgent
} = useUserSession();

onMounted(async () => {
  await fetchSessionData(Number(route.params.id));
});
</script> 