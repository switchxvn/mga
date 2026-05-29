import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import PostReviewForm from './PostReviewForm.vue';

const locale = ref('vi');
const mutateSubmitReview = vi.fn();
const translate = vi.fn((key: string) =>
  ({
    'validation.required': 'Bat buoc',
    'validation.minLength': 'Toi thieu {min} ky tu',
    'reviews.authorName': 'Ten cua ban',
    'reviews.authorNamePlaceholder': 'Nhap ten cua ban',
    'reviews.professionLabel': 'Nghe nghiep',
    'reviews.professionPlaceholder': 'Nhap nghe nghiep cua ban (khong bat buoc)',
    'reviews.rating': 'Danh gia',
    'reviews.ratingExcellent': 'Xuat sac',
    'reviews.ratingGood': 'Tot',
    'reviews.ratingAverage': 'Trung binh',
    'reviews.ratingPoor': 'Kem',
    'reviews.ratingBad': 'Rat kem',
    'reviews.reviewTitle': 'Tieu de danh gia',
    'reviews.reviewTitlePlaceholder': 'Tom tat trai nghiem cua ban trong mot cau',
    'reviews.reviewContent': 'Noi dung danh gia',
    'reviews.reviewContentPlaceholder': 'Mo ta chi tiet trai nghiem cua ban...',
    'reviews.moderationNotice': 'Danh gia cua ban se duoc hien thi sau khi duoc kiem duyet.',
    'reviews.submitReview': 'Gui danh gia',
  }[key] || key),
);

vi.mock('~/composables/useLocalization', () => ({
  useLocalization: () => ({
    t: translate,
    locale,
  }),
}));

vi.mock('~/composables/useTrpc', () => ({
  useTrpc: () => ({
    review: {
      submitReview: {
        mutate: mutateSubmitReview,
      },
    },
  }),
}));

describe('PostReviewForm', () => {
  beforeEach(() => {
    mutateSubmitReview.mockReset();
    locale.value = 'vi';
  });

  it('validates required minimal fields before submit', async () => {
    const wrapper = mount(PostReviewForm, {
      props: {
        postId: 44,
        locale: 'vi',
      },
      global: {
        stubs: {
          UButton: {
            props: ['loading', 'type'],
            template: '<button :type="type"><slot /></button>',
          },
        },
      },
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(mutateSubmitReview).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Bat buoc');
  });

  it('submits post reviews without serviceTypeId and emits success', async () => {
    mutateSubmitReview.mockResolvedValue({ id: 999 });

    const wrapper = mount(PostReviewForm, {
      props: {
        postId: 44,
        locale: 'vi',
      },
      global: {
        stubs: {
          UButton: {
            props: ['loading', 'type'],
            template: '<button :type="type"><slot /></button>',
          },
        },
      },
    });

    await wrapper.find('input').setValue('Nguyen Van A');
    await wrapper.findAll('input')[2].setValue('Bai viet rat ro');
    await wrapper.find('textarea').setValue('Noi dung bai viet ro rang va giup toi chot phuong an van hanh nhanh hon.');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mutateSubmitReview).toHaveBeenCalledWith({
      authorName: 'Nguyen Van A',
      profession: undefined,
      rating: 5,
      postId: 44,
      translations: [
        {
          locale: 'vi',
          title: 'Bai viet rat ro',
          content: 'Noi dung bai viet ro rang va giup toi chot phuong an van hanh nhanh hon.',
        },
      ],
    });
    expect(wrapper.emitted('success')).toHaveLength(1);
  });
});
