import { ref } from 'vue';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const useConfirmDialog = () => {
  const isVisible = ref(false);
  const options = ref<ConfirmDialogOptions>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger'
  });

  let resolvePromise: (value: boolean) => void;

  const showConfirm = (dialogOptions: ConfirmDialogOptions): Promise<boolean> => {
    options.value = {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
      ...dialogOptions
    };
    isVisible.value = true;

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
  };

  const confirm = () => {
    isVisible.value = false;
    if (resolvePromise) {
      resolvePromise(true);
    }
  };

  const cancel = () => {
    isVisible.value = false;
    if (resolvePromise) {
      resolvePromise(false);
    }
  };

  return {
    isVisible,
    options,
    showConfirm,
    confirm,
    cancel
  };
}; 