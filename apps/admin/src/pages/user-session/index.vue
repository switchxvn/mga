<template>
  <AuthWrapper>
    <PermissionGate :permissions="[]">
      <div class="min-h-screen bg-slate-50">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div class="flex flex-col items-center gap-2">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p class="text-sm text-slate-500">Đang tải...</p>
          </div>
        </div>

        <!-- Content Area -->
        <div v-else class="min-h-screen bg-slate-50">
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-6">
              <!-- Header -->
              <PageHeader
                title="Phiên người dùng"
                description="Quản lý và theo dõi các phiên người dùng"
              >
                <template #actions>
                  <NuxtLink 
                    to="/user-session/analytics" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    <ChartIcon class="w-4 h-4 mr-2" />
                    Phân tích
                  </NuxtLink>
                  
                  <NuxtLink 
                    to="/user-session/page-visits" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <EyeIcon class="w-4 h-4 mr-2" />
                    Lượt truy cập
                  </NuxtLink>
                </template>
              </PageHeader>

              <!-- Filters -->
              <FilterContainer>
                <SearchFilter
                  :search="search"
                  @update:search="search = $event"
                  searchPlaceholder="Tìm kiếm theo IP, thiết bị..."
                />
                <StatusFilter
                  v-model="activeFilter"
                  :options="[
                    { value: undefined, label: 'Tất cả trạng thái' },
                    { value: true, label: 'Đang hoạt động' },
                    { value: false, label: 'Đã kết thúc' }
                  ]"
                />
                <PageSizeFilter v-model="pageSize" />
              </FilterContainer>

              <!-- Sessions Table -->
              <div class="bg-white shadow-sm rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian bắt đầu</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian kết thúc</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời lượng</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="session in sessions.items" :key="session.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ session.id }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ session.ipAddress }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div class="flex flex-col">
                            <span class="truncate max-w-[200px]">{{ session.userAgent }}</span>
                            <span class="text-xs text-gray-500">{{ session.deviceInfo?.browser || 'Unknown' }} / {{ session.deviceInfo?.os || 'Unknown' }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDate(session.createdAt) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ !session.isActive ? formatDate(session.lastActivity) : '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDuration(session.totalTime) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <span 
                            class="px-2 py-1 text-xs font-medium rounded-full"
                            :class="!session.isActive ? 'bg-slate-100 text-slate-700' : 'bg-green-100 text-green-700'"
                          >
                            {{ !session.isActive ? 'Đã kết thúc' : 'Đang hoạt động' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div class="flex items-center space-x-2">
                            <button 
                              @click="viewSessionDetails(session.id)"
                              class="text-slate-400 hover:text-primary"
                              title="Xem chi tiết"
                            >
                              <ZoomInIcon class="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="sessions.items.length === 0">
                        <td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500">
                          {{ error || 'Không có phiên người dùng nào' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Pagination -->
                <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div class="text-sm text-gray-500">
                    Hiển thị {{ sessions.items.length }} / {{ sessions.total }} phiên
                  </div>
                  <Pagination
                    :current-page="page"
                    :total-pages="sessions.totalPages"
                    :total-items="sessions.total"
                    :items-per-page="pageSize"
                    @page-change="page = $event"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  </AuthWrapper>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { ZoomInIcon, BarChart2Icon as ChartIcon, EyeIcon } from 'lucide-vue-next';
import PageHeader from '../../components/common/header/PageHeader.vue';
import DataTable from '../../components/common/table/DataTable.vue';
import FilterContainer from '../../components/common/filter/FilterContainer.vue';
import SearchFilter from '../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../components/common/filter/StatusFilter.vue';
import PageSizeFilter from '../../components/common/filter/PageSizeFilter.vue';
import AuthWrapper from '../../components/common/AuthWrapper.vue';
import PermissionGate from '../../components/common/PermissionGate.vue';
import Pagination from '../../components/common/pagination/Pagination.vue';
import { useAuth } from '../../composables/useAuth';
// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth", "permission"],
});

useHead({
  title: 'Quản lý phiên người dùng - Admin Panel'
});

const router = useRouter();
const route = useRoute();
const trpc = useTrpc();
const { user } = useAuth();

const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const activeFilter = ref<boolean | undefined>(
  route.query.active === 'true' ? true : 
  route.query.active === 'false' ? false : 
  undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);

interface User {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
}

interface UserSession {
  id: number;
  userId: number | null;
  user: User | null;
  sessionId: string;
  ipAddress: string | null;
  country: string | null;
  userAgent: string | null;
  deviceInfo: {
    browser?: string;
    os?: string;
    [key: string]: any;
  } | null;
  startTime: string;
  lastActivity: string;
  expireAt: string | null;
  totalTime: number;
  isActive: boolean;
  pageVisits: any[];
  createdAt: string;
  updatedAt: string;
}

interface SessionsResponse {
  items: UserSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const sessions = ref<SessionsResponse>({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1
});

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    active: activeFilter.value !== undefined ? activeFilter.value.toString() : undefined
  };

  // Remove undefined values
  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

  router.replace({ query });
};

// Watch for changes in filters and update URL
watch([page, search, activeFilter], () => {
  updateQueryParams();
  fetchSessions();
}, { deep: true });

async function fetchSessions() {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await trpc.admin.userSession.getSessions.query({
      page: page.value,
      limit: pageSize.value,
      isActive: activeFilter.value
    });

    sessions.value = result as unknown as SessionsResponse;
  } catch (err: any) {
    error.value = err.message || "Không thể tải dữ liệu phiên người dùng";
    console.error("Lỗi khi tải dữ liệu phiên:", err);
  } finally {
    isLoading.value = false;
  }
}

function viewSessionDetails(id: number) {
  router.push(`/user-session/sessions/${id}`);
}

function formatDate(dateString: string) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDuration(seconds: number) {
  if (!seconds) return '0 giây';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  if (hours > 0) {
    result += `${hours} giờ `;
  }
  if (minutes > 0) {
    result += `${minutes} phút `;
  }
  if (remainingSeconds > 0 || result === '') {
    result += `${remainingSeconds} giây`;
  }
  
  return result.trim();
}

onMounted(() => {
  setTimeout(() => {
    fetchSessions();
  }, 500);
});
</script> 