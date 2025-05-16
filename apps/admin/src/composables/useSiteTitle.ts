import { useHead } from '#imports';
import { computed } from 'vue';
import { useLocalization } from './useLocalization';
import { useI18n } from 'vue-i18n';

export const useSiteTitle = (titleKey: string, params?: Record<string, any>) => {
  const { t } = useLocalization();
  
  // Truy cập trực tiếp vào i18n để kiểm tra
  let i18n;
  try {
    i18n = useI18n();
  } catch (error) {
    console.warn('i18n not initialized yet');
  }
  
  const fullTitle = computed(() => {
    // Truy cập trực tiếp vào messages để lấy bản dịch
    let pageTitle = '';
    
    if (i18n) {
      const messages = i18n.messages.value;
      const locale = i18n.locale.value;
      
      // Kiểm tra cấu trúc của messages
      console.log('Current locale:', locale);
      console.log('Available keys in head:', Object.keys(messages[locale]?.head || {}));
      
      // Thử lấy bản dịch từ head
      if (titleKey.startsWith('head.')) {
        const key = titleKey.substring(5); // Bỏ 'head.' ở đầu
        pageTitle = messages[locale]?.head?.[key];
      } else if (titleKey.includes('.')) {
        // Xử lý key dạng 'categories.createCategory'
        const parts = titleKey.split('.');
        if (parts.length === 2) {
          const namespace = parts[0];
          const key = parts[1];
          
          // Thử lấy từ head trước
          pageTitle = messages[locale]?.head?.[titleKey];
          
          // Nếu không có, thử lấy từ namespace
          if (!pageTitle && messages[locale]?.[namespace]) {
            pageTitle = messages[locale][namespace][key];
          }
        }
      } else {
        // Key đơn giản, thử lấy từ head
        pageTitle = messages[locale]?.head?.[titleKey];
      }
    }
    
    // Nếu không tìm thấy bằng cách truy cập trực tiếp, thử dùng t()
    if (!pageTitle) {
      pageTitle = t(titleKey, params);
      
      // Nếu vẫn không có, thử thêm tiền tố 'head.'
      if (!pageTitle && !titleKey.startsWith('head.')) {
        pageTitle = t(`head.${titleKey}`, params);
      }
    }
    
    // Lấy hậu tố từ file ngôn ngữ
    const adminPageSuffix = t('common.adminPageSuffix');
    
    // Log để debug
    console.log(`Title for key "${titleKey}":`, pageTitle || titleKey);
    
    // Trả về kết quả hoặc key gốc nếu không tìm thấy bản dịch
    return `${pageTitle || titleKey} ${adminPageSuffix}`;
  });
  
  useHead({
    title: fullTitle
  });
  
  return {
    title: fullTitle
  };
}; 