import { useToast } from './useToast';

interface NotificationOptions {
  title?: string;
  message: string;
  timeout?: number;
  closable?: boolean;
}

export function useNotification() {
  const { showToast } = useToast();

  const showSuccess = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    showToast({
      type: 'success',
      title: options?.title || 'Success',
      message,
      timeout: options?.timeout || 5000,
      closable: options?.closable || true,
    });
  };

  const showError = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    showToast({
      type: 'error',
      title: options?.title || 'Error',
      message,
      timeout: options?.timeout || 5000,
      closable: options?.closable || true,
    });
  };

  const showWarning = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    showToast({
      type: 'warning',
      title: options?.title || 'Warning',
      message,
      timeout: options?.timeout || 5000,
      closable: options?.closable || true,
    });
  };

  const showInfo = (message: string, options?: Omit<NotificationOptions, 'message'>) => {
    showToast({
      type: 'info',
      title: options?.title || 'Information',
      message,
      timeout: options?.timeout || 5000,
      closable: options?.closable || true,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
} 