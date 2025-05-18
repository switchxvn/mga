export interface ThemeSectionTranslation {
  id: number;
  sectionId: number;
  locale: string;
  title: string;
  description?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 