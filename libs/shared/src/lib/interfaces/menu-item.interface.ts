export interface MenuItemTranslation {
  id: number;
  locale: string;
  label: string;
  menuItemId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: number;
  parentId: number | null;
  isActive: boolean;
  order: number;
  label?: string;
  href?: string;
  icon?: string;
  translations: MenuItemTranslation[];
  children?: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
} 