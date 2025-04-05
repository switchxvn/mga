<!-- TicketBookingSection.vue -->
<template>
  <section :class="[backgroundColor, settings?.sectionClass]" class="relative">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Booking Card -->
      <div :class="[
        'bg-white rounded-2xl shadow-lg p-6',
        settings?.cardClass,
        settings?.isFloating && '-mt-24 relative z-10'
      ]">
        <h2 class="text-2xl font-bold text-primary-500 mb-6 uppercase tracking-wide text-center">
          {{ settings?.title || 'Đặt vé cáp treo' }}
        </h2>

        <!-- Booking Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Ticket Type -->
          <div class="space-y-2">
            <label class="text-gray-600 font-medium flex items-center gap-2">
              <TicketIcon class="w-6 h-6 text-gray-400" />
              LOẠI VÉ
            </label>
            <div class="grid md:grid-cols-2 gap-4">
              <button
                v-for="ticket in tickets"
                :key="ticket.id"
                type="button"
                @click="selectedTicket = ticket.id"
                :class="[
                  'p-4 rounded-lg border-2 transition-colors duration-200 text-left',
                  selectedTicket === ticket.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="font-medium text-gray-800">{{ ticket.name }}</div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ ticket.description }}
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-lg font-semibold text-orange-500">
                    {{ formatPrice(ticket.adultPrice) }}
                  </span>
                  <span class="text-sm text-gray-500">/người lớn</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-semibold text-orange-500">
                    {{ formatPrice(ticket.childPrice) }}
                  </span>
                  <span class="text-sm text-gray-500">/trẻ em</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Date Picker -->
          <div class="space-y-2">
            <label class="text-gray-600 font-medium flex items-center gap-2">
              <CalendarIcon class="w-6 h-6 text-gray-400" />
              NGÀY ĐI
            </label>
            <DatePicker
              v-model="selectedDate"
              :min-date="new Date()"
              :masks="masks"
              class="w-full [&_.vc-highlight-base-start]:!bg-blue-500 [&_.vc-highlight-base-start]:!text-white"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  :value="inputValue"
                  v-on="inputEvents"
                  placeholder="Chọn ngày"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  readonly
                />
              </template>
            </DatePicker>
          </div>

          <!-- Number of Guests -->
          <div class="space-y-4">
            <label class="text-gray-600 font-medium flex items-center gap-2">
              <UsersIcon class="w-6 h-6 text-gray-400" />
              SỐ KHÁCH
            </label>
            
            <!-- Adult Count -->
            <div class="flex items-center gap-4">
              <div class="w-32">
                <div class="text-gray-600 font-medium mb-1">Người lớn</div>
                <div class="text-sm text-gray-500">Từ 13 tuổi</div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="adultCount <= 1"
                  @click="adultCount--"
                >
                  <MinusIcon class="w-5 h-5" />
                </button>
                <span class="w-12 text-center text-lg font-medium">{{ adultCount }}</span>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="adultCount >= 20"
                  @click="adultCount++"
                >
                  <PlusIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Child Count -->
            <div class="flex items-center gap-4">
              <div class="w-32">
                <div class="text-gray-600 font-medium mb-1">Trẻ em</div>
                <div class="text-sm text-gray-500">4-12 tuổi</div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="childCount <= 0"
                  @click="childCount--"
                >
                  <MinusIcon class="w-5 h-5" />
                </button>
                <span class="w-12 text-center text-lg font-medium">{{ childCount }}</span>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="childCount >= 20"
                  @click="childCount++"
                >
                  <PlusIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Total and Submit -->
          <div class="flex items-center justify-between pt-4 border-t">
            <div class="text-gray-600">
              <div class="text-sm">Tổng tiền</div>
              <div class="text-2xl font-semibold text-orange-500">
                {{ calculateTotal }}
              </div>
            </div>

            <UButton
              type="submit"
              color="orange"
              variant="solid"
              class="!bg-orange-500 !px-8 !py-3 !text-lg !font-medium"
              :disabled="!isFormValid"
              @click="handleSubmit"
            >
              Đặt vé ngay
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Ticket as TicketIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
} from 'lucide-vue-next';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

interface Settings {
  title?: string;
  sectionClass?: string;
  cardClass?: string;
  isFloating?: boolean;
}

const props = withDefaults(defineProps<{
  backgroundColor?: string;
  settings?: Settings;
}>(), {
  backgroundColor: '',
  settings: () => ({
    title: 'Đặt vé cáp treo',
    sectionClass: 'py-8',
    cardClass: '',
    isFloating: true
  })
});

const tickets = [
  {
    id: 'round_trip',
    name: 'Vé khứ hồi 2 chiều',
    description: 'Vé cáp treo khứ hồi 2 chiều',
    adultPrice: 350000,
    childPrice: 250000,
  },
  {
    id: 'round_trip_buffet',
    name: 'Vé khứ hồi 2 chiều + Buffet',
    description: 'Vé cáp treo khứ hồi 2 chiều và buffet trưa',
    adultPrice: 550000,
    childPrice: 350000,
  }
];

const selectedTicket = ref('');
const selectedDate = ref<Date | null>(null);
const adultCount = ref(1);
const childCount = ref(0);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const calculateTotal = computed(() => {
  const ticket = tickets.find(t => t.id === selectedTicket.value);
  if (!ticket) return formatPrice(0);
  
  const adultTotal = ticket.adultPrice * adultCount.value;
  const childTotal = ticket.childPrice * childCount.value;
  
  return formatPrice(adultTotal + childTotal);
});

const isFormValid = computed(() => {
  return (
    selectedTicket.value && 
    selectedDate.value && 
    adultCount.value >= 1 && 
    (adultCount.value + childCount.value) <= 20
  );
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
  
  const ticket = tickets.find(t => t.id === selectedTicket.value);
  console.log('Booking details:', {
    ticketType: ticket?.name,
    adultPrice: ticket?.adultPrice,
    childPrice: ticket?.childPrice,
    date: selectedDate.value,
    adults: adultCount.value,
    children: childCount.value,
    totalAmount: ticket ? (
      ticket.adultPrice * adultCount.value + 
      ticket.childPrice * childCount.value
    ) : 0
  });
};

// Date picker configuration
const masks = {
  input: 'DD/MM/YYYY',
  data: 'YYYY-MM-DD'
};

const modelConfig = {
  type: 'string',
  mask: 'YYYY-MM-DD',
};

const attributes = [
  {
    key: 'today',
    highlight: {
      color: 'orange',
      fillMode: 'light',
    },
    dates: new Date(),
  },
];

const datePickerClass = computed(() => ({
  'vc-container': true,
  'vc-text-gray-800': true,
  'vc-bg-white': true,
  'vc-border': true,
  'vc-border-gray-300': true,
  'vc-rounded-lg': true,
  '[&_.vc-highlight-bg-light]:!bg-orange-100': true,
  '[&_.vc-highlight-bg-light]:!text-orange-900': true,
  '[&_.vc-highlight-bg-solid]:!bg-orange-500': true,
  '[&_.vc-highlight-bg-solid]:!text-white': true,
  '[&_.vc-nav-title]:!text-gray-800': true,
  '[&_.vc-nav-arrow]:!text-gray-600': true,
  '[&_.vc-nav-arrow]:hover:!text-gray-900': true,
  '[&_.vc-day]:!text-sm': true,
  '[&_.vc-day-content]:hover:!bg-orange-100': true,
  '[&_.vc-day-content]:hover:!text-orange-900': true,
  '[&_.vc-weekday]:!text-gray-500': true,
}));
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