import { ref, computed } from 'vue';
import { trpc } from '../utils/trpc';

export interface FooterContent {
  sections: Array<{
    type: string;
    title?: string;
    items?: Array<{
      label: string;
      url: string;
    }>;
  }>;
  copyright?: string;
  theme?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface Footer {
  id: number;
  name: string;
  type: string;
  content: FooterContent;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useFooter = () => {
  const activeFooter = ref<Footer | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Lấy footer đang active
  const fetchActiveFooter = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      activeFooter.value = await trpc.footer.getActiveFooter.query();
    } catch (err) {
      console.error('Failed to fetch active footer:', err);
      error.value = err instanceof Error ? err.message : 'Không thể tải thông tin footer';
      activeFooter.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Computed properties để truy cập dễ dàng các phần của footer
  const footerSections = computed(() => activeFooter.value?.content?.sections || []);
  const copyright = computed(() => activeFooter.value?.content?.copyright || '');
  const theme = computed(() => activeFooter.value?.content?.theme || {});

  // Hàm tiện ích để lấy section theo loại
  const getSectionByType = (type: string) => {
    return footerSections.value.find(section => section.type === type);
  };

  // Các section phổ biến
  const linksSection = computed(() => getSectionByType('links'));
  const socialSection = computed(() => getSectionByType('social'));
  const contactSection = computed(() => getSectionByType('contact'));

  return {
    activeFooter,
    isLoading,
    error,
    fetchActiveFooter,
    footerSections,
    copyright,
    theme,
    getSectionByType,
    linksSection,
    socialSection,
    contactSection
  };
}; 