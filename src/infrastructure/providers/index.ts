/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Infrastructure Providers - مزودي البنية التحتية
 * 
 * @module infrastructure/providers
 */

// Storage Providers
export * from './storage';

// Payment Gateway Providers
export * from './payment-gateway';

// Notification Providers
export * from './notification';

// Search Providers
export * from './search';

// AI Providers
export * from './ai';

// Re-export interfaces
export {
  IStorageProvider,
  UploadRequest,
  UploadResult,
  FileInfo,
} from '@/core/interfaces/providers/storage.provider';

export {
  IPaymentGatewayProvider,
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentInfo,
} from '@/core/interfaces/providers/payment-gateway.provider';

export {
  INotificationProvider,
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from '@/core/interfaces/providers/notification.provider';

export {
  ISearchProvider,
  SearchRequest,
  SearchResult,
  SearchHit,
} from '@/core/interfaces/providers/search.provider';

export {
  IAIProvider,
  ChatRequest,
  ChatResponse,
  GenerateRequest,
  GenerateResponse,
} from '@/core/interfaces/providers/ai.provider';
