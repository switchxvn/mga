<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { ImageIcon, SaveIcon, XIcon } from 'lucide-vue-next';
import PageHeader from '../../components/common/header/PageHeader.vue';
import { usePermissions } from '../../composables/usePermissions';
import PermissionAlert from '../../components/common/PermissionAlert.vue';
import { useHeroSlider, HeroSliderFormData } from '../../composables/useHeroSlider';
import { useLocalization } from '../../composables/useLocalization';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {};
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

const { t } = useLocalization();

useHead({
  title: t('head.heroSliderCreate')
});

const route = useRoute();
const { checkAuth } = useAuth();
const { hasPermission, isSuperAdmin } = usePermissions();

// Use hero slider composable
const {
  isLoading,
  isSaving,
  error,
  themes,
  isDragging,
  imagePreview,
  fetchThemes,
  handleImageUpload,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  createHeroSlider,
  cancelAndGoBack,
  resetImage
} = useHeroSlider();

// Form data
const formData = reactive<HeroSliderFormData>({
  title: '',
  description: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  order: 0,
  isActive: true,
  themeId: route.query.themeId ? Number(route.query.themeId) : undefined
});

// Check permissions
const userCanManageSliders = computed(() => {
  if (isSuperAdmin.value) return true;
  return hasPermission('MANAGE_THEMES');
});

// Initial load
onMounted(async () => {
  await checkAuth();
  await fetchThemes();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      :title="t('hero_slider.createSlider')"
      :description="t('hero_slider.createDescription', { defaultValue: 'Add a new hero slider to your website' })"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <button
            @click="cancelAndGoBack"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            {{ t('actions.cancel') }}
          </button>
          
          <button
            @click="createHeroSlider(formData)"
            :disabled="isSaving"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon class="h-4 w-4 mr-2" />
            {{ isSaving ? t('common.saving') : t('hero_slider.saveSlider', { defaultValue: 'Save Slider' }) }}
          </button>
        </div>
      </template>
    </PageHeader>


    <!-- Create Form -->
    <div>
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {{ t('hero_slider.sliderDetails') }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {{ t('hero_slider.sliderDetailsDescription', { defaultValue: 'Fill in the details below to create a new hero slider.' }) }}
          </p>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <form @submit.prevent="createHeroSlider(formData)" class="space-y-6">
            <!-- Theme Selection -->
            <div>
              <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.theme') }} *
              </label>
              <select
                id="theme"
                v-model="formData.themeId"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="" disabled selected>{{ t('hero_slider.selectTheme') }}</option>
                <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                  {{ theme.name }}
                </option>
              </select>
            </div>

            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.title') }} *
              </label>
              <input
                type="text"
                id="title"
                v-model="formData.title"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="t('hero_slider.titlePlaceholder', { defaultValue: 'Enter slider title' })"
                required
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.description') }}
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="t('hero_slider.descriptionPlaceholder', { defaultValue: 'Enter slider description' })"
              ></textarea>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.image') }} *
              </label>
              <div
                class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"
                :class="{ 
                  'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700': isDragging,
                  'bg-gray-50 dark:bg-gray-800': !isDragging
                }"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="(event) => handleDrop(event, formData)"
              >
                <div v-if="!imagePreview" class="space-y-1 text-center">
                  <div class="flex justify-center">
                    <ImageIcon class="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <label for="file-upload" class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>{{ t('hero_slider.uploadImage') }}</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/*" @change="(event) => handleImageUpload(event, formData)" />
                    </label>
                    <p class="pl-1">{{ t('hero_slider.orDragDrop', { defaultValue: 'or drag and drop' }) }}</p>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('hero_slider.uploadFormats') }}
                  </p>
                </div>
                <div v-else class="relative">
                  <img :src="imagePreview" alt="Preview" class="max-h-48 mx-auto rounded-md" />
                  <button
                    type="button"
                    @click="resetImage(formData)"
                    class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                  >
                    <XIcon class="h-4 w-4" />
                  </button>
                </div>
                <div v-if="isLoading" class="mt-4 flex justify-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</span>
                </div>
              </div>
            </div>

            <!-- Button Text -->
            <div>
              <label for="buttonText" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.buttonText') }}
              </label>
              <input
                type="text"
                id="buttonText"
                v-model="formData.buttonText"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="t('hero_slider.buttonTextPlaceholder', { defaultValue: 'Enter button text (optional)' })"
              />
            </div>

            <!-- Button Link -->
            <div>
              <label for="buttonLink" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.buttonLink') }}
              </label>
              <input
                type="text"
                id="buttonLink"
                v-model="formData.buttonLink"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="t('hero_slider.buttonLinkPlaceholder', { defaultValue: 'Enter button link URL (optional)' })"
              />
            </div>
            
            <!-- Order -->
            <div>
              <label for="order" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('hero_slider.order') }}
              </label>
              <input
                type="number"
                id="order"
                v-model.number="formData.order"
                min="0"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t('hero_slider.orderHelp', { defaultValue: 'Lower numbers will be displayed first.' }) }}
              </p>
            </div>

            <!-- Is Active -->
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="isActive"
                  type="checkbox"
                  v-model="formData.isActive"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="isActive" class="font-medium text-gray-700 dark:text-gray-300">{{ t('hero_slider.active') }}</label>
                <p class="text-gray-500 dark:text-gray-400">
                  {{ t('hero_slider.activeHelp', { defaultValue: 'Only active sliders will be displayed on the website.' }) }}
                </p>
              </div>
            </div>
          </form>
        </div>

        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            @click="cancelAndGoBack"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {{ t('actions.cancel') }}
          </button>
          <button
            type="button"
            @click="createHeroSlider(formData)"
            :disabled="isSaving"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? t('common.saving') : t('hero_slider.saveSlider', { defaultValue: 'Save Slider' }) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 