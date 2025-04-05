import { ref, onMounted } from 'vue';

/**
 * Utility composable for handling color-related operations
 */
export const useCssColorValue = () => {
  const isClient = typeof window !== 'undefined';
  const colorCache = new Map<string, string>();

  /**
   * Convert hex color to RGB
   */
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Check if parsing was successful
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    
    return { r, g, b };
  };

  /**
   * Process color value with caching
   */
  const processColorValue = (colorValue: string): string => {
    if (!colorValue) return '';

    // Check cache first
    if (colorCache.has(colorValue)) {
      return colorCache.get(colorValue)!;
    }

    // If it's a CSS variable
    if (colorValue.startsWith('var(--')) {
      // Extract the variable name
      const variableName = colorValue.match(/var\((.*?)\)/)?.[1];
      
      if (!variableName) return colorValue;

      // If we're on the server, return the original value
      if (!isClient) return colorValue;

      // Get the actual color value
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
      
      // If it's space-separated RGB values
      if (color.match(/^\d+\s+\d+\s+\d+$/)) {
        const [r, g, b] = color.split(/\s+/).map(Number);
        const result = `rgb(${r}, ${g}, ${b})`;
        colorCache.set(colorValue, result);
        return result;
      }
      
      // If it's a hex color
      if (color.startsWith('#')) {
        const rgb = hexToRgb(color);
        if (rgb) {
          const result = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          colorCache.set(colorValue, result);
          return result;
        }
      }
      
      colorCache.set(colorValue, color || colorValue);
      return color || colorValue;
    }
    
    colorCache.set(colorValue, colorValue);
    return colorValue;
  };

  // Clear cache when window is focused (in case CSS variables have changed)
  if (isClient) {
    window.addEventListener('focus', () => {
      colorCache.clear();
    });
  }

  return {
    processColorValue
  };
}; 