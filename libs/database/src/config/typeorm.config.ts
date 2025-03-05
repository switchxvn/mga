import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { Post } from '../entities/post.entity';
import { CountryPhoneCode } from '../entities/country-phone-code.entity';
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
  entities: [User, UserProfile, Post, CountryPhoneCode],
  migrations: ['libs/database/src/migrations/*.{ts,js}'],
  migrationsRun: true,
  synchronize: false,
  logging: process.env['NODE_ENV'] === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource; 