<template>
  <NuxtLayout>
    <RouterView />
    <ToastContainer />
  </NuxtLayout>
</template>

<script setup>
import ToastContainer from '~/components/common/Toast.vue'
</script>