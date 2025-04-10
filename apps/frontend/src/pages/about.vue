<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useLocalization } from "../composables/useLocalization";
import { useTrpc } from '~/composables/useTrpc';

const { t, locale } = useLocalization();
const trpc = useTrpc();

// Fetch data using tRPC
const sections = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Helper function to get translation by locale
const getTranslation = (translations: any[] | undefined, fallback: any) => {
  if (!translations || !Array.isArray(translations) || translations.length === 0) return fallback;
  const translation = translations.find(t => t?.locale === locale.value);
  return translation || translations.find(t => t?.locale === 'en') || fallback;
};

// Computed properties for translated content
const translatedSections = computed(() => {
  if (!sections.value) return [];
  
  return sections.value.map(section => {
    if (!section) return null;
    const translation = getTranslation(section.translations, {});
    return {
      ...section,
      title: translation?.title || section.title,
      subtitle: translation?.subtitle || '',
      content: translation?.content || '',
      data: translation?.data || {}
    };
  }).filter(Boolean);
});

// Helper function to get team members from section data
const teamMembers = computed(() => {
  const teamSection = translatedSections.value.find(section => section.type === 'team');
  if (!teamSection || !teamSection.settings || !teamSection.settings.teamMembers) return [];
  return teamSection.settings.teamMembers;
});

// Helper function to get milestones from section data
const milestones = computed(() => {
  const milestoneSection = translatedSections.value.find(section => section.type === 'milestone');
  if (!milestoneSection || !milestoneSection.settings || !milestoneSection.settings.milestones) return [];
  return milestoneSection.settings.milestones;
});

// Helper function to get hero section
const heroSection = computed(() => {
  return translatedSections.value.find(section => section.type === 'hero');
});

const fetchData = async () => {
  try {
    console.log('Fetching about sections with locale:', locale.value);
    isLoading.value = true;
    error.value = null;

    const data = await trpc.about.getActiveSections.query(locale.value);
    console.log('Received data:', data);

    if (!data || data.length === 0) {
      error.value = 'No active about sections found';
      return;
    }

    sections.value = data;

  } catch (e) {
    console.error('Error fetching about sections:', e);
    error.value = 'Failed to load about sections';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Watch for locale changes and refetch data
watch(locale, () => {
  fetchData();
});
</script>

<template>
  <div class="about w-full">
    <div v-if="isLoading" class="container mx-auto py-10 px-4">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
      ></div>
      <p class="mt-4">{{ t("common.loading") }}</p>
    </div>

    <div v-else-if="error" class="container mx-auto py-10 px-4">
      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Hero Section - Full Width -->
      <div
        v-if="heroSection"
        class="w-full bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-16"
        :style="{
          backgroundImage: heroSection.settings?.heroBackgroundImage ? `url(${heroSection.settings.heroBackgroundImage})` : '',
          height: heroSection.settings?.heroHeight || '500px',
          position: 'relative'
        }"
      >
        <div 
          v-if="heroSection.settings?.heroBackgroundImage"
          class="absolute inset-0 bg-black"
          :style="{ opacity: heroSection.settings?.heroOverlayOpacity || 0.5 }"
        ></div>
        <div class="container mx-auto px-4 text-center relative z-10">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            {{ heroSection.title }}
          </h1>
          <p
            v-if="heroSection.subtitle"
            class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
          >
            {{ heroSection.subtitle }}
          </p>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="container mx-auto px-4 py-16">
        <div class="space-y-16">
          <div
            v-for="section in translatedSections.filter(s => s.type === 'content')"
            :key="section.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
          >
            <h2 class="text-2xl font-semibold mb-6">
              {{ section.title }}
            </h2>

            <div class="flex flex-col md:flex-row gap-8" :class="{
              'md:flex-row-reverse': section.settings?.contentLayout === 'image-text',
              'md:flex-row': section.settings?.contentLayout === 'text-image'
            }">
              <!-- Text Content -->
              <div class="flex-1" v-if="section.content || section.settings?.contentLayout !== 'image-only'">
                <div
                  class="prose dark:prose-invert max-w-none"
                  v-html="section.content"
                ></div>
              </div>

              <!-- Media Content -->
              <div 
                v-if="section.settings?.imageUrl || section.settings?.contentLayout !== 'text-only'" 
                class="flex-1"
                :style="{ width: section.settings?.imageWidth || '50%' }"
              >
                <img
                  v-if="section.settings?.imageUrl"
                  :src="section.settings.imageUrl"
                  :alt="section.title"
                  class="rounded-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members Section - Full Width Background -->
      <div
        v-if="teamMembers.length > 0"
        class="w-full bg-gray-50 dark:bg-gray-900/50 py-16"
      >
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-10">
            {{ t("about.team.title") }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              v-for="member in teamMembers"
              :key="member.id || member.name"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center"
            >
              <img
                v-if="member.imageUrl"
                :src="member.imageUrl"
                :alt="member.name"
                class="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 class="text-xl font-semibold mb-2">{{ member.name }}</h3>
              <p class="text-primary mb-3">
                {{ member.position }}
              </p>
              <p v-if="member.bio" class="text-muted-foreground text-sm mb-4">
                {{ member.bio }}
              </p>

              <!-- Social Links -->
              <div v-if="member.socialLinks" class="flex justify-center space-x-4">
                <a
                  v-for="(url, platform) in member.socialLinks"
                  :key="platform"
                  :href="url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground hover:text-primary transition-colors"
                >
                  <i :class="'fab fa-' + platform"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Milestones Section -->
      <div v-if="milestones.length > 0" class="container mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold text-center mb-10">
          {{ t("about.milestones.title") }}
        </h2>
        <div class="relative">
          <!-- Timeline Line -->
          <div
            class="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary"
          ></div>

          <!-- Milestone Items -->
          <div class="space-y-12">
            <div
              v-for="(milestone, index) in milestones"
              :key="milestone.id || index"
              class="relative flex items-center"
              :class="{ 'flex-row-reverse': index % 2 === 0 }"
            >
              <!-- Year Bubble -->
              <div
                class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
              >
                <span class="text-primary-foreground text-sm font-bold">{{
                  milestone.year
                }}</span>
              </div>

              <!-- Content -->
              <div class="w-5/12" :class="{ 'ml-auto': index % 2 === 0 }">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 class="text-xl font-semibold mb-2">
                    {{ milestone.title }}
                  </h3>
                  <p v-if="milestone.description" class="text-muted-foreground">
                    {{ milestone.description }}
                  </p>
                  <img
                    v-if="milestone.imageUrl"
                    :src="milestone.imageUrl"
                    :alt="milestone.title"
                    class="mt-4 rounded-lg w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
