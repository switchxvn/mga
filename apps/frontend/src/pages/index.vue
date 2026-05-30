<script setup lang="ts">
import { useHomePage } from '../composables/useHomePage';

const { 
  themeSections, 
  isLoading, 
  error, 
  resolveComponent,
  getSectionConfig
} = await useHomePage();

const heroSectionTypes = new Set(['hero', 'hero_full_width']);
const heroComponentNames = new Set(['HeroSection', 'HeroSectionFullWidth']);
const companyIntroSectionTypes = new Set(['company_intro']);
const companyIntroComponentNames = new Set(['CompanyIntroSection']);

const isHeroSection = (section: { type?: string; componentName?: string | null }) =>
  heroSectionTypes.has(section.type || '') ||
  (section.componentName ? heroComponentNames.has(section.componentName) : false);

const isCompanyIntroSection = (section: { type?: string; componentName?: string | null }) =>
  companyIntroSectionTypes.has(section.type || '') ||
  (section.componentName ? companyIntroComponentNames.has(section.componentName) : false);

const getSemanticHeadingProps = (
  section: { id: number; type?: string; componentName?: string | null },
) => {
  if (!isHeroSection(section)) {
    if (isCompanyIntroSection(section)) {
      return {
        titleTag: 'h1',
      };
    }

    return {};
  }

  return {
    titleTag: 'h2',
    fallbackTitleTag: 'div',
  };
};
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900">
    <template v-if="isLoading">
      <div class="space-y-10 px-4 py-6">
        <HeroSkeleton overlay-card />
        <CardGridSkeleton :item-count="4" :columns="4" />
        <CardGridSkeleton :item-count="3" :columns="3" />
      </div>
    </template>
    <template v-else-if="error">
      <div class="container mx-auto px-4 py-12 text-center">
        {{ error }}
      </div>
    </template>
    <template v-else>
      <template v-if="themeSections && themeSections.length > 0">
        <template v-for="(section, index) in themeSections" :key="`section-${section.id}-${index}`">
          <component
            v-if="section.isActive"
            :is="resolveComponent(section)"
            :section="section"
            :config="getSectionConfig(section)"
            v-bind="getSemanticHeadingProps(section)"
          />
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/components/HomePage.scss" as *;
</style> 
