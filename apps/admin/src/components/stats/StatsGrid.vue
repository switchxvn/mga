<script setup lang="ts">
const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.9',
    change: '+20.1%',
    changeType: 'positive',
    icon: 'i-heroicons-currency-dollar'
  },
  {
    name: 'Total Orders',
    value: '2,345',
    change: '+15%',
    changeType: 'positive',
    icon: 'i-heroicons-shopping-cart'
  },
  {
    name: 'Total Customers',
    value: '1,234',
    change: '+12.5%',
    changeType: 'positive',
    icon: 'i-heroicons-users'
  },
  {
    name: 'Conversion Rate',
    value: '3.2%',
    change: '-0.4%',
    changeType: 'negative',
    icon: 'i-heroicons-chart-bar'
  }
] as const
</script>

<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatsCard
      v-for="stat in stats"
      :key="stat.name"
      :stat="stat"
    />
  </section>
</template> 