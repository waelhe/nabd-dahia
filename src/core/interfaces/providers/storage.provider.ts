/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Storage Provider Interface - واجهة مزود التخزين
 * 
 * @module core/interfaces/providers/storage.provider
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * نوع الملف
 */
export type FileType = 'image' | 'video' | 'document' | 'audio' | 'other';

/**
 * رفع الملف
 */
export interface UploadRequest {
  file: Buffer | Blob | File;
  filename: string;
  mimeType: string;
  size: number;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

/**
 * نتيجة الرفع
 */
export interface UploadResult {
  id: string;
  url: string;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  hash?: string;
  publicUrl?: string;
  signedUrl?: string;
  signedUrlExpiresAt?: Date;
}

/**
 * معلومات الملف
 */
export interface FileInfo {
  id: string;
  key: string;
  url: string;
  filename: string;
  originalName?: string;
  mimeType: string;
  size: number;
  hash?: string;
  isPublic: boolean;
  folder?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * خيارات التوقيع
 */
export interface SignedUrlOptions {
  expiresIn?: number; // بالثواني
  action?: 'read' | 'write' | 'delete';
  responseType?: string;
  responseDisposition?: string;
}

/**
 * خيارات النسخ
 */
export interface CopyOptions {
  destinationKey: string;
  destinationBucket?: string;
  metadata?: Record<string, unknown>;
  contentType?: string;
}

/**
 * خيارات القائمة
 */
export interface ListOptions {
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  continuationToken?: string;
}

/**
 * نتيجة القائمة
 */
export interface ListResult {
  files: FileInfo[];
  prefixes: string[];
  isTruncated: boolean;
  continuationToken?: string;
}

/**
 * خيارات ضغط الصور
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
  background?: string;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
}

/**
 * نتيجة تحويل الصورة
 */
export interface ImageTransformResult {
  url: string;
  key: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * إحصائيات التخزين
 */
export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<FileType, { count: number; size: number }>;
  byFolder: Record<string, { count: number; size: number }>;
  oldestFile?: Date;
  newestFile?: Date;
}

/**
 * حدث التخزين
 */
export interface StorageEvent {
  type: 'uploaded' | 'deleted' | 'copied' | 'moved' | 'transformed';
  key: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ==================== Provider Interface ====================

/**
 * واجهة مزود التخزين
 */
export interface IStorageProvider {
  // ==================== Upload ====================

  /**
   * رفع ملف
   */
  upload(request: UploadRequest): Promise<Result<UploadResult, Error>>;

  /**
   * رفع من Buffer
   */
  uploadBuffer(buffer: Buffer, filename: string, options?: Partial<UploadRequest>): Promise<Result<UploadResult, Error>>;

  /**
   * رفع من Base64
   */
  uploadBase64(base64: string, filename: string, options?: Partial<UploadRequest>): Promise<Result<UploadResult, Error>>;

  /**
   * رفع من URL
   */
  uploadFromUrl(url: string, options?: Partial<UploadRequest>): Promise<Result<UploadResult, Error>>;

  /**
   * رفع متعدد
   */
  uploadMultiple(files: UploadRequest[]): Promise<Result<UploadResult[], Error>>;

  // ==================== Download ====================

  /**
   * تنزيل ملف
   */
  download(key: string): Promise<Result<Buffer, Error>>;

  /**
   * تنزيل كـ Stream
   */
  downloadStream(key: string): Promise<Result<ReadableStream, Error>>;

  /**
   * الحصول على URL موقّع
   */
  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<Result<string, Error>>;

  /**
   * الحصول على URL عام
   */
  getPublicUrl(key: string): string;

  // ==================== Info ====================

  /**
   * معلومات الملف
   */
  getFileInfo(key: string): Promise<Result<FileInfo, Error>>;

  /**
   * التحقق من الوجود
   */
  exists(key: string): Promise<boolean>;

  /**
   * حساب Hash
   */
  getHash(key: string): Promise<Result<string, Error>>;

  // ==================== Update ====================

  /**
   * تحديث Metadata
   */
  updateMetadata(key: string, metadata: Record<string, unknown>): Promise<Result<void, Error>>;

  /**
   * تحديث نوع المحتوى
   */
  updateContentType(key: string, mimeType: string): Promise<Result<void, Error>>;

  // ==================== Copy/Move ====================

  /**
   * نسخ ملف
   */
  copy(key: string, options: CopyOptions): Promise<Result<FileInfo, Error>>;

  /**
   * نقل ملف
   */
  move(key: string, destinationKey: string): Promise<Result<FileInfo, Error>>;

  /**
   * إعادة تسمية
   */
  rename(key: string, newName: string): Promise<Result<FileInfo, Error>>;

  // ==================== Delete ====================

  /**
   * حذف ملف
   */
  delete(key: string): Promise<Result<void, Error>>;

  /**
   * حذف متعدد
   */
  deleteMultiple(keys: string[]): Promise<Result<{ deleted: string[]; failed: string[] }, Error>>;

  /**
   * حذف مجلد
   */
  deleteFolder(prefix: string): Promise<Result<number, Error>>; // عدد المحذوفة

  // ==================== List ====================

  /**
   * قائمة الملفات
   */
  list(options?: ListOptions): Promise<Result<ListResult, Error>>;

  /**
   * ملفات المجلد
   */
  listFolder(folder: string): Promise<Result<FileInfo[], Error>>;

  // ==================== Image Transform ====================

  /**
   * تحويل صورة
   */
  transformImage(key: string, options: ImageTransformOptions): Promise<Result<ImageTransformResult, Error>>;

  /**
   * إنشاء صور مصغرة
   */
  createThumbnails(key: string, sizes: number[]): Promise<Result<ImageTransformResult[], Error>>;

  /**
   * معلومات الصورة
   */
  getImageInfo(key: string): Promise<Result<{
    width: number;
    height: number;
    format: string;
    hasAlpha: boolean;
    pages?: number;
  }, Error>>;

  // ==================== Stats ====================

  /**
   * إحصائيات التخزين
   */
  getStats(): Promise<StorageStats>;

  /**
   * حجم المجلد
   */
  getFolderSize(prefix: string): Promise<number>;

  // ==================== Validation ====================

  /**
   * التحقق من نوع الملف
   */
  isValidType(mimeType: string, allowedTypes: string[]): boolean;

  /**
   * التحقق من الحجم
   */
  isValidSize(size: number, maxSizeBytes: number): boolean;

  // ==================== Bucket/Container ====================

  /**
   * إنشاء مجلد
   */
  createFolder(folder: string): Promise<Result<void, Error>>;

  /**
   * التحقق من وجود المجلد
   */
  folderExists(folder: string): Promise<boolean>;
}

// Type for ReadableStream
declare global {
  interface ReadableStream {
    readonly locked: boolean;
    cancel(): Promise<void>;
    getReader(): ReadableStreamDefaultReader;
    pipeTo(dest: WritableStream): Promise<void>;
    pipeThrough(transform: TransformStream): ReadableStream;
  }
}
