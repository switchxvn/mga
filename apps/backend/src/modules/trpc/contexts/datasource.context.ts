import { Injectable } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../app.module';

@Injectable()
export class DataSourceContext {
  private static dataSource: DataSource | null = null;

  public async getDataSource(): Promise<DataSource> {
    if (!DataSourceContext.dataSource) {
      const app = await AppModule.getApp();
      DataSourceContext.dataSource = app.get(getDataSourceToken());
    }
    return DataSourceContext.dataSource;
  }
} 