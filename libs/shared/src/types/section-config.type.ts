// Section config interfaces
export interface SliderConfig {
  height?: string;
  layout?: "split-columns" | "stacked-rows";
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  videoWidth?: string;
  sliderWidth?: string;
  videoPosition?: "left" | "right";
  sliderPosition?: "left" | "right";
  themeId?: number;
  items?: Array<{
    image_url: string;
    title: string;
    description: string;
    link: string;
    order: number;
  }>;
}

export interface ProductsConfig {
  layout?: "grid" | "slider";
  columns?: number;
  maxItems?: number;
  showPrice?: boolean;
  showRating?: boolean;
  limit?: number;
  slidesPerView?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

export interface ServicesConfig {
  layout: "grid";
  columns: number;
  maxItems: number;
  showIcon: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showPrice: boolean;
  showButton: boolean;
  descriptionLength: number;
  gap: string;
  backgroundGradient: {
    from: string;
    to: string;
    direction: string;
  };
  overlayOpacity: string;
  padding: {
    top: string;
    bottom: string;
  };
  buttonText: string;
  buttonStyle: string;
  cardStyle: {
    background: string;
    shadow: string;
    border: string;
    rounded: string;
    padding: string;
    transition: string;
  };
  iconStyle: {
    size: string;
    background: string;
    color: string;
    rounded: string;
    padding: string;
  };
  titleStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
  descriptionStyle: {
    size: string;
    color: string;
    margin: string;
  };
  priceStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
}

export interface CategoriesConfig {
  title: string;
  layout: "grid" | "slider";
  columns: number;
  maxItems: number;
  showIcon: boolean;
  showTitle: boolean;
  showDescription: boolean;
  descriptionLength: number;
  gap: string;
  backgroundGradient: {
    from: string;
    to: string;
    direction: string;
  };
  overlayOpacity: string;
  padding: {
    top: string;
    bottom: string;
  };
  cardStyle: {
    background: string;
    shadow: string;
    border: string;
    rounded: string;
    padding: string;
    transition: string;
  };
  iconStyle: {
    size: string;
    background: string;
    color: string;
    rounded: string;
    padding: string;
  };
  titleStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
  descriptionStyle: {
    size: string;
    color: string;
    margin: string;
  };
  categoryIds?: number[];
  productsPerCategory?: number;
  displayMode: "grid" | "slider";
}

export interface CompanyIntroConfig {
  layout: 'left-image' | 'right-image';
  title: string;
  description: string;
  image: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
} 