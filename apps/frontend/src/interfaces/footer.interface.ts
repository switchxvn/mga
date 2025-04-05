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
  componentName: string;
  isActive: boolean;
  addresses: Array<{
    title: string;
    subtitle?: string;
    location: string;
    email?: Array<{
      label: string;
      address: string;
      contact?: string;
    }>;
    phone?: Array<{
      label: string;
      number: string;
      contact?: string;
    }>;
  }>;
  mapUrl?: string;
  fanpageUrl?: string;
  companyInfo: {
    name: string;
    tax_number?: string;
    registration?: string;
    business_license?: string;
    certifications?: Array<{
      image: string;
      alt?: string;
      text?: string;
    }>;
  };
  quickLinks?: Array<{
    url: string;
    icon: string;
    label: string;
  }>;
  backgroundLightColor: string;
  backgroundDarkColor: string;
  socialIcons?: Array<{
    url: string;
    icon: string;
    name: string;
  }>;
  logoUrl: string;
  logoAlt: string;
  branchInfo?: Array<{
    title: string;
    address: string;
    contacts?: Array<{
      name?: string;
      position?: string;
      phone?: string;
      email?: string;
    }>;
  }>;
  copyrightStyle?: {
    text?: string;
    dark?: {
      textColor: string;
      backgroundColor: string;
    };
    light?: {
      textColor: string;
      backgroundColor: string;
    };
  };
  createdAt: string;
  updatedAt: string;
} 