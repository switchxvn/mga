<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next';
import { ArrowRight } from 'lucide-vue-next';
import { computed } from 'vue';
import { useLocalization } from '../../../composables/useLocalization';
import { getLocalizedRoute } from '../../../utils/routes';

interface ServiceTranslation {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  locale: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  serviceId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Service {
  id: number;
  icon: string;
  order: number;
  isActive: boolean;
  translations: ServiceTranslation[];
  currentTranslation?: ServiceTranslation;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CardStyle {
  background?: string;
  shadow?: string;
  border?: string;
  rounded?: string;
  padding?: string;
  transition?: string;
}

interface IconStyle {
  size?: string;
  background?: string;
  color?: string;
  rounded?: string;
  padding?: string;
}

interface TextStyle {
  size?: string;
  weight?: string;
  color?: string;
  margin?: string;
}

interface Props {
  service: Service;
  showIcon?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showButton?: boolean;
  buttonText?: string;
  buttonVariant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link';
  cardStyle?: CardStyle;
  iconStyle?: IconStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

const props = defineProps<Props>();

const { locale, t } = useLocalization();

const currentTranslation = computed(() => {
  return props.service.translations.find(t => t.locale === locale.value) || props.service.translations[0];
});

const serviceUrl = computed(() => {
  const translation = currentTranslation.value;
  const slug = translation?.slug || props.service.id.toString();
  return getLocalizedRoute('SERVICE_DETAIL', locale.value, { slug });
});

// Convert kebab-case to PascalCase for icon names
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Get icon component dynamically
const getIconComponent = (iconName: string) => {
  const pascalCaseName = toPascalCase(iconName);
  return (LucideIcons as any)[pascalCaseName] || LucideIcons.HelpCircle; // Fallback to HelpCircle if icon not found
};
</script>

<template>
  <div
    class="service-card bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg flex flex-col items-stretch relative pt-12"
    :style="{
      background: cardStyle?.background,
      boxShadow: cardStyle?.shadow,
      border: cardStyle?.border,
      borderRadius: cardStyle?.rounded,
      padding: cardStyle?.padding || '2rem',
      transition: cardStyle?.transition,
    }"
  >
    <div
      v-if="showIcon"
      class="icon-wrapper absolute left-1/2 -translate-x-1/2 -top-8"
      :style="{
        width: iconStyle?.size || '80px',
        height: iconStyle?.size || '80px',
        background: iconStyle?.background || 'rgb(var(--color-primary-50))',
        color: iconStyle?.color || 'rgb(var(--color-primary-500))',
        borderRadius: iconStyle?.rounded || '9999px',
        padding: iconStyle?.padding || '1.25rem',
      }"
    >
      <component 
        :is="getIconComponent(service.icon)"
        class="service-icon"
      />
    </div>

    <div class="flex-1 text-center pt-4 pb-8">
      <NuxtLink 
        v-if="showTitle" 
        :to="serviceUrl"
        class="block"
      >
        <h3
          class="title text-gray-900 dark:text-white"
          :style="{
            fontSize: titleStyle?.size || '1.25rem',
            fontWeight: titleStyle?.weight || '600',
            color: titleStyle?.color,
            margin: titleStyle?.margin || '0 0 1rem 0',
          }"
        >
          {{ currentTranslation?.title }}
        </h3>
      </NuxtLink>

      <p
        v-if="showDescription"
        class="description text-gray-600 dark:text-gray-400 line-clamp-3"
        :style="{
          fontSize: descriptionStyle?.size || '1rem',
          color: descriptionStyle?.color,
          margin: descriptionStyle?.margin || '0',
          minHeight: '4.5rem',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
          lineHeight: '1.5',
        }"
      >
        {{ currentTranslation?.shortDescription || currentTranslation?.description }}
      </p>
    </div>

    <div class="relative w-full -mb-[1px]">
      <NuxtLink
        v-if="showButton"
        :to="serviceUrl"
        :class="[
          'absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 font-medium transition-all duration-200 rounded-full flex items-center justify-center gap-2 text-sm py-2 px-6',
          buttonVariant === 'outline' 
            ? 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 bg-white dark:bg-gray-900'
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        ]"
      >
        <span>{{ buttonText || t('common.viewDetails') }}</span>
        <ArrowRight class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.service-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgb(var(--color-background));
  margin-top: 2rem; // Add space for the icon

  &:hover {
    button {
      transform: translate(-50%, calc(50% - 2px));
    }
  }
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgb(var(--color-primary-50));
  color: rgb(var(--color-primary-500));
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 4px solid rgb(var(--color-background));
  transition: transform 0.2s ease-in-out;

  .service-card:hover & {
    transform: translateY(-2px) translateX(-50%);
  }

  .service-icon {
    width: 32px;
    height: 32px;
  }
}

.title {
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.25rem;
  color: rgb(var(--color-gray-900));
}

.description {
  color: rgb(var(--color-gray-600));
  line-height: 1.5;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
}

.dark {
  .service-card {
    background: rgb(var(--color-gray-900));
  }

  .title {
    color: rgb(var(--color-white));
  }

  .description {
    color: rgb(var(--color-gray-400));
  }
}
</style> 