<template>
  <div>
    <AdminPageHeader title="Quản lý phiên người dùng" />

    <div class="card shadow-sm mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Danh sách phiên</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success" @click="refreshData">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
          <button class="btn btn-sm btn-danger" @click="cleanupExpiredSessions">
            <i class="bi bi-trash me-1"></i> Dọn dẹp phiên hết hạn
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="filters d-flex flex-wrap gap-3 mb-4">
          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="filters.isActive" class="form-select form-select-sm">
              <option :value="null">Tất cả</option>
              <option :value="true">Hoạt động</option>
              <option :value="false">Không hoạt động</option>
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
                <th>Người dùng</th>
                <th>Địa chỉ IP</th>
                <th>Quốc gia</th>
                <th>Thiết bị</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian cuối</th>
                <th>Tổng thời gian</th>
                <th>Trạng thái</th>
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
            <tbody v-else-if="sessions.length === 0">
              <tr>
                <td colspan="10" class="text-center py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="session in sessions" :key="session.id">
                <td>{{ session.id }}</td>
                <td>
                  <template v-if="session.user">
                    {{ session.user.fullName }}
                  </template>
                  <span v-else class="text-muted">Khách</span>
                </td>
                <td>{{ session.ipAddress || '-' }}</td>
                <td>{{ session.country || '-' }}</td>
                <td>
                  <span class="d-inline-block text-truncate" style="max-width: 150px;">
                    {{ getUserAgentInfo(session.userAgent) }}
                  </span>
                </td>
                <td>{{ formatDateTime(session.startTime) }}</td>
                <td>{{ formatDateTime(session.lastActivity) }}</td>
                <td>{{ formatDuration(session.totalTime) }}</td>
                <td>
                  <span :class="session.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ session.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <NuxtLink :to="`/admin/user-session/sessions/${session.id}`" class="btn btn-outline-primary">
                      <i class="bi bi-eye"></i>
                    </NuxtLink>
                    <button class="btn btn-outline-danger" @click="deleteSession(session.id)">
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
      <div class="col-md-6 col-lg-3 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title">Phiên hoạt động</h6>
            <h3 class="card-text">{{ activeSessionsCount }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title">Tổng số phiên</h6>
            <h3 class="card-text">{{ sessionMetrics.totalSessions }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title">Thời lượng trung bình</h6>
            <h3 class="card-text">{{ formatDuration(sessionMetrics.averageSessionDuration) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title">Tỷ lệ thoát</h6>
            <h3 class="card-text">{{ sessionMetrics.bounceRate }}%</h3>
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
const sessions = ref([]);
const currentPage = ref(1);
const totalItems = ref(0);
const totalPages = ref(0);
const itemsPerPage = ref(10);
const activeSessionsCount = ref(0);
const sessionMetrics = reactive({
  totalSessions: 0,
  averageSessionDuration: 0,
  bounceRate: 0,
  newUsers: 0,
  returningUsers: 0
});

const filters = reactive({
  isActive: null as boolean | null,
  startDate: '',
  endDate: '',
});

onMounted(async () => {
  await Promise.all([
    fetchSessions(),
    fetchActiveSessionsCount(),
    fetchSessionMetrics()
  ]);
});

async function fetchSessions() {
  try {
    loading.value = true;
    
    const query = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      isActive: filters.isActive,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    
    // Lọc các giá trị undefined
    Object.keys(query).forEach(key => {
      if (query[key] === undefined || query[key] === '') {
        delete query[key];
      }
    });
    
    const response = await $fetch('/api/trpc/admin.userSession.findAll', {
      method: 'POST',
      body: { input: query }
    });
    
    if (response.result?.data) {
      sessions.value = response.result.data.items;
      totalItems.value = response.result.data.total;
      totalPages.value = response.result.data.totalPages;
      currentPage.value = response.result.data.page;
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    toast.error('Không thể tải danh sách phiên');
  } finally {
    loading.value = false;
  }
}

async function fetchActiveSessionsCount() {
  try {
    const response = await $fetch('/api/trpc/admin.userSession.getActiveSessionsCount', {
      method: 'POST'
    });
    
    if (response.result?.data) {
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

async function handlePageChange(page: number) {
  currentPage.value = page;
  await fetchSessions();
}

async function applyFilters() {
  currentPage.value = 1;
  await Promise.all([
    fetchSessions(),
    fetchSessionMetrics()
  ]);
}

async function refreshData() {
  await Promise.all([
    fetchSessions(),
    fetchActiveSessionsCount(),
    fetchSessionMetrics()
  ]);
  toast.success('Dữ liệu đã được làm mới');
}

async function cleanupExpiredSessions() {
  try {
    const response = await $fetch('/api/trpc/admin.userSession.cleanupExpiredSessions', {
      method: 'POST'
    });
    
    const cleanedCount = response.result?.data || 0;
    toast.success(`Đã dọn dẹp ${cleanedCount} phiên hết hạn`);
    
    await refreshData();
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    toast.error('Không thể dọn dẹp phiên hết hạn');
  }
}

async function deleteSession(id: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa phiên này?')) {
    return;
  }
  
  try {
    await $fetch('/api/trpc/admin.userSession.deleteSession', {
      method: 'POST',
      body: { input: { id } }
    });
    
    toast.success('Đã xóa phiên thành công');
    await fetchSessions();
  } catch (error) {
    console.error('Error deleting session:', error);
    toast.error('Không thể xóa phiên');
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

function getUserAgentInfo(userAgent: string) {
  if (!userAgent) return 'Không xác định';
  return userAgent;
}
</script> 