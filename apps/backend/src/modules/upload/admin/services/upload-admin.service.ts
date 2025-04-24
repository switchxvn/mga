import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../../entities/upload.entity';
import { UploadConfig } from '../../entities/upload-config.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadAdminService {
  private s3Client: S3Client;
  private uploadConfig: UploadConfig;

  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    @InjectRepository(UploadConfig)
    private readonly uploadConfigRepository: Repository<UploadConfig>,
  ) {}

  private async initializeS3Client() {
    if (!this.uploadConfig) {
      this.uploadConfig = await this.uploadConfigRepository.findOne({
        where: { isActive: true },
      });

      if (!this.uploadConfig) {
        throw new Error('No active upload configuration found');
      }

      this.s3Client = new S3Client({
        endpoint: this.uploadConfig.endpoint,
        region: this.uploadConfig.region,
        credentials: {
          accessKeyId: this.uploadConfig.accessKey,
          secretAccessKey: this.uploadConfig.secretKey,
        },
      });
    }
  }

  async getPresignedUrl(options: {
    filename: string;
    mimeType: string;
    size: number;
    uploadBy?: string;
  }) {
    await this.initializeS3Client();

    const ext = path.extname(options.filename);
    const key = `admin-uploads/${randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.uploadConfig.bucket,
      Key: key,
      ContentType: options.mimeType,
      ACL: 'public-read',
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    const upload = this.uploadRepository.create({
      originalName: options.filename,
      filename: path.basename(key),
      path: key,
      mimeType: options.mimeType,
      size: options.size,
      url: `${this.uploadConfig.publicUrl}/${key}`,
      uploadBy: options.uploadBy,
    });

    await this.uploadRepository.save(upload);

    return {
      uploadId: upload.id,
      presignedUrl,
      url: upload.url,
    };
  }

  async findAllUploads(options: { page: number; pageSize: number }) {
    const [uploads, total] = await this.uploadRepository.findAndCount({
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return {
      data: uploads,
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }

  async findUploadById(id: number) {
    return this.uploadRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async deleteUpload(id: number) {
    await this.uploadRepository.delete(id);
    return { success: true };
  }

  async getUploadConfig() {
    return this.uploadConfigRepository.findOne({
      where: { isActive: true },
    });
  }

  async updateUploadConfig(id: number, data: Partial<UploadConfig>) {
    await this.uploadConfigRepository.update(id, data);
    return this.uploadConfigRepository.findOne({
      where: { id },
    });
  }
} 