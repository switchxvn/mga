import { useToast } from './useToast';

interface NotificationOptions {
  title?: string;
  message: string;
  timeout?: number;
  closable?: boolean;
}

export function useNotification() {
  const toast = useToast();

  const showSuccess = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    toast.success(message, options?.timeout || 5000);
  };

  const showError = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    toast.error(message, options?.timeout || 5000);
  };

  const showWarning = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    toast.warning(message, options?.timeout || 5000);
  };

  const showInfo = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    toast.info(message, options?.timeout || 5000);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
} 