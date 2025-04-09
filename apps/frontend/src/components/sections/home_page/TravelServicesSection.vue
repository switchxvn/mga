<script setup lang="ts">
import { computed } from 'vue';
import { Bed, Bike, Car, Bus, BatteryCharging } from 'lucide-vue-next';

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
};

// Get icon component by name
const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || null;
};

// Computed properties for styling
const containerClasses = computed(() => {
  return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${props.config.columns} gap-8 md:gap-12`;
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
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ section.title }}
        </h2>
        <div class="w-24 h-1 bg-primary-500 mx-auto rounded-full"></div>
      </div>
      
      <div :class="containerClasses">
        <div 
          v-for="(service, index) in services" 
          :key="index" 
          class="group flex items-center space-x-6"
        >
          <div 
            v-if="props.config.showIcon && getIconComponent(service.icon)" 
            class="relative flex-shrink-0"
          >
            <!-- Outer circle with border -->
            <div class="absolute inset-0 rounded-full border-2 border-primary-500 bg-white dark:bg-gray-800 transform transition-transform duration-300 group-hover:scale-105"></div>
            <!-- Inner circle with lighter background -->
            <div class="relative flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800">
              <component 
                :is="getIconComponent(service.icon)" 
                class="w-10 h-10 text-primary-500"
              />
            </div>
          </div>
          <div class="flex flex-col items-start">
            <h3 
              v-if="props.config.showTitle" 
              class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1"
            >
              {{ service.title }}
            </h3>
            <p class="text-base text-gray-600 dark:text-gray-400">{{ service.price }}</p>
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