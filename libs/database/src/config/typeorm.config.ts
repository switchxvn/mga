import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { Post } from '../entities/post.entity';
import { CountryPhoneCode } from '../entities/country-phone-code.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432'),
  username: process.env['DB_USERNAME'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'password',
  database: process.env['DB_NAME'] || 'mydb',
  entities: [User, UserProfile, Post, CountryPhoneCode],
  migrations: ['libs/database/src/migrations/*.{ts,js}'],
  migrationsRun: true,
  logging: process.env['NODE_ENV'] === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 