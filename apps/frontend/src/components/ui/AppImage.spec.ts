import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import AppImage from './AppImage.vue';

const NuxtImgStub = defineComponent({
  name: 'NuxtImg',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      default: undefined,
    },
    sizes: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () =>
      h('img', {
        ...attrs,
        src: props.src,
        alt: props.alt,
        'data-format': props.format,
        'data-sizes': props.sizes,
        class: ['nuxt-img-stub', attrs.class],
      });
  },
});

const WrappedNuxtImgStub = defineComponent({
  name: 'NuxtImg',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },
  setup(props, { attrs }) {
    return () =>
      h('div', { class: 'nuxt-img-wrapper' }, [
        h('img', {
          src: props.src,
          alt: props.alt,
          class: ['nuxt-img-inner', attrs.class],
        }),
      ]);
  },
});

const DelayedNuxtImgStub = defineComponent({
  name: 'NuxtImg',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showImage: false,
    };
  },
  async mounted() {
    await nextTick();
    this.showImage = true;
  },
  render() {
    return h('div', { class: 'nuxt-img-delayed-wrapper' }, this.showImage
      ? [
          h('img', {
            src: this.src,
            alt: this.alt,
            class: 'nuxt-img-delayed-inner',
          }),
        ]
      : []);
  },
});

describe('AppImage', () => {
  it('keeps whitelisted CDN images on the NuxtImg/IPX path', () => {
    const wrapper = mount(AppImage, {
      props: {
        src: 'https://cdn.mgavietnam.com/products/xe-nang-dau-mga-3-0-tan.jpg',
        alt: 'Forklift image',
      },
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.find('.nuxt-img-stub').exists()).toBe(true);
  });

  it('keeps the rendered image visible even before a load event arrives', () => {
    const wrapper = mount(AppImage, {
      props: {
        src: 'https://images.unsplash.com/photo-123',
        alt: 'Example image',
      },
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.find('.nuxt-img-stub').classes()).not.toContain('opacity-0');
  });

  it('does not pass an invalid multi-format string to NuxtImg by default', () => {
    const wrapper = mount(AppImage, {
      props: {
        src: 'https://images.unsplash.com/photo-456',
        alt: 'Example image',
      },
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.find('.nuxt-img-stub').attributes('data-format')).toBeUndefined();
  });

  it('does not forward native HTML sizes syntax into the NuxtImg sizes prop', () => {
    const wrapper = mount(AppImage, {
      props: {
        src: 'https://images.unsplash.com/photo-456',
        alt: 'Example image',
        sizes: '(max-width: 768px) 100vw, 50vw',
      },
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.find('.nuxt-img-stub').attributes('data-sizes')).toBeUndefined();
  });

  it('applies consumer classes to the rendered image element', () => {
    const wrapper = mount(AppImage, {
      attrs: {
        class: 'consumer-image-class',
      },
      props: {
        src: 'https://images.unsplash.com/photo-789',
        alt: 'Example image',
      },
      global: {
        stubs: {
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.find('.nuxt-img-stub').classes()).toContain('consumer-image-class');
  });

  it('clears the loading overlay when a nested NuxtImg image fires a native load event', async () => {
    const wrapper = mount(AppImage, {
      props: {
        src: 'https://cdn.mgavietnam.com/banner/5.jpg',
        alt: 'Hero image',
      },
      global: {
        stubs: {
          NuxtImg: WrappedNuxtImgStub,
        },
      },
    });

    expect(wrapper.html()).toContain('animate-pulse');
    await nextTick();
    await nextTick();

    await wrapper.find('.nuxt-img-inner').trigger('load');
    await nextTick();

    expect(wrapper.html()).not.toContain('animate-pulse');
  });

  it('recovers when the NuxtImg inner image is inserted after AppImage mounts', async () => {
    const wrapper = mount(AppImage, {
      props: {
        src: 'https://cdn.mgavietnam.com/banner/6.jpg',
        alt: 'Delayed hero image',
      },
      global: {
        stubs: {
          NuxtImg: DelayedNuxtImgStub,
        },
      },
    });

    expect(wrapper.html()).toContain('animate-pulse');

    await nextTick();
    await nextTick();

    expect(wrapper.find('.nuxt-img-delayed-inner').exists()).toBe(true);

    await wrapper.find('.nuxt-img-delayed-inner').trigger('load');
    await nextTick();

    expect(wrapper.html()).not.toContain('animate-pulse');
  });
});
