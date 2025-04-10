<!-- Milestone section for about page -->
<script setup lang="ts">
import { computed } from 'vue';

interface Milestone {
  year: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface Props {
  settings: {
    milestoneLayout?: string;
    milestones?: Milestone[];
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    animation?: {
      enabled: boolean;
      type: string;
      duration: number;
      delay: number;
    };
  };
  translations: {
    title: string;
    subtitle?: string;
    content?: string;
    data?: {
      milestones?: Milestone[];
    };
  };
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({}),
  translations: () => ({ title: '' })
});

const sectionStyle = computed(() => ({
  backgroundColor: props.settings.backgroundColor || 'transparent',
  color: props.settings.textColor || 'inherit',
  padding: props.settings.padding || '4rem 0'
}));

const milestones = computed(() => {
  return props.translations.data?.milestones || props.settings.milestones || [];
});

const isTimelineLayout = computed(() => {
  return props.settings.milestoneLayout === 'timeline';
});
</script>

<template>
  <section 
    class="w-full"
    :style="sectionStyle"
    :data-aos="settings.animation?.enabled ? settings.animation.type : null"
    :data-aos-duration="settings.animation?.duration"
    :data-aos-delay="settings.animation?.delay"
  >
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ translations.title }}
        </h2>
        <p v-if="translations.subtitle" class="text-xl text-muted-foreground">
          {{ translations.subtitle }}
        </p>
        <div v-if="translations.content" class="prose dark:prose-invert mx-auto mt-4" v-html="translations.content"></div>
      </div>

      <div v-if="isTimelineLayout" class="relative">
        <!-- Timeline Line -->
        <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary"></div>

        <!-- Milestone Items -->
        <div class="space-y-12">
          <div
            v-for="(milestone, index) in milestones"
            :key="milestone.year"
            class="relative flex items-center"
            :class="{ 'flex-row-reverse': index % 2 === 0 }"
            :data-aos="settings.animation?.enabled ? 'fade-up' : null"
            :data-aos-delay="settings.animation?.delay + (index * 100)"
          >
            <!-- Year Bubble -->
            <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span class="text-primary-foreground text-sm font-bold">{{ milestone.year }}</span>
            </div>

            <!-- Content -->
            <div class="w-5/12" :class="{ 'ml-auto': index % 2 === 0 }">
              <div class="bg-card text-card-foreground rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-2">{{ milestone.title }}</h3>
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

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(milestone, index) in milestones"
          :key="milestone.year"
          class="bg-card text-card-foreground rounded-lg shadow-md p-6"
          :data-aos="settings.animation?.enabled ? 'fade-up' : null"
          :data-aos-delay="settings.animation?.delay + (index * 100)"
        >
          <div class="text-primary text-2xl font-bold mb-3">{{ milestone.year }}</div>
          <h3 class="text-xl font-semibold mb-2">{{ milestone.title }}</h3>
          <p v-if="milestone.description" class="text-muted-foreground mb-4">
            {{ milestone.description }}
          </p>
          <img
            v-if="milestone.imageUrl"
            :src="milestone.imageUrl"
            :alt="milestone.title"
            class="rounded-lg w-full h-auto"
          />
        </div>
      </div>
    </div>
  </section>
</template> 