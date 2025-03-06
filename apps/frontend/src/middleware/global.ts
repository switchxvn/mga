export default defineNuxtRouteMiddleware((to) => {
  // Chuyển hướng từ /posts đến /bai-viet
  if (to.path === '/posts') {
    return navigateTo('/bai-viet', { redirectCode: 301 });
  }

  // Chuyển hướng từ /posts/[slug] đến /bai-viet/[slug]
  if (to.path.startsWith('/posts/')) {
    const slug = to.path.replace('/posts/', '');
    return navigateTo(`/bai-viet/${slug}`, { redirectCode: 301 });
  }

  // Chuyển hướng từ /products đến /san-pham
  if (to.path === '/products') {
    return navigateTo('/san-pham', { redirectCode: 301 });
  }

  // Chuyển hướng từ /products/[slug] đến /san-pham/[slug]
  if (to.path.startsWith('/products/')) {
    const slug = to.path.replace('/products/', '');
    return navigateTo(`/san-pham/${slug}`, { redirectCode: 301 });
  }
}); 