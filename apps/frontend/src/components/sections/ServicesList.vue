<script setup lang="ts">
import { ref } from 'vue';
import ServiceCard from '../ui/card/ServiceCard.vue';
import Button from '../ui/button/Button.vue';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const props = defineProps<{
  services: Service[];
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <section class="services-section">
    <div class="container">
      <h2 class="services-section__title">Dịch vụ của chúng tôi</h2>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="services-section__loading">
        <div class="services-section__spinner"></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="services-section__error">
        <p>{{ error }}</p>
        <Button 
          @click="handleRetry" 
          variant="destructive"
          class="services-section__retry-btn"
        >
          Thử lại
        </Button>
      </div>
      
      <!-- Services Grid -->
      <div v-else-if="services.length > 0" class="services-section__grid">
        <ServiceCard 
          v-for="service in services" 
          :key="service.id"
          :service="service"
        />
      </div>
      
      <!-- Empty state -->
      <div v-else class="services-section__empty">
        <p>Không có dịch vụ nào</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.services-section {
  padding: 5rem 0;
  background-color: var(--color-background-subtle, #f9fafb);
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  &__title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--color-foreground);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.75rem;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background-color: var(--color-primary);
      border-radius: 3px;
    }
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
  
  &__spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(var(--color-primary-rgb), 0.3);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s ease-in-out infinite;
  }
  
  &__error {
    background-color: var(--color-destructive-light, rgba(var(--color-destructive-rgb), 0.1));
    border: 1px solid var(--color-destructive);
    color: var(--color-destructive);
    padding: 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
  }
  
  &__retry-btn {
    margin-top: 1rem;
  }
  
  &__empty {
    text-align: center;
    color: var(--color-muted-foreground);
    padding: 3rem 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .services-section {
    padding: 3rem 0;
    
    &__title {
      font-size: 1.75rem;
      margin-bottom: 2rem;
    }
    
    &__grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
  }
}
</style> 