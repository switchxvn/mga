interface CategoryTranslationLike {
  locale?: string | null;
  name?: string | null;
  slug?: string | null;
}

interface CategoryLike {
  id: number;
  translations?: CategoryTranslationLike[] | null;
  parent?: CategoryLike | null;
}

interface BreadcrumbCategoryLink {
  label: string;
  to: string;
}

const getCategoryTranslation = (
  category: CategoryLike | null | undefined,
  locale: string,
): CategoryTranslationLike | null => {
  if (!category?.translations?.length) {
    return null;
  }

  return (
    category.translations.find((translation) => translation.locale === locale) ||
    category.translations[0] ||
    null
  );
};

export const resolveProductBreadcrumbCategory = (
  categories: CategoryLike[] | null | undefined,
  locale: string,
): BreadcrumbCategoryLink | null => {
  if (!categories?.length) {
    return null;
  }

  for (const category of categories) {
    const parentTranslation = getCategoryTranslation(category.parent, locale);
    if (parentTranslation?.slug && parentTranslation.name) {
      return {
        label: parentTranslation.name,
        to: `/categories/${parentTranslation.slug}`,
      };
    }

    const categoryTranslation = getCategoryTranslation(category, locale);
    if (categoryTranslation?.slug && categoryTranslation.name) {
      return {
        label: categoryTranslation.name,
        to: `/categories/${categoryTranslation.slug}`,
      };
    }
  }

  return null;
};
