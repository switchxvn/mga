<template>
  <AuthWrapper>
    <PermissionGate :permissions="[]">
      <div class="min-h-screen bg-slate-50">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
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
                title="Lượt truy cập trang"
                description="Quản lý và theo dõi lượt truy cập trang"
              >
                <template #actions>
                  <NuxtLink 
                    to="/user-session" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <UsersIcon class="w-4 h-4 mr-2" />
                    Phiên người dùng
                  </NuxtLink>
                  
                  <NuxtLink 
                    to="/user-session/analytics" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <BarChart2Icon class="w-4 h-4 mr-2" />
                    Phân tích
                  </NuxtLink>
                  
                  <button 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
                    @click="refreshData"
                  >
                    <RefreshCwIcon class="w-4 h-4 mr-2" />
                    Làm mới
                  </button>
                </template>
              </PageHeader>

              <!-- Bộ lọc -->
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <h2 class="text-lg font-medium">Bộ lọc</h2>
                </div>
                <div class="p-4">
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">URL trang</label>
                      <input 
                        type="text" 
                        class="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                        v-model="filters.pageUrl"
                        placeholder="Nhập URL trang"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Loại trang</label>
                      <select 
                        v-model="filters.pageType" 
                        class="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Tất cả</option>
                        <option value="landing">Trang đầu</option>
                        <option value="exit">Trang cuối</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Từ ngày</label>
                      <input 
                        type="date" 
                        class="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                        v-model="filters.startDate"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
                      <input 
                        type="date" 
                        class="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                        v-model="filters.endDate"
                      >
                    </div>
                    <div class="flex items-end">
                      <button 
                        class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
                        @click="applyFilters"
                      >
                        <FilterIcon class="w-4 h-4 mr-2" />
                        Lọc dữ liệu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bảng dữ liệu -->
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200">
                        <th class="px-4 py-3 text-left font-medium text-slate-500">ID</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Phiên</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">URL trang</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Nguồn</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Thời gian vào</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Thời gian ra</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Thời gian trên trang</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Trang đầu</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Trang cuối</th>
                        <th class="px-4 py-3 text-left font-medium text-slate-500">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody v-if="pageVisits.length === 0">
                      <tr>
                        <td colspan="10" class="px-4 py-8 text-center text-slate-500">Không có dữ liệu</td>
                      </tr>
                    </tbody>
                    <tbody v-else>
                      <tr v-for="visit in pageVisits" :key="visit.id" class="border-b border-slate-200 hover:bg-slate-50">
                        <td class="px-4 py-3 whitespace-nowrap">{{ visit.id }}</td>
                        <td class="px-4 py-3 whitespace-nowrap">
                          <NuxtLink 
                            :to="`/user-session/sessions/${visit.session?.id}`" 
                            v-if="visit.session"
                            class="text-primary hover:underline"
                          >
                            {{ visit.session.id }}
                          </NuxtLink>
                          <span v-else>-</span>
                        </td>
                        <td class="px-4 py-3">
                          <div class="truncate max-w-[200px]" :title="visit.pageUrl">
                            {{ visit.pageUrl }}
                          </div>
                        </td>
                        <td class="px-4 py-3">
                          <div class="truncate max-w-[150px]" :title="visit.referrer">
                            {{ visit.referrer || '-' }}
                          </div>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap">{{ formatDateTime(visit.entryTime) }}</td>
                        <td class="px-4 py-3 whitespace-nowrap">{{ visit.exitTime ? formatDateTime(visit.exitTime) : '-' }}</td>
                        <td class="px-4 py-3 whitespace-nowrap">{{ formatDuration(visit.timeOnPage) }}</td>
                        <td class="px-4 py-3 whitespace-nowrap">
                          <span v-if="visit.isLandingPage" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                            <CheckIcon class="w-4 h-4 text-blue-600" />
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap">
                          <span v-if="visit.isExitPage" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                            <CheckIcon class="w-4 h-4 text-blue-600" />
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap">
                          <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100"
                            @click="deletePageVisit(visit.id)"
                            title="Xóa"
                          >
                            <TrashIcon class="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                  <div class="text-sm text-slate-500">
                    Trang {{ currentPage }} / {{ totalPages }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <button 
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 py-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                      :disabled="currentPage <= 1"
                      @click="handlePageChange(currentPage - 1)"
                    >
                      <ChevronLeftIcon class="w-4 h-4" />
                      <span class="ml-1">Trước</span>
                    </button>
                    <button 
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 py-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                      :disabled="currentPage >= totalPages"
                      @click="handlePageChange(currentPage + 1)"
                    >
                      <span class="mr-1">Sau</span>
                      <ChevronRightIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Thống kê -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Tổng quan</h2>
                  </div>
                  <div class="p-4 space-y-4">
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Tổng lượt xem trang</p>
                      <p class="text-2xl font-semibold">{{ pageMetrics.totalPageViews }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Thời gian trung bình (giây)</p>
                      <p class="text-2xl font-semibold">{{ pageMetrics.averageTimeOnPage }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Tỷ lệ thoát</p>
                      <p class="text-2xl font-semibold">{{ pageMetrics.bounceRate }}%</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Trang đầu phổ biến nhất</h2>
                  </div>
                  <div class="p-4">
                    <div v-if="topLandingPages.length === 0" class="flex items-center justify-center py-8">
                      <p class="text-sm text-slate-500">Không có dữ liệu</p>
                    </div>
                    <div v-else class="space-y-3">
                      <div v-for="(item, index) in topLandingPages" :key="index" class="flex items-center justify-between">
                        <div class="truncate max-w-[80%]" :title="item.page">
                          <span class="text-slate-500 mr-1">{{ index + 1 }}.</span> {{ item.page }}
                        </div>
                        <span class="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {{ item.count }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Trang cuối phổ biến nhất</h2>
                  </div>
                  <div class="p-4">
                    <div v-if="topExitPages.length === 0" class="flex items-center justify-center py-8">
                      <p class="text-sm text-slate-500">Không có dữ liệu</p>
                    </div>
                    <div v-else class="space-y-3">
                      <div v-for="(item, index) in topExitPages" :key="index" class="flex items-center justify-between">
                        <div class="truncate max-w-[80%]" :title="item.page">
                          <span class="text-slate-500 mr-1">{{ index + 1 }}.</span> {{ item.page }}
                        </div>
                        <span class="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {{ item.count }}
                        </span>
                      </div>
                    </div>
                  </div>
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
import { ref, reactive, onMounted } from 'vue';
import { 
  UsersIcon, 
  BarChart2Icon, 
  RefreshCwIcon, 
  FilterIcon, 
  CheckIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next';
import PageHeader from '../../components/common/header/PageHeader.vue';
import AuthWrapper from '../../components/common/AuthWrapper.vue';
import PermissionGate from '../../components/common/PermissionGate.vue';
import { useUserAnalytics } from '../../composables/useUserAnalytics';
// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth", "permission"],
});

useHead({
  title: 'Lượt truy cập trang - Admin Panel'
});

interface PageVisit {
  id: number;
  session?: {
    id: number;
  };
  pageUrl: string;
  referrer: string;
  entryTime: string;
  exitTime: string | null;
  timeOnPage: number;
  isLandingPage: boolean;
  isExitPage: boolean;
}

interface PageItem {
  page: string;
  count: number;
}

const {
  loading,
  pageVisits,
  currentPage,
  totalPages,
  pageSize,
  pageMetrics,
  topLandingPages,
  topExitPages,
  fetchPageVisits,
  fetchPageMetrics,
  fetchTopLandingPages,
  fetchTopExitPages,
  deletePageVisit: deleteVisit,
  formatDateTime,
  formatDuration
} = useUserAnalytics();

const filters = reactive({
  pageUrl: '',
  pageType: '',
  startDate: '',
  endDate: '',
});

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    await Promise.all([
      fetchPageVisitsData(),
      fetchPageMetricsData(),
      fetchTopLandingPagesData(),
      fetchTopExitPagesData(),
    ]);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchPageVisitsData() {
  const query: any = {
    page: currentPage.value,
    limit: pageSize.value
  };
  
  if (filters.pageUrl) query.pageUrl = filters.pageUrl;
  if (filters.pageType === 'landing') query.isLandingPage = true;
  if (filters.pageType === 'exit') query.isExitPage = true;
  if (filters.startDate) query.startDate = new Date(filters.startDate);
  if (filters.endDate) query.endDate = new Date(filters.endDate);
  
  await fetchPageVisits(query);
}

async function fetchPageMetricsData() {
  const query: any = {};
  
  if (filters.startDate) query.startDate = new Date(filters.startDate);
  if (filters.endDate) query.endDate = new Date(filters.endDate);
  
  await fetchPageMetrics(query);
}

async function fetchTopLandingPagesData() {
  await fetchTopLandingPages(5);
}

async function fetchTopExitPagesData() {
  await fetchTopExitPages(5);
}

function handlePageChange(page: number) {
  currentPage.value = page;
  fetchPageVisitsData();
}

async function applyFilters() {
  currentPage.value = 1;
  await fetchData();
}

async function refreshData() {
  await fetchData();
}

async function deletePageVisit(id: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa lượt truy cập này?')) return;
  
  const success = await deleteVisit(id);
  if (success) {
    await fetchPageVisitsData();
  }
}
</script> 