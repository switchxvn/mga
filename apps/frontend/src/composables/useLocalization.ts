import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';

export function useLocalization() {
  // Sử dụng useI18n từ vue-i18n
  const i18n = useI18n();
  const route = useRoute();
  const router = useRouter();
  
  // Biến để lưu trữ ngôn ngữ đã chọn
  const selectedLanguage = ref<string | null>(null);

  // Danh sách ngôn ngữ có sẵn
  const availableLocales = computed(() => {
    return [
      { code: 'en', name: 'English' },
      { code: 'vi', name: 'Tiếng Việt' }
    ];
  });

  // Ngôn ngữ hiện tại
  const currentLocale = computed(() => {
    return i18n.locale.value;
  });

  // Thay đổi ngôn ngữ và cập nhật URL
  const switchLanguage = async (localeCode: string) => {
    try {
      // Lưu locale hiện tại
      const oldLocale = i18n.locale.value;
      
      // Thay đổi locale
      i18n.locale.value = localeCode;
      
      // Lưu vào biến ref
      selectedLanguage.value = localeCode;
      
      // Lưu vào localStorage (chỉ ở phía client)
      if (process.client) {
        localStorage.setItem('user-language', localeCode);
      }
      
      // Nếu route hiện tại có locale prefix, cập nhật URL
      if (route.path.startsWith(`/${oldLocale}/`) && oldLocale !== localeCode) {
        const newPath = route.path.replace(`/${oldLocale}/`, `/${localeCode}/`);
        await router.push(newPath);
      }
      
      // Log để debug
      console.log('Language switched to:', localeCode);
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };

  // Khởi tạo ngôn ngữ từ localStorage khi component được tạo
  const initializeLanguage = async () => {
    try {
      let savedLanguage = 'vi'; // Mặc định là tiếng Việt
      
      // Chỉ đọc localStorage ở phía client
      if (process.client) {
        savedLanguage = localStorage.getItem('user-language') || 'vi';
      }
      
      selectedLanguage.value = savedLanguage;
      
      if (savedLanguage !== i18n.locale.value) {
        await switchLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
    }
  };

  return {
    t: i18n.t,
    locale: currentLocale,
    locales: availableLocales,
    switchLanguage,
    initializeLanguage,
    selectedLanguage,
  };
} 