import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadConfig } from '../../../../apps/backend/src/modules/upload/entities/upload-config.entity';

@Injectable()
export class UploadConfigSeeder {
  private readonly logger = new Logger(UploadConfigSeeder.name);

  constructor(
    @InjectRepository(UploadConfig)
    private readonly uploadConfigRepository: Repository<UploadConfig>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting upload config seeding...');

    try {
      const config = {
        provider: 's3',
        endpoint: 'https://sgp1.digitaloceanspaces.com',
        region: 'sgp1',
        bucket: 'your-bucket-name',
        accessKey: 'your-access-key',
        secretKey: 'your-secret-key',
        publicUrl: 'https://your-bucket-name.sgp1.digitaloceanspaces.com',
        isActive: true,
      };

      const existingConfig = await this.uploadConfigRepository.findOne({
        where: { isActive: true },
      });

      if (existingConfig) {
        this.logger.log('Upload config already exists, skipping...');
        return;
      }

      const savedConfig = await this.uploadConfigRepository.save(config);
      this.logger.log(
        `Created upload config with ID: ${savedConfig.id}`
      );

      this.logger.log('Upload config seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding upload config: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
} 