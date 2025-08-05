import { useCartLogic } from './useCartLogic';
import type { CartLogicComposable } from '~/types/cart';

// Cart page composable just extends the base cart logic
// No additional functionality needed for the page
export const useCartPage = (): CartLogicComposable => {
  return useCartLogic();
}; 