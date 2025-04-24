export interface TopMenuItem {
  type: 'component' | 'link' | 'text';
  component?: string;
  settings?: Record<string, any>;
  href?: string;
  label?: string;
  content?: string;
  textColor?: string;
  hoverColor?: string;
  isTranslated?: boolean;
}

export interface TopMenuColumn {
  items: TopMenuItem[];
  width?: string;
  alignment?: 'start' | 'center' | 'end';
}

export interface TopMenu {
  leftColumn?: TopMenuColumn;
  centerColumn?: TopMenuColumn;
  rightColumn?: TopMenuColumn;
}

export interface MenuItemTranslation {
  label: string;
  href: string;
}

export interface MenuItem {
  id: number;
  label: string;
  href: string;
  icon?: string | null;
  children?: MenuItem[];
  translations: MenuItemTranslation[];
  defaultLocale: string;
  order: number;
  level: number;
  isActive: boolean;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NavbarSettings {
  menuBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  menuAlignment?: string;
  showLanguageSwitcher?: boolean;
  showThemeToggle?: boolean;
  showCart?: boolean;
  mobileMenuBreakpoint?: string;
  darkMode?: {
    menuBackgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  navigation?: {
    textColor?: string;
    fontWeight?: string;
    activeTextColor?: string;
  };
  topMenu?: TopMenu;
  bookingButton?: {
    text: string;
    href: string;
    phoneNumbers: {
      label: string;
      number: string;
    }[];
    backgroundColor?: string;
    textColor?: string;
  };
  phoneButton?: {
    text: string;
    numbers: {
      label: string;
      number: string;
      textColor?: string;
      backgroundColor?: string;
    }[];
    backgroundColor?: string;
    textColor?: string;
  };
} 