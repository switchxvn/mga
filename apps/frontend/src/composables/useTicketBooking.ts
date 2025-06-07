import { ref, computed } from 'vue';

export interface TicketBookingData {
  productId: number;
  productName: string;
  date: string;
  variants: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    originalPrice?: number;
    discountPercent?: number;
  }>;
  totalAmount: number;
  originalAmount?: number;
}

const STORAGE_KEY = 'ticket_booking_data';

export const useTicketBooking = () => {
  const bookingData = ref<TicketBookingData | null>(null);

  const saveBookingData = (data: Omit<TicketBookingData, 'date'> & { date: Date }) => {
    const dataToSave: TicketBookingData = {
      ...data,
      date: data.date.toISOString()
    };
    bookingData.value = dataToSave;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  const loadBookingData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        bookingData.value = parsed;
      }
      return bookingData.value;
    } catch (error) {
      console.error('Error loading booking data:', error);
      return null;
    }
  };

  const clearBookingData = () => {
    bookingData.value = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasBookingData = computed(() => {
    return !!bookingData.value;
  });

  return {
    bookingData,
    saveBookingData,
    loadBookingData,
    clearBookingData,
    hasBookingData
  };
}; 