import { ref, onMounted } from 'vue';

/**
 * Utility composable for handling color-related operations
 */
export const useCssColorValue = () => {
  const isClient = typeof window !== 'undefined';

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
   * Process color value
   */
  const processColorValue = (colorValue: string): string => {
    if (!colorValue) return '';

    console.log('Input color value:', colorValue);

    // If it's a CSS variable
    if (colorValue.startsWith('var(--')) {
      // Extract the variable name
      const variableName = colorValue.match(/var\((.*?)\)/)?.[1];
      console.log('Extracted variable name:', variableName);
      
      if (!variableName) return colorValue;

      // If we're on the server, return the original value
      if (!isClient) return colorValue;

      // Get the actual color value
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
      
      console.log('Retrieved color value:', color);
      
      // If it's space-separated RGB values
      if (color.match(/^\d+\s+\d+\s+\d+$/)) {
        const [r, g, b] = color.split(/\s+/).map(Number);
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      // If it's a hex color
      if (color.startsWith('#')) {
        const rgb = hexToRgb(color);
        console.log('Converted RGB:', rgb);
        if (rgb) {
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        }
      }
      
      return color || colorValue;
    }
    
    return colorValue;
  };

  return {
    processColorValue
  };
}; 