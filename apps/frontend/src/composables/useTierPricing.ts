import { ref, computed } from 'vue';
import { useTrpc } from './useTrpc';
import { formatPrice } from '@ew/shared';

interface TierDiscount {
  id: number;
  productId: number | null;
  productVariantId: number | null;
  minQuantity: number;
  discountPercent: number;
  isActive: boolean;
}

export function useTierPricing() {
  const trpc = useTrpc();
  const tierDiscounts = ref<TierDiscount[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Lấy danh sách giá theo bậc cho sản phẩm
  const fetchTierDiscountsForProduct = async (productId: number) => {
    if (!productId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await trpc.productTierDiscount.getByProductId.query({ productId });
      tierDiscounts.value = result.filter(discount => discount.isActive);
    } catch (err) {
      console.error('Failed to fetch tier discounts:', err);
      error.value = err instanceof Error ? err : new Error('Failed to fetch tier discounts');
    } finally {
      isLoading.value = false;
    }
  };

  // Lấy danh sách giá theo bậc cho biến thể sản phẩm
  const fetchTierDiscountsForVariant = async (variantId: number) => {
    if (!variantId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await trpc.productTierDiscount.getByVariantId.query({ variantId });
      tierDiscounts.value = result.filter(discount => discount.isActive);
    } catch (err) {
      console.error('Failed to fetch tier discounts:', err);
      error.value = err instanceof Error ? err : new Error('Failed to fetch tier discounts');
    } finally {
      isLoading.value = false;
    }
  };

  // Lấy phần trăm giảm giá cho số lượng
  const getDiscountForQuantity = async (productId: number | null, variantId: number | null, quantity: number) => {
    if ((!productId && !variantId) || quantity <= 0) return 0;
    
    try {
      return await trpc.productTierDiscount.getDiscountForQuantity.query({
        productId,
        variantId,
        quantity
      });
    } catch (err) {
      console.error('Failed to get discount for quantity:', err);
      return 0;
    }
  };

  // Tính giá sau khi áp dụng giảm giá theo bậc
  const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
    if (!originalPrice || !discount) return originalPrice;
    return originalPrice * (1 - discount / 100);
  };

  // Hiển thị giá sau khi áp dụng giảm giá
  const formatDiscountedPrice = (originalPrice: number, discount: number) => {
    const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
    return formatPrice(discountedPrice);
  };

  // Lấy bậc giá phù hợp nhất cho số lượng
  const getBestTierForQuantity = (quantity: number) => {
    if (!tierDiscounts.value.length || quantity <= 0) return null;
    
    // Sắp xếp giảm dần theo số lượng tối thiểu để lấy bậc cao nhất phù hợp
    const sortedDiscounts = [...tierDiscounts.value].sort((a, b) => b.minQuantity - a.minQuantity);
    
    // Tìm bậc giá đầu tiên có số lượng tối thiểu <= số lượng yêu cầu
    return sortedDiscounts.find(tier => tier.minQuantity <= quantity) || null;
  };

  // Tính toán số tiền tiết kiệm được
  const calculateSavings = (originalPrice: number, quantity: number, discount: number) => {
    if (!originalPrice || !quantity || !discount) return 0;
    return (originalPrice * quantity * discount) / 100;
  };

  // Hiển thị số tiền tiết kiệm được
  const formatSavings = (originalPrice: number, quantity: number, discount: number) => {
    const savings = calculateSavings(originalPrice, quantity, discount);
    return formatPrice(savings);
  };

  return {
    tierDiscounts,
    isLoading,
    error,
    fetchTierDiscountsForProduct,
    fetchTierDiscountsForVariant,
    getDiscountForQuantity,
    calculateDiscountedPrice,
    formatDiscountedPrice,
    getBestTierForQuantity,
    calculateSavings,
    formatSavings
  };
} 