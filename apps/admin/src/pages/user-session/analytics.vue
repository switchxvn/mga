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
                title="Phân tích người dùng"
                description="Thống kê và phân tích dữ liệu người dùng"
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
                    to="/user-session/page-visits" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <EyeIcon class="w-4 h-4 mr-2" />
                    Lượt truy cập
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
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <!-- Các chỉ số tổng quan -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Phiên hiện tại</p>
                      <h3 class="text-2xl font-semibold">{{ activeSessionsCount }}</h3>
                    </div>
                    <div class="bg-green-100 p-2 rounded-md">
                      <UsersIcon class="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Tổng số phiên</p>
                      <h3 class="text-2xl font-semibold">{{ sessionMetrics.totalSessions }}</h3>
                    </div>
                    <div class="bg-blue-100 p-2 rounded-md">
                      <CalendarIcon class="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Người dùng mới</p>
                      <h3 class="text-2xl font-semibold">{{ sessionMetrics.newUsers }}</h3>
                    </div>
                    <div class="bg-cyan-100 p-2 rounded-md">
                      <UserPlusIcon class="h-5 w-5 text-cyan-600" />
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm text-slate-500 mb-1">Tổng lượt xem trang</p>
                      <h3 class="text-2xl font-semibold">{{ pageMetrics.totalPageViews }}</h3>
                    </div>
                    <div class="bg-amber-100 p-2 rounded-md">
                      <EyeIcon class="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Các chỉ số chi tiết -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Thời gian</h2>
                  </div>
                  <div class="p-4 space-y-4">
                    <div>
                      <div class="flex justify-between mb-1">
                        <p class="text-sm text-slate-500">Thời lượng phiên trung bình</p>
                      </div>
                      <div class="flex items-center">
                        <div class="flex-grow h-2 mr-3 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-green-500" :style="`width: ${Math.min(100, sessionMetrics.averageSessionDuration / 600 * 100)}%`"></div>
                        </div>
                        <p class="text-sm font-medium">{{ formatDuration(sessionMetrics.averageSessionDuration) }}</p>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between mb-1">
                        <p class="text-sm text-slate-500">Thời gian trên trang trung bình</p>
                      </div>
                      <div class="flex items-center">
                        <div class="flex-grow h-2 mr-3 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-blue-500" :style="`width: ${Math.min(100, pageMetrics.averageTimeOnPage / 120 * 100)}%`"></div>
                        </div>
                        <p class="text-sm font-medium">{{ formatDuration(pageMetrics.averageTimeOnPage) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Phân tích phiên</h2>
                  </div>
                  <div class="p-4 space-y-4">
                    <div>
                      <div class="flex justify-between mb-1">
                        <p class="text-sm text-slate-500">Tỷ lệ thoát (phiên)</p>
                      </div>
                      <div class="flex items-center">
                        <div class="flex-grow h-2 mr-3 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-red-500" :style="`width: ${sessionMetrics.bounceRate}%`"></div>
                        </div>
                        <p class="text-sm font-medium">{{ sessionMetrics.bounceRate }}%</p>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between mb-1">
                        <p class="text-sm text-slate-500">Tỷ lệ thoát (trang)</p>
                      </div>
                      <div class="flex items-center">
                        <div class="flex-grow h-2 mr-3 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-amber-500" :style="`width: ${pageMetrics.bounceRate}%`"></div>
                        </div>
                        <p class="text-sm font-medium">{{ pageMetrics.bounceRate }}%</p>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between mb-1">
                        <p class="text-sm text-slate-500">Người dùng quay lại</p>
                      </div>
                      <div class="flex items-center">
                        <div class="flex-grow h-2 mr-3 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-cyan-500" :style="`width: ${returnUserPercentage}%`"></div>
                        </div>
                        <p class="text-sm font-medium">{{ sessionMetrics.returningUsers }} ({{ returnUserPercentage }}%)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Người dùng</h2>
                  </div>
                  <div class="p-4">
                    <p class="text-sm text-slate-500 mb-2">Phân bố người dùng</p>
                    <div class="flex justify-center">
                      <div style="max-width: 200px; max-height: 200px;">
                        <canvas ref="userChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Phân tích chi tiết -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Nguồn giới thiệu hàng đầu</h2>
                  </div>
                  <div class="p-4">
                    <div v-if="topReferrers.length === 0" class="flex items-center justify-center py-8">
                      <p class="text-sm text-slate-500">Không có dữ liệu</p>
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-slate-200">
                            <th class="px-4 py-2 text-left font-medium text-slate-500">#</th>
                            <th class="px-4 py-2 text-left font-medium text-slate-500">Nguồn</th>
                            <th class="px-4 py-2 text-left font-medium text-slate-500">Lượt truy cập</th>
                            <th class="px-4 py-2 text-left font-medium text-slate-500">Tỷ lệ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, index) in topReferrers" :key="index" class="border-b border-slate-200">
                            <td class="px-4 py-2">{{ index + 1 }}</td>
                            <td class="px-4 py-2">
                              <div class="truncate max-w-[250px]" :title="item.referrer">
                                {{ item.referrer || 'Truy cập trực tiếp' }}
                              </div>
                            </td>
                            <td class="px-4 py-2">{{ item.count }}</td>
                            <td class="px-4 py-2">
                              <div class="flex items-center">
                                <div class="w-24 h-1.5 mr-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div class="h-full bg-blue-500" :style="`width: ${(item.count / totalReferrers) * 100}%`"></div>
                                </div>
                                <span class="text-xs">{{ Math.round((item.count / totalReferrers) * 100) }}%</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div class="px-4 py-3 border-b border-slate-200">
                    <h2 class="text-lg font-medium">Trang phổ biến</h2>
                  </div>
                  <div class="p-4">
                    <div v-if="topLandingPages.length === 0" class="flex items-center justify-center py-8">
                      <p class="text-sm text-slate-500">Không có dữ liệu</p>
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-slate-200">
                            <th class="px-4 py-2 text-left font-medium text-slate-500">#</th>
                            <th class="px-4 py-2 text-left font-medium text-slate-500">URL trang</th>
                            <th class="px-4 py-2 text-left font-medium text-slate-500">Lượt xem</th>
                            <th class="px-4 py-2 text-left font-medium text-slate-500">Tỷ lệ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, index) in topLandingPages" :key="index" class="border-b border-slate-200">
                            <td class="px-4 py-2">{{ index + 1 }}</td>
                            <td class="px-4 py-2">
                              <div class="truncate max-w-[250px]" :title="item.page">
                                {{ item.page }}
                              </div>
                            </td>
                            <td class="px-4 py-2">{{ item.count }}</td>
                            <td class="px-4 py-2">
                              <div class="flex items-center">
                                <div class="w-24 h-1.5 mr-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div class="h-full bg-green-500" :style="`width: ${(item.count / totalLandingPages) * 100}%`"></div>
                                </div>
                                <span class="text-xs">{{ Math.round((item.count / totalLandingPages) * 100) }}%</span>
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
          </div>
        </div>
      </div>
    </PermissionGate>
  </AuthWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { 
  UsersIcon, 
  EyeIcon, 
  RefreshCwIcon, 
  FilterIcon,
  CalendarIcon,
  UserPlusIcon
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
  middleware: ["auth"],
});

useHead({
  title: 'Phân tích người dùng - Admin Panel'
});

const {
  loading: isLoading,
  activeSessionsCount,
  sessionMetrics,
  pageMetrics,
  topReferrers,
  topLandingPages,
  topExitPages,
  fetchActiveSessionsCount,
  fetchSessionMetrics,
  fetchPageMetrics,
  fetchTopReferrers,
  fetchTopLandingPages,
  fetchTopExitPages,
  formatDuration
} = useUserAnalytics();

const userChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const filters = reactive({
  startDate: '',
  endDate: '',
});

const totalReferrers = computed(() => {
  return topReferrers.value.reduce((sum, item) => sum + item.count, 0);
});

const totalLandingPages = computed(() => {
  return topLandingPages.value.reduce((sum, item) => sum + item.count, 0);
});

const returnUserPercentage = computed(() => {
  const total = sessionMetrics.newUsers + sessionMetrics.returningUsers;
  if (total === 0) return 0;
  return Math.round((sessionMetrics.returningUsers / total) * 100);
});

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    await Promise.all([
      fetchActiveSessionsCount(),
      fetchSessionMetricsData(),
      fetchPageMetricsData(),
      fetchTopReferrers(10),
      fetchTopLandingPages(5),
      fetchTopExitPages(5),
    ]);
    
    initUserChart();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchSessionMetricsData() {
  const query: any = {};
  
  if (filters.startDate) query.startDate = new Date(filters.startDate);
  if (filters.endDate) query.endDate = new Date(filters.endDate);
  
  await fetchSessionMetrics(query);
}

async function fetchPageMetricsData() {
  const query: any = {};
  
  if (filters.startDate) query.startDate = new Date(filters.startDate);
  if (filters.endDate) query.endDate = new Date(filters.endDate);
  
  await fetchPageMetrics(query);
}

function initUserChart() {
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const canvas = userChart.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Người dùng mới', 'Người dùng quay lại'],
      datasets: [{
        data: [sessionMetrics.newUsers, sessionMetrics.returningUsers],
        backgroundColor: [
          '#0d6efd',
          '#20c997'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw as number;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

async function applyFilters() {
  await fetchData();
}

async function refreshData() {
  await fetchData();
}
</script> 