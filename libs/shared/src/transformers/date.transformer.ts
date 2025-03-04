export const dateTransformer = {
  serialize: (date: Date): string => date.toISOString(),
  deserialize: (dateString: string): Date => new Date(dateString),
};

export const isISODate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
};

export const safeParseDateString = (value: unknown): Date | null => {
  if (!isISODate(value)) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}; 