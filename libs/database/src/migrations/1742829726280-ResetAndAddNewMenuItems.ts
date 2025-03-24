import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetAndAddNewMenuItems1742829726280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Clear existing data
    await queryRunner.query('DELETE FROM "menu_item_translations"');
    await queryRunner.query('DELETE FROM "menu_items"');

    // Insert menu items
    const menuItems = [
      { id: 1, order: 1, icon: null }, // XE NÂNG DẦU
      { id: 2, order: 2, icon: null }, // XE NÂNG ĐIỆN
      { id: 3, order: 3, icon: null }, // MÁY NÉN KHÍ
      { id: 4, order: 4, icon: null }, // MÁY PHÁT ĐIỆN
      { id: 5, order: 5, icon: null }, // DỊCH VỤ
      { id: 6, order: 6, icon: null }, // DỰ ÁN
      { id: 7, order: 7, icon: null }, // TUYỂN DỤNG
      { id: 8, order: 8, icon: null }, // LIÊN HỆ
    ];

    for (const item of menuItems) {
      await queryRunner.query(`
        INSERT INTO "menu_items" ("id", "order", "icon")
        VALUES ($1, $2, $3)
      `, [item.id, item.order, item.icon]);
    }

    // Insert translations
    const translations = [
      // XE NÂNG DẦU
      { menuItemId: 1, locale: 'en', label: 'DIESEL FORKLIFT', href: '/categories/diesel-forklift' },
      { menuItemId: 1, locale: 'vi', label: 'XE NÂNG DẦU', href: '/danh-muc-san-pham/xe-nang-dau' },
      { menuItemId: 1, locale: 'ko', label: '디젤 지게차', href: '/카테고리/디젤-지게차' },

      // XE NÂNG ĐIỆN
      { menuItemId: 2, locale: 'en', label: 'ELECTRIC FORKLIFT', href: '/categories/electric-forklift' },
      { menuItemId: 2, locale: 'vi', label: 'XE NÂNG ĐIỆN', href: '/danh-muc-san-pham/xe-nang-dien' },
      { menuItemId: 2, locale: 'ko', label: '전동 지게차', href: '/카테고리/전동-지게차' },

      // MÁY NÉN KHÍ
      { menuItemId: 3, locale: 'en', label: 'AIR COMPRESSOR', href: '/categories/air-compressor' },
      { menuItemId: 3, locale: 'vi', label: 'MÁY NÉN KHÍ', href: '/danh-muc-san-pham/may-nen-khi' },
      { menuItemId: 3, locale: 'ko', label: '공기 압축기', href: '/카테고리/공기-압축기' },

      // MÁY PHÁT ĐIỆN
      { menuItemId: 4, locale: 'en', label: 'GENERATOR', href: '/categories/generator' },
      { menuItemId: 4, locale: 'vi', label: 'MÁY PHÁT ĐIỆN', href: '/danh-muc-san-pham/may-phat-dien' },
      { menuItemId: 4, locale: 'ko', label: '발전기', href: '/카테고리/발전기' },

      // DỊCH VỤ
      { menuItemId: 5, locale: 'en', label: 'SERVICES', href: '/services' },
      { menuItemId: 5, locale: 'vi', label: 'DỊCH VỤ', href: '/dich-vu' },
      { menuItemId: 5, locale: 'ko', label: '서비스', href: '/서비스' },

      // DỰ ÁN
      { menuItemId: 6, locale: 'en', label: 'PROJECTS', href: '/projects' },
      { menuItemId: 6, locale: 'vi', label: 'DỰ ÁN', href: '/du-an' },
      { menuItemId: 6, locale: 'ko', label: '프로젝트', href: '/프로젝트' },

      // TUYỂN DỤNG
      { menuItemId: 7, locale: 'en', label: 'CAREERS', href: '/careers' },
      { menuItemId: 7, locale: 'vi', label: 'TUYỂN DỤNG', href: '/tuyen-dung' },
      { menuItemId: 7, locale: 'ko', label: '채용', href: '/채용' },

      // LIÊN HỆ
      { menuItemId: 8, locale: 'en', label: 'CONTACT', href: '/contact' },
      { menuItemId: 8, locale: 'vi', label: 'LIÊN HỆ', href: '/lien-he' },
      { menuItemId: 8, locale: 'ko', label: '연락처', href: '/연락처' },
    ];

    for (const translation of translations) {
      await queryRunner.query(`
        INSERT INTO "menu_item_translations" ("menu_item_id", "locale", "label", "href")
        VALUES ($1, $2, $3, $4)
      `, [translation.menuItemId, translation.locale, translation.label, translation.href]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "menu_item_translations"');
    await queryRunner.query('DELETE FROM "menu_items"');
  }
} 