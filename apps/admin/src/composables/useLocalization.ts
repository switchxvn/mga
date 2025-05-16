import { useI18n } from 'vue-i18n';
import { ref, computed, reactive } from 'vue';
import type { Composer } from 'vue-i18n';

export type SupportedLocale = 'en' | 'vi';

interface LocaleOption {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

export const useLocalization = () => {
  // Sử dụng try-catch để xử lý trường hợp i18n chưa được khởi tạo
  let i18n: Composer | undefined;
  try {
    i18n = useI18n();
  } catch (error) {
    console.warn('i18n not initialized yet, using fallback');
  }

  const currentLocaleCode = ref<SupportedLocale>('en');
  
  const availableLocales = ref<LocaleOption[]>([
    { code: 'en', name: 'English', nativeName: 'English', flag: '/images/flag/us.svg' },
    { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '/images/flag/vn.svg' }
  ]);

  const currentLocale = computed(() => {
    if (i18n) {
      return availableLocales.value.find(l => l.code === i18n.locale.value) || availableLocales.value[0];
    }
    return availableLocales.value.find(l => l.code === currentLocaleCode.value) || availableLocales.value[0];
  });

  const setLocale = (localeCode: SupportedLocale) => {
    // Lưu ngôn ngữ vào localStorage để duy trì giữa các phiên
    if (process.client) {
      localStorage.setItem('locale', localeCode);
    }
    
    // Cập nhật locale trong i18n nếu đã khởi tạo
    if (i18n) {
      i18n.locale.value = localeCode;
    }
    
    // Luôn cập nhật giá trị local
    currentLocaleCode.value = localeCode;
  };

  // Alias for setLocale that matches frontend API
  const switchLanguage = (localeCode: SupportedLocale) => {
    return setLocale(localeCode);
  };

  // Hàm tiện ích để lấy chuỗi dịch với các tham số
  const translate = (key: string, params?: Record<string, any>) => {
    if (i18n) {
      return i18n.t(key, params || {});
    }
    return key; // Fallback khi i18n chưa sẵn sàng
  };

  // Hàm tiện ích để lấy chuỗi dịch từ một namespace cụ thể
  const translateFromNamespace = (namespace: string, key: string, params?: Record<string, any>) => {
    if (!i18n) return key;
    
    const messages = i18n.tm(namespace);
    if (messages && typeof messages === 'object' && key in messages) {
      const translation = messages[key];
      if (typeof translation === 'string') {
        // Xử lý các tham số nếu có
        if (params) {
          // Sửa lỗi linter về phương thức replace
          return Object.entries(params).reduce(
            (acc: string, entry: [string, any]) => {
              const [paramKey, paramValue] = entry;
              return acc.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
            },
            translation
          );
        }
        return translation;
      }
    }
    return key; // Trả về key nếu không tìm thấy bản dịch
  };

  // Khởi tạo ngôn ngữ từ localStorage nếu có
  const initLocale = () => {
    if (process.client) {
      const savedLocale = localStorage.getItem('locale') as SupportedLocale | null;
      if (savedLocale && availableLocales.value.some(l => l.code === savedLocale)) {
        if (i18n) {
          i18n.locale.value = savedLocale;
        }
        currentLocaleCode.value = savedLocale;
      }
    }
  };

  return {
    locale: i18n ? i18n.locale : currentLocaleCode,
    locales: availableLocales,
    currentLocale,
    setLocale,
    switchLanguage,
    t: translate,
    translateFromNamespace,
    initLocale
  };
}; 