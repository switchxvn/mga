import { ref } from 'vue';
import { trpc } from '../utils/trpc';

interface ThemeColors {
  primary: Record<number, string>;
  secondary: Record<number, string>;
  success: Record<number, string>;
  error: Record<number, string>;
  warning: Record<number, string>;
  info: Record<number, string>;
}

interface ThemeSection {
  id: number;
  type: string;
  title: string;
  order: number;
  settings: Record<string, any>;
  isActive: boolean;
}

interface Theme {
  id: number;
  name: string;
  isActive: boolean;
  sections?: ThemeSection[];
  colors?: ThemeColors;
  createdAt: string;
  updatedAt: string;
}

const activeTheme = ref<Theme | null>(null);
let initialized = false;

export function useTheme() {
  const getActiveTheme = () => activeTheme.value;

  const initializeTheme = async () => {
    if (initialized) return;

    try {
      const theme = await trpc.theme.getActiveTheme.query();
      activeTheme.value = theme;
      initialized = true;
      return theme;
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      return null;
    }
  };

  return {
    getActiveTheme,
    initializeTheme
  };
} 