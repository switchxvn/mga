<template>
  <div>
    <AdminPageHeader title="Thống kê người dùng" />

    <div class="mb-4">
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Bộ lọc</h5>
          <button class="btn btn-sm btn-success" @click="refreshData">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Từ ngày</label>
              <input type="date" class="form-control" v-model="filters.startDate">
            </div>
            <div class="col-md-4">
              <label class="form-label">Đến ngày</label>
              <input type="date" class="form-control" v-model="filters.endDate">
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-primary w-100" @click="applyFilters">
                <i class="bi bi-funnel-fill me-1"></i> Lọc dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Các chỉ số tổng quan -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Phiên hiện tại</h6>
                <h3 class="mb-0">{{ activeSessionsCount }}</h3>
              </div>
              <div class="bg-success bg-opacity-10 p-2 rounded">
                <i class="bi bi-people-fill text-success fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Tổng số phiên</h6>
                <h3 class="mb-0">{{ sessionMetrics.totalSessions }}</h3>
              </div>
              <div class="bg-primary bg-opacity-10 p-2 rounded">
                <i class="bi bi-calendar2-check text-primary fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Người dùng mới</h6>
                <h3 class="mb-0">{{ sessionMetrics.newUsers }}</h3>
              </div>
              <div class="bg-info bg-opacity-10 p-2 rounded">
                <i class="bi bi-person-plus-fill text-info fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Tổng lượt xem trang</h6>
                <h3 class="mb-0">{{ pageMetrics.totalPageViews }}</h3>
              </div>
              <div class="bg-warning bg-opacity-10 p-2 rounded">
                <i class="bi bi-eye-fill text-warning fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Các chỉ số chi tiết -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Thời gian</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <h6 class="text-muted">Thời lượng phiên trung bình</h6>
              </div>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-3" style="height: 8px;">
                  <div class="progress-bar bg-success" :style="`width: ${Math.min(100, sessionMetrics.averageSessionDuration / 600 * 100)}%`"></div>
                </div>
                <div>{{ formatDuration(sessionMetrics.averageSessionDuration) }}</div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <h6 class="text-muted">Thời gian trên trang trung bình</h6>
              </div>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-3" style="height: 8px;">
                  <div class="progress-bar bg-primary" :style="`width: ${Math.min(100, pageMetrics.averageTimeOnPage / 120 * 100)}%`"></div>
                </div>
                <div>{{ formatDuration(pageMetrics.averageTimeOnPage) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Phân tích phiên</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <h6 class="text-muted">Tỷ lệ thoát (phiên)</h6>
              </div>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-3" style="height: 8px;">
                  <div class="progress-bar bg-danger" :style="`width: ${sessionMetrics.bounceRate}%`"></div>
                </div>
                <div>{{ sessionMetrics.bounceRate }}%</div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <h6 class="text-muted">Tỷ lệ thoát (trang)</h6>
              </div>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-3" style="height: 8px;">
                  <div class="progress-bar bg-warning" :style="`width: ${pageMetrics.bounceRate}%`"></div>
                </div>
                <div>{{ pageMetrics.bounceRate }}%</div>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <h6 class="text-muted">Người dùng quay lại</h6>
              </div>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-3" style="height: 8px;">
                  <div class="progress-bar bg-info" :style="`width: ${returnUserPercentage}%`"></div>
                </div>
                <div>{{ sessionMetrics.returningUsers }} ({{ returnUserPercentage }}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Người dùng</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <h6 class="text-muted mb-2">Phân bố người dùng</h6>
              <div class="d-flex justify-content-center">
                <div style="max-width: 200px; max-height: 200px;">
                  <canvas ref="userChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phân tích chi tiết -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Nguồn giới thiệu hàng đầu</h5>
          </div>
          <div class="card-body">
            <div v-if="topReferrers.length === 0" class="text-center py-3">
              <span class="text-muted">Không có dữ liệu</span>
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nguồn</th>
                      <th>Lượt truy cập</th>
                      <th>Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in topReferrers" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <div class="text-truncate" style="max-width: 250px;" :title="item.referrer">
                          {{ item.referrer || 'Truy cập trực tiếp' }}
                        </div>
                      </td>
                      <td>{{ item.count }}</td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="progress flex-grow-1 me-2" style="height: 6px; max-width: 100px;">
                            <div class="progress-bar bg-primary" :style="`width: ${(item.count / totalReferrers) * 100}%`"></div>
                          </div>
                          <small>{{ Math.round((item.count / totalReferrers) * 100) }}%</small>
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

      <div class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Trang phổ biến</h5>
          </div>
          <div class="card-body">
            <div v-if="topLandingPages.length === 0" class="text-center py-3">
              <span class="text-muted">Không có dữ liệu</span>
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>URL trang</th>
                      <th>Lượt xem</th>
                      <th>Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in topLandingPages" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <div class="text-truncate" style="max-width: 250px;" :title="item.page">
                          {{ item.page }}
                        </div>
                      </td>
                      <td>{{ item.count }}</td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="progress flex-grow-1 me-2" style="height: 6px; max-width: 100px;">
                            <div class="progress-bar bg-success" :style="`width: ${(item.count / totalLandingPages) * 100}%`"></div>
                          </div>
                          <small>{{ Math.round((item.count / totalLandingPages) * 100) }}%</small>
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import Chart from 'chart.js/auto';

const toast = useToast();
const userChart = ref(null);
let chartInstance = null;

const activeSessionsCount = ref(0);
const sessionMetrics = reactive({
  totalSessions: 0,
  averageSessionDuration: 0,
  bounceRate: 0,
  newUsers: 0,
  returningUsers: 0
});

const pageMetrics = reactive({
  totalPageViews: 0,
  averageTimeOnPage: 0,
  bounceRate: 0
});

const topReferrers = ref([]);
const topLandingPages = ref([]);
const topExitPages = ref([]);

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
  await Promise.all([
    fetchActiveSessionsCount(),
    fetchSessionMetrics(),
    fetchPageMetrics(),
    fetchTopReferrers(),
    fetchTopLandingPages(),
    fetchTopExitPages(),
  ]);
  
  initUserChart();
}

async function fetchActiveSessionsCount() {
  try {
    const response = await $fetch('/api/trpc/admin.userSession.getActiveSessionsCount', {
      method: 'POST'
    });
    
    if (response.result?.data !== undefined) {
      activeSessionsCount.value = response.result.data;
    }
  } catch (error) {
    console.error('Error fetching active sessions count:', error);
  }
}

async function fetchSessionMetrics() {
  try {
    const query = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    
    // Lọc các giá trị undefined
    Object.keys(query).forEach(key => {
      if (query[key] === undefined) {
        delete query[key];
      }
    });
    
    const response = await $fetch('/api/trpc/admin.userSession.getSessionMetrics', {
      method: 'POST',
      body: { input: query }
    });
    
    if (response.result?.data) {
      Object.assign(sessionMetrics, response.result.data);
    }
  } catch (error) {
    console.error('Error fetching session metrics:', error);
  }
}

async function fetchPageMetrics() {
  try {
    const query = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    
    // Lọc các giá trị undefined
    Object.keys(query).forEach(key => {
      if (query[key] === undefined) {
        delete query[key];
      }
    });
    
    const response = await $fetch('/api/trpc/admin.userPageVisit.getPageVisitMetrics', {
      method: 'POST',
      body: { input: query }
    });
    
    if (response.result?.data) {
      Object.assign(pageMetrics, response.result.data);
    }
  } catch (error) {
    console.error('Error fetching page metrics:', error);
  }
}

async function fetchTopReferrers() {
  try {
    const response = await $fetch('/api/trpc/admin.userPageVisit.getTopReferrers', {
      method: 'POST',
      body: { input: { limit: 10 } }
    });
    
    if (response.result?.data) {
      topReferrers.value = response.result.data;
    }
  } catch (error) {
    console.error('Error fetching top referrers:', error);
  }
}

async function fetchTopLandingPages() {
  try {
    const response = await $fetch('/api/trpc/admin.userPageVisit.getTopLandingPages', {
      method: 'POST',
      body: { input: { limit: 5 } }
    });
    
    if (response.result?.data) {
      topLandingPages.value = response.result.data;
    }
  } catch (error) {
    console.error('Error fetching top landing pages:', error);
  }
}

async function fetchTopExitPages() {
  try {
    const response = await $fetch('/api/trpc/admin.userPageVisit.getTopExitPages', {
      method: 'POST',
      body: { input: { limit: 5 } }
    });
    
    if (response.result?.data) {
      topExitPages.value = response.result.data;
    }
  } catch (error) {
    console.error('Error fetching top exit pages:', error);
  }
}

function initUserChart() {
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const ctx = userChart.value?.getContext('2d');
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
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
  toast.success('Dữ liệu đã được cập nhật');
}

async function refreshData() {
  await fetchData();
  toast.success('Dữ liệu đã được làm mới');
}

function formatDuration(seconds: number) {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (remainingSeconds > 0 || result === '') result += `${remainingSeconds}s`;
  
  return result.trim();
}
</script> 