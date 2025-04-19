<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTrpc } from '@/composables/useTrpc'

interface PricingTier {
  id: number
  name: string
  price: number
  currency: string
  interval: string
  features: string[]
  isPopular?: boolean
  isCallHotline?: boolean
}

interface Props {
  settings: {
    backgroundColor?: string
    typography?: {
      heading?: string
      subheading?: string
      tierName?: string
      price?: string
      feature?: string
    }
    colors?: {
      heading?: string
      subheading?: string
      tierName?: string
      price?: string
      feature?: string
      primary?: string
    }
  }
  translations: {
    title: string
    subtitle: string
    tiers: PricingTier[]
  }
}

const props = defineProps<Props>()
const router = useRouter()
const trpc = useTrpc()

const sectionClasses = computed(() => {
  return [
    'w-full',
    props.settings?.backgroundColor || 'bg-gray-50 dark:bg-gray-900',
  ].join(' ')
})

const headingClasses = computed(() => {
  const defaultTypography = 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center tracking-tight'
  const defaultColor = props.settings?.colors?.primary || 'text-primary-600 dark:text-primary-400'
  
  return [
    props.settings?.typography?.heading || defaultTypography,
    props.settings?.colors?.heading || defaultColor,
  ].join(' ')
})

const subheadingClasses = computed(() => {
  return [
    props.settings?.typography?.subheading || 'text-lg sm:text-xl md:text-2xl text-center max-w-2xl mx-auto font-medium',
    props.settings?.colors?.subheading || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})

const tierNameClasses = computed(() => {
  return [
    props.settings?.typography?.tierName || 'text-xl font-semibold',
    props.settings?.colors?.tierName || 'text-gray-900 dark:text-gray-100',
  ].join(' ')
})

const priceClasses = computed(() => {
  return [
    props.settings?.typography?.price || 'text-4xl font-bold',
    props.settings?.colors?.price || 'text-gray-900 dark:text-gray-100',
  ].join(' ')
})

const featureClasses = computed(() => {
  return [
    props.settings?.typography?.feature || 'text-base',
    props.settings?.colors?.feature || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})

const handleTicketAction = async (tier: PricingTier) => {
  if (tier.isCallHotline) {
    try {
      const hotlineSetting = await trpc.settings.getPublicSettingByKey.query('hotline')
      if (hotlineSetting?.value) {
        window.location.href = `tel:${hotlineSetting.value}`
      }
    } catch (error) {
      console.error('Error fetching hotline:', error)
    }
  } else {
    router.push('/order-ticket')
  }
}
</script>

<template>
  <section :class="sectionClasses">
    <div class="container mx-auto px-4 py-16 md:py-24">
      <div class="text-center max-w-4xl mx-auto mb-16">
        <h2 :class="headingClasses" class="mb-8">{{ translations.title }}</h2>
        
        <div v-if="translations.subtitle" class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-primary-200 dark:border-primary-700"></div>
          </div>
          <div class="relative flex justify-center">
            <span :class="[props.settings?.backgroundColor || 'bg-gray-50 dark:bg-gray-900', 'px-6']">
              <p :class="subheadingClasses">
                {{ translations.subtitle }}
              </p>
            </span>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" class="px-6 py-4 text-left bg-white dark:bg-gray-800">
                    <span class="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                      Loại vé/Dịch vụ
                    </span>
                  </th>
                  <th scope="col" class="px-6 py-4 text-left bg-white dark:bg-gray-800">
                    <span class="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                      Giá
                    </span>
                  </th>
                  <th scope="col" class="px-6 py-4 text-left bg-white dark:bg-gray-800">
                    <span class="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                      Chi tiết
                    </span>
                  </th>
                  <th scope="col" class="px-6 py-4 text-center bg-white dark:bg-gray-800">
                    <span class="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                      Đặt vé
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="tier in translations.tiers" 
                  :key="tier.id" 
                  :class="[
                    'transition-colors duration-200 bg-white dark:bg-gray-800',
                    tier.isPopular ? 'bg-primary-50/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  ]"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div>
                        <div :class="tierNameClasses" class="flex items-center gap-2">
                          {{ tier.name }}
                          <span v-if="tier.isPopular" 
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          >
                            Phổ biến
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div :class="priceClasses" class="flex items-baseline">
                      <span class="text-2xl font-semibold text-gray-900 dark:text-white">{{ tier.currency }}</span>
                      <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ tier.price.toLocaleString() }}</span>
                      <span class="ml-1 text-sm text-gray-500 dark:text-gray-400">/{{ tier.interval }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <ul class="space-y-2">
                      <li v-for="(feature, index) in tier.features" 
                        :key="index" 
                        :class="featureClasses" 
                        class="flex items-start"
                      >
                        <svg class="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {{ feature }}
                      </li>
                    </ul>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                      :class="[
                        tier.isPopular 
                          ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500' 
                          : 'text-red-700 bg-red-50 hover:bg-red-100 focus:ring-2 focus:ring-offset-2 focus:ring-red-400'
                      ]"
                      @click="handleTicketAction(tier)"
                    >
                      <span>{{ tier.isCallHotline ? 'Gọi ngay' : 'Đặt ngay' }}</span>
                      <svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="tier.isCallHotline" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Travel Benefits -->
      <div class="mt-16 max-w-4xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div v-for="(benefit, index) in [
            {
              title: 'Linh hoạt',
              description: 'Dễ dàng đổi lịch và hoàn tiền',
              icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
            },
            {
              title: 'An toàn',
              description: 'Bảo hiểm du lịch toàn diện',
              icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
            },
            {
              title: 'Tiết kiệm',
              description: 'Giá cả cạnh tranh nhất',
              icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            }
          ]" 
            :key="index"
            class="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800/30 shadow-sm hover:border-red-300 dark:hover:border-red-700/30 transition-all duration-200 p-6"
          >
            <div class="bg-red-50 dark:bg-red-500/5 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="benefit.icon"/>
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ benefit.title }}</h4>
            <p class="text-gray-600 dark:text-gray-300">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template> 