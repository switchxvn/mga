import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../../entities/upload.entity';
import { UploadConfig } from '../../entities/upload-config.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadFrontendService {
  private readonly logger = new Logger(UploadFrontendService.name);
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
        forcePathStyle: true,
      });
    }
  }

  async getPresignedUrl(options: {
    filename: string;
    mimeType: string;
    size: number;
    folder?: string;
  }) {
    try {
      await this.initializeS3Client();

      // Basic validation
      if (!options.filename || !options.mimeType || !options.size) {
        throw new Error('Missing required fields');
      }

      const folder = options.folder || 'uploads';
      const ext = path.extname(options.filename) || '.png';
      const key = `${folder}/${randomUUID()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: this.uploadConfig.bucket,
        Key: key,
        ContentType: options.mimeType,
        ACL: 'public-read',
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      const publicUrl = `${this.uploadConfig.publicUrl}/${key}`;

      const upload = this.uploadRepository.create({
        originalName: options.filename,
        filename: path.basename(key),
        path: key,
        mimeType: options.mimeType,
        size: options.size,
        url: publicUrl,
        acl: 'public-read',
      });

      await this.uploadRepository.save(upload);

      return {
        uploadId: upload.id,
        presignedUrl,
        url: publicUrl,
        key,
      };
    } catch (error) {
      this.logger.error('Upload failed:', {
        error: error.message,
        options,
      });
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async uploadFileDirectly(options: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    size: number;
    folder: string;
  }) {
    try {
      await this.initializeS3Client();

      // Validate options
      if (!options.buffer || !options.filename || !options.mimeType) {
        throw new Error('Missing required file parameters');
      }

      const folder = options.folder || 'uploads';
      const ext = path.extname(options.filename) || '.png';
      const key = `${folder}/${randomUUID()}${ext}`;
      
      // Upload directly to S3
      const command = new PutObjectCommand({
        Bucket: this.uploadConfig.bucket,
        Key: key,
        Body: options.buffer,
        ContentType: options.mimeType,
        ACL: 'public-read',
      });

      // Execute upload command
      await this.s3Client.send(command);
      
      const publicUrl = `${this.uploadConfig.publicUrl}/${key}`;

      // Create upload record
      const upload = this.uploadRepository.create({
        originalName: options.filename,
        filename: path.basename(key),
        path: key,
        mimeType: options.mimeType,
        size: options.size,
        url: publicUrl,
        acl: 'public-read',
      });

      await this.uploadRepository.save(upload);

      this.logger.log(`File uploaded successfully: ${key}`);
      
      return {
        uploadId: upload.id,
        url: publicUrl,
        key,
      };
    } catch (error) {
      this.logger.error('Direct upload failed:', {
        error: error.message,
        filename: options.filename,
      });
      throw new Error(`Direct upload failed: ${error.message}`);
    }
  }

  async findUploadById(id: number) {
    return this.uploadRepository.findOne({
      where: { id },
    });
  }
} 