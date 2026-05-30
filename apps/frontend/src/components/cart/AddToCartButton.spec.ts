import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AddToCartButton from './AddToCartButton.vue';

const addToCart = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
const translate = vi.fn((key: string) => {
  const messages: Record<string, string> = {
    'common.addToCart': 'Them vao gio hang',
    'common.decreaseQuantity': 'Giam so luong',
    'common.increaseQuantity': 'Tang so luong',
    'common.success': 'Thanh cong',
    'common.error': 'Co loi',
  };

  return messages[key] || key;
});

vi.mock('~/composables/useCart', () => ({
  useCart: () => ({
    addToCart,
    isCartEnabled: true,
  }),
}));

vi.mock('~/composables/useTrpc', () => ({
  useTrpc: () => ({}),
}));

vi.mock('~/composables/useNotificationToast', () => ({
  useNotificationToast: () => ({
    success: toastSuccess,
    error: toastError,
  }),
}));

vi.mock('~/composables/useLocalization', () => ({
  useLocalization: () => ({
    t: translate,
  }),
}));

describe('AddToCartButton', () => {
  beforeEach(() => {
    addToCart.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
    translate.mockClear();
  });

  it('adds an accessible name to icon-only add to cart buttons', () => {
    const wrapper = mount(AddToCartButton, {
      props: {
        product: {
          id: 1,
          title: 'Bom thuy luc 2 tan',
          price: 1250000,
        },
        iconOnly: true,
        showQuantity: false,
      },
      slots: {
        default: '<svg aria-hidden="true"></svg>',
      },
      global: {
        stubs: {
          ProductVariantModal: true,
        },
      },
    });

    expect(wrapper.get('button.add-to-cart-button').attributes('aria-label')).toBe('Them vao gio hang: Bom thuy luc 2 tan');
  });

  it('labels quantity controls for screen readers', () => {
    const wrapper = mount(AddToCartButton, {
      props: {
        product: {
          id: 1,
          title: 'Bom thuy luc 2 tan',
          price: 1250000,
          stock: 3,
        },
      },
      global: {
        stubs: {
          ProductVariantModal: true,
        },
      },
    });

    const quantityButtons = wrapper.findAll('button.quantity-btn');

    expect(quantityButtons).toHaveLength(2);
    expect(quantityButtons[0].attributes('aria-label')).toBe('Giam so luong');
    expect(quantityButtons[1].attributes('aria-label')).toBe('Tang so luong');
  });
});
