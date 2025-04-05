import { computed, watch } from 'vue';
import { useDarkMode } from '~/composables/useDarkMode';
import { useCssColorValue } from '~/composables/useColorUtils';

interface NavbarSettings {
  // Header section settings
  headerBackgroundColor?: string;
  slogan?: {
    text: string;
    subText: string;
    additionalText: string;
    fontSize: string;
    fontWeight: string;
  };
  hotlines?: {
    sales: {
      text: string;
      number: string;
      textColor?: string;
      backgroundColor?: string;
    };
    support: {
      text: string;
      number: string;
      textColor?: string;
      backgroundColor?: string;
    };
  };
  
  // Menu section settings
  menuBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  menuAlignment?: string;
  
  // Global settings
  showLanguageSwitcher?: boolean;
  showThemeToggle?: boolean;
  showCart?: boolean;
  mobileMenuBreakpoint?: string;

  // Dark mode settings
  darkMode?: {
    headerBackgroundColor?: string;
    menuBackgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };

  // Navigation settings
  navigation?: {
    textColor?: string;
    fontWeight?: string;
    activeTextColor?: string;
  };

  // Top menu settings
  topMenu?: {
    links: {
      label: string;
      href: string;
      textColor: string;
      hoverColor: string;
      isTranslated: boolean;
    }[];
  };
}

export const useNavbarSettings = (settings: NavbarSettings = {}) => {
  const { isDark } = useDarkMode();
  const { processColorValue } = useCssColorValue();

  // Computed properties for all color values
  const headerBackgroundColor = computed(() => 
    isDark.value
      ? processColorValue(settings.darkMode?.headerBackgroundColor || '#171717')
      : processColorValue(settings.headerBackgroundColor || '#ffffff')
  );

  const menuBackgroundColor = computed(() => 
    isDark.value
      ? processColorValue(settings.darkMode?.menuBackgroundColor || '#171717')
      : processColorValue(settings.menuBackgroundColor || '#ffffff')
  );

  const textColor = computed(() => 
    isDark.value
      ? processColorValue(settings.darkMode?.textColor || '#ffffff')
      : processColorValue(settings.textColor || '#000000')
  );

  const borderColor = computed(() => 
    isDark.value
      ? processColorValue(settings.darkMode?.borderColor || '#404040')
      : processColorValue(settings.borderColor || '#e5e7eb')
  );

  const navigationTextColor = computed(() => 
    processColorValue(settings.navigation?.textColor || 'var(--tertiary-500)')
  );

  const navigationActiveTextColor = computed(() => 
    processColorValue(settings.navigation?.activeTextColor || 'var(--primary-500)')
  );

  const updateNavbarVariables = () => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--navbar-header-bg', headerBackgroundColor.value);
    root.style.setProperty('--navbar-menu-bg', menuBackgroundColor.value);
    root.style.setProperty('--navbar-text', textColor.value);
    root.style.setProperty('--navbar-border', borderColor.value);
  };

  watch(isDark, () => {
    updateNavbarVariables();
  });

  watch(() => settings, () => {
    updateNavbarVariables();
  }, { deep: true });

  return {
    isDark,
    settings,
    updateNavbarVariables,
    headerBackgroundColor,
    menuBackgroundColor,
    textColor,
    borderColor,
    navigationTextColor,
    navigationActiveTextColor,
    processColorValue
  };
}; 