<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '@/composables/useTrpc';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { navigateTo } from 'nuxt/app';
import { TicketIcon, SearchIcon, UserIcon, PrinterIcon, ArrowLeftIcon } from 'lucide-vue-next';
import { OrderStatus } from '@ew/shared';
import PageHeader from '../../components/common/header/PageHeader.vue';
import PhoneInput from '../../components/form/PhoneInput.vue';

// Định nghĩa kiểu dữ liệu
interface ScanResult {
  success: boolean;
  message: string;
  orderItem?: {
    id: number;
    qrCode: string;
    orderId: number;
    isUsed: boolean;
    travelDate?: string;
    productType?: string;
    product?: {
      translations?: {
        title: string;
      }[];
    };
    order?: {
      orderCode: string;
      status?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      createdAt: string;
      paymentStatus: string;
    };
  };
  scanHistory?: any;
  isFirstScan?: boolean;
  scanCount?: number;
}

interface ScanHistory {
  id: number;
  scannedAt: string;
  scannedBy: string;
  location?: string;
  orderItemId?: number;
  deviceInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  scanner?: {
    id?: string;
    email?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  orderItem?: any;
  isFirstScan?: boolean;
  scanCount?: number;
}

interface CustomerTicket {
  id: number;
  qrCode: string;
  orderId: number;
  isUsed: boolean;
  travelDate?: string;
  productType?: string;
  product?: {
    translations?: {
      title: string;
    }[];
  };
  order?: {
    orderCode: string;
    status: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    createdAt: string;
    paymentStatus: string;
  };
  scanCount?: number;
}

// Kiểu dữ liệu cho kích thước in ấn
interface PrintSize {
  id: string;
  name: string;
  width: string;
  height: string;
  description?: string;
}

// Định nghĩa kiểu cho Setting
interface Setting {
  id: number;
  key: string;
  value: string;
  group?: string;
  description?: string;
  is_public: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const { t } = useI18n();
const trpc = useTrpc();
const toast = useToast();

// State refs
const qrCode = ref('');
const isLoading = ref(false);
const scanResult = ref<ScanResult | null>(null);
const showHistory = ref(false);
const scanHistories = ref<ScanHistory[]>([]);
const historyOrderItemId = ref<number | null>(null);
const isLoadingHistory = ref(false);
const errorMessage = ref('');

// Tìm kiếm khách hàng
const customerEmail = ref('');
const customerPhone = ref('');
const customerPhoneCode = ref('+84');
const isSearchingCustomer = ref(false);
const customerTickets = ref<CustomerTicket[]>([]);
const showCustomerSearch = ref(false);
const customerTip = ref(true);
const ticketStatus = ref('');
const orderDateRange = ref({
  start: null as string | null,
  end: null as string | null,
});

// In ấn
const showPrintModal = ref(false);
const selectedTicket = ref<CustomerTicket | null>(null);
const selectedPrintSize = ref('A4');
const isPrinting = ref(false);
const printSizes = ref<PrintSize[]>([
  { id: 'A4', name: 'A4', width: '210mm', height: '297mm', description: 'Khổ tiêu chuẩn A4' },
  { id: 'A5', name: 'A5', width: '148mm', height: '210mm', description: 'Khổ nhỏ A5 (nửa A4)' },
  { id: 'TICKET', name: 'Vé nhỏ', width: '80mm', height: '180mm', description: 'Khổ vé nhỏ' },
  { id: 'LABEL', name: 'Nhãn vé', width: '50mm', height: '30mm', description: 'Nhãn vé nhỏ' }
]);

const debounceTimer = ref<NodeJS.Timeout | null>(null);

// Cấu hình in vé
const ticketSettings = ref({
  title: 'VÉ THAM QUAN',
  subtitle: 'Vé cáp treo 2 chiều',
  location: 'KDL Cáp Treo',
  footer: 'Vui lòng giữ vé cẩn thận và trình cho nhân viên khi vào cổng',
  logo: '',
  qrSize: '250',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  borderColor: '#cccccc',
  label: {
    title: 'VÉ THAM QUAN',
    footer: 'Vui lòng giữ vé cẩn thận',
    qrSize: '100',
    fontSize: '6',
    padding: '3mm',
    headerFontSize: '8'
  }
});

// Methods
const scanTicket = async () => {
  if (!qrCode.value) {
    toast.error(t('Vui lòng nhập mã QR'));
    return;
  }

  // Reset trạng thái lỗi và kết quả trước đó
  errorMessage.value = '';
  scanResult.value = null;

  console.log('Tra cứu mã QR:', qrCode.value);
  isLoading.value = true;
  try {
    // Kiểm tra vé 
    const orderItem = await trpc.admin.ticketScanner.getTicketByQrCode.query({
      qrCode: qrCode.value
    });
    
    if (orderItem) {
      scanResult.value = {
        success: true,
        message: orderItem.isUsed 
          ? 'Vé hợp lệ nhưng đã được sử dụng trước đó.'
          : 'Vé hợp lệ và chưa sử dụng.',
        orderItem: orderItem,
        isFirstScan: !orderItem.isUsed,
        scanCount: orderItem.scanCount || 0
      };
      
      // Reset QR code input
      qrCode.value = '';
      
      // Tải lịch sử quét của vé này để hiển thị
      if (orderItem.id) {
        historyOrderItemId.value = orderItem.id;
        loadScanHistory(orderItem.id);
        showHistory.value = true;
      }
    } else {
      errorMessage.value = t('Không tìm thấy vé với mã QR này');
      toast.error(errorMessage.value);
    }
  } catch (error: any) {
    console.error('Error looking up ticket:', error);
    console.error('Error details:', error?.data?.httpStatus, error?.message);
    
    // Hiển thị thông báo lỗi cụ thể từ server nếu có
    let msg = t('Không tìm thấy thông tin vé');
    
    if (error?.message) {
      // Hiển thị thông báo lỗi cụ thể từ server
      msg = error.message;
    } else if (error?.data?.message) {
      // Hiển thị thông báo lỗi từ TRPC response
      msg = error.data.message;
    }
    
    // Lưu thông báo lỗi để hiển thị trong UI
    errorMessage.value = msg;
    toast.error(msg);
  } finally {
    isLoading.value = false;
    
    // Focus lại vào input sau khi xử lý xong
    setTimeout(() => {
      const qrInput = document.getElementById('qr-input');
      if (qrInput) {
        qrInput.focus();
      }
    }, 100);
  }
};

// Tìm kiếm vé theo thông tin khách hàng (email hoặc số điện thoại)
const searchCustomerTickets = async () => {
  if (!customerEmail.value && !customerPhone.value) {
    toast.error(t('Vui lòng nhập email hoặc số điện thoại của khách hàng'));
    return;
  }

  customerTickets.value = [];
  isSearchingCustomer.value = true;
  errorMessage.value = '';

  try {
    const searchTerm = customerEmail.value || (customerPhone.value ? customerPhone.value : '');
    const result = await trpc.admin.ticketScanner.searchCustomerTickets.query({
      searchTerm: searchTerm,
      ticketStatus: ticketStatus.value || undefined,
      startOrderDate: orderDateRange.value.start || undefined,
      endOrderDate: orderDateRange.value.end || undefined
    });

    if (result && result.length > 0) {
      customerTickets.value = result as CustomerTicket[];
    } else {
      toast.warning(t('Không tìm thấy vé nào cho khách hàng này'));
    }
  } catch (error: any) {
    console.error('Error searching customer tickets:', error);
    let errorMsg = t('Lỗi khi tìm kiếm thông tin vé của khách hàng');
    
    if (error?.message) {
      errorMsg = error.message;
    } else if (error?.data?.message) {
      errorMsg = error.data.message;
    }
    
    toast.error(errorMsg);
  } finally {
    isSearchingCustomer.value = false;
  }
};

// Xem thông tin vé được tìm thấy từ khách hàng
const viewCustomerTicket = (ticketQrCode: string) => {
  qrCode.value = ticketQrCode;
  scanTicket();
};

// Toggle hiển thị phần tìm kiếm khách hàng
const toggleCustomerSearch = () => {
  showCustomerSearch.value = !showCustomerSearch.value;
  if (showCustomerSearch.value) {
    // Reset dữ liệu khi hiển thị form tìm kiếm
    customerEmail.value = '';
    customerPhone.value = '';
    customerTickets.value = [];
  }
};

// Đóng phần tip hướng dẫn
const closeTip = () => {
  customerTip.value = false;
};

// Load scan history for a specific ticket
const loadScanHistory = async (orderItemId: number) => {
  if (!orderItemId) return;
  
  isLoadingHistory.value = true;
  try {
    const result = await trpc.admin.ticketScanner.getTicketScanHistory.query({
      orderItemId: orderItemId,
      page: 1,
      pageSize: 10
    });
    
    // Thêm số thứ tự quét cho mỗi lịch sử
    if (result.items && result.items.length > 0) {
      scanHistories.value = result.items.map((history, index) => {
        // Thứ tự ngược lại vì danh sách được sắp xếp theo thời gian mới nhất
        // (lần quét gần nhất sẽ có index = 0)
        const scanNumber = result.items.length - index;
        return {
          ...history,
          scanCount: history.isFirstScan ? 1 : scanNumber
        };
      });
    } else {
      scanHistories.value = [];
    }
  } catch (error) {
    console.error('Error loading scan history:', error);
    toast.error(t('Không thể tải lịch sử quét vé'));
  } finally {
    isLoadingHistory.value = false;
  }
};

// Format date
const formatDate = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// Format ngày theo kiểu Việt Nam
const formatVietnameseDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Định dạng "22 tháng 03 năm 2023 (22/03/2023)"
  return `${day} tháng ${month < 10 ? '0' + month : month} năm ${year} (${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year})`;
};

// Mở modal in vé
const openPrintModal = (ticket: CustomerTicket) => {
  selectedTicket.value = ticket;
  showPrintModal.value = true;
};

// Tải cấu hình in vé từ Settings
const loadTicketPrintSettings = async () => {
  try {
    // Lấy cài đặt theo group 'ticket'
    const settings = await trpc.admin.settings.getAllSettings.query() as Setting[];
    const ticketSettings = settings.filter(setting => setting.group === 'ticket');
    
    if (ticketSettings && ticketSettings.length > 0) {
      // Lọc các settings bắt đầu bằng 'ticket.print.'
      const printSettings = ticketSettings.filter((setting: Setting) => setting.key.startsWith('ticket.print.'));
      
      // Tạo map từ settings
      const settingsMap: Record<string, string> = {};
      const labelSettingsMap: Record<string, string> = {};
      
      printSettings.forEach((setting: Setting) => {
        if (setting.key.startsWith('ticket.print.label.')) {
          const key = setting.key.replace('ticket.print.label.', '');
          labelSettingsMap[key] = setting.value;
        } else {
          const key = setting.key.replace('ticket.print.', '');
          settingsMap[key] = setting.value;
        }
      });
      
      // Cập nhật cấu hình
      ticketSettings.value = {
        title: settingsMap.title || ticketSettings.value.title,
        subtitle: settingsMap.subtitle || ticketSettings.value.subtitle,
        location: settingsMap.location || ticketSettings.value.location,
        footer: settingsMap.footer || ticketSettings.value.footer,
        logo: settingsMap.logo || ticketSettings.value.logo,
        qrSize: settingsMap.qrSize || ticketSettings.value.qrSize,
        backgroundColor: settingsMap.backgroundColor || ticketSettings.value.backgroundColor,
        textColor: settingsMap.textColor || ticketSettings.value.textColor,
        borderColor: settingsMap.borderColor || ticketSettings.value.borderColor,
        label: {
          title: labelSettingsMap.title || 'VÉ THAM QUAN',
          footer: labelSettingsMap.footer || 'Vui lòng giữ vé cẩn thận',
          qrSize: labelSettingsMap.qrSize || '100',
          fontSize: labelSettingsMap.fontSize || '6',
          padding: labelSettingsMap.padding || '3mm',
          headerFontSize: labelSettingsMap.headerFontSize || '8'
        }
      };
    }
  } catch (error) {
    console.error('Error loading ticket print settings:', error);
  }
};

// In vé
const printTicket = async () => {
  if (!selectedTicket.value) return;
  
  isPrinting.value = true;
  try {
    // Chuẩn bị nội dung in
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error(t('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt chặn popup trên trình duyệt.'));
      return;
    }
    
    // Lấy size in đã chọn
    const size = printSizes.value.find(s => s.id === selectedPrintSize.value);
    const isLabel = selectedPrintSize.value === 'LABEL';
    
    // Tạo CSS cho trang in
    const printCSS = `
      @page {
        size: ${size?.width} ${size?.height};
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          width: ${size?.width};
          height: ${size?.height};
        }
        .print-container {
          width: 100%;
          height: 100%;
          page-break-after: always;
        }
      }
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: ${ticketSettings.value.backgroundColor};
      }
      .print-container {
        padding: ${isLabel ? ticketSettings.value.label.padding : '10mm'};
        box-sizing: border-box;
        border: 1px solid ${ticketSettings.value.borderColor};
        background-color: ${ticketSettings.value.backgroundColor};
        color: ${ticketSettings.value.textColor};
      }
      .ticket-header {
        border-bottom: ${isLabel ? 'none' : '1px solid #ddd'};
        padding-bottom: ${isLabel ? '2mm' : '5mm'};
        margin-bottom: ${isLabel ? '2mm' : '5mm'};
        text-align: center;
      }
      .ticket-header h1 {
        font-size: ${isLabel ? `${ticketSettings.value.label.headerFontSize}pt` : '16pt'};
        margin: 0 0 ${isLabel ? '1mm' : '2mm'} 0;
        font-weight: bold;
        color: ${ticketSettings.value.textColor};
      }
      .ticket-header h2 {
        font-size: ${isLabel ? '7pt' : '14pt'};
        margin: ${isLabel ? '1mm' : '2mm'} 0;
        font-weight: normal;
        color: ${ticketSettings.value.textColor};
      }
      .ticket-header div {
        font-size: ${isLabel ? `${ticketSettings.value.label.fontSize}pt` : '12pt'};
      }
      .ticket-info {
        margin-bottom: ${isLabel ? '2mm' : '5mm'};
      }
      .info-row {
        display: flex;
        margin-bottom: ${isLabel ? '1mm' : '2mm'};
        font-size: ${isLabel ? `${ticketSettings.value.label.fontSize}pt` : '11pt'};
      }
      .info-label {
        font-weight: bold;
        width: ${isLabel ? '40%' : '35%'};
      }
      .info-value {
        flex: 1;
      }
      .ticket-qr {
        text-align: center;
        margin: ${isLabel ? '3mm auto' : '5mm auto'};
        padding: ${isLabel ? '2mm' : '3mm'};
        border: 1px dashed #e0e0e0;
        border-radius: ${isLabel ? '2mm' : '3mm'};
        background-color: #f9f9f9;
        width: ${isLabel ? '90%' : '60mm'};
      }
      .ticket-qr img {
        max-width: 100%;
        height: auto;
        margin: 0 auto;
        display: block;
      }
      .ticket-qr .mt-2 {
        margin-top: ${isLabel ? '1mm' : '2mm'};
      }
      .ticket-qr .text-center {
        text-align: center;
      }
      .ticket-qr .font-bold {
        font-weight: bold;
        font-size: ${isLabel ? `${ticketSettings.value.label.fontSize}pt` : '9pt'};
      }
      .ticket-footer {
        margin-top: ${isLabel ? '2mm' : '5mm'};
        text-align: center;
        font-size: ${isLabel ? `${ticketSettings.value.label.fontSize}pt` : '9pt'};
        color: #666;
        border-top: ${isLabel ? 'none' : '1px solid #ddd'};
        padding-top: ${isLabel ? '1mm' : '3mm'};
      }
    `;
    
    // Tạo nội dung HTML cho trang in
    const ticket = selectedTicket.value;
    const qrCodeSize = isLabel ? ticketSettings.value.label.qrSize : ticketSettings.value.qrSize;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrCodeSize}x${qrCodeSize}&data=${encodeURIComponent(ticket.qrCode)}`;
    
    // Format ngày đi nếu có
    let travelDateDisplay = '';
    if (ticket.travelDate) {
      const travelDate = new Date(ticket.travelDate);
      travelDateDisplay = formatVietnameseDate(travelDate);
    }
    
    // Header và footer content dựa trên kích thước in
    let headerContent = '';
    let footerContent = '';
    
    if (isLabel) {
      // Simplified content for small label
      headerContent = `
        <h1>${ticketSettings.value.label.title}</h1>
        <div>${ticket.product?.translations?.[0]?.title || ''}</div>
      `;
      footerContent = `
        <div>Mã QR: ${ticket.qrCode}</div>
        <div>${ticketSettings.value.location}</div>
        <div>${ticketSettings.value.label.footer}</div>
      `;
    } else {
      // Full content for larger sizes
      headerContent = `
        <h1>${ticketSettings.value.title}</h1>
        <h2>${ticketSettings.value.subtitle}</h2>
        <div>${ticket.product?.translations?.[0]?.title || ''}</div>
      `;
      footerContent = `
        <div>${ticketSettings.value.location}</div>
        <div>Mã đơn hàng: ${ticket.order?.orderCode || ''}</div>
        <div>Mã QR: ${ticket.qrCode}</div>
        <div>${ticketSettings.value.footer}</div>
      `;
    }
    
    // Thêm logo nếu có
    const logoHtml = ticketSettings.value.logo && !isLabel ? 
      `<div class="ticket-logo"><img src="${ticketSettings.value.logo}" alt="Logo" style="max-width: 60px; margin-bottom: 3mm;"/></div>` : 
      '';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>In vé</title>
        <style>${printCSS}</style>
      </head>
      <body>
        <div class="print-container">
          <div class="ticket-header">
            ${logoHtml}
            ${headerContent}
          </div>
          
          ${!isLabel ? `
          <div class="ticket-info">
            <div class="info-row">
              <div class="info-label">Khách hàng:</div>
              <div class="info-value">${ticket.order?.customerName || ''}</div>
            </div>
            ${ticket.order?.customerEmail ? `
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${ticket.order?.customerEmail || ''}</div>
            </div>
            ` : ''}
            ${ticket.order?.customerPhone ? `
            <div class="info-row">
              <div class="info-label">Số điện thoại:</div>
              <div class="info-value">${ticket.order?.customerPhone || ''}</div>
            </div>
            ` : ''}
            <div class="info-row">
              <div class="info-label">Mã đơn hàng:</div>
              <div class="info-value">${ticket.order?.orderCode || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Mã vé:</div>
              <div class="info-value">${ticket.qrCode}</div>
            </div>
            ${ticket.travelDate ? `
            <div class="info-row">
              <div class="info-label">Ngày đi:</div>
              <div class="info-value">${travelDateDisplay}</div>
            </div>
            ` : ''}
            <div class="info-row">
              <div class="info-label">Trạng thái:</div>
              <div class="info-value">${ticket.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}</div>
            </div>
            ${ticket.productType ? `
            <div class="info-row">
              <div class="info-label">Loại vé:</div>
              <div class="info-value">${ticket.productType}</div>
            </div>
            ` : ''}
          </div>
          ` : `
          <div class="ticket-info">
            ${ticket.order?.customerName ? `
            <div class="info-row">
              <div class="info-label">Khách:</div>
              <div class="info-value">${ticket.order?.customerName || ''}</div>
            </div>
            ` : ''}
            ${ticket.travelDate ? `
            <div class="info-row">
              <div class="info-label">Ngày:</div>
              <div class="info-value">${formatVietnameseDate(new Date(ticket.travelDate))}</div>
            </div>
            ` : ''}
          </div>
          `}
          
          <div class="ticket-qr">
            <img src="${qrCodeUrl}" alt="QR Code" />
            <div class="mt-2 text-center font-bold">${ticket.qrCode}</div>
          </div>
          
          <div class="ticket-footer">
            ${footerContent}
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Đợi để tải hình ảnh QR code
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      
      // Đóng modal sau khi in
      showPrintModal.value = false;
      selectedTicket.value = null;
      selectedPrintSize.value = 'A4'; // Reset lại kích thước in mặc định
      
      toast.success(t('Đã gửi lệnh in vé'));
    }, 800); // Tăng thời gian để đảm bảo QR code được tải
  } catch (error) {
    console.error('Error printing ticket:', error);
    toast.error(t('Lỗi khi in vé'));
  } finally {
    isPrinting.value = false;
  }
};

// Đóng modal in vé
const closePrintModal = () => {
  showPrintModal.value = false;
  selectedTicket.value = null;
};

// Reset error message
const resetError = () => {
  errorMessage.value = '';
};

// Auto-scan on paste or when the value is long enough (for barcode scanners)
const handleInput = () => {
  // Reset error message khi người dùng nhập mã QR mới
  if (errorMessage.value) {
    resetError();
  }
  
  // Hủy timer cũ nếu có
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  
  // Chỉ tự động quét khi đủ số ký tự
  if (qrCode.value.length >= 15) {
    // Đặt một timer để đợi máy quét hoàn thành (500ms)
    debounceTimer.value = setTimeout(() => {
      scanTicket();
    }, 500);
  }
};

// Thêm handler cho sự kiện keydown
const handleKeyDown = (e: KeyboardEvent) => {
  // Nếu nhấn Enter, thực hiện quét ngay lập tức
  if (e.key === 'Enter' && qrCode.value) {
    // Hủy timer debounce nếu có
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
      debounceTimer.value = null;
    }
    
    // Thực hiện quét ngay
    scanTicket();
  }
};

// Auto-focus on QR input when component is mounted
onMounted(() => {
  const qrInput = document.getElementById('qr-input');
  if (qrInput) {
    qrInput.focus();
  }
  
  // Tải cấu hình in vé
  loadTicketPrintSettings();
});

// Format tên người dùng từ user profile
const formatUserName = (history: ScanHistory) => {
  // Nếu có profile với first name và last name
  if (history.scanner?.profile?.firstName && history.scanner?.profile?.lastName) {
    return `${history.scanner.profile.firstName} ${history.scanner.profile.lastName}`;
  }
  
  // Nếu chỉ có first name
  if (history.scanner?.profile?.firstName) {
    return history.scanner.profile.firstName;
  }
  
  // Nếu chỉ có last name
  if (history.scanner?.profile?.lastName) {
    return history.scanner.profile.lastName;
  }
  
  // Nếu có email
  if (history.scanner?.email) {
    return history.scanner.email;
  }
  
  // Trường hợp mặc định hiển thị userId
  return history.scannedBy || t('Unknown');
};
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <PageHeader
      :title="t('Tra cứu vé')"
      :description="t('Tra cứu thông tin vé và in ấn')"
    />

    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">{{ t('Tra cứu mã QR') }}</h2>
      
      <div class="mb-6">
        <label for="qr-input" class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Nhập mã QR') }}
        </label>
        <div class="flex space-x-2">
          <input
            id="qr-input"
            v-model="qrCode"
            @input="handleInput"
            @keydown="handleKeyDown"
            type="text"
            class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :placeholder="t('Nhập hoặc quét mã QR')"
            :disabled="isLoading"
          />
          <button
            @click="scanTicket"
            :disabled="isLoading || !qrCode"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="isLoading">{{ t('Đang tra cứu...') }}</span>
            <span v-else>{{ t('Tra cứu') }}</span>
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-2">
          {{ t('Sử dụng máy quét mã QR hoặc nhập mã thủ công') }}
        </p>
        <p class="text-sm font-medium text-blue-600 mt-1">
          {{ t('Nếu sử dụng máy quét mã vạch, vui lòng nhấn Enter sau khi quét hoặc đợi hệ thống tự xử lý.') }}
        </p>
      </div>

      <!-- Nút chuyển đổi sang tìm kiếm theo thông tin khách hàng -->
      <button 
        @click="toggleCustomerSearch" 
        class="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800"
      >
        <UserIcon class="w-4 h-4" />
        <span>{{ showCustomerSearch ? t('Quay lại tra cứu mã QR') : t('Tìm theo thông tin khách hàng') }}</span>
      </button>

      <!-- Tìm kiếm theo thông tin khách hàng -->
      <div v-if="showCustomerSearch" class="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 class="text-lg font-semibold mb-4 text-blue-800">{{ t('Tìm vé theo thông tin khách hàng') }}</h3>
        
        <!-- Hướng dẫn tìm vé -->
        <div v-if="customerTip" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg relative">
          <button @click="closeTip" class="absolute top-2 right-2 text-yellow-500 hover:text-yellow-700">
            <span class="sr-only">Close</span>
            <i class="fas fa-times"></i>
          </button>
          <div class="flex items-start">
            <div class="flex-shrink-0 text-yellow-500">
              <i class="fas fa-lightbulb text-xl"></i>
            </div>
            <div class="ml-3">
              <h4 class="text-sm font-bold text-yellow-800">{{ t('Mẹo tìm kiếm:') }}</h4>
              <ul class="mt-1 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                <li>{{ t('Nhập đúng email hoặc số điện thoại để tìm chính xác') }}</li>
                <li>{{ t('Có thể tìm kiếm vé theo trạng thái đã/chưa sử dụng') }}</li>
                <li>{{ t('Sử dụng bộ lọc ngày đặt hàng để thu hẹp kết quả') }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Form tìm kiếm -->
        <div class="space-y-4">
          <p class="text-sm text-gray-600">{{ t('Nhập email hoặc số điện thoại để tìm vé, có thể tìm theo 1 trong 2 thông tin') }}</p>
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Email input -->
            <div>
              <label for="customer-email" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Email khách hàng') }}
              </label>
              <input
                id="customer-email"
                v-model="customerEmail"
                type="email"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                :placeholder="t('Nhập email khách hàng')"
                :disabled="isSearchingCustomer"
              />
            </div>
            
            <!-- Phone input -->
            <div>
              <label for="customer-phone" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Số điện thoại khách hàng') }}
              </label>
              <PhoneInput
                v-model="customerPhone"
                v-model:phoneCode="customerPhoneCode"
                :disabled="isSearchingCustomer"
                :placeholder="t('Nhập số điện thoại')"
                class="phone-input-scanner"
              />
            </div>
          </div>
          
          <!-- Bộ lọc bổ sung -->
          <div class="mt-4 border-t pt-4 border-blue-200">
            <h4 class="font-medium text-blue-800 mb-3">{{ t('Bộ lọc bổ sung') }}</h4>
            
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <!-- Trạng thái vé filter -->
              <div>
                <label for="ticket-status" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Trạng thái vé') }}
                </label>
                <select
                  id="ticket-status"
                  v-model="ticketStatus"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                  :disabled="isSearchingCustomer"
                >
                  <option value="">{{ t('Tất cả') }}</option>
                  <option value="used">{{ t('Đã sử dụng') }}</option>
                  <option value="unused">{{ t('Chưa sử dụng') }}</option>
                </select>
              </div>
              
              <!-- Ngày đặt hàng filter -->
              <div>
                <label for="order-date-from" class="block text-sm font-bold text-gray-700 mb-1">
                  {{ t('Từ ngày') }}
                </label>
                <input
                  id="order-date-from"
                  v-model="orderDateRange.start"
                  type="date"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                  :disabled="isSearchingCustomer"
                />
              </div>
              
              <div>
                <label for="order-date-to" class="block text-sm font-bold text-gray-700 mb-1">
                  {{ t('Đến ngày') }}
                </label>
                <input
                  id="order-date-to"
                  v-model="orderDateRange.end"
                  type="date"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px]"
                  :disabled="isSearchingCustomer"
                />
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button
              @click="searchCustomerTickets"
              :disabled="isSearchingCustomer || (!customerEmail && !customerPhone)"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span v-if="isSearchingCustomer">{{ t('Đang tìm...') }}</span>
              <span v-else>{{ t('Tìm kiếm') }}</span>
            </button>
          </div>
          
          <!-- Kết quả tìm kiếm -->
          <div v-if="customerTickets.length > 0" class="mt-4">
            <h4 class="font-semibold text-gray-700 mb-3">{{ t('Vé của khách hàng') }}</h4>
            <div class="border rounded-md overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Mã đơn hàng') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Sản phẩm') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Trạng thái vé') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Lượt quét') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Trạng thái đơn') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Ngày mua') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Thông tin KH') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Hành động') }}</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="ticket in customerTickets" :key="ticket.id">
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ ticket.order?.orderCode || t('N/A') }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {{ ticket.product?.translations?.[0]?.title || t('Unknown Product') }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-bold',
                          ticket.isUsed 
                            ? 'bg-orange-100 text-orange-800 border border-orange-500' 
                            : 'bg-green-100 text-green-800 border border-green-500'
                        ]"
                      >
                        {{ ticket.isUsed ? t('ĐÃ SỬ DỤNG') : t('CHƯA SỬ DỤNG') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                      <span class="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        {{ ticket.scanCount || 0 }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-bold',
                          ticket.order?.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ ticket.order?.paymentStatus === 'paid' ? t('ĐÃ THANH TOÁN') : t('CHƯA THANH TOÁN') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(ticket.order?.createdAt) }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">
                      <div class="space-y-1">
                        <p class="font-medium">{{ ticket.order?.customerName || t('N/A') }}</p>
                        <p v-if="ticket.order?.customerEmail" class="text-xs">{{ ticket.order.customerEmail }}</p>
                        <p v-if="ticket.order?.customerPhone" class="text-xs">{{ ticket.order.customerPhone }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      <div class="flex space-x-2">
                        <button 
                          @click="viewCustomerTicket(ticket.qrCode)"
                          class="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          title="Xem thông tin vé"
                        >
                          <SearchIcon class="w-4 h-4" />
                        </button>
                        
                        <button 
                          @click="openPrintModal(ticket)"
                          class="p-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          title="In vé"
                        >
                          <PrinterIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông báo lỗi -->
      <div v-if="errorMessage" class="mb-6 p-4 rounded-lg border-2 border-red-500 bg-red-50 text-red-800">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-bold">
              {{ errorMessage.includes('chưa được thanh toán') ? 'VÉ CHƯA THANH TOÁN' : 'LỖI TRA CỨU VÉ' }}
            </h3>
            <p class="mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Scan Result -->
      <div v-if="scanResult" class="mt-6">
        <div
          :class="[
            'p-4 mb-4 rounded-md border-2',
            scanResult.success 
              ? scanResult.isFirstScan 
                ? 'bg-green-50 text-green-800 border-green-500' 
                : 'bg-orange-50 text-orange-800 border-orange-500'
              : 'bg-red-50 text-red-800 border-red-500'
          ]"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <i
                :class="[
                  'text-2xl',
                  scanResult.success 
                    ? scanResult.isFirstScan 
                      ? 'fas fa-check-circle text-green-600' 
                      : 'fas fa-exclamation-triangle text-orange-600'
                    : 'fas fa-times-circle text-red-600'
                ]"
              ></i>
            </div>
            <div class="ml-3">
              <h3 class="text-base font-bold">{{ scanResult.message }}</h3>
            </div>
          </div>
        </div>

        <!-- Ticket Details (if success) -->
        <div v-if="scanResult.success && scanResult.orderItem" class="bg-gray-50 p-6 rounded-md border border-gray-200">
          <div class="flex justify-between mb-4">
            <h3 class="font-bold text-xl">{{ t('Thông tin vé') }}</h3>
            <button 
              v-if="scanResult.orderItem"
              @click="openPrintModal(scanResult.orderItem as any)"
              class="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <PrinterIcon class="w-4 h-4" />
              <span>{{ t('In vé') }}</span>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Sản phẩm') }}</p>
                  <p class="font-medium text-base">{{ scanResult.orderItem.product?.translations?.[0]?.title || 'Unknown Product' }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Mã đơn hàng') }}</p>
                  <p class="font-medium text-base">#{{ scanResult.orderItem.order?.orderCode || scanResult.orderItem.orderId }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Mã QR') }}</p>
                  <p class="font-medium text-base">{{ scanResult.orderItem.qrCode }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Trạng thái') }}</p>
                  <div class="mt-1">
                    <span 
                      :class="[
                        'px-3 py-1 rounded-full text-base font-bold inline-block',
                        scanResult.isFirstScan ? 'bg-green-100 text-green-800 border border-green-500' : 'bg-orange-100 text-orange-800 border border-orange-500'
                      ]"
                    >
                      {{ scanResult.isFirstScan ? t('CHƯA SỬ DỤNG') : t('ĐÃ SỬ DỤNG') }}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Lượt quét') }}</p>
                  <p class="font-bold text-lg mt-1">
                    <span class="px-3 py-1 rounded-full text-base font-bold inline-block bg-blue-100 text-blue-800 border border-blue-500">
                      {{ scanResult.scanCount || 0 }}
                    </span>
                  </p>
                </div>
              </div>
              
              <div class="space-y-3">
                <!-- Hiển thị ngày đi nếu có -->
                <div v-if="scanResult.orderItem.travelDate">
                  <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Ngày đi') }}</p>
                  <p class="font-medium text-base">
                    {{ formatVietnameseDate(new Date(scanResult.orderItem.travelDate)) }}
                    <span 
                      v-if="new Date(scanResult.orderItem.travelDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)" 
                      class="ml-2 px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-500"
                    >
                      {{ t('HÔM NAY') }}
                    </span>
                  </p>
                </div>
                
                <!-- Thông tin khách hàng (nếu có) -->
                <template v-if="scanResult.orderItem.order">
                  <div v-if="scanResult.orderItem.order.customerName">
                    <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Khách hàng') }}</p>
                    <p class="font-medium text-base">{{ scanResult.orderItem.order.customerName }}</p>
                  </div>
                  
                  <div v-if="scanResult.orderItem.order.customerEmail">
                    <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Email') }}</p>
                    <p class="font-medium text-base">{{ scanResult.orderItem.order.customerEmail }}</p>
                  </div>
                  
                  <div v-if="scanResult.orderItem.order.customerPhone">
                    <p class="text-sm font-bold text-gray-700 uppercase">{{ t('Số điện thoại') }}</p>
                    <p class="font-medium text-base">{{ scanResult.orderItem.order.customerPhone }}</p>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lịch sử quét vé -->
      <div v-if="showHistory && scanHistories.length > 0" class="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold mb-4">{{ t('Lịch sử quét vé') }}</h3>
        
        <div class="border rounded-md overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Thời gian') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Người quét') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Địa điểm') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Thiết bị') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Trạng thái') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{{ t('Lần quét thứ #') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="history in scanHistories" :key="history.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatDate(history.scannedAt) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatUserName(history) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ history.location || t('Không rõ') }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ history.deviceInfo?.name || t('Không rõ') }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-bold',
                      history.isFirstScan ? 'bg-green-100 text-green-800 border border-green-500' : 'bg-orange-100 text-orange-800 border border-orange-500'
                    ]"
                  >
                    {{ history.isFirstScan ? t('LẦN ĐẦU') : t('ĐÃ DÙNG') }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                  <span class="px-3 py-1 rounded-full text-base font-bold inline-block bg-blue-100 text-blue-800 border border-blue-500">
                    {{ history.scanCount || '?' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal in vé -->
    <div v-if="showPrintModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 m-4">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ t('In vé') }}
          </h3>
          <button @click="closePrintModal" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-sm text-gray-600 mb-4">
            {{ t('Chọn kích thước vé muốn in. Vui lòng đảm bảo máy in và khổ giấy được cài đặt phù hợp.') }}
          </p>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div 
              v-for="size in printSizes" 
              :key="size.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer',
                selectedPrintSize === size.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              ]"
              @click="selectedPrintSize = size.id"
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold">{{ size.name }}</h4>
                <div 
                  :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    selectedPrintSize === size.id
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  ]"
                >
                  <i v-if="selectedPrintSize === size.id" class="fas fa-check text-white text-xs"></i>
                </div>
              </div>
              <p class="text-xs text-gray-500">{{ size.width }} x {{ size.height }}</p>
              <p v-if="size.description" class="text-xs text-gray-600 mt-1">{{ size.description }}</p>
            </div>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-lightbulb text-yellow-600"></i>
              </div>
              <div class="ml-3">
                <h4 class="font-medium">{{ t('Lưu ý khi in:') }}</h4>
                <ul class="mt-1 list-disc pl-5 space-y-1">
                  <li>{{ t('Đảm bảo máy in được kết nối và cài đặt đúng') }}</li>
                  <li>{{ t('Kiểm tra khổ giấy trong máy in trước khi in') }}</li>
                  <li>{{ t('Sử dụng khổ A4 để in vé đầy đủ thông tin') }}</li>
                  <li>{{ t('Khổ nhỏ sẽ in ít thông tin hơn nhưng tiết kiệm giấy') }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="closePrintModal"
            class="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ t('Hủy') }}
          </button>
          
          <button
            @click="printTicket"
            class="px-4 py-2 bg-green-600 border border-transparent rounded-md font-bold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            :disabled="isPrinting"
          >
            <span v-if="isPrinting">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ t('Đang in...') }}
            </span>
            <span v-else>
              <i class="fas fa-print mr-2"></i>
              {{ t('In vé') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone-input-scanner :deep(input) {
  height: 42px !important;
}

.phone-input-scanner :deep(.phone-code-selector button) {
  height: 42px !important;
}
</style>