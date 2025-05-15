import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAdminMenuItemWithLucideIcons1745000000026 implements MigrationInterface {
  name = 'UpdateAdminMenuItemWithLucideIcons1745000000026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm cột icon_type để phân biệt loại icon (lucide, custom, etc.)
    await queryRunner.query(`
      ALTER TABLE admin_menu_items 
      ADD COLUMN icon_type VARCHAR(20) DEFAULT 'lucide'
    `);

    // 2. Cập nhật các icon hiện tại sang định dạng Lucide
    // Mapping các icon cũ sang tên icon tương ứng trong Lucide
    const iconMappings = {
      'fa-dashboard': 'LayoutDashboard',
      'fa-users': 'Users',
      'fa-user': 'User',
      'fa-shopping-cart': 'ShoppingCart',
      'fa-tags': 'Tags',
      'fa-tag': 'Tag',
      'fa-list': 'List',
      'fa-image': 'Image',
      'fa-images': 'Images',
      'fa-file': 'File',
      'fa-cog': 'Settings',
      'fa-gear': 'Settings',
      'fa-comment': 'MessageSquare',
      'fa-comments': 'MessageSquare',
      'fa-star': 'Star',
      'fa-ticket': 'Ticket',
      'fa-home': 'Home',
      'fa-envelope': 'Mail',
      'fa-bell': 'Bell',
      'fa-calendar': 'Calendar',
      'fa-chart-bar': 'BarChart',
      'fa-chart-line': 'LineChart',
      'fa-globe': 'Globe',
      'fa-language': 'Languages',
      'fa-money-bill': 'Banknote',
      'fa-credit-card': 'CreditCard',
      'fa-exchange': 'ArrowRightLeft',
      'fa-sliders': 'Sliders',
      'fa-th-large': 'LayoutGrid',
      'fa-th': 'Grid',
      'fa-bars': 'Menu',
      'fa-check': 'Check',
      'fa-times': 'X',
      'fa-plus': 'Plus',
      'fa-minus': 'Minus',
      'fa-edit': 'Edit',
      'fa-trash': 'Trash2',
      'fa-info-circle': 'Info',
      'fa-question-circle': 'HelpCircle',
      'fa-exclamation-circle': 'AlertCircle',
      'fa-check-circle': 'CheckCircle',
      'fa-times-circle': 'XCircle',
      'fa-search': 'Search',
      'fa-filter': 'Filter',
      'fa-sort': 'ArrowUpDown',
      'fa-download': 'Download',
      'fa-upload': 'Upload',
      'fa-link': 'Link',
      'fa-unlink': 'Unlink',
      'fa-external-link': 'ExternalLink',
      'fa-eye': 'Eye',
      'fa-eye-slash': 'EyeOff',
      'fa-lock': 'Lock',
      'fa-unlock': 'Unlock',
      'fa-key': 'Key',
      'fa-wrench': 'Wrench',
      'fa-tools': 'Settings',
      'fa-clipboard': 'Clipboard',
      'fa-clipboard-list': 'ClipboardList',
      'fa-copy': 'Copy',
      'fa-paste': 'Clipboard',
      'fa-save': 'Save',
      'fa-print': 'Printer',
      'fa-camera': 'Camera',
      'fa-video': 'Video',
      'fa-music': 'Music',
      'fa-play': 'Play',
      'fa-pause': 'Pause',
      'fa-stop': 'Square',
      'fa-forward': 'FastForward',
      'fa-backward': 'Rewind',
      'fa-step-forward': 'SkipForward',
      'fa-step-backward': 'SkipBack',
      'fa-eject': 'Eject',
      'fa-volume-up': 'Volume2',
      'fa-volume-down': 'Volume1',
      'fa-volume-off': 'VolumeX',
      'fa-phone': 'Phone',
      'fa-mobile': 'Smartphone',
      'fa-tablet': 'Tablet',
      'fa-laptop': 'Laptop',
      'fa-desktop': 'Monitor',
      'fa-server': 'Server',
      'fa-database': 'Database',
      'fa-cloud': 'Cloud',
      'fa-cloud-upload': 'CloudUpload',
      'fa-cloud-download': 'CloudDownload',
      'fa-wifi': 'Wifi',
      'fa-signal': 'Signal',
      'fa-power-off': 'Power',
      'fa-sign-in': 'LogIn',
      'fa-sign-out': 'LogOut',
      'fa-exchange-alt': 'ArrowRightLeft',
      'fa-sync': 'RefreshCw',
      'fa-spinner': 'Loader',
      'fa-circle-notch': 'Loader',
      'fa-map-marker': 'MapPin',
      'fa-map': 'Map',
      'fa-location-arrow': 'Navigation',
      'fa-compass': 'Compass',
      'fa-route': 'Route',
      'fa-car': 'Car',
      'fa-plane': 'Plane',
      'fa-ship': 'Ship',
      'fa-train': 'Train',
      'fa-bicycle': 'Bike',
      'fa-walking': 'PersonStanding',
      'fa-running': 'PersonRunning',
      'fa-shopping-bag': 'ShoppingBag',
      'fa-shopping-basket': 'ShoppingBasket',
      'fa-store': 'Store',
      'fa-store-alt': 'Store',
      'fa-box': 'Box',
      'fa-boxes': 'Package',
      'fa-archive': 'Archive',
      'fa-truck': 'Truck',
      'fa-dolly': 'Dolly',
      'fa-pallet': 'Package',
      'fa-warehouse': 'Warehouse',
      'fa-receipt': 'Receipt',
      'fa-file-invoice': 'FileText',
      'fa-file-invoice-dollar': 'FileText',
      'fa-file-alt': 'FileText',
      'fa-file-pdf': 'FilePdf',
      'fa-file-word': 'FileText',
      'fa-file-excel': 'FileSpreadsheet',
      'fa-file-powerpoint': 'FileText',
      'fa-file-image': 'FileImage',
      'fa-file-video': 'FileVideo',
      'fa-file-audio': 'FileAudio',
      'fa-file-code': 'FileCode',
      'fa-file-archive': 'FileArchive',
      'fa-folder': 'Folder',
      'fa-folder-open': 'FolderOpen',
      'fa-folder-plus': 'FolderPlus',
      'fa-folder-minus': 'FolderMinus',
      'fa-sitemap': 'Network',
      'fa-project-diagram': 'GitBranch',
      'fa-chart-pie': 'PieChart',
      'fa-chart-area': 'AreaChart',
      'fa-tachometer-alt': 'Gauge',
      'fa-tasks': 'ListTodo',
      'fa-clipboard-check': 'ClipboardCheck',
      'fa-list-ul': 'List',
      'fa-list-ol': 'ListOrdered',
      'fa-list-alt': 'ListChecks',
      'fa-check-square': 'CheckSquare',
      'fa-grip-horizontal': 'GripHorizontal',
      'fa-grip-vertical': 'GripVertical',
      'fa-grip-lines': 'GripHorizontal',
      'fa-grip-lines-vertical': 'GripVertical',
      'fa-ellipsis-h': 'MoreHorizontal',
      'fa-ellipsis-v': 'MoreVertical',
      'fa-arrows-alt': 'Move',
      'fa-expand': 'Maximize',
      'fa-compress': 'Minimize',
      'fa-expand-alt': 'Maximize2',
      'fa-compress-alt': 'Minimize2',
      'fa-arrows-alt-h': 'MoveHorizontal',
      'fa-arrows-alt-v': 'MoveVertical',
      'fa-random': 'Shuffle',
      'fa-sort-alpha-down': 'SortAsc',
      'fa-sort-alpha-up': 'SortDesc',
      'fa-sort-numeric-down': 'SortAsc',
      'fa-sort-numeric-up': 'SortDesc',
      'fa-sort-amount-down': 'SortAsc',
      'fa-sort-amount-up': 'SortDesc',
      'fa-long-arrow-alt-up': 'ArrowUp',
      'fa-long-arrow-alt-down': 'ArrowDown',
      'fa-long-arrow-alt-left': 'ArrowLeft',
      'fa-long-arrow-alt-right': 'ArrowRight',
      'fa-arrow-up': 'ArrowUp',
      'fa-arrow-down': 'ArrowDown',
      'fa-arrow-left': 'ArrowLeft',
      'fa-arrow-right': 'ArrowRight',
      'fa-arrow-circle-up': 'ArrowUpCircle',
      'fa-arrow-circle-down': 'ArrowDownCircle',
      'fa-arrow-circle-left': 'ArrowLeftCircle',
      'fa-arrow-circle-right': 'ArrowRightCircle',
      'fa-chevron-up': 'ChevronUp',
      'fa-chevron-down': 'ChevronDown',
      'fa-chevron-left': 'ChevronLeft',
      'fa-chevron-right': 'ChevronRight',
      'fa-angle-up': 'ChevronUp',
      'fa-angle-down': 'ChevronDown',
      'fa-angle-left': 'ChevronLeft',
      'fa-angle-right': 'ChevronRight',
      'fa-angle-double-up': 'ChevronsUp',
      'fa-angle-double-down': 'ChevronsDown',
      'fa-angle-double-left': 'ChevronsLeft',
      'fa-angle-double-right': 'ChevronsRight',
      'fa-caret-up': 'ChevronUp',
      'fa-caret-down': 'ChevronDown',
      'fa-caret-left': 'ChevronLeft',
      'fa-caret-right': 'ChevronRight',
      'fa-caret-square-up': 'ChevronUpSquare',
      'fa-caret-square-down': 'ChevronDownSquare',
      'fa-caret-square-left': 'ChevronLeftSquare',
      'fa-caret-square-right': 'ChevronRightSquare',
    };

    // Cập nhật các menu item hiện tại để sử dụng Lucide Icons
    for (const [oldIcon, newIcon] of Object.entries(iconMappings)) {
      await queryRunner.query(`
        UPDATE admin_menu_items 
        SET icon = '${newIcon}', icon_type = 'lucide'
        WHERE icon = '${oldIcon}' OR icon LIKE '%${oldIcon}%'
      `);
    }

    // Thêm menu items mới với RETURNING id để lấy ID của bản ghi vừa thêm
    const menuItemsResult = await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, icon_type, created_at, updated_at)
        VALUES ('menu-items', 'Menu Items', 'Menu', 'lucide', NOW(), NOW())
        RETURNING id
    `);
    
    // Lấy ID từ kết quả trả về
    const menuItemId = menuItemsResult[0]?.id;
    
    // Kiểm tra nếu có ID thì mới thêm các menu con
    if (menuItemId) {
      await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, icon_type, parent_id, created_at, updated_at)
          VALUES ('menu-items-list', 'Menu Items List', 'List', 'lucide', ${menuItemId}, NOW(), NOW())
      `);
      await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, icon_type, parent_id, created_at, updated_at)
          VALUES ('menu-items-create', 'Menu Items Create', 'Plus', 'lucide', ${menuItemId}, NOW(), NOW())
      `);
    }

    // 3. Cập nhật các menu item cụ thể liên quan đến Menu Items
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET icon = 'Menu', icon_type = 'lucide'
      WHERE code = 'menu-items' OR name LIKE '%Menu Items%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột icon_type
    await queryRunner.query(`
      ALTER TABLE admin_menu_items 
      DROP COLUMN icon_type
    `);

    // Không cần khôi phục các giá trị icon cũ vì sẽ rất phức tạp
    // và có thể gây mất dữ liệu
  }
} 