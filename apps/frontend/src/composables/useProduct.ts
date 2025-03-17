import { computed } from 'vue';
import type { Product, ProductTranslation } from '@ew/shared';
import { useLocalization } from './useLocalization';
import { getLocalizedRoute } from '../utils/routes';

export function useProduct() {
  const { locale } = useLocalization();

  /**
   * Get translation by locale
   */
  const getTranslationByLocale = (product: Product, targetLocale: string = locale.value): ProductTranslation | null => {
    if (!product.translations || product.translations.length === 0) {
      return null;
    }

    const found = product.translations.find(t => t.locale === targetLocale);
    return found || product.translations[0];
  };

  /**
   * Get product URL based on locale
   */
  const getProductUrl = (product: Product): string => {
    const translation = getTranslationByLocale(product);
    const slug = translation?.slug || product.id.toString();
    return getLocalizedRoute('PRODUCT_DETAIL', locale.value, { slug });
  };

  /**
   * Format price in VND
   */
  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  /**
   * Calculate discount percentage
   */
  const calculateDiscountPercentage = (price: number | null, comparePrice: number | null): number | null => {
    if (!comparePrice || !price) return null;
    const discount = ((comparePrice - price) / comparePrice) * 100;
    return Math.round(discount);
  };

  return {
    getTranslationByLocale,
    getProductUrl,
    formatPrice,
    calculateDiscountPercentage
  };
} 