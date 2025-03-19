<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-8 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-8 opacity-0"
  >
    <button
      v-show="showButton"
      @click="scrollToTop"
      class="group fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-xl active:scale-95"
      aria-label="Back to top"
    >
      <Icon
        name="heroicons:arrow-up"
        class="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)

const handleScroll = () => {
  showButton.value = window.scrollY > 200
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script> 