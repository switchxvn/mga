import Swal from 'sweetalert2';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useConfirm() {
  const show = async ({
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmButtonColor = '#10B981',
    onConfirm,
    onCancel
  }: ConfirmOptions) => {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor,
    });

    if (result.isConfirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  };

  return {
    show
  };
} 