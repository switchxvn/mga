// Plugin để đảm bảo các thẻ meta được render đúng cách
export default defineNuxtPlugin({
  name: 'seo-meta-plugin',
  enforce: 'pre', // Chạy trước các plugin khác
  setup() {
    const route = useRoute();
    
    // Set default meta tags during SSR
    useHead({
      htmlAttrs: {
        lang: 'vi'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:url', content: process.client ? window.location.href : `https://captreonuisam.com${route.fullPath}` }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    });

    // Set default SEO meta
    useSeoMeta({
      ogType: 'website',
      twitterCard: 'summary_large_image'
    });

    // Sử dụng useHead để đảm bảo các thẻ meta mặc định được render
    useHead({
      meta: [
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      script: [
        {
          // Thêm script để đảm bảo các thẻ meta được render đúng cách
          innerHTML: `
            // Đảm bảo các thẻ meta được render đúng cách
            document.addEventListener('DOMContentLoaded', function() {
              // Kiểm tra xem các thẻ meta đã được render chưa
              const ogTitle = document.querySelector('meta[property="og:title"]');
              const ogDescription = document.querySelector('meta[property="og:description"]');
              
              if (!ogTitle) {
                // Nếu chưa có og:title, sử dụng title
                const title = document.querySelector('title');
                if (title) {
                  const metaOgTitle = document.createElement('meta');
                  metaOgTitle.setAttribute('property', 'og:title');
                  metaOgTitle.setAttribute('content', title.textContent || '');
                  document.head.appendChild(metaOgTitle);
                  console.log('Added missing og:title');
                }
              }
              
              if (!ogDescription) {
                // Nếu chưa có og:description, sử dụng description
                const description = document.querySelector('meta[name="description"]');
                if (description) {
                  const metaOgDescription = document.createElement('meta');
                  metaOgDescription.setAttribute('property', 'og:description');
                  metaOgDescription.setAttribute('content', description.getAttribute('content') || '');
                  document.head.appendChild(metaOgDescription);
                  console.log('Added missing og:description');
                }
              }
              
              // Đảm bảo có og:url
              const ogUrl = document.querySelector('meta[property="og:url"]');
              if (!ogUrl) {
                const metaOgUrl = document.createElement('meta');
                metaOgUrl.setAttribute('property', 'og:url');
                metaOgUrl.setAttribute('content', window.location.href);
                document.head.appendChild(metaOgUrl);
                console.log('Added missing og:url');
              }
            });
          `,
          tagPosition: 'bodyClose'
        }
      ]
    })
  }
}) 