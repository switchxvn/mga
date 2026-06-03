import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferUntilFirstScroll, deferUntilVisible } from './deferredLoad';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  callback: IntersectionObserverCallback;
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

describe('deferredLoad helpers', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  it('runs the callback only after the target enters the viewport', () => {
    const callback = vi.fn();
    const target = document.createElement('div');

    const stop = deferUntilVisible(target, callback);

    expect(callback).not.toHaveBeenCalled();
    expect(MockIntersectionObserver.instances).toHaveLength(1);

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger([{ isIntersecting: false, target }]);
    expect(callback).not.toHaveBeenCalled();

    observer.trigger([{ isIntersecting: true, target }]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);

    observer.trigger([{ isIntersecting: true, target }]);
    expect(callback).toHaveBeenCalledTimes(1);

    stop();
    expect(observer.disconnect).toHaveBeenCalledTimes(2);
  });

  it('runs the callback only once on the first scroll event', () => {
    const callback = vi.fn();

    const stop = deferUntilFirstScroll(callback);

    expect(callback).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('scroll'));
    expect(callback).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('scroll'));
    expect(callback).toHaveBeenCalledTimes(1);

    stop();
  });
});
