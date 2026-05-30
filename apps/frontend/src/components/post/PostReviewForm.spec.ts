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
    translate.mockReset();
    translate.mockImplementation((key: string) =>
      ({
        'validation.required': 'Bắt buộc',
        'validation.minLength': 'Tối thiểu {min} ký tự',
        'reviews.authorName': 'Tên của bạn',
        'reviews.authorNamePlaceholder': 'Nhập tên của bạn',
        'reviews.professionLabel': 'Nghề nghiệp',
        'reviews.professionPlaceholder': 'Nhập nghề nghiệp của bạn (không bắt buộc)',
        'reviews.rating': 'Đánh giá',
        'reviews.ratingExcellent': 'Xuất sắc',
        'reviews.ratingGood': 'Tốt',
        'reviews.ratingAverage': 'Trung bình',
        'reviews.ratingPoor': 'Kém',
        'reviews.ratingBad': 'Rất kém',
        'reviews.reviewTitle': 'Tiêu đề đánh giá',
        'reviews.reviewTitlePlaceholder': 'Tóm tắt trải nghiệm của bạn trong một câu',
        'reviews.reviewContent': 'Nội dung đánh giá',
        'reviews.reviewContentPlaceholder': 'Mô tả chi tiết trải nghiệm của bạn...',
        'reviews.moderationNotice': 'Đánh giá của bạn sẽ được hiển thị sau khi được kiểm duyệt.',
        'reviews.submitReview': 'Gửi đánh giá',
      }[key] || key),
    );
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
    expect(wrapper.text()).toContain('Bắt buộc');
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

  it('falls back to Vietnamese labels and placeholders when translations resolve to an empty string', () => {
    translate.mockImplementation(() => '');

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

    expect(wrapper.text()).toContain('Tên của bạn');
    expect(wrapper.text()).toContain('Đánh giá');
    expect(wrapper.text()).toContain('Gửi đánh giá');
    expect(wrapper.html()).toContain('Nhập tên của bạn');
  });
});
