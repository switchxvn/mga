<template>
  <div class="fixed bottom-8 left-8 z-50">
    <!-- Phone Icon Button -->
    <button
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      class="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-xl active:scale-95 animate-ringing"
      aria-label="Support phones"
    >
      <Phone
        class="h-5 w-5 text-white"
        :size="20"
      />
    </button>

    <!-- Phone Numbers Popup -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-x-4 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform -translate-x-4 opacity-0"
    >
      <div
        v-if="isHovered && phones.length"
        class="absolute bottom-0 left-14 mb-1 w-48 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800"
        @mouseenter="clearHideTimeout"
        @mouseleave="handleMouseLeave"
      >
        <div class="space-y-2">
          <a
            v-for="phone in phones"
            :key="phone"
            :href="`tel:${phone}`"
            class="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {{ formatPhoneNumber(phone) }}
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTrpc } from '~/composables/useTrpc'
import { Phone } from 'lucide-vue-next'

const isHovered = ref(false)
const phones = ref<string[]>([])
let hideTimeout: NodeJS.Timeout | null = null

const trpc = useTrpc()

onMounted(async () => {
  try {
    const result = await trpc.settings.getPublicSettingByKey.query('support_phones')
    if (result?.value) {
      phones.value = JSON.parse(result.value)
    }
  } catch (error) {
    console.error('Failed to fetch support phones:', error)
  }
})

const handleMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  isHovered.value = true
}

const handleMouseLeave = () => {
  hideTimeout = setTimeout(() => {
    isHovered.value = false
  }, 500) // 500ms delay before hiding
}

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})

const formatPhoneNumber = (phone: string) => {
  // Format phone number with spaces for better readability
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
}
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

.animate-ringing {
  animation: ringing 3s ease-in-out infinite;
  transform-origin: center center;
}
</style> 