📦 src
 ┣ 📂 modules                # All feature modules (modular structure)
 ┃ ┣ 📂 user                 # Example feature module
 ┃ ┃ ┣ 📂 dto                # DTOs for data validation & transformation
 ┃ ┃ ┣ 📂 entities           # TypeORM or Prisma entities/models
 ┃ ┃ ┣ 📂 repositories       # Custom repositories (if using TypeORM)
 ┃ ┃ ┣ 📂 services           # Business logic (service layer)
 ┃ ┃ ┣ 📂 controllers        # API handlers (controller layer)
 ┃ ┃ ┣ 📜 user.module.ts     # NestJS module definition
 ┃ ┃ ┣ 📜 user.service.ts    # User service
 ┃ ┃ ┗ 📜 user.controller.ts # User controller
 ┃ ┣ 📂 auth                 # Authentication module (JWT, OAuth, etc.)
 ┃ ┣ 📂 product              # Example module
 ┃ ┗ 📂 common               # Common utilities and shared logic
 ┃   ┣ 📂 decorators         # Custom decorators (e.g., @AuthUser)
 ┃   ┣ 📂 exceptions         # Global error handling
 ┃   ┣ 📂 filters            # Exception filters (NestJS)
 ┃   ┣ 📂 guards             # Authorization & authentication guards
 ┃   ┣ 📂 interceptors       # Request/response interceptors
 ┃   ┣ 📂 middlewares        # Express/Nest middlewares
 ┃   ┗ 📂 pipes              # Validation & transformation pipes
 ┣ 📂 config                 # Configuration files (using @nestjs/config)
 ┃ ┣ 📜 database.config.ts   # Database connection settings
 ┃ ┣ 📜 jwt.config.ts        # JWT settings
 ┃ ┣ 📜 app.config.ts        # Global app settings
 ┣ 📂 database               # Database-related files
 ┃ ┣ 📂 migrations           # TypeORM/MikroORM migrations
 ┃ ┣ 📂 seeds                # Seeder scripts
 ┃ ┗ 📜 prisma.schema        # Prisma schema (if using Prisma)
 ┣ 📂 tests                  # Unit and e2e tests
 ┃ ┣ 📂 e2e                  # End-to-end tests
 ┃ ┣ 📜 user.service.spec.ts  # Unit tests for services
 ┃ ┗ 📜 auth.e2e-spec.ts      # End-to-end tests for authentication
 ┣ 📜 main.ts                # Entry point of the application
 ┣ 📜 app.module.ts          # Root module
 ┣ 📜 app.controller.ts      # Root controller
 ┣ 📜 app.service.ts         # Root service
 ┗ 📜 global-prefix.ts       # Global route prefix configuration
