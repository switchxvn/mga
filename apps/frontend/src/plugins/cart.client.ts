export default defineNuxtPlugin(async () => {
  console.log('🛒 Cart Plugin - Starting cart initialization');
  
  const { $pinia } = useNuxtApp();
  const { useCartStore } = await import('~/stores/cart');
  
  // Get cart store instance
  const cartStore = useCartStore($pinia);
  
  // Initialize cart once at app startup
  try {
    await cartStore.initialize();
    
    // Setup user watcher for login/logout handling
    cartStore.setupUserWatcher();
    
    console.log('🛒 Cart Plugin - Cart initialized successfully');
  } catch (error) {
    console.error('🛒 Cart Plugin - Error initializing cart:', error);
  }
  
  // Provide cart store globally
  return {
    provide: {
      cartStore
    }
  };
}); 