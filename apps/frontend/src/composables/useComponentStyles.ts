import { ref } from 'vue';
import { trpc } from '../utils/trpc';
import { useTheme } from './useTheme';

interface StyleConfig {
  imageHeight: number;
  showLabels: {
    featured: boolean;
    new: boolean;
    sale: boolean;
    discount: boolean;
  };
  labelStyles: {
    featured: {
      backgroundColor: string;
      textColor: string;
    };
    new: {
      backgroundColor: string;
      textColor: string;
    };
    sale: {
      backgroundColor: string;
      textColor: string;
    };
    discount: {
      backgroundColor: string;
      textColor: string;
    };
  };
}

interface ComponentStyleConfig {
  id: number;
  themeId: number;
  type: string;
  title: string;
  settings: StyleConfig;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ApiConfig {
  id: number;
  themeId: number;
  type: string;
  title: string;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  theme?: any;
}

// Lưu trữ style configs toàn cục
const styleConfigs = ref<Map<string, ComponentStyleConfig>>(new Map());
let initialized = false;

// Default configs cho từng loại component
const defaultConfigs: Record<string, ComponentStyleConfig> = {
  'product-card': {
    id: 0,
    themeId: 1,
    type: 'product-card',
    title: 'Product Card Style Configuration',
    settings: {
      imageHeight: 192,
      showLabels: {
        featured: true,
        new: true,
        sale: true,
        discount: true
      },
      labelStyles: {
        featured: {
          backgroundColor: '#f59e0b',
          textColor: '#ffffff'
        },
        new: {
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        },
        sale: {
          backgroundColor: '#ef4444',
          textColor: '#ffffff'
        },
        discount: {
          backgroundColor: '#ef4444',
          textColor: '#ffffff'
        }
      }
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

export function useComponentStyles() {
  const getStyleConfig = (type: string): ComponentStyleConfig => {
    return styleConfigs.value.get(type) || defaultConfigs[type];
  };

  const initializeStyles = async () => {
    if (initialized) return;

    try {
      const { getActiveTheme } = useTheme();
      const activeTheme = getActiveTheme();
      
      if (!activeTheme) {
        throw new Error('No active theme found');
      }

      // Lấy tất cả component styles cho theme hiện tại
      const configs = await trpc.componentStyleConfig.byThemeId.query(activeTheme.id) as ApiConfig[];
      
      // Cập nhật vào map
      configs.forEach(apiConfig => {
        const defaultConfig = defaultConfigs[apiConfig.type];
        if (defaultConfig) {
          // Merge với default config để đảm bảo không thiếu thuộc tính
          styleConfigs.value.set(apiConfig.type, {
            ...apiConfig,
            settings: {
              ...defaultConfig.settings,
              ...apiConfig.settings
            }
          } as ComponentStyleConfig);
        }
      });

      initialized = true;
    } catch (error) {
      console.error('Failed to initialize component styles:', error);
      // Fallback to default configs if API fails
      Object.entries(defaultConfigs).forEach(([type, config]) => {
        styleConfigs.value.set(type, config);
      });
    }
  };

  return {
    getStyleConfig,
    initializeStyles
  };
} 