<template>
  <div class="fixed bottom-24 left-8 z-10">
    <!-- Ripple Effects -->
    <div class="absolute inset-0">
      <div class="animate-ripple absolute inset-0 rounded-full bg-[#0A7CFF]/20"></div>
      <div class="animate-ripple animation-delay-1000 absolute inset-0 rounded-full bg-[#0A7CFF]/20"></div>
    </div>
    <!-- Messenger Icon Button -->
    <a
      :href="messengerLink"
      target="_blank"
      rel="noopener noreferrer"
      class="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#0A7CFF] shadow-lg transition-all duration-300 hover:bg-[#006AFF] hover:shadow-[#0A7CFF]/20 hover:shadow-xl active:scale-95 animate-ringing"
      aria-label="Chat with us on Messenger"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-7 w-7"
        viewBox="0 0 512 512"
        fill="#ffffff"
      >
        <path d="M256.55 8C116.52 8 8 110.34 8 248.57c0 72.3 29.71 134.78 78.07 177.94 8.35 7.51 6.63 11.86 8.05 58.23A19.92 19.92 0 0 0 122 502.31c52.91-23.3 53.59-25.14 62.56-22.7C337.85 521.8 504 423.7 504 248.57 504 110.34 396.59 8 256.55 8zm149.24 185.13l-73 115.57a37.37 37.37 0 0 1-53.91 9.93l-58.08-43.47a15 15 0 0 0-18 0l-78.37 59.44c-10.46 7.93-24.16-4.6-17.11-15.67l73-115.57a37.36 37.36 0 0 1 53.91-9.93l58.06 43.46a15 15 0 0 0 18 0l78.41-59.38c10.44-7.98 24.14 4.54 17.09 15.62z"/>
      </svg>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTrpc } from '~/composables/useTrpc'

const messengerLink = ref('')
const trpc = useTrpc()

onMounted(async () => {
  try {
    const result = await trpc.settings.getPublicSettingByKey.query('messenger_support')
    if (result?.value) {
      messengerLink.value = result.value
    }
  } catch (error) {
    console.error('Failed to fetch Messenger support link:', error)
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