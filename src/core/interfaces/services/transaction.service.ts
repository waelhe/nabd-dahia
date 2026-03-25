/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Transaction Service Interface - واجهة خدمة المعاملات
 * 
 * @module core/interfaces/services/transaction.service
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * سياق المعاملة
 */
export interface TransactionContext {
  id: string;
  startedAt: Date;
  isCompleted: boolean;
  isRolledBack: boolean;
  isolationLevel?: IsolationLevel;
  metadata?: Record<string, unknown>;
}

/**
 * مستوى العزل
 */
export type IsolationLevel = 
  | 'read_uncommitted' 
  | 'read_committed' 
  | 'repeatable_read' 
  | 'serializable';

/**
 * رد نداء المعاملة
 */
export type TransactionCallback<T> = (tx: TransactionContext) => Promise<T>;

/**
 * خيارات المعاملة
 */
export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
  timeout?: number; // milliseconds
  retry?: RetryOptions;
  readOnly?: boolean;
}

/**
 * خيارات إعادة المحاولة
 */
export interface RetryOptions {
  maxAttempts: number;
  delay?: number; // milliseconds
  backoff?: 'fixed' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * نتيجة المعاملة
 */
export interface TransactionResult<T> {
  result: T;
  transactionId: string;
  duration: number;
  retryCount: number;
}

/**
 * قفل المعاملة
 */
export interface TransactionLock {
  id: string;
  resourceId: string;
  resourceType: string;
  transactionId: string;
  lockType: LockType;
  acquiredAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * نوع القفل
 */
export type LockType = 'shared' | 'exclusive' | 'update' | 'intent';

/**
 * خيارات القفل
 */
export interface LockOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * حالة القفل
 */
export interface LockStatus {
  locked: boolean;
  lock?: TransactionLock;
  holder?: {
    transactionId: string;
    acquiredAt: Date;
  };
}

/**
 * Savepoint
 */
export interface Savepoint {
  id: string;
  transactionId: string;
  name: string;
  createdAt: Date;
  snapshot?: Record<string, unknown>;
}

// ==================== Service Interface ====================

/**
 * واجهة خدمة المعاملات
 */
export interface ITransactionService {
  // ==================== Transaction ====================

  /**
   * تنفيذ معاملة
   */
  run<T>(callback: TransactionCallback<T>, options?: TransactionOptions): Promise<Result<TransactionResult<T>, Error>>;

  /**
   * تنفيذ معاملة للقراءة فقط
   */
  runReadOnly<T>(callback: TransactionCallback<T>): Promise<Result<T, Error>>;

  /**
   * تنفيذ معاملة متعددة
   */
  runSequential<T>(callbacks: TransactionCallback<T>[]): Promise<Result<T[], Error>>;

  /**
   * تنفيذ معاملات متوازية
   */
  runParallel<T>(callbacks: TransactionCallback<T>[]): Promise<Result<T[], Error>>;

  // ==================== Savepoint ====================

  /**
   * إنشاء savepoint
   */
  createSavepoint(tx: TransactionContext, name: string): Promise<Result<Savepoint, Error>>;

  /**
   * العودة لـ savepoint
   */
  rollbackToSavepoint(tx: TransactionContext, name: string): Promise<Result<void, Error>>;

  /**
   * حذف savepoint
   */
  releaseSavepoint(tx: TransactionContext, name: string): Promise<Result<void, Error>>;

  // ==================== Locking ====================

  /**
   * طلب قفل
   */
  acquireLock(
    tx: TransactionContext,
    resourceType: string,
    resourceId: string,
    lockType: LockType,
    options?: LockOptions
  ): Promise<Result<TransactionLock, Error>>;

  /**
   * تحرير القفل
   */
  releaseLock(lockId: string): Promise<Result<void, Error>>;

  /**
   * تحرير أقفال المعاملة
   */
  releaseTransactionLocks(transactionId: string): Promise<number>;

  /**
   * حالة القفل
   */
  getLockStatus(resourceType: string, resourceId: string): Promise<LockStatus>;

  /**
   * الأقفال النشطة
   */
  getActiveLocks(filter?: { resourceType?: string; transactionId?: string }): Promise<TransactionLock[]>;

  /**
   * تحديث وقت انتهاء القفل
   */
  extendLock(lockId: string, duration: number): Promise<Result<void, Error>>;

  // ==================== Distributed ====================

  /**
   * تنفيذ معاملة موزعة
   */
  runDistributed<T>(
    callbacks: Array<{ service: string; callback: TransactionCallback<unknown> }>,
    options?: TransactionOptions
  ): Promise<Result<TransactionResult<T>, Error>>;

  /**
   * تسجيل مشارك
   */
  registerParticipant(transactionId: string, service: string): Promise<void>;

  /**
   * تسجيل مشاركين
   */
  getParticipants(transactionId: string): Promise<string[]>;

  // ==================== Status ====================

  /**
   * معاملة نشطة؟
   */
  isActive(transactionId: string): Promise<boolean>;

  /**
   * معلومات المعاملة
   */
  getTransaction(transactionId: string): Promise<TransactionContext | null>;

  /**
   * المعاملات النشطة
   */
  getActiveTransactions(): Promise<TransactionContext[]>;

  /**
   * عدد المعاملات النشطة
   */
  getActiveCount(): Promise<number>;

  // ==================== Timeout ====================

  /**
   * معاملات منتهية المهلة
   */
  getTimedOutTransactions(): Promise<TransactionContext[]>;

  /**
   * تنظيف المعاملات المنتهية
   */
  cleanupTimedOut(): Promise<number>;

  // ==================== Stats ====================

  /**
   * إحصائيات المعاملات
   */
  getStats(filter?: { from?: Date; to?: Date }): Promise<{
    total: number;
    committed: number;
    rolledBack: number;
    timedOut: number;
    averageDuration: number;
    maxDuration: number;
    byIsolationLevel: Record<IsolationLevel, number>;
    lockContentions: number;
    deadlockCount: number;
  }>;

  // ==================== Recovery ====================

  /**
   * استرداد المعاملات
   */
  recoverPendingTransactions(): Promise<number>;

  /**
   * إعادة محاولة فاشلة
   */
  retryFailed(transactionId: string): Promise<Result<void, Error>>;
}
