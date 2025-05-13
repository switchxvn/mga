<template>
  <div>
    <div class="card mb-4">
      <div class="card-body p-0">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <NuxtLink class="nav-link" :class="{ active: activeTab === 'analytics' }" to="/admin/user-session/analytics">
              <i class="bi bi-bar-chart-fill me-1"></i> Thống kê
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" :class="{ active: activeTab === 'sessions' }" to="/admin/user-session/sessions">
              <i class="bi bi-people-fill me-1"></i> Phiên người dùng
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" :class="{ active: activeTab === 'page-visits' }" to="/admin/user-session/page-visits">
              <i class="bi bi-eye-fill me-1"></i> Lượt truy cập trang
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const activeTab = computed(() => {
  const path = route.path;
  
  if (path.includes('/sessions/') || path === '/admin/user-session/sessions') {
    return 'sessions';
  } else if (path === '/admin/user-session/page-visits') {
    return 'page-visits';
  }
  
  // Default to analytics
  return 'analytics';
});
</script> 