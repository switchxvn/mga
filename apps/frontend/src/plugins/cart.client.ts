export default defineNuxtPlugin({
  name: 'cart-client',
  dependsOn: ['trpc'],
  async setup(nuxtApp) {
    const { $pinia } = useNuxtApp();
    const { useCartStore } = await import('~/stores/cart');
    
    const cartStore = useCartStore($pinia as any);

    nuxtApp.hook('app:mounted', () => {
      const initializeCart = async () => {
        try {
          await cartStore.initialize();
        } catch (error) {
          console.error('Error initializing cart:', error);
        }
      };

      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => {
          void initializeCart();
        }, { timeout: 1500 });
        return;
      }

      window.setTimeout(() => {
        void initializeCart();
      }, 200);
    });
    
    return {
      provide: {
        cartStore
      }
    };
  },
}); 
