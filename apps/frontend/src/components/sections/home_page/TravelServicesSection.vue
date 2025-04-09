<script setup lang="ts">
import { computed } from 'vue';
import { Bed, Bike, Car, Bus, BatteryCharging, Truck, Building2, Zap } from 'lucide-vue-next';

interface Service {
  title: string;
  icon: string;
  price: string;
}

interface Props {
  section: {
    id: number;
    type: string;
    title: string;
    order: number;
    pageType: string;
    componentName?: string;
    settings: Record<string, any>;
    isActive: boolean;
  };
  config: {
    layout: string;
    columns: number;
    maxItems: number;
    showIcon: boolean;
    showTitle: boolean;
    gap: string;
    padding: {
      top: string;
      bottom: string;
    };
    iconStyle: {
      size: string;
      color: string;
      margin: string;
    };
    titleStyle: {
      size: string;
      weight: string;
      color: string;
      margin: string;
    };
    services: Service[];
  };
}

const props = defineProps<Props>();

// Map icon names to Lucide components
const iconMap = {
  Bed,
  Bike,
  Car,
  Bus,
  BatteryCharging,
  Truck,
  Building2,
  Zap
};

// Get icon component by name
const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || null;
};

// Computed properties for styling
const containerClasses = computed(() => {
  return props.config.layout || 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8';
});

const iconClasses = computed(() => {
  return `${props.config.iconStyle.size} ${props.config.iconStyle.color} ${props.config.iconStyle.margin} transition-all duration-300 group-hover:scale-110`;
});

// Limit services to maxItems
const services = computed(() => {
  return props.config.services.slice(0, props.config.maxItems);
});
</script>

<template>
  <section class="py-16 bg-gray-50/50 dark:bg-gray-900/50">
    <div class="container mx-auto px-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-primary-800/50 p-8 lg:p-12">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ section.title }}
          </h2>
          <div class="w-24 h-1 bg-primary-800 mx-auto rounded-full"></div>
        </div>
        
        <div :class="containerClasses">
          <div 
            v-for="(service, index) in services" 
            :key="index" 
            class="group bg-gray-50/50 dark:bg-gray-900/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 lg:p-6 border-2 border-primary-800/50 hover:border-primary-800"
          >
            <div class="flex items-start space-x-4 lg:space-x-6">
              <div 
                v-if="props.config.showIcon && getIconComponent(service.icon)" 
                class="relative flex-shrink-0"
              >
                <!-- Outer circle with border -->
                <div class="absolute inset-0 rounded-full border-2 border-primary-800 bg-white dark:bg-gray-800 transform transition-transform duration-300 group-hover:scale-105"></div>
                <!-- Inner circle with lighter background -->
                <div class="relative flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white dark:bg-gray-800">
                  <component 
                    :is="getIconComponent(service.icon)" 
                    class="w-8 h-8 lg:w-10 lg:h-10 text-primary-800"
                  />
                </div>
              </div>
              <div class="flex flex-col items-start">
                <h3 
                  v-if="props.config.showTitle" 
                  class="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1"
                >
                  {{ service.title }}
                </h3>
                <p class="text-sm lg:text-base text-gray-600 dark:text-gray-400">{{ service.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style> 