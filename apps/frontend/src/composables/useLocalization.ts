import { useI18n } from '#imports';
import { useRoute, useRouter } from '#imports';
import { computed } from '#imports';

export function useLocalization() {
  const { t, locale, locales, setLocale } = useI18n();
  const route = useRoute();
  const router = useRouter();

  // Danh sách ngôn ngữ có sẵn
  const availableLocales = computed(() => {
    return (locales.value as any[]).map((l) => ({
      code: l.code,
      name: l.name,
    }));
  });

  // Ngôn ngữ hiện tại
  const currentLocale = computed(() => {
    return locale.value;
  });

  // Thay đổi ngôn ngữ và cập nhật URL
  const switchLanguage = async (localeCode: string) => {
    // Lưu locale hiện tại
    const oldLocale = locale.value;
    
    // Thay đổi locale
    await setLocale(localeCode);
    
    // Nếu route hiện tại có locale prefix, cập nhật URL
    if (route.path.startsWith(`/${oldLocale}/`) && oldLocale !== localeCode) {
      const newPath = route.path.replace(`/${oldLocale}/`, `/${localeCode}/`);
      await router.push(newPath);
    }
  };

  return {
    t,
    locale: currentLocale,
    locales: availableLocales,
    switchLanguage,
  };
} 