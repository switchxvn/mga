export interface IUpload {
  id: number;
  originalName: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  url: string;
  provider: string;
  uploadBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUploadConfig {
  id: number;
  provider: string;
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  publicUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPresignedUrlResponse {
  uploadId: number;
  presignedUrl: string;
  url: string;
} 