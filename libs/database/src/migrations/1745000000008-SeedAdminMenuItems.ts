import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminMenuItems1745000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Clear existing data except the default items (keep dashboard and settings)
    await queryRunner.query(`
      DELETE FROM admin_menu_items 
      WHERE code NOT IN ('dashboard', 'settings')
    `);

    // Seed content management menu items
    // 1. Content parent
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
      VALUES ('content', 'Content', 'FileText', NULL, NULL, 2, true, NULL)
      RETURNING id
    `).then(async (result) => {
      const contentId = result[0].id;
      
      // 1.1 Posts submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('posts', 'Posts', 'FileText', NULL, ${contentId}, 1, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const postsId = result[0].id;
        
        // Posts children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('posts-list', 'List All Posts', NULL, '/posts', ${postsId}, 1, true, NULL),
            ('posts-create', 'Create New Post', NULL, '/posts/create', ${postsId}, 2, true, NULL)
        `);
      });
      
      // 1.2 Categories submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('categories', 'Categories', 'Folder', NULL, ${contentId}, 2, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const categoriesId = result[0].id;
        
        // Categories children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('categories-list', 'List All Categories', NULL, '/categories', ${categoriesId}, 1, true, NULL),
            ('categories-create', 'Create New Category', NULL, '/categories/create', ${categoriesId}, 2, true, NULL)
        `);
      });
      
      // 1.3 Gallery submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('galleries', 'Gallery', 'Image', NULL, ${contentId}, 3, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const galleriesId = result[0].id;
        
        // Gallery children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('galleries-list', 'List All Galleries', NULL, '/galleries', ${galleriesId}, 1, true, NULL),
            ('galleries-create', 'Create New Gallery', NULL, '/galleries/create', ${galleriesId}, 2, true, NULL)
        `);
      });
    });

    // 2. User Management parent
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
      VALUES ('user-management', 'User Management', 'Users', NULL, NULL, 3, true, 'SUPER_ADMIN,USER_MANAGER')
      RETURNING id
    `).then(async (result) => {
      const userManagementId = result[0].id;
      
      // 2.1 Users submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('users', 'Users', 'Users', NULL, ${userManagementId}, 1, true, 'SUPER_ADMIN,USER_MANAGER')
        RETURNING id
      `).then(async (result) => {
        const usersId = result[0].id;
        
        // Users children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('users-list', 'List All Users', NULL, '/users', ${usersId}, 1, true, 'SUPER_ADMIN,USER_MANAGER'),
            ('users-create', 'Create New User', NULL, '/users/create', ${usersId}, 2, true, 'SUPER_ADMIN')
        `);
      });
      
      // 2.2 Roles submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('roles', 'Roles', 'UserCircle', NULL, ${userManagementId}, 2, true, 'SUPER_ADMIN')
        RETURNING id
      `).then(async (result) => {
        const rolesId = result[0].id;
        
        // Roles children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('roles-list', 'List All Roles', NULL, '/roles', ${rolesId}, 1, true, 'SUPER_ADMIN'),
            ('roles-create', 'Create New Role', NULL, '/roles/create', ${rolesId}, 2, true, 'SUPER_ADMIN')
        `);
      });
    });

    // 3. E-commerce parent
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
      VALUES ('ecommerce', 'E-commerce', 'ShoppingBag', NULL, NULL, 4, true, NULL)
      RETURNING id
    `).then(async (result) => {
      const ecommerceId = result[0].id;
      
      // 3.1 Products submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('products', 'Products', 'ShoppingBag', NULL, ${ecommerceId}, 1, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const productsId = result[0].id;
        
        // Products children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('products-list', 'List All Products', NULL, '/products', ${productsId}, 1, true, NULL),
            ('products-create', 'Create New Product', NULL, '/products/create', ${productsId}, 2, true, NULL)
        `);
      });
      
      // 3.2 Orders submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('orders', 'Orders', 'ShoppingCart', NULL, ${ecommerceId}, 2, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const ordersId = result[0].id;
        
        // Orders children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('orders-list', 'List All Orders', NULL, '/orders', ${ordersId}, 1, true, NULL),
            ('orders-pending', 'Pending Orders', NULL, '/orders?status=pending', ${ordersId}, 2, true, NULL)
        `);
      });
      
      // 3.3 Customers submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('customers', 'Customers', 'Users', '/customers', ${ecommerceId}, 3, true, NULL)
      `);
    });

    // 4. Reviews parent
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
      VALUES ('reviews-parent', 'Reviews', 'Star', NULL, NULL, 5, true, NULL)
      RETURNING id
    `).then(async (result) => {
      const reviewsParentId = result[0].id;
      
      // 4.1 Customer Reviews submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('customer-reviews', 'Customer Reviews', 'Star', NULL, ${reviewsParentId}, 1, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const customerReviewsId = result[0].id;
        
        // Customer Reviews children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('reviews-list', 'List All Reviews', NULL, '/reviews', ${customerReviewsId}, 1, true, NULL),
            ('reviews-add', 'Add New Review', NULL, '/reviews/add', ${customerReviewsId}, 2, true, NULL)
        `);
      });
      
      // 4.2 Service Types submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('service-types', 'Service Types', 'Tag', NULL, ${reviewsParentId}, 2, true, NULL)
        RETURNING id
      `).then(async (result) => {
        const serviceTypesId = result[0].id;
        
        // Service Types children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('service-types-list', 'List All Types', NULL, '/reviews/service-types', ${serviceTypesId}, 1, true, NULL),
            ('service-types-add', 'Add New Type', NULL, '/reviews/service-types/add', ${serviceTypesId}, 2, true, NULL)
        `);
      });
    });

    // 5. Theme Management parent
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
      VALUES ('theme-management', 'Theme Management', 'Palette', NULL, NULL, 6, true, 'SUPER_ADMIN')
      RETURNING id
    `).then(async (result) => {
      const themeManagementId = result[0].id;
      
      // 5.1 Themes submenu
      await queryRunner.query(`
        INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
        VALUES ('themes', 'Themes', 'Palette', NULL, ${themeManagementId}, 1, true, 'SUPER_ADMIN')
        RETURNING id
      `).then(async (result) => {
        const themesId = result[0].id;
        
        // Themes children
        await queryRunner.query(`
          INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
          VALUES 
            ('themes-list', 'List All Themes', NULL, '/themes', ${themesId}, 1, true, 'SUPER_ADMIN'),
            ('themes-create', 'Create New Theme', NULL, '/themes/create', ${themesId}, 2, true, 'SUPER_ADMIN')
        `);
      });
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore only the defaults items
    await queryRunner.query(`
      DELETE FROM admin_menu_items 
      WHERE code NOT IN ('dashboard', 'settings')
    `);
  }
} 