export default defineNuxtPlugin(async () => {
  const { $pinia } = useNuxtApp();
  const { useCartStore } = await import('~/stores/cart');
  
  // Get cart store instance
  const cartStore = useCartStore($pinia as any);
  
  // Initialize cart once at app startup
  try {
    await cartStore.initialize();
  } catch (error) {
    console.error('Error initializing cart:', error);
  }
  
  // Provide cart store globally
  return {
    provide: {
      cartStore
    }
  };
}); 