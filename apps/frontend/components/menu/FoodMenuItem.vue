<template>
  <div class="food-menu-item">
    <div class="food-menu-border">
      <NuxtImg
        :src="imageUrl"
        :alt="name"
        class="food-menu-image"
      />
    </div>
    <h3 class="food-menu-title">{{ name }}</h3>
    <div class="food-menu-price">
      {{ formatPrice(price) }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  imageUrl: string;
  name: string;
  description?: string;
  price: number;
}

const props = defineProps<Props>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};
</script>

<style scoped>
.food-menu-item {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.food-menu-border {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 1.5rem;
}

.food-menu-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/images/others/af-spp.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  pointer-events: none;
}

.food-menu-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.food-menu-title {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #B8860B;
  text-transform: uppercase;
}

.food-menu-price {
  margin-top: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  color: #B8860B;
}
</style> 