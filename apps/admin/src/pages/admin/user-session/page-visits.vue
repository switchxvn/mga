<template>
  <div>
    <AdminPageHeader title="Quản lý lượt truy cập trang" />

    <div class="card shadow-sm mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Danh sách lượt truy cập</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success" @click="refreshData">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="filters d-flex flex-wrap gap-3 mb-4">
          <div class="form-group">
            <label>URL trang</label>
            <input type="text" class="form-control form-control-sm" v-model="filters.pageUrl" placeholder="Nhập URL trang">
          </div>
          <div class="form-group">
            <label>Loại trang</label>
            <select v-model="filters.pageType" class="form-select form-select-sm">
              <option value="">Tất cả</option>
              <option value="landing">Trang đầu</option>
              <option value="exit">Trang cuối</option>
            </select>
          </div>
          <div class="form-group">
            <label>Từ ngày</label>
            <input type="date" class="form-control form-control-sm" v-model="filters.startDate">
          </div>
          <div class="form-group">
            <label>Đến ngày</label>
            <input type="date" class="form-control form-control-sm" v-model="filters.endDate">
          </div>
          <div class="form-group d-flex align-items-end">
            <button class="btn btn-sm btn-primary" @click="applyFilters">
              <i class="bi bi-funnel-fill me-1"></i> Lọc
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Phiên</th>
                <th>URL trang</th>
                <th>Nguồn</th>
                <th>Thời gian vào</th>
                <th>Thời gian ra</th>
                <th>Thời gian trên trang</th>
                <th>Trang đầu</th>
                <th>Trang cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td colspan="10" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="pageVisits.length === 0">
              <tr>
                <td colspan="10" class="text-center py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="visit in pageVisits" :key="visit.id">
                <td>{{ visit.id }}</td>
                <td>
                  <NuxtLink :to="`/admin/user-session/sessions/${visit.session?.id}`" v-if="visit.session">
                    {{ visit.session.id }}
                  </NuxtLink>
                  <span v-else>-</span>
                </td>
                <td>
                  <span class="d-inline-block text-truncate" style="max-width: 200px;" :title="visit.pageUrl">
                    {{ visit.pageUrl }}
                  </span>
                </td>
                <td>
                  <span class="d-inline-block text-truncate" style="max-width: 150px;" :title="visit.referrer">
                    {{ visit.referrer || '-' }}
                  </span>
                </td>
                <td>{{ formatDateTime(visit.entryTime) }}</td>
                <td>{{ visit.exitTime ? formatDateTime(visit.exitTime) : '-' }}</td>
                <td>{{ formatDuration(visit.timeOnPage) }}</td>
                <td>
                  <span v-if="visit.isLandingPage" class="badge bg-primary">
                    <i class="bi bi-check-circle"></i>
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="visit.isExitPage" class="badge bg-primary">
                    <i class="bi bi-check-circle"></i>
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-danger" @click="deletePageVisit(visit.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AdminPagination
          v-if="!loading && totalPages > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-changed="handlePageChange"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="card-title mb-0">Tổng quan</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <h6 class="text-muted">Tổng lượt xem trang</h6>
              <h3>{{ pageMetrics.totalPageViews }}</h3>
            </div>
            <div class="mb-3">
              <h6 class="text-muted">Thời gian trung bình (giây)</h6>
              <h3>{{ pageMetrics.averageTimeOnPage }}</h3>
            </div>
            <div>
              <h6 class="text-muted">Tỷ lệ thoát</h6>
              <h3>{{ pageMetrics.bounceRate }}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="card-title mb-0">Trang đầu phổ biến nhất</h5>
          </div>
          <div class="card-body">
            <div v-if="topLandingPages.length === 0" class="text-center py-3">
              <span class="text-muted">Không có dữ liệu</span>
            </div>
            <div v-else>
              <div class="mb-2" v-for="(item, index) in topLandingPages" :key="index">
                <div class="d-flex justify-content-between">
                  <div class="text-truncate" style="max-width: 80%;" :title="item.page">
                    {{ index + 1 }}. {{ item.page }}
                  </div>
                  <div class="ms-2">
                    <span class="badge bg-primary">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="card-title mb-0">Trang cuối phổ biến nhất</h5>
          </div>
          <div class="card-body">
            <div v-if="topExitPages.length === 0" class="text-center py-3">
              <span class="text-muted">Không có dữ liệu</span>
            </div>
            <div v-else>
              <div class="mb-2" v-for="(item, index) in topExitPages" :key="index">
                <div class="d-flex justify-content-between">
                  <div class="text-truncate" style="max-width: 80%;" :title="item.page">
                    {{ index + 1 }}. {{ item.page }}
                  </div>
                  <div class="ms-2">
                    <span class="badge bg-primary">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="card-title mb-0">Nguồn giới thiệu hàng đầu</h5>
          </div>
          <div class="card-body">
            <div v-if="topReferrers.length === 0" class="text-center py-3">
              <span class="text-muted">Không có dữ liệu</span>
            </div>
            <div v-else>
              <div class="mb-2" v-for="(item, index) in topReferrers" :key="index">
                <div class="d-flex justify-content-between">
                  <div class="text-truncate" style="max-width: 80%;" :title="item.referrer">
                    {{ index + 1 }}. {{ item.referrer || 'Truy cập trực tiếp' }}
                  </div>
                  <div class="ms-2">
                    <span class="badge bg-primary">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const loading = ref(true);
const pageVisits = ref([]);
const currentPage = ref(1);
const totalItems = ref(0);
const totalPages = ref(0);
const itemsPerPage = ref(10);

const pageMetrics = reactive({
  totalPageViews: 0,
  averageTimeOnPage: 0,
  bounceRate: 0
});

const topLandingPages = ref([]);
const topExitPages = ref([]);
const topReferrers = ref([]);

const filters = reactive({
  pageUrl: '',
  pageType: '',
  startDate: '',
  endDate: '',
});

onMounted(async () => {
  await Promise.all([
    fetchPageVisits(),
    fetchPageMetrics(),
    fetchTopLandingPages(),
    fetchTopExitPages(),
    fetchTopReferrers()
  ]);
});

async function fetchPageVisits() {
  try {
    loading.value = true;
    
    const query = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      pageUrl: filters.pageUrl || undefined,
      isLandingPage: filters.pageType === 'landing' ? true : undefined,
      isExitPage: filters.pageType === 'exit' ? true : undefined,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    
    // Lọc các giá trị undefined
    Object.keys(query).forEach(key => {
      if (query[key] === undefined || query[key] === '') {
        delete query[key];
      }
    });
    
    const response = await $fetch('/api/trpc/admin.userPageVisit.findAll', {
      method: 'POST',
      body: { input: query }
    });
    
    if (response.result?.data) {
      pageVisits.value = response.result.data.items;
      totalItems.value = response.result.data.total;
      totalPages.value = response.result.data.totalPages;
      currentPage.value = response.result.data.page;
    }
  } catch (error) {
    console.error('Error fetching page visits:', error);
    toast.error('Không thể tải danh sách lượt truy cập trang');
  } finally {
    loading.value = false;
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

async function handlePageChange(page: number) {
  currentPage.value = page;
  await fetchPageVisits();
}

async function applyFilters() {
  currentPage.value = 1;
  await Promise.all([
    fetchPageVisits(),
    fetchPageMetrics()
  ]);
}

async function refreshData() {
  await Promise.all([
    fetchPageVisits(),
    fetchPageMetrics(),
    fetchTopLandingPages(),
    fetchTopExitPages(),
    fetchTopReferrers()
  ]);
  toast.success('Dữ liệu đã được làm mới');
}

async function deletePageVisit(id: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa lượt truy cập này?')) {
    return;
  }
  
  try {
    await $fetch('/api/trpc/admin.userPageVisit.deletePageVisit', {
      method: 'POST',
      body: { input: { id } }
    });
    
    toast.success('Đã xóa lượt truy cập thành công');
    await fetchPageVisits();
  } catch (error) {
    console.error('Error deleting page visit:', error);
    toast.error('Không thể xóa lượt truy cập');
  }
}

function formatDateTime(dateTime: string | Date) {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('vi-VN');
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