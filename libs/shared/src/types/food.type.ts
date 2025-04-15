export interface FoodCategoryTranslation {
  id: string;
  name: string;
  description?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  languageCode: string;
}

export interface FoodCategory {
  id: string;
  isActive: boolean;
  order: number;
  image?: Record<string, any>;
  settings?: Record<string, any>;
  translations: FoodCategoryTranslation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodItemTranslation {
  id: string;
  name: string;
  description?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  ingredients?: string[];
  allergens?: string[];
  languageCode: string;
}

export interface FoodItem {
  id: string;
  isActive: boolean;
  order: number;
  price: number;
  discountPrice?: number;
  isFeatured: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  preparationTime?: number;
  calories?: number;
  image?: Record<string, any>;
  gallery?: Record<string, any>;
  settings?: Record<string, any>;
  categoryId: string;
  category?: FoodCategory;
  translations: FoodItemTranslation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFoodCategoryDto {
  isActive?: boolean;
  order?: number;
  image?: Record<string, any>;
  settings?: Record<string, any>;
  translations: Omit<FoodCategoryTranslation, 'id'>[];
}

export interface UpdateFoodCategoryDto extends Partial<CreateFoodCategoryDto> {
  id: string;
}

export interface CreateFoodItemDto {
  isActive?: boolean;
  order?: number;
  price: number;
  discountPrice?: number;
  isFeatured?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  preparationTime?: number;
  calories?: number;
  image?: Record<string, any>;
  gallery?: Record<string, any>;
  settings?: Record<string, any>;
  categoryId: string;
  translations: Omit<FoodItemTranslation, 'id'>[];
}

export interface UpdateFoodItemDto extends Partial<CreateFoodItemDto> {
  id: string;
} 