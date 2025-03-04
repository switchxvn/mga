<template>
  <div>
    <div v-if="loading">Loading SEO data...</div>
    <div v-else-if="error">{{ error }}</div>
    <!-- Your page content -->
  </div>
</template>

<script setup lang="ts">
const { getSeoByPath, loading, error } = useSeo();

// Fetch SEO data for homepage
const seo = await getSeoByPath('/');

// Manually update SEO tags if needed
if (seo) {
  useHead({
    title: seo.title,
    meta: [
      { name: 'description', content: seo.description },
      // Open Graph
      { property: 'og:title', content: seo.ogTitle || seo.title },
      { property: 'og:description', content: seo.ogDescription || seo.description },
      { property: 'og:image', content: seo.ogImage },
      // Keywords
      { name: 'keywords', content: seo.keywords },
      // Robots
      { name: 'robots', content: seo.robotsTxt },
    ].filter(meta => meta.content),
    link: [
      ...(seo.canonicalUrl ? [{ rel: 'canonical', href: seo.canonicalUrl }] : []),
    ],
  });
}
</script> 