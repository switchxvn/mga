import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import Pagination from './Pagination.vue';

const locale = ref('vi');
const translate = vi.fn((key: string, params?: Record<string, unknown>) => {
  const messages: Record<string, string> = {
    'pagination.showing': 'Hiển thị',
    'pagination.to': 'đến',
    'pagination.of': 'trong số',
    'pagination.results': 'kết quả',
    'pagination.previous': 'Trang trước',
    'pagination.next': 'Trang sau',
    'pagination.goToPage': 'Đi đến trang {page}',
    'pagination.navigation': 'Điều hướng phân trang',
  };

  const message = messages[key] || key;
  return Object.entries(params || {}).reduce(
    (result, [paramKey, value]) => result.replace(`{${paramKey}}`, String(value)),
    message,
  );
});

vi.mock('~/composables/useLocalization', () => ({
  useLocalization: () => ({
    t: translate,
    locale,
  }),
}));

describe('Pagination', () => {
  beforeEach(() => {
    translate.mockClear();
    locale.value = 'vi';
  });

  it('renders the total summary through i18n keys instead of hardcoded copy', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 13,
        itemsPerPage: 12,
        modelValue: 1,
      },
    });

    expect(wrapper.text()).toContain('Hiển thị 1-12 trong số 13 kết quả');
    expect(translate).toHaveBeenCalledWith('pagination.showing');
    expect(translate).toHaveBeenCalledWith('pagination.of');
    expect(translate).toHaveBeenCalledWith('pagination.results');
  });

  it('localizes navigation aria labels', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 24,
        itemsPerPage: 12,
        modelValue: 1,
      },
    });

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Điều hướng phân trang');
    expect(wrapper.find('button[aria-current="page"]').attributes('aria-label')).toBe('Đi đến trang 1');
    expect(wrapper.find('button[aria-label="Trang sau"]').exists()).toBe(true);
  });
});
