<template>
  <div class="fixed bottom-24 left-8 z-50">
    <!-- Ripple Effects -->
    <div class="absolute inset-0">
      <div class="animate-ripple absolute inset-0 rounded-full bg-[#2196F3]/20"></div>
      <div class="animate-ripple animation-delay-1000 absolute inset-0 rounded-full bg-[#2196F3]/20"></div>
    </div>
    <!-- Zalo Icon Button -->
    <a
      :href="zaloLink"
      target="_blank"
      rel="noopener noreferrer"
      class="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#2196F3] shadow-lg transition-all duration-300 hover:bg-[#1976D2] hover:shadow-[#2196F3]/20 hover:shadow-xl active:scale-95 animate-ringing"
      aria-label="Chat with us on Zalo"
    >
      <img
        src="@/assets/images/icons/zalo.png"
        alt="Zalo"
        class="h-7 w-7 brightness-0 invert"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTrpc } from '~/composables/useTrpc'

const zaloLink = ref('')
const trpc = useTrpc()

onMounted(async () => {
  try {
    const result = await trpc.settings.getPublicSettingByKey.query('zalo_support')
    if (result?.value) {
      zaloLink.value = result.value
    }
  } catch (error) {
    console.error('Failed to fetch Zalo support link:', error)
  }
})
</script>

<style>
@keyframes ringing {
  0% {
    transform: rotate(0deg) scale(1);
  }
  1% {
    transform: rotate(15deg) scale(1.1);
  }
  3% {
    transform: rotate(-15deg) scale(1.1);
  }
  5% {
    transform: rotate(15deg) scale(1.1);
  }
  7% {
    transform: rotate(-15deg) scale(1.1);
  }
  9% {
    transform: rotate(0deg) scale(1.1);
  }
  11% {
    transform: rotate(0deg) scale(1);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ringing {
  animation: ringing 3s ease-in-out infinite;
  transform-origin: center center;
}

.animate-ripple {
  animation: ripple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}
</style> 