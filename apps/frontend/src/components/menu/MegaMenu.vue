<!-- MegaMenu component -->
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
  console.log('MegaMenu - Processing item:', props.item);
  
  // Ensure we have children to process
  if (!props.item?.children?.length) {
    console.log('MegaMenu - No children available');
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

      console.log('Level 2 items for subtitle', subtitle.id, ':', level2Items);

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

  console.log('Direct level 2 items:', directLevel2Items);

  // If we have direct level 2 items, add them as a section without subtitle
  if (directLevel2Items.length > 0) {
    level1Items.push({
      subtitle: null,
      items: directLevel2Items
    });
  }

  console.log('MegaMenu - Final structure:', level1Items);
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
  <div
    v-if="menuStructure.length > 0"
    class="absolute left-1/2 z-50 mt-4 w-screen max-w-max -translate-x-1/2"
  >
    <!-- Arrow -->
    <div class="absolute -top-[10px] left-1/2 h-[20px] w-[28px] -translate-x-1/2">
      <div 
        class="absolute h-full w-full bg-white dark:bg-neutral-900"
        style="clip-path: polygon(50% 20%, 0 100%, 100% 100%); border-left: 1px solid var(--navbar-border); border-right: 1px solid var(--navbar-border); border-bottom: 1px solid var(--navbar-border);"
      ></div>
    </div>
    
    <!-- Content -->
    <div class="relative mt-2 rounded-lg bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5">
      <div class="relative p-2 min-w-[200px]">
        <div 
          v-for="(section, index) in menuStructure" 
          :key="section?.subtitle?.id || index"
          class="mb-4 last:mb-0"
        >
          <!-- Subtitle (Level 1) -->
          <div 
            v-if="section?.subtitle"
            class="px-4 py-2 font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase"
          >
            {{ section.subtitle.translation.label }}
          </div>

          <!-- Menu Items (Level 2) -->
          <ul v-if="section.items.length > 0" class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <li
              v-for="item in section.items"
              :key="item.id"
              class="[&:last-child]:border-none"
            >
              <NuxtLink
                :to="item.translation.href"
                class="group flex items-center justify-between px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800 transition duration-150 ease-in-out"
                @click="handleLinkClick"
              >
                <span>{{ item.translation.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="absolute left-1/2 z-50 mt-4 w-screen max-w-max -translate-x-1/2">
      <div class="relative mt-2 rounded-lg bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5">
        <div class="px-4 py-2 text-sm text-neutral-500">
          No menu items available
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0) translateX(-50%);
}
</style> 