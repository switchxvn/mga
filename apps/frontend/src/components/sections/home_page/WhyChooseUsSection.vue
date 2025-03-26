<script setup lang="ts">
import { computed } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

interface WhyChooseUsItem {
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseUsConfig {
  title: string;
  description: string;
  layout: 'grid';
  columns: number;
  items: WhyChooseUsItem[];
  gap: string;
  background: {
    light: string;
    dark: string;
  };
  border: {
    light: string;
    dark: string;
  };
  padding: {
    top: string;
    bottom: string;
  };
  cardStyle: {
    height: string;
    padding: string;
    textAlign: string;
    background: {
      dark: string;
      light: string;
    };
    transition: string;
  };
  headerStyle: {
    background: {
      light: string;
      dark: string;
    };
    title: {
      fontSize: string;
      useUppercase: boolean;
      color: {
        light: string;
        dark: string;
      };
    };
  };
  iconStyle: {
    height: string;
    color: {
      light: string;
      dark: string;
    };
    margin: string;
    hexagon: {
      size: string;
      background: {
        light: string;
        dark: string;
      };
      border: {
        width: string;
        gradient: {
          from: string;
          to: string;
        };
      };
      padding: string;
    };
  };
  titleStyle: {
    size: string;
    weight: string;
    fontWeight: string;
    color: {
      light: string;
      dark: string;
    };
    margin: string;
    textTransform: string;
  };
  descriptionStyle: {
    size: string;
    color: {
      light: string;
      dark: string;
    };
    margin: string;
    maxWidth: string;
    padding: string;
    border: {
      width: string;
      style: string;
      color: {
        light: string;
        dark: string;
      };
      radius: string;
    };
  };
}

interface Props {
  config?: Partial<WhyChooseUsConfig>;
}

const defaultConfig: WhyChooseUsConfig = {
  title: '',
  description: '',
  layout: 'grid',
  columns: 5,
  items: [],
  gap: '2rem',
  background: {
    light: '#FFFFFF',
    dark: '#1a1a1a'
  },
  border: {
    light: '#FFFFFF',
    dark: '#FFFFFF'
  },
  padding: {
    top: '2rem',
    bottom: '2rem'
  },
  cardStyle: {
    height: 'auto',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    background: {
      dark: 'transparent',
      light: 'transparent'
    },
    transition: 'all 0.3s ease'
  },
  headerStyle: {
    background: {
      light: 'bg-primary-600',
      dark: 'dark:bg-primary-500'
    },
    title: {
      fontSize: 'text-2xl sm:text-3xl',
      useUppercase: true,
      color: {
        light: 'text-white',
        dark: 'text-white'
      }
    }
  },
  iconStyle: {
    height: '4rem',
    color: {
      light: '#017399',
      dark: '#FFFFFF'
    },
    margin: '0 auto 1.5rem auto',
    hexagon: {
      size: '4rem',
      background: {
        light: '#FFFFFF',
        dark: '#1a1a1a'
      },
      border: {
        width: '0.2rem',
        gradient: {
          from: '#017399',
          to: '#FFFFFF'
        }
      },
      padding: '0.2rem'
    }
  },
  titleStyle: {
    size: 'xl',
    weight: 'bold',
    fontWeight: '700',
    color: {
      light: '#111827',
      dark: '#F9FAFB'
    },
    margin: '0 0 1rem 0',
    textTransform: 'uppercase'
  },
  descriptionStyle: {
    size: 'base',
    color: {
      light: '#333333',
      dark: '#FFFFFF'
    },
    margin: '0',
    maxWidth: '100%',
    padding: '0',
    border: {
      width: '0',
      style: 'none',
      color: {
        light: 'transparent',
        dark: 'transparent'
      },
      radius: '0'
    }
  }
};

const props = withDefaults(defineProps<Props>(), {
  config: () => ({})
});

// Merge default config with provided config
const mergedConfig = computed(() => ({
  ...defaultConfig,
  ...props.config
}));

// Computed styles for grid
const gridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${mergedConfig.value.columns}, minmax(0, 1fr))`,
  gap: mergedConfig.value.gap
}));

// Function to get Lucide icon component
const getIconComponent = (iconName: string) => {
  return (LucideIcons as any)[iconName] || null;
};
</script>

<template>
  <section 
    class="why-choose-us-section"
    :style="{
      paddingTop: mergedConfig.padding.top,
      paddingBottom: mergedConfig.padding.bottom
    }"
  >
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="mb-8" :class="mergedConfig.headerStyle.background.light">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between gap-4 py-3">
            <div class="w-32 hidden sm:block"><!-- Spacer --></div>
            <div class="category-header flex-1 text-center">
              <h2 
                class="inline-flex items-center px-4 py-2 mobile-title"
                :class="[
                  mergedConfig.headerStyle.title.fontSize,
                  'font-bold',
                  mergedConfig.headerStyle.title.color.light,
                  mergedConfig.headerStyle.title.useUppercase ? 'uppercase' : ''
                ]"
              >
                {{ mergedConfig.title }}
              </h2>
            </div>
            <div class="w-32"><!-- Spacer --></div>
          </div>
        </div>
      </div>
      
      <!-- Items Grid -->
      <div 
        class="grid"
        :style="gridStyles"
      >
        <div
          v-for="(item, index) in mergedConfig.items"
          :key="index"
          class="why-choose-us-card"
          :style="{
            padding: mergedConfig.cardStyle.padding,
            textAlign: mergedConfig.cardStyle.textAlign as any,
            background: mergedConfig.cardStyle.background.light,
            transition: mergedConfig.cardStyle.transition
          }"
        >
          <div class="card-content">
            <!-- Icon with Hexagon Border -->
            <div class="icon-wrapper">
              <div class="hexagon-container">
                <div 
                  class="hexagon-border"
                  :style="{
                    '--hexagon-size': mergedConfig.iconStyle.hexagon.size,
                    '--border-width': mergedConfig.iconStyle.hexagon.border.width,
                    '--gradient-from': mergedConfig.iconStyle.hexagon.border.gradient.from,
                    '--gradient-to': mergedConfig.iconStyle.hexagon.border.gradient.to,
                    '--bg-light': mergedConfig.iconStyle.hexagon.background.light,
                    '--bg-dark': mergedConfig.iconStyle.hexagon.background.dark,
                    '--icon-color': mergedConfig.iconStyle.color.light
                  }"
                >
                  <component 
                    :is="getIconComponent(item.icon)"
                    class="icon"
                  />
                </div>
              </div>
            </div>

            <!-- Title -->
            <h3 
              class="item-title"
              :style="{
                fontSize: `var(--text-${mergedConfig.titleStyle.size})`,
                fontWeight: mergedConfig.titleStyle.fontWeight,
                color: mergedConfig.titleStyle.color.light,
                margin: mergedConfig.titleStyle.margin,
                textTransform: mergedConfig.titleStyle.textTransform as any,
                minHeight: '2.5em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }"
            >
              {{ item.title }}
            </h3>

            <!-- Description -->
            <p 
              class="item-description"
              :style="{
                fontSize: `var(--text-${mergedConfig.descriptionStyle.size})`,
                color: mergedConfig.descriptionStyle.color.light,
                margin: mergedConfig.descriptionStyle.margin,
                maxWidth: mergedConfig.descriptionStyle.maxWidth,
                padding: mergedConfig.descriptionStyle.padding,
                minHeight: '4.8em',
                display: '-webkit-box',
                '-webkit-line-clamp': '3',
                '-webkit-box-orient': 'vertical',
                overflow: 'hidden'
              }"
            >
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.why-choose-us-section {
  background-color: v-bind('mergedConfig.background.light');

  :deep(.dark) & {
    background-color: v-bind('mergedConfig.background.dark');

    .why-choose-us-card {
      background: v-bind('mergedConfig.cardStyle.background.dark');
    }

    .item-title {
      color: v-bind('mergedConfig.titleStyle.color.dark');
    }

    .item-description {
      color: v-bind('mergedConfig.descriptionStyle.color.dark');
    }

    .icon-wrapper {
      .hexagon-border {
        background: v-bind('mergedConfig.iconStyle.hexagon.background.dark');
      }
      
      svg {
        color: v-bind('mergedConfig.iconStyle.color.dark');
      }
    }
  }

  .category-header {
    @media (max-width: 640px) {
      text-align: left !important;
      
      h2.mobile-title {
        font-size: 0.875rem !important;
        line-height: 1.25rem !important;
        padding: 0.375rem 0 !important;
        justify-content: flex-start !important;
        letter-spacing: 0.025em !important;
        font-weight: 600 !important;
      }
    }
  }

  .grid {
    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    
    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    @media (max-width: 640px) {
      grid-template-columns: 1fr !important;
    }
  }
}

.why-choose-us-card {
  text-align: center;
  display: flex;
  align-items: stretch;
  justify-content: center;

  &:hover {
    transform: translateY(-4px);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: v-bind('mergedConfig.iconStyle.margin');

  .hexagon-container {
    position: relative;
    width: var(--hexagon-size);
    height: calc(var(--hexagon-size) * 0.866); // Perfect hexagon ratio
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hexagon-border {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before,
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, var(--gradient-from), var(--gradient-to));
      clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
      z-index: 1;
    }

    &::after {
      margin: var(--border-width);
      background: var(--bg-light);
      z-index: 2;

      :deep(.dark) & {
        background: var(--bg-dark);
      }
    }

    .icon {
      position: relative;
      z-index: 3;
      width: calc(var(--hexagon-size) * 0.5); // Icon size is 50% of hexagon
      height: calc(var(--hexagon-size) * 0.5);
      color: var(--icon-color);
      padding: calc(var(--hexagon-size) * 0.1); // Padding is 10% of hexagon size
    }
  }
}

.item-description {
  text-align: center;
  line-height: 1.6;
}
</style> 