import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { CountryPhoneCode } from './entities/country-phone-code.entity';
import { Post } from './entities/post.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ew_db',
  synchronize: false,
  logging: true,
  entities: [User, UserProfile, CountryPhoneCode, Post],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  subscribers: [],
});

export default AppDataSource; 