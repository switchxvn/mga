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

  const updateNavbarVariables = () => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (isDark.value && settings.darkMode) {
      root.style.setProperty('--navbar-header-bg', settings.darkMode.headerBackgroundColor || '#171717');
      root.style.setProperty('--navbar-menu-bg', settings.darkMode.menuBackgroundColor || '#171717');
      root.style.setProperty('--navbar-text', settings.darkMode.textColor || '#ffffff');
      root.style.setProperty('--navbar-border', settings.darkMode.borderColor || '#404040');
    } else {
      root.style.setProperty('--navbar-header-bg', settings.headerBackgroundColor || '#ffffff');
      root.style.setProperty('--navbar-menu-bg', settings.menuBackgroundColor || '#ffffff');
      root.style.setProperty('--navbar-text', settings.textColor || '#000000');
      root.style.setProperty('--navbar-border', settings.borderColor || '#e5e7eb');
    }
  };

  const getMenuBackgroundColor = computed(() => {
    return isDark.value
      ? processColorValue(settings.darkMode?.menuBackgroundColor || '#171717')
      : processColorValue(settings.menuBackgroundColor || '#ffffff');
  });

  const getTextColor = computed(() => {
    return isDark.value
      ? processColorValue(settings.darkMode?.textColor || '#ffffff')
      : processColorValue(settings.textColor || '#000000');
  });

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
    getMenuBackgroundColor,
    getTextColor,
    processColorValue
  };
}; 