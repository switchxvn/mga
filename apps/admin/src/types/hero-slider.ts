export interface HeroSlider {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  isActive: boolean;
  order: number;
  themeId: number | null;
  theme?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeroSliderInput {
  title: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  order?: number;
  themeId: number;
}

export interface UpdateHeroSliderInput {
  id: number;
  data: Partial<CreateHeroSliderInput>;
} 