/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Storage Providers - مزودي التخزين
 * 
 * @module infrastructure/providers/storage
 */

export * from './local-storage.provider';
export * from './s3-storage.provider';

import { IStorageProvider } from '@/core/interfaces/providers/storage.provider';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

// ==================== Types ====================

export type StorageProviderType = 'local' | 's3';

export interface StorageConfig {
  type: StorageProviderType;
  local?: {
    basePath: string;
    baseUrl?: string;
  };
  s3?: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    baseUrl?: string;
    cdnUrl?: string;
    endpoint?: string;
  };
}

// ==================== Factory ====================

/**
 * إنشاء مزود التخزين المناسب
 */
export function createStorageProvider(config: StorageConfig): IStorageProvider {
  switch (config.type) {
    case 'local':
      return new LocalStorageProvider({
        basePath: config.local?.basePath || './uploads',
        baseUrl: config.local?.baseUrl || '/uploads',
      });

    case 's3':
      if (!config.s3) {
        throw new Error('S3 configuration is required for S3 storage provider');
      }
      return new S3StorageProvider({
        region: config.s3.region,
        bucket: config.s3.bucket,
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
        baseUrl: config.s3.baseUrl,
        cdnUrl: config.s3.cdnUrl,
        endpoint: config.s3.endpoint,
      });

    default:
      throw new Error(`Unknown storage provider type: ${config.type}`);
  }
}

// ==================== Singleton Instance ====================

let storageInstance: IStorageProvider | null = null;

/**
 * تهيئة مزود التخزين
 */
export function initializeStorage(config: StorageConfig): IStorageProvider {
  storageInstance = createStorageProvider(config);
  return storageInstance;
}

/**
 * الحصول على مزود التخزين
 */
export function getStorageProvider(): IStorageProvider {
  if (!storageInstance) {
    throw new Error('Storage provider not initialized. Call initializeStorage() first.');
  }
  return storageInstance;
}
