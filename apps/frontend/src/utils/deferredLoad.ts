type StopDeferredLoad = () => void;

export const deferUntilVisible = (
  target: HTMLElement | null | undefined,
  callback: () => void,
  options: IntersectionObserverInit = { rootMargin: '200px 0px' },
): StopDeferredLoad => {
  if (typeof window === 'undefined' || !target) {
    return () => {};
  }

  let hasRun = false;
  let cleanup: StopDeferredLoad = () => {};

  const run = () => {
    if (hasRun) return;
    hasRun = true;
    cleanup();
    callback();
  };

  if (!('IntersectionObserver' in window)) {
    run();
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
      run();
    }
  }, options);

  observer.observe(target);
  cleanup = () => observer.disconnect();

  return cleanup;
};

export const deferUntilFirstScroll = (callback: () => void): StopDeferredLoad => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let hasRun = false;

  const run = () => {
    if (hasRun) return;
    hasRun = true;
    window.removeEventListener('scroll', handleScroll);
    callback();
  };

  const handleScroll = () => {
    run();
  };

  if (window.scrollY > 0) {
    run();
    return () => {};
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};
