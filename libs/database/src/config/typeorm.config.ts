import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from backend's .env file
config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'],
  port: parseInt(process.env['DB_PORT'] || '5432'),
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_DATABASE'],
  entities: ['dist/apps/backend/src/modules/**/*.entity.js'],
  migrations: ['libs/database/src/migrations/*.{ts,js}'],
  migrationsRun: true,
  synchronize: false,
  logging: process.env['NODE_ENV'] === 'development',
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;