<template>
  <NuxtLayout>
    <RouterView />
    <ToastContainer />
  </NuxtLayout>
</template>

<script setup>
import ToastContainer from '~/components/common/Toast.vue'

// Apply auth middleware globally
definePageMeta({
  middleware: 'auth'
})
</script>