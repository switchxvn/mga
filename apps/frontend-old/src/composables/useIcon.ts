import * as LucideIcons from 'lucide-vue-next';
import type { Icon as LucideIcon } from 'lucide-vue-next';
import { getIconName } from '~/utils/icon';

export const useIcon = () => {
  /**
   * Get Lucide icon component from icon name
   * @param iconName Icon name in any format (MDI, kebab-case, etc.)
   * @returns Lucide icon component or HelpCircle if not found
   */
  const getIconComponent = (iconName: string | null | undefined) => {
    const lucideIconName = getIconName(iconName);
    return LucideIcons[lucideIconName];
  };

  return {
    getIconComponent
  };
}; 