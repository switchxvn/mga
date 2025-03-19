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

export interface BranchContact {
  name?: string;
  position?: string;
  phone?: string;
  email?: string;
}

export interface BranchInfo {
  title: string;
  address: string;
  contacts: BranchContact[];
}

export interface CopyrightStyle {
  text: string;
  light: {
    backgroundColor: string;
    textColor: string;
  };
  dark: {
    backgroundColor: string;
    textColor: string;
  };
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
  copyrightStyle: CopyrightStyle;
  socialIcons: SocialIcon[];
  logoUrl: string;
  logoAlt: string;
  branchInfo?: BranchInfo[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 