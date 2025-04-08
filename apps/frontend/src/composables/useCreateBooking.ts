import { useMutation } from '@tanstack/vue-query';
import { trpc } from '@/utils/trpc';

interface BookingData {
  productId: number;
  variantId: number;
  date: Date | null;
  adultCount: number;
  total: number;
}

interface BookingResponse {
  id: number;
  status: string;
}

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (data: BookingData) => {
      const response = await trpc.booking.create.mutate(data);
      return response as BookingResponse;
    },
  });
}; 