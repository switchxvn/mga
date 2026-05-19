export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/categories' && !to.path.startsWith('/categories/')) {
    return;
  }

  const redirectedPath = to.path.replace(/^\/categories/, '/danh-muc-san-pham');

  return navigateTo(
    {
      path: redirectedPath,
      query: to.query,
      hash: to.hash,
    },
    { redirectCode: 301 },
  );
});
