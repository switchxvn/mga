export default defineNuxtPlugin((nuxtApp) => {
  const bootstrapWindow = window as Window & {
    __mgaAppBootstrapInitialized?: boolean;
  };

  if (bootstrapWindow.__mgaAppBootstrapInitialized) {
    return;
  }

  bootstrapWindow.__mgaAppBootstrapInitialized = true;

  const runPrimaryInit = async () => {
    try {
      const [
        { useTheme },
        { useDarkMode },
        { useFavicon },
      ] = await Promise.all([
        import('../composables/useTheme'),
        import('../composables/useDarkMode'),
        import('../composables/useFavicon'),
      ]);

      const { initializeTheme } = useTheme();
      const { initializeDarkMode } = useDarkMode();
      const { initializeFavicon } = useFavicon();

      await initializeTheme();

      try {
        await initializeFavicon();
      } catch {
        // Keep the default favicon when the async override fails.
      }

      initializeDarkMode();
    } catch {
      // Keep the app usable even when bootstrap work fails.
    }
  };

  const runSecondaryInit = async () => {
    try {
      const [
        { useComponentStyles },
        { useFeatureFlags },
        { useSettings },
      ] = await Promise.all([
        import('../composables/useComponentStyles'),
        import('../composables/useFeatureFlags'),
        import('../composables/useSettings'),
      ]);

      const { initializeStyles } = useComponentStyles();
      const { fetchFeatureFlags } = useFeatureFlags();
      const { getPublicSettingValueByKey } = useSettings();

      await initializeStyles();
      await fetchFeatureFlags();
      await getPublicSettingValueByKey('google_tag_manager_id', '');
    } catch {
      // Keep non-critical bootstrap failures from blocking the UI.
    }
  };

  void runPrimaryInit();

  nuxtApp.hook('app:mounted', () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => {
        void runSecondaryInit();
      }, { timeout: 2000 });
      return;
    }

    window.setTimeout(() => {
      void runSecondaryInit();
    }, 300);
  });
});
