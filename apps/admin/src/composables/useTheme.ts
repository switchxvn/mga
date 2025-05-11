import { ref, watch, computed } from 'vue';
import { useTrpc } from './useTrpc';
import { useDark } from '@vueuse/core';
import type { RouterOutput } from '../types/trpc';

type Theme = RouterOutput['theme']['getActiveTheme'];

type ColorShades = {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
};

type ColorMode = {
  primary: ColorShades;
  secondary: ColorShades;
  tertiary: ColorShades;
  yellow?: ColorShades;
};

interface ThemeColors {
  light: ColorMode;
  dark: ColorMode;
}

// Default theme colors as fallback
const defaultColors: ThemeColors = {
  light: {
    primary: {
      '50': '#fff7e6',
      '100': '#ffe9b3',
      '200': '#ffdb80',
      '300': '#ffcd4d',
      '400': '#fec02a',
      '500': '#feb914',
      '600': '#e6a912',
      '700': '#cc960f',
      '800': '#b3840d',
      '900': '#99710b'
    },
    secondary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a'
    },
    tertiary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a'
    },
    yellow: {
      '50': '#fffde7',
      '100': '#fff9c4',
      '200': '#fff59d',
      '300': '#fff176',
      '400': '#ffee58',
      '500': '#ffeb3b',
      '600': '#fdd835',
      '700': '#fbc02d',
      '800': '#f9a825',
      '900': '#f57f17'
    }
  },
  dark: {
    primary: {
      '50': '#fff7e6',
      '100': '#ffe9b3',
      '200': '#ffdb80',
      '300': '#ffcd4d',
      '400': '#fec02a',
      '500': '#cc960f',
      '600': '#b3840d',
      '700': '#997109',
      '800': '#805f08',
      '900': '#664c06'
    },
    secondary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a'
    },
    tertiary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a'
    },
    yellow: {
      '50': '#fffde7',
      '100': '#fff9c4',
      '200': '#fff59d',
      '300': '#fff176',
      '400': '#ffee58',
      '500': '#ffeb3b',
      '600': '#fdd835',
      '700': '#fbc02d',
      '800': '#f9a825',
      '900': '#f57f17'
    }
  }
};

const activeTheme = ref<Theme | null>(null);
let initialized = false;

// Kiểm tra xem CSS variables đã được set chưa
const areCssVariablesInitialized = () => {
  if (typeof window === 'undefined') return false;
  
  // Kiểm tra một số biến CSS cụ thể đã được set chưa
  const primaryVar = window.getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-500');
  
  return !!primaryVar.trim();
};

export function useTheme() {
  const trpc = useTrpc();
  const isDark = useDark({
    initialValue: 'light'
  });
  
  const updateCssVariables = (themeColors: ThemeColors) => {
    if (typeof window === 'undefined') return;

    const mode = isDark.value ? 'dark' : 'light';
    const currentColors = themeColors[mode];

    try {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
          `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : 
          null;
      };

      // Update primary colors
      Object.entries(currentColors.primary).forEach(([shade, color]) => {
        const rgb = hexToRgb(color);
        if (rgb) {
          document.documentElement.style.setProperty(`--color-primary-${shade}`, rgb);
          document.documentElement.style.setProperty(`--primary-${shade}`, rgb);
        }
      });

      // Update secondary colors
      Object.entries(currentColors.secondary).forEach(([shade, color]) => {
        const rgb = hexToRgb(color);
        if (rgb) document.documentElement.style.setProperty(`--color-secondary-${shade}`, rgb);
      });

      // Update tertiary colors
      Object.entries(currentColors.tertiary).forEach(([shade, color]) => {
        const rgb = hexToRgb(color);
        if (rgb) document.documentElement.style.setProperty(`--color-tertiary-${shade}`, rgb);
      });

      // Update yellow colors if available
      if (currentColors.yellow) {
        Object.entries(currentColors.yellow).forEach(([shade, color]) => {
          const rgb = hexToRgb(color);
          if (rgb) {
            document.documentElement.style.setProperty(`--color-yellow-${shade}`, rgb);
            document.documentElement.style.setProperty(`--yellow-${shade}`, rgb);
          }
        });
        document.documentElement.style.setProperty('--yellow', currentColors.yellow['500']);
      }

      // Update semantic colors
      const updateSemanticColor = (name: string, color: string) => {
        const rgb = hexToRgb(color);
        if (rgb) document.documentElement.style.setProperty(`--${name}`, rgb);
      };

      // Background and foreground
      updateSemanticColor('background', isDark.value ? currentColors.secondary['900'] : '#ffffff');
      updateSemanticColor('foreground', isDark.value ? currentColors.secondary['50'] : currentColors.secondary['900']);
      
      // Card
      updateSemanticColor('card', isDark.value ? currentColors.secondary['800'] : '#ffffff');
      updateSemanticColor('card-foreground', isDark.value ? currentColors.secondary['50'] : currentColors.secondary['900']);
      
      // Popover
      updateSemanticColor('popover', isDark.value ? currentColors.secondary['800'] : '#ffffff');
      updateSemanticColor('popover-foreground', isDark.value ? currentColors.secondary['50'] : currentColors.secondary['900']);
      
      // Primary
      updateSemanticColor('primary', currentColors.primary['500']);
      updateSemanticColor('primary-foreground', isDark.value ? currentColors.secondary['900'] : '#ffffff');
      
      // Secondary
      updateSemanticColor('secondary', currentColors.secondary['200']);
      updateSemanticColor('secondary-foreground', currentColors.secondary['900']);
      
      // Muted
      updateSemanticColor('muted', isDark.value ? currentColors.secondary['800'] : currentColors.secondary['100']);
      updateSemanticColor('muted-foreground', isDark.value ? currentColors.secondary['400'] : currentColors.secondary['500']);
      
      // Accent
      updateSemanticColor('accent', isDark.value ? currentColors.secondary['800'] : currentColors.secondary['100']);
      updateSemanticColor('accent-foreground', currentColors.primary['900']);
      
      // Border and Input
      updateSemanticColor('border', isDark.value ? currentColors.secondary['800'] : currentColors.secondary['200']);
      updateSemanticColor('input', isDark.value ? currentColors.secondary['800'] : currentColors.secondary['200']);
      updateSemanticColor('ring', currentColors.primary['500']);

      // Set CSS color variables for direct HEX values
      updateSemanticColor('primary-hex', currentColors.primary['500']);
      updateSemanticColor('primary-hex-dark', currentColors.primary['600']);
      updateSemanticColor('primary-hex-light', currentColors.primary['400']);

    } catch (error) {
      console.error('Error updating CSS variables:', error);
    }
  };

  const initializeTheme = async () => {
    // Nếu đã khởi tạo và CSS variables đã được set, không cần khởi tạo lại
    if (initialized && areCssVariablesInitialized()) {
      return activeTheme.value;
    }

    // Luôn áp dụng theme mặc định ngay lập tức để tránh nhấp nháy
    if (typeof window !== 'undefined') {
      updateCssVariables(defaultColors);
    }

    try {
      const response = await trpc.theme.getActiveTheme.query();
      
      if (response) {
        activeTheme.value = response;
        initialized = true;
        
        if (response.colors && typeof window !== 'undefined') {
          // Áp dụng theme từ API ngay lập tức
          updateCssVariables(response.colors as unknown as ThemeColors);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      // Đảm bảo khi lỗi vẫn đánh dấu là đã initialized để không gọi lại liên tục
      initialized = true;
      return null;
    }
  };

  // Watch for dark mode changes
  if (typeof window !== 'undefined') {
    watch(isDark, () => {
      const colors = activeTheme.value?.colors as unknown as ThemeColors || defaultColors;
      updateCssVariables(colors);
    });
  }

  return {
    theme: activeTheme,
    isDark,
    initializeTheme,
    updateCssVariables
  };
} 