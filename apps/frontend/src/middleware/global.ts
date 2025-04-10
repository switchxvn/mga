export default defineNuxtRouteMiddleware((to) => {
  // Nếu có danh-muc trong query params, đảm bảo nó được giữ lại
  if (to.query['danh-muc']) {
    // Nếu path không phải là /bai-viet, chuyển hướng về /bai-viet với danh-muc
    if (to.path !== '/bai-viet') {
      return navigateTo({
        path: '/bai-viet',
        query: to.query
      });
    }
  }
}); 