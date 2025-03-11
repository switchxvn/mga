export interface Hero {
  id: number;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  videoUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlider {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoThumbnail {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
  themeId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  image_url: string;
  title: string;
  description: string;
  link: string;
  order: number;
  buttonText?: string;
}

export interface HeroConfig {
  height?: string;
  layout?: 'split-columns' | 'stacked-rows';
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  videoWidth?: string;
  sliderWidth?: string;
  videoPosition?: 'left' | 'right';
  sliderPosition?: 'left' | 'right';
  themeId?: number;
  maxVideos?: number;
  videoRowHeight?: string;
  gap?: string;
  videoGap?: string;
  backgroundGradient?: {
    from: string;
    to: string;
    direction: 'to-t' | 'to-b' | 'to-l' | 'to-r' | 'to-tl' | 'to-tr' | 'to-bl' | 'to-br';
  };
  overlayOpacity?: string;
} 