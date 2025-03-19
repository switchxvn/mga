import { ref } from 'vue';
import { trpc } from '../utils/trpc';

export interface Address {
  title?: string;
  subtitle?: string;
  location: string;
  phone?: {
    label: string;
    number: string;
    contact?: string;
  }[];
  email?: {
    label: string;
    address: string;
    contact?: string;
  }[];
}

export interface CompanyInfo {
  name: string;
  registration: string;
  tax_number?: string;
  business_license?: string;
  certifications?: {
    image: string;
    alt?: string;
    text?: string;
  }[];
}

export interface QuickLink {
  label: string;
  url: string;
  icon?: string;
}

export interface SocialIcon {
  name: string;
  icon: string;
  url: string;
}

export interface Footer {
  id: number;
  name: string;
  addresses: Address[];
  mapUrl?: string;
  fanpageUrl?: string;
  companyInfo: CompanyInfo;
  quickLinks: QuickLink[];
  backgroundLightColor: string;
  backgroundDarkColor: string;
  copyright?: string;
  socialIcons: SocialIcon[];
  logoUrl: string;
  logoAlt: string;
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
      const response = await trpc.footer.getActiveFooter.query();
      console.log('API Response:', response);
      
      if (response) {
        activeFooter.value = response;
        console.log('Processed footer:', activeFooter.value);
      } else {
        console.error('Invalid API response:', response);
        error.value = 'Không thể tải thông tin footer: Dữ liệu không hợp lệ';
        activeFooter.value = null;
      }
    } catch (err) {
      console.error('Failed to fetch active footer:', err);
      error.value = err instanceof Error ? err.message : 'Không thể tải thông tin footer';
      activeFooter.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    activeFooter,
    isLoading,
    error,
    fetchActiveFooter
  };
}; 