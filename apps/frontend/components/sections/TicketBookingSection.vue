<!-- TicketBookingSection.vue -->
<template>
  <section :class="settings.backgroundColor" class="relative">
    <div :class="[
      settings.cardBackgroundColor,
      settings.cardShadow,
      settings.borderRadius,
      settings.padding,
      settings.width,
      settings.position,
      settings.zIndex,
      settings.margin
    ]">
      <h2 :class="[settings.typography.heading, settings.colors.heading]" class="mb-6">
        {{ title }}
      </h2>

      <!-- Tabs -->
      <div class="flex space-x-4 mb-6">
        <button
          v-for="tab in settings.tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg transition-colors duration-200',
            selectedTab === tab.id
              ? 'bg-primary-100 dark:bg-primary-900 ' + settings.colors.primary
              : 'bg-gray-100 dark:bg-gray-800 ' + settings.colors.secondary
          ]"
        >
          <div :class="settings.typography.tabLabel">{{ tab.label }}</div>
          <div :class="settings.typography.price">
            {{ formatPrice(tab.price) }}
          </div>
          <div :class="[settings.typography.description, settings.colors.secondary]">
            {{ tab.description }}
          </div>
        </button>
      </div>

      <!-- Booking Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Date Picker -->
        <div>
          <label :class="settings.colors.secondary" class="block mb-2">
            {{ settings.form.datePickerLabel }}
          </label>
          <UDatePicker
            v-model="selectedDate"
            :min="new Date()"
            class="w-full"
          />
        </div>

        <!-- Number of Guests -->
        <div>
          <label :class="settings.colors.secondary" class="block mb-2">
            {{ settings.form.guestsLabel }}
          </label>
          <UInput
            v-model="guestCount"
            type="number"
            :min="settings.form.minGuests"
            :max="settings.form.maxGuests"
            class="w-full"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :class="[
            settings.form.buttonColor,
            settings.form.buttonTextColor,
            'w-full py-3 rounded-lg font-medium transition-colors duration-200'
          ]"
        >
          {{ settings.form.buttonText }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ThemeSection } from '@ew/shared';

const props = defineProps<{
  settings: ThemeSection['settings'];
  title: string;
}>();

const selectedTab = ref(props.settings.tabs[0].id);
const selectedDate = ref(new Date());
const guestCount = ref(props.settings.form.minGuests);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const handleSubmit = () => {
  const selectedTicket = props.settings.tabs.find(tab => tab.id === selectedTab.value);
  
  // TODO: Implement booking logic
  console.log('Booking details:', {
    ticketType: selectedTicket?.label,
    price: selectedTicket?.price,
    date: selectedDate.value,
    guests: guestCount.value,
    totalAmount: (selectedTicket?.price || 0) * guestCount.value
  });
};
</script> 