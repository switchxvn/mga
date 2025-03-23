import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerLogosData1742637124950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO customer_logos (image_url, alt, link, "order", is_active)
      VALUES 
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/acb.png', 'Asia Commercial Bank', NULL, 1, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/cocacola.png', 'The Coca-Cola Company', NULL, 2, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/heineken.png', 'Heineken N.V.', NULL, 3, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/honda.png', 'Honda Motor Company, Ltd.', NULL, 4, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/lavie.png', 'La Vie (Nestlé Waters)', NULL, 5, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/myhao.png', 'My Hao Chemical Corporation', NULL, 6, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/number1.jpg', 'Number 1 (Tan Hiep Phat Group)', NULL, 7, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/pepsi.png', 'PepsiCo, Inc.', NULL, 8, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/samsung.svg', 'Samsung Electronics Co., Ltd.', NULL, 9, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/tavico.webp', 'Toyota An Viet Company (TAVICO)', NULL, 10, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/unilever.webp', 'Unilever plc', NULL, 11, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/vinamilk.png', 'Vietnam Dairy Products JSC (Vinamilk)', NULL, 12, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/vna.webp', 'Vietnam Airlines JSC', NULL, 13, true),
        ('https://s3mga.sgp1.digitaloceanspaces.com/partners/vppa.png', 'Vietnam Pulp and Paper Association (VPPA)', NULL, 14, true)
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM customer_logos`);
  }
} 