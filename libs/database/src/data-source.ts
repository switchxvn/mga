import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { Theme } from '../../apps/backend/src/modules/theme/entities/theme.entity';
import { ThemeSection } from '../../apps/backend/src/modules/theme/entities/theme-section.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Theme,
    ThemeSection,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 