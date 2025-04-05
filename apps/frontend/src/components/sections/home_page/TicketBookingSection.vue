<!-- TicketBookingSection.vue -->
<template>
  <section :class="[backgroundColor]" class="relative">
    <div :class="[currentSettings.width, currentSettings.margin]" class="px-4">
      <!-- Booking Card -->
      <div :class="[
        currentSettings.backgroundColor,
        currentSettings.borderRadius,
        currentSettings.cardShadow,
        currentSettings.padding,
        currentSettings.position,
        currentSettings.zIndex
      ]">
        <h2 :class="[currentSettings.typography.heading, currentSettings.colors.heading]" class="mb-6 uppercase tracking-wide text-center">
          Đặt vé tham quan
        </h2>

        <!-- Booking Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Ticket Type -->
          <div class="space-y-2">
            <label class="flex items-center gap-2" :class="currentSettings.colors.secondary">
              <TicketIcon class="w-6 h-6" />
              LOẠI VÉ
            </label>
            <div v-if="currentSettings?.tabs?.length" class="grid md:grid-cols-2 gap-4">
              <button
                v-for="tab in currentSettings.tabs"
                :key="tab.id"
                type="button"
                @click="selectedTicket = tab.id"
                :class="[
                  'p-4 rounded-lg border-2 transition-colors duration-200 text-left flex gap-4',
                  selectedTicket === tab.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                ]"
              >
                <div class="flex-1">
                  <div :class="currentSettings.typography.tabLabel" class="text-gray-800 dark:text-gray-200">
                    {{ tab.label }}
                  </div>
                  <div :class="[currentSettings.typography.description, currentSettings.colors.secondary]" class="mt-1">
                    {{ tab.description }}
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span :class="[currentSettings.typography.price, currentSettings.colors.primary]">
                      {{ formatPrice(tab.price) }}
                    </span>
                  </div>
                </div>
                <div class="w-24 h-24 rounded-lg overflow-hidden">
                  <img 
                    :src="tab.image" 
                    :alt="tab.label"
                    class="w-full h-full object-cover"
                  />
                </div>
              </button>
            </div>
            <div v-else class="text-center py-4" :class="currentSettings.colors.secondary">
              Đang tải thông tin vé...
            </div>
          </div>

          <!-- Date Picker -->
          <div class="space-y-2">
            <label :class="currentSettings.colors.secondary" class="flex items-center gap-2">
              <CalendarIcon class="w-6 h-6" />
              {{ currentSettings.form.datePickerLabel }}
            </label>
            <DatePicker
              v-model="selectedDate"
              :min-date="new Date()"
              :masks="masks"
              class="w-full [&_.vc-highlight-base-start]:!bg-primary-500 [&_.vc-highlight-base-start]:!text-white"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  :value="inputValue"
                  v-on="inputEvents"
                  placeholder="Chọn ngày"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none dark:bg-gray-800"
                  readonly
                />
              </template>
            </DatePicker>
          </div>

          <!-- Number of Guests -->
          <div class="space-y-4">
            <label :class="currentSettings.colors.secondary" class="flex items-center gap-2">
              <UsersIcon class="w-6 h-6" />
              {{ currentSettings.form.guestsLabel }}
            </label>
            
            <!-- Adult Count -->
            <div class="flex items-center gap-4">
              <div class="w-32">
                <div :class="currentSettings.colors.secondary" class="font-medium mb-1">Người lớn</div>
                <div :class="currentSettings.colors.secondary" class="text-sm">Từ 13 tuổi</div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="adultCount <= currentSettings.form.minGuests"
                  @click="adultCount--"
                >
                  <MinusIcon class="w-5 h-5" />
                </button>
                <span class="w-12 text-center text-lg font-medium" :class="currentSettings.colors.heading">{{ adultCount }}</span>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="adultCount >= currentSettings.form.maxGuests"
                  @click="adultCount++"
                >
                  <PlusIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Child Count -->
            <div class="flex items-center gap-4">
              <div class="w-32">
                <div :class="currentSettings.colors.secondary" class="font-medium mb-1">Trẻ em</div>
                <div :class="currentSettings.colors.secondary" class="text-sm">4-12 tuổi</div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="childCount <= 0"
                  @click="childCount--"
                >
                  <MinusIcon class="w-5 h-5" />
                </button>
                <span class="w-12 text-center text-lg font-medium" :class="currentSettings.colors.heading">{{ childCount }}</span>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="childCount >= currentSettings.form.maxGuests"
                  @click="childCount++"
                >
                  <PlusIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Total and Submit -->
          <div class="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div :class="currentSettings.colors.secondary">
              <div class="text-sm">Tổng tiền</div>
              <div class="text-2xl font-semibold" :class="currentSettings.colors.primary">
                {{ calculateTotal }}
              </div>
            </div>

            <button
              type="submit"
              :disabled="!isFormValid"
              :class="[
                currentSettings.form.buttonColor,
                currentSettings.form.buttonTextColor,
                'px-8 py-3 rounded-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              ]"
            >
              {{ currentSettings.form.buttonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
export interface Tab {
  id: string;
  label: string;
  price: number;
  description: string;
  image: string;
}

export interface Settings {
  form: {
    maxGuests: number;
    minGuests: number;
    buttonText: string;
    buttonColor: string;
    guestsLabel: string;
    buttonTextColor: string;
    datePickerLabel: string;
  };
  tabs: Tab[];
  width: string;
  colors: {
    heading: string;
    primary: string;
    secondary: string;
  };
  layout: string;
  margin: string;
  zIndex: string;
  padding: string;
  position: string;
  cardShadow: string;
  typography: {
    price: string;
    heading: string;
    tabLabel: string;
    description: string;
  };
  borderRadius: string;
  backgroundColor: string;
  cardBackgroundColor: string;
}

interface APIResponse {
  id: number;
  themeId: number;
  type: string;
  componentName: string;
  title: string;
  order: number;
  pageType: string;
  settings: Settings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultSettings: Settings = {
  form: {
    maxGuests: 10,
    minGuests: 1,
    buttonText: "Đặt vé ngay",
    buttonColor: "bg-primary-600 hover:bg-primary-700",
    guestsLabel: "Số khách",
    buttonTextColor: "text-white",
    datePickerLabel: "Ngày tham quan"
  },
  tabs: [
    {
      id: "cable_car",
      label: "Vé cáp treo khứ hồi",
      price: 500000,
      description: "Vé cáp treo khứ hồi dành cho người lớn",
      image: "https://s3cablecar.sgp1.digitaloceanspaces.com/tickets/cable_car.webp"
    },
    {
      id: "cable_car_buffet",
      label: "Vé cáp treo + Buffet",
      price: 800000,
      description: "Vé cáp treo khứ hồi kèm buffet trưa",
      image: "https://s3cablecar.sgp1.digitaloceanspaces.com/tickets/buffet.jpg"
    }
  ],
  width: "max-w-3xl",
  colors: {
    heading: "text-gray-900 dark:text-white",
    primary: "text-primary-600 dark:text-primary-400",
    secondary: "text-gray-600 dark:text-gray-400"
  },
  layout: "floating-card",
  margin: "mx-auto",
  zIndex: "z-10",
  padding: "p-6",
  position: "relative -mt-20",
  cardShadow: "shadow-xl",
  typography: {
    price: "text-lg font-semibold",
    heading: "text-2xl font-bold",
    tabLabel: "text-base font-medium",
    description: "text-sm"
  },
  borderRadius: "rounded-xl",
  backgroundColor: "bg-white dark:bg-gray-800",
  cardBackgroundColor: "bg-white dark:bg-gray-900"
};
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Ticket as TicketIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
} from 'lucide-vue-next';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

const props = withDefaults(defineProps<{
  backgroundColor?: string;
  settings?: Settings;
}>(), {
  backgroundColor: 'bg-gray-100 dark:bg-gray-900',
  settings: () => defaultSettings
});

const selectedTicket = ref('');
const selectedDate = ref<Date | null>(null);
const adultCount = ref(1);
const childCount = ref(0);
const currentSettings = ref<Settings>(props.settings);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const calculateTotal = computed(() => {
  if (!currentSettings.value?.tabs?.length) return formatPrice(0);
  
  const ticket = currentSettings.value.tabs.find(t => t.id === selectedTicket.value);
  if (!ticket) return formatPrice(0);
  
  const total = ticket.price * (adultCount.value + childCount.value);
  return formatPrice(total);
});

const isFormValid = computed(() => {
  if (!currentSettings.value?.tabs?.length) return false;
  
  return (
    selectedTicket.value && 
    selectedDate.value && 
    adultCount.value >= currentSettings.value.form.minGuests && 
    (adultCount.value + childCount.value) <= currentSettings.value.form.maxGuests
  );
});

const handleSubmit = () => {
  if (!isFormValid.value || !currentSettings.value?.tabs?.length) return;
  
  const ticket = currentSettings.value.tabs.find(t => t.id === selectedTicket.value);
  console.log('Booking details:', {
    ticketType: ticket?.label,
    price: ticket?.price,
    date: selectedDate.value,
    adults: adultCount.value,
    children: childCount.value,
    totalAmount: ticket ? (
      ticket.price * (adultCount.value + childCount.value)
    ) : 0
  });
};

const fetchSettings = async () => {
  try {
    const response = await fetch('/api/sections/home_page/ticket_booking');
    if (!response.ok) throw new Error('Failed to fetch settings');
    
    const data: APIResponse = await response.json();
    if (data?.settings) {
      currentSettings.value = data.settings;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Keep using the default settings
  }
};

onMounted(() => {
  fetchSettings();
});

// Date picker configuration
const masks = {
  input: 'DD/MM/YYYY',
  data: 'YYYY-MM-DD'
};
</script>

<style>
.vc-container {
  --vc-font-family: inherit;
  --vc-rounded-full: 9999px;
  --vc-font-bold: 600;
  --vc-font-semibold: 500;
  --vc-text-lg: 1.125rem;
}
</style> 