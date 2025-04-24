<!-- MobileMegaMenu component -->
<script setup lang="ts">
import { computed } from 'vue';
import { useLocalization } from '~/composables/useLocalization';

interface MenuItemTranslation {
  id?: number;
  locale: string;
  label: string;
  href: string;
  menuItemId?: number;
}

interface MenuItem {
  id: number;
  defaultLocale: string;
  icon?: string | null;
  order: number;
  level: number;
  isActive: boolean;
  parentId: number | null;
  translations: MenuItemTranslation[];
  children?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  item: MenuItem;
  isActive: boolean;
  onClose?: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

// Get current locale
const { locale } = useLocalization();

// Helper function to get translation
const getTranslation = (item: MenuItem): MenuItemTranslation => {
  if (!item?.translations?.length) {
    return {
      locale: locale.value,
      label: '',
      href: '#'
    };
  }

  const translation = item.translations.find(t => t.locale === locale.value);
  if (translation) {
    return translation;
  }

  const defaultTranslation = item.translations.find(t => t.locale === item.defaultLocale);
  return defaultTranslation || item.translations[0];
};

// Process menu structure recursively
const menuStructure = computed(() => {
  if (!props.item?.children?.length) {
    return [];
  }

  // Get level 1 items
  const level1Items = props.item.children
    .filter(child => child.level === 1 && child.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(subtitle => {
      // Get level 2 items for this subtitle
      const level2Items = subtitle.children
        ?.filter(child => child.level === 2 && child.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(item => ({
          ...item,
          translation: getTranslation(item)
        })) || [];

      return {
        subtitle: {
          ...subtitle,
          translation: getTranslation(subtitle)
        },
        items: level2Items
      };
    });

  // Get direct level 2 items (children of level 0)
  const directLevel2Items = props.item.children
    .filter(child => child.level === 2 && child.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => ({
      ...item,
      translation: getTranslation(item)
    }));

  if (directLevel2Items.length > 0) {
    level1Items.push({
      subtitle: null,
      items: directLevel2Items
    });
  }

  return level1Items;
});

// Handle link click
const handleLinkClick = () => {
  if (props.onClose) {
    props.onClose();
  }
  emit('close');
};
</script>

<template>
  <div class="mobile-mega-menu pl-6 pr-3 py-2 space-y-4">
    <div
      v-for="(section, index) in menuStructure"
      :key="section?.subtitle?.id || index"
      class="space-y-2"
    >
      <!-- Subtitle (Level 1) -->
      <div 
        v-if="section?.subtitle"
        class="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-2"
      >
        {{ section.subtitle.translation.label }}
      </div>

      <!-- Menu Items (Level 2) -->
      <div class="space-y-1">
        <div
          v-for="item in section.items"
          :key="item.id"
          class="mobile-submenu-item"
        >
          <NuxtLink
            :to="item.translation.href"
            class="block py-2 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            @click="handleLinkClick"
          >
            {{ item.translation.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-mega-menu {
  background-color: var(--navbar-menu-bg);
  border-left: 2px solid var(--navbar-border);
  margin-left: 1rem;
}

.mobile-submenu-item {
  @apply border-b border-neutral-200 dark:border-neutral-700 last:border-b-0;
  transition: all 0.3s ease;
}

.mobile-submenu-item:hover {
  transform: translateX(4px);
}

.mobile-submenu-item a {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
}
</style> 