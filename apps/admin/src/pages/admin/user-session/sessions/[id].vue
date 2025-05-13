<template>
  <div>
    <AdminPageHeader title="Chi tiết phiên người dùng" :back-link="'/admin/user-session/sessions'" />

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="!session" class="alert alert-warning">
      Không tìm thấy thông tin phiên
    </div>

    <template v-else>
      <div class="row">
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">Thông tin phiên</h5>
            </div>
            <div class="card-body">
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">ID phiên:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ session.id }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Session ID:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ session.sessionId }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Người dùng:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">
                    <template v-if="session.user">
                      {{ session.user.fullName }} (ID: {{ session.user.id }})
                    </template>
                    <span v-else class="text-muted">Khách</span>
                  </p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Trạng thái:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">
                    <span :class="session.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ session.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Thời gian bắt đầu:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ formatDateTime(session.startTime) }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Hoạt động cuối:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ formatDateTime(session.lastActivity) }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Hết hạn:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ formatDateTime(session.expireAt) }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Tổng thời gian:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ formatDuration(session.totalTime) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">Thông tin thiết bị</h5>
            </div>
            <div class="card-body">
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Địa chỉ IP:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ session.ipAddress || 'Không có' }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Quốc gia:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ session.country || 'Không xác định' }}</p>
                </div>
              </div>
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label fw-semibold">Trình duyệt:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ session.userAgent || 'Không xác định' }}</p>
                </div>
              </div>
              <div class="mb-3" v-if="session.deviceInfo">
                <label class="form-label fw-semibold">Thông tin thiết bị:</label>
                <pre class="bg-light p-3 rounded"><code>{{ JSON.stringify(session.deviceInfo, null, 2) }}</code></pre>
              </div>
            </div>
          </div>

          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-4">
            <button 
              class="btn btn-warning" 
              @click="endSession" 
              v-if="session.isActive"
              :disabled="loading"
            >
              <i class="bi bi-stop-circle me-1"></i> Kết thúc phiên
            </button>
            <button 
              class="btn btn-danger" 
              @click="confirmDelete" 
              :disabled="loading"
            >
              <i class="bi bi-trash me-1"></i> Xóa phiên
            </button>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Lịch sử duyệt trang</h5>
        </div>
        <div class="card-body">
          <div v-if="pageVisitsLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
          </div>
          <div v-else-if="!pageVisits.length" class="alert alert-info">
            Không có dữ liệu lịch sử duyệt trang
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Trang</th>
                    <th>Nguồn</th>
                    <th>Thời gian vào</th>
                    <th>Thời gian ra</th>
                    <th>Thời gian trên trang</th>
                    <th>Trang đầu</th>
                    <th>Trang cuối</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="visit in pageVisits" :key="visit.id">
                    <td>{{ visit.pageUrl }}</td>
                    <td>{{ visit.referrer || '-' }}</td>
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
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const pageVisitsLoading = ref(true);
const session = ref(null);
const pageVisits = ref([]);

onMounted(async () => {
  await fetchSessionData();
});

async function fetchSessionData() {
  try {
    loading.value = true;
    const sessionId = route.params.id;
    
    const response = await $fetch('/api/trpc/admin.userSession.findById', {
      method: 'POST',
      body: { input: { id: Number(sessionId) } }
    });
    
    if (response.result?.data) {
      session.value = response.result.data;
      await fetchPageVisits();
    } else {
      toast.error('Không tìm thấy thông tin phiên');
    }
  } catch (error) {
    console.error('Error fetching session data:', error);
    toast.error('Không thể tải thông tin phiên');
  } finally {
    loading.value = false;
  }
}

async function fetchPageVisits() {
  try {
    pageVisitsLoading.value = true;
    
    if (!session.value) return;
    
    const response = await $fetch('/api/trpc/admin.userPageVisit.getSessionPageVisits', {
      method: 'POST',
      body: { input: { sessionId: session.value.sessionId } }
    });
    
    if (response.result?.data) {
      pageVisits.value = response.result.data.items;
    }
  } catch (error) {
    console.error('Error fetching page visits:', error);
    toast.error('Không thể tải lịch sử duyệt trang');
  } finally {
    pageVisitsLoading.value = false;
  }
}

async function endSession() {
  if (!session.value || !session.value.isActive) return;
  
  try {
    loading.value = true;
    
    await $fetch('/api/trpc/admin.userSession.endSession', {
      method: 'POST',
      body: { input: { sessionId: session.value.sessionId } }
    });
    
    toast.success('Đã kết thúc phiên thành công');
    await fetchSessionData();
  } catch (error) {
    console.error('Error ending session:', error);
    toast.error('Không thể kết thúc phiên');
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  if (!session.value) return;
  
  if (!confirm('Bạn có chắc chắn muốn xóa phiên này?')) {
    return;
  }
  
  try {
    loading.value = true;
    
    await $fetch('/api/trpc/admin.userSession.deleteSession', {
      method: 'POST',
      body: { input: { id: session.value.id } }
    });
    
    toast.success('Đã xóa phiên thành công');
    router.push('/admin/user-session/sessions');
  } catch (error) {
    console.error('Error deleting session:', error);
    toast.error('Không thể xóa phiên');
  } finally {
    loading.value = false;
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