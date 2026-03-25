/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * S3 Storage Provider - مزود التخزين S3
 * 
 * @module infrastructure/providers/storage/s3-storage.provider
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetSignedUrlCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import {
  IStorageProvider,
  UploadRequest,
  UploadResult,
  FileInfo,
  SignedUrlOptions,
  CopyOptions,
  ListOptions,
  ListResult,
  ImageTransformOptions,
  ImageTransformResult,
  StorageStats,
  FileType,
} from '@/core/interfaces/providers/storage.provider';
import { Result, ok, err } from '@/core/types/result';

// ==================== S3 Storage Provider ====================

/**
 * مزود التخزين S3 - للإنتاج
 */
export class S3StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly cdnUrl?: string;

  constructor(config: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    baseUrl?: string;
    cdnUrl?: string;
    endpoint?: string;
  }) {
    const clientConfig: S3ClientConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true;
    }

    this.client = new S3Client(clientConfig);
    this.bucket = config.bucket;
    this.baseUrl = config.baseUrl || `https://${config.bucket}.s3.${config.region}.amazonaws.com`;
    this.cdnUrl = config.cdnUrl;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private generateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    return 'other';
  }

  private mapS3Metadata(metadata: Record<string, string> | undefined): Record<string, unknown> | undefined {
    if (!metadata) return undefined;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      result[key] = value;
    }
    return result;
  }

  // ==================== Upload ====================

  async upload(request: UploadRequest): Promise<Result<UploadResult, Error>> {
    try {
      // Validate
      if (request.maxSizeBytes && request.size > request.maxSizeBytes) {
        return err(new Error(`File size ${request.size} exceeds maximum ${request.maxSizeBytes}`));
      }

      if (request.allowedTypes && !request.allowedTypes.includes(request.mimeType)) {
        return err(new Error(`File type ${request.mimeType} is not allowed`));
      }

      const id = this.generateId();
      const folder = request.folder || '';
      const key = folder ? `${folder}/${id}-${request.filename}` : `${id}-${request.filename}`;

      const buffer = request.file instanceof Buffer
        ? request.file
        : Buffer.isBuffer(request.file)
          ? request.file
          : Buffer.from(await (request.file as Blob).arrayBuffer());

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: request.mimeType,
        Metadata: request.metadata as Record<string, string>,
        ACL: request.isPublic ? 'public-read' : 'private',
      });

      await this.client.send(command);

      const hash = this.generateHash(buffer);

      return ok({
        id,
        url: `${this.baseUrl}/${key}`,
        key,
        filename: request.filename,
        mimeType: request.mimeType,
        size: request.size,
        hash,
        publicUrl: request.isPublic ? this.getPublicUrl(key) : undefined,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Upload failed'));
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    options?: Partial<UploadRequest>,
  ): Promise<Result<UploadResult, Error>> {
    return this.upload({
      file: buffer,
      filename,
      mimeType: options?.mimeType || 'application/octet-stream',
      size: buffer.length,
      ...options,
    });
  }

  async uploadBase64(
    base64: string,
    filename: string,
    options?: Partial<UploadRequest>,
  ): Promise<Result<UploadResult, Error>> {
    try {
      const buffer = Buffer.from(base64, 'base64');
      return this.uploadBuffer(buffer, filename, options);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Invalid base64 data'));
    }
  }

  async uploadFromUrl(
    url: string,
    options?: Partial<UploadRequest>,
  ): Promise<Result<UploadResult, Error>> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return err(new Error(`Failed to fetch URL: ${response.statusText}`));
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = options?.filename || 'download';

      return this.uploadBuffer(buffer, filename, {
        ...options,
        mimeType: options?.mimeType || response.headers.get('content-type') || 'application/octet-stream',
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Upload from URL failed'));
    }
  }

  async uploadMultiple(files: UploadRequest[]): Promise<Result<UploadResult[], Error>> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.upload(file);
      if (result.isErr()) {
        return err(result.error);
      }
      results.push(result.value);
    }

    return ok(results);
  }

  // ==================== Download ====================

  async download(key: string): Promise<Result<Buffer, Error>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      const body = await response.Body?.transformToByteArray();

      if (!body) {
        return err(new Error('Empty response body'));
      }

      return ok(Buffer.from(body));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Download failed'));
    }
  }

  async downloadStream(key: string): Promise<Result<ReadableStream, Error>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      
      if (!response.Body) {
        return err(new Error('Empty response body'));
      }

      // Convert to ReadableStream
      const stream = response.Body.transformToWebStream() as ReadableStream;
      return ok(stream);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Download stream failed'));
    }
  }

  async getSignedUrl(key: string, options?: SignedUrlOptions): Promise<Result<string, Error>> {
    try {
      const expiresIn = options?.expiresIn || 3600;
      
      let command;
      if (options?.action === 'write') {
        command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
      } else {
        command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
          ResponseContentType: options?.responseType,
          ResponseContentDisposition: options?.responseDisposition,
        });
      }

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return ok(url);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Get signed URL failed'));
    }
  }

  getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `${this.baseUrl}/${key}`;
  }

  // ==================== Info ====================

  async getFileInfo(key: string): Promise<Result<FileInfo, Error>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return ok({
        id: key.split('/').pop()?.split('-')[0] || key,
        key,
        url: this.getPublicUrl(key),
        filename: key.split('/').pop() || key,
        mimeType: response.ContentType || 'application/octet-stream',
        size: response.ContentLength || 0,
        hash: response.ETag?.replace(/"/g, ''),
        isPublic: false, // Would need additional call to determine
        metadata: this.mapS3Metadata(response.Metadata),
        createdAt: response.LastModified || new Date(),
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Get file info failed'));
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  async getHash(key: string): Promise<Result<string, Error>> {
    const info = await this.getFileInfo(key);
    if (info.isErr()) {
      return err(info.error);
    }
    return ok(info.value.hash || '');
  }

  // ==================== Update ====================

  async updateMetadata(
    key: string,
    metadata: Record<string, unknown>,
  ): Promise<Result<void, Error>> {
    try {
      // S3 requires copying the object to update metadata
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        Key: key,
        CopySource: `${this.bucket}/${key}`,
        Metadata: metadata as Record<string, string>,
        MetadataDirective: 'REPLACE',
      });

      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Update metadata failed'));
    }
  }

  async updateContentType(key: string, mimeType: string): Promise<Result<void, Error>> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        Key: key,
        CopySource: `${this.bucket}/${key}`,
        ContentType: mimeType,
        MetadataDirective: 'REPLACE',
      });

      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Update content type failed'));
    }
  }

  // ==================== Copy/Move ====================

  async copy(key: string, options: CopyOptions): Promise<Result<FileInfo, Error>> {
    try {
      const command = new CopyObjectCommand({
        Bucket: options.destinationBucket || this.bucket,
        Key: options.destinationKey,
        CopySource: `${this.bucket}/${key}`,
        ContentType: options.contentType,
        Metadata: options.metadata as Record<string, string>,
      });

      await this.client.send(command);

      return await this.getFileInfo(options.destinationKey);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Copy failed'));
    }
  }

  async move(key: string, destinationKey: string): Promise<Result<FileInfo, Error>> {
    try {
      // Copy to destination
      const copyResult = await this.copy(key, { destinationKey });
      if (copyResult.isErr()) {
        return err(copyResult.error);
      }

      // Delete source
      await this.delete(key);

      return copyResult;
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Move failed'));
    }
  }

  async rename(key: string, newName: string): Promise<Result<FileInfo, Error>> {
    const parts = key.split('/');
    parts.pop();
    const newKey = parts.length > 0 ? `${parts.join('/')}/${newName}` : newName;
    return this.move(key, newKey);
  }

  // ==================== Delete ====================

  async delete(key: string): Promise<Result<void, Error>> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Delete failed'));
    }
  }

  async deleteMultiple(keys: string[]): Promise<Result<{ deleted: string[]; failed: string[] }, Error>> {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      });

      const response = await this.client.send(command);
      
      const deleted = response.Deleted?.map((d) => d.Key || '') || [];
      const failed = response.Errors?.map((e) => e.Key || '') || [];

      return ok({ deleted, failed });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Delete multiple failed'));
    }
  }

  async deleteFolder(prefix: string): Promise<Result<number, Error>> {
    try {
      let count = 0;
      let continuationToken: string | undefined;

      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        const listResponse = await this.client.send(listCommand);
        const objects = listResponse.Contents || [];

        if (objects.length > 0) {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
              Objects: objects.map((obj) => ({ Key: obj.Key! })),
            },
          });

          await this.client.send(deleteCommand);
          count += objects.length;
        }

        continuationToken = listResponse.NextContinuationToken;
      } while (continuationToken);

      return ok(count);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Delete folder failed'));
    }
  }

  // ==================== List ====================

  async list(options?: ListOptions): Promise<Result<ListResult, Error>> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: options?.prefix,
        Delimiter: options?.delimiter,
        MaxKeys: options?.maxKeys || 100,
        ContinuationToken: options?.continuationToken,
      });

      const response = await this.client.send(command);

      const files: FileInfo[] = (response.Contents || []).map((obj) => ({
        id: obj.Key?.split('/').pop()?.split('-')[0] || obj.Key || '',
        key: obj.Key || '',
        url: this.getPublicUrl(obj.Key || ''),
        filename: obj.Key?.split('/').pop() || '',
        mimeType: 'application/octet-stream',
        size: obj.Size || 0,
        isPublic: false,
        createdAt: obj.LastModified || new Date(),
      }));

      const prefixes = (response.CommonPrefixes || []).map((p) => p.Prefix || '');

      return ok({
        files,
        prefixes,
        isTruncated: response.IsTruncated || false,
        continuationToken: response.NextContinuationToken,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('List failed'));
    }
  }

  async listFolder(folder: string): Promise<Result<FileInfo[], Error>> {
    const result = await this.list({ prefix: folder, delimiter: '/' });
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(result.value.files);
  }

  // ==================== Image Transform ====================

  async transformImage(
    key: string,
    options: ImageTransformOptions,
  ): Promise<Result<ImageTransformResult, Error>> {
    // S3 doesn't provide image transformation
    // In production, use CloudFront + Lambda@Edge or Cloudflare Images
    const info = await this.getFileInfo(key);
    if (info.isErr()) {
      return err(info.error);
    }

    // Return with transform parameters in URL (for CDN processing)
    const transformParams = new URLSearchParams();
    if (options.width) transformParams.set('w', String(options.width));
    if (options.height) transformParams.set('h', String(options.height));
    if (options.quality) transformParams.set('q', String(options.quality));
    if (options.format) transformParams.set('f', options.format);

    const transformUrl = `${this.getPublicUrl(key)}?${transformParams.toString()}`;

    return ok({
      url: transformUrl,
      key,
      width: options.width || 0,
      height: options.height || 0,
      size: info.value.size,
      format: options.format || 'jpeg',
    });
  }

  async createThumbnails(
    key: string,
    sizes: number[],
  ): Promise<Result<ImageTransformResult[], Error>> {
    const results: ImageTransformResult[] = [];

    for (const size of sizes) {
      const result = await this.transformImage(key, {
        width: size,
        height: size,
        fit: 'cover',
      });

      if (result.isOk()) {
        results.push(result.value);
      }
    }

    return ok(results);
  }

  async getImageInfo(key: string): Promise<Result<{
    width: number;
    height: number;
    format: string;
    hasAlpha: boolean;
    pages?: number;
  }, Error>> {
    // Would need image processing library
    // Return placeholder
    return ok({
      width: 0,
      height: 0,
      format: 'unknown',
      hasAlpha: false,
    });
  }

  // ==================== Stats ====================

  async getStats(): Promise<StorageStats> {
    // S3 doesn't provide bucket stats directly
    // Would need to iterate all objects or use CloudWatch
    return {
      totalFiles: 0,
      totalSize: 0,
      byType: {
        image: { count: 0, size: 0 },
        video: { count: 0, size: 0 },
        document: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        other: { count: 0, size: 0 },
      },
      byFolder: {},
    };
  }

  async getFolderSize(prefix: string): Promise<number> {
    let totalSize = 0;
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await this.client.send(command);
      totalSize += (response.Contents || []).reduce((sum, obj) => sum + (obj.Size || 0), 0);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return totalSize;
  }

  // ==================== Validation ====================

  isValidType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  isValidSize(size: number, maxSizeBytes: number): boolean {
    return size <= maxSizeBytes;
  }

  // ==================== Bucket/Container ====================

  async createFolder(folder: string): Promise<Result<void, Error>> {
    try {
      // S3 folders are just keys ending with /
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${folder}/`,
        Body: '',
      });

      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Create folder failed'));
    }
  }

  async folderExists(folder: string): Promise<boolean> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `${folder}/`,
        MaxKeys: 1,
      });

      const response = await this.client.send(command);
      return (response.Contents?.length || 0) > 0;
    } catch {
      return false;
    }
  }
}
