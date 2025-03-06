<script setup lang="ts">
defineProps<{
  service: {
    id: number;
    title: string;
    description: string;
    icon: string;
    order: number;
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
  }
}>();
</script>

<template>
  <div class="service-card">
    <div class="service-card__icon-wrapper">
      <div class="service-card__icon">
        <i :class="service.icon"></i>
      </div>
    </div>
    <h3 class="service-card__title">{{ service.title }}</h3>
    <p class="service-card__description">{{ service.description }}</p>
    <div class="service-card__hover-effect"></div>
  </div>
</template>

<style lang="scss" scoped>
.service-card {
  position: relative;
  background-color: var(--color-card);
  border-radius: 1rem;
  padding: 2.5rem 1.5rem;
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  z-index: 1;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    
    .service-card__icon-wrapper {
      transform: scale(1.05);
    }
    
    .service-card__hover-effect {
      opacity: 1;
    }
  }
  
  &__icon-wrapper {
    background-color: var(--color-primary-light, rgba(var(--color-primary-rgb), 0.1));
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 2;
    transition: transform 0.3s ease;
  }
  
  &__icon {
    color: var(--color-primary);
    font-size: 2rem;
    
    i {
      font-size: 32px;
    }
  }
  
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--color-foreground);
    position: relative;
    z-index: 2;
  }
  
  &__description {
    color: var(--color-muted-foreground);
    line-height: 1.6;
    position: relative;
    z-index: 2;
  }
  
  &__hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(var(--color-primary-rgb), 0.05) 0%, 
      rgba(var(--color-primary-rgb), 0.02) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
}

@media (max-width: 768px) {
  .service-card {
    padding: 2rem 1rem;
    
    &__icon-wrapper {
      width: 70px;
      height: 70px;
    }
    
    &__title {
      font-size: 1.1rem;
    }
  }
}
</style> 