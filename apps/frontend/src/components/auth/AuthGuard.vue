<template>
  <div>
    <slot v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user, checkAuth } = useAuth();
const isAuthenticated = ref(false);

onMounted(async () => {
  await checkAuth();
  
  if (!user.value) {
    // Redirect to login if not authenticated
    router.push('/auth/login');
  } else {
    isAuthenticated.value = true;
  }
});
</script> 