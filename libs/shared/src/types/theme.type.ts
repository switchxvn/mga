import { PageType } from './page-type'

export type ColorShades = {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
};

export type ColorMode = {
  primary: ColorShades;
  secondary: ColorShades;
  tertiary: ColorShades;
};

export interface Theme {
  id: number;
  name: string;
  colors: {
    light: ColorMode;
    dark: ColorMode;
  };
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  sections?: ThemeSection[];
  componentStyleConfigs?: any[];
}

export interface ThemeSection {
  id: number;
  themeId: number;
  type: string;
  componentName?: string;
  title: string;
  order: number;
  pageType: PageType;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  theme?: any;
}

// Common settings for theme sections
export interface BaseThemeSectionSettings {
  layout?: string;
  backgroundColor?: string;
  textColor?: string;
}

// Hero section settings
export interface HeroSectionSettings extends BaseThemeSectionSettings {
  height: string;
  autoplay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  videoWidth?: string;
  sliderWidth?: string;
  videoPosition?: string;
  sliderPosition?: string;
  overlayOpacity: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

// Navbar section settings
export interface NavbarSectionSettings extends BaseThemeSectionSettings {
  menuAlignment: string;
  showLanguageSwitcher: boolean;
  showThemeToggle: boolean;
  showCart: boolean;
  showHotline: boolean;
  mobileMenuBreakpoint: string;
  borderColor: string;
  topMenu: {
    leftColumn: MenuColumn;
    centerColumn: MenuColumn;
    rightColumn: MenuColumn;
  };
}

export interface MenuColumn {
  items: any[];
  width: string;
  alignment: 'start' | 'center' | 'end';
}

// Features section settings
export interface FeaturesSectionSettings extends BaseThemeSectionSettings {
  columns: number;
  features: Feature[];
  alignment: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

// This is not exhaustive - add more section settings interfaces as needed 