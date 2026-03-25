/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Concurrency Service Interface - واجهة خدمة التزامن
 * 
 * @module core/interfaces/services/concurrency.service
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * حالة القفل
 */
export type LockState = 'acquired' | 'waiting' | 'timeout' | 'released';

/**
 * نوع القفل
 */
export type DistributedLockType = 'exclusive' | 'shared' | 'read_write';

/**
 * خيارات القفل الموزع
 */
export interface DistributedLockOptions {
  ttl?: number; // milliseconds
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

/**
 * القفل الموزع
 */
export interface DistributedLock {
  id: string;
  key: string;
  holder: string;
  type: DistributedLockType;
  acquiredAt: Date;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * نتيجة طلب القفل
 */
export interface LockAcquireResult {
  acquired: boolean;
  lock?: DistributedLock;
  currentHolder?: string;
  waitTime?: number;
}

/**
 * السيمافور
 */
export interface Semaphore {
  key: string;
  maxCount: number;
  currentCount: number;
  waiters: number;
  createdAt: Date;
}

/**
 * خيارات السيمافور
 */
export interface SemaphoreOptions {
  ttl?: number;
  timeout?: number;
}

/**
 * Rate Limiter
 */
export interface RateLimiterConfig {
  key: string;
  maxRequests: number;
  windowMs: number;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

/**
 * حالة Rate Limiter
 */
export interface RateLimiterStatus {
  key: string;
  totalHits: number;
  remainingHits: number;
  resetAt: Date;
  isBlocked: boolean;
  blockedUntil?: Date;
}

/**
 * Circuit Breaker
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half_open';

/**
 * Circuit Breaker Config
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // milliseconds
  resetTimeout: number; // milliseconds before trying again
  onStateChange?: (oldState: CircuitBreakerState, newState: CircuitBreakerState) => void;
}

/**
 * Circuit Breaker Stats
 */
export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  nextAttempt?: Date;
}

/**
 * قائمة الانتظار
 */
export interface QueueOptions {
  maxWorkers?: number;
  concurrency?: number;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * مهمة الانتظار
 */
export interface QueueTask<T = unknown> {
  id: string;
  queueName: string;
  data: T;
  priority?: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: unknown;
}

/**
 * إحصائيات الانتظار
 */
export interface QueueStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  averageWaitTime?: number;
  averageProcessTime?: number;
}

// ==================== Service Interface ====================

/**
 * واجهة خدمة التزامن
 */
export interface IConcurrencyService {
  // ==================== Distributed Lock ====================

  /**
   * طلب قفل
   */
  acquireLock(key: string, holder: string, options?: DistributedLockOptions): Promise<LockAcquireResult>;

  /**
   * طلب قفل أو انتظار
   */
  acquireLockOrWait(key: string, holder: string, options?: DistributedLockOptions): Promise<Result<DistributedLock, Error>>;

  /**
   * تحرير القفل
   */
  releaseLock(key: string, holder: string): Promise<boolean>;

  /**
   * تمديد القفل
   */
  extendLock(key: string, holder: string, ttl: number): Promise<boolean>;

  /**
   * التحقق من القفل
   */
  isLocked(key: string): Promise<boolean>;

  /**
   * حامل القفل
   */
  getLockHolder(key: string): Promise<string | null>;

  /**
   * معلومات القفل
   */
  getLockInfo(key: string): Promise<DistributedLock | null>;

  /**
   * الأقفال النشطة
   */
  getActiveLocks(filter?: { holder?: string; prefix?: string }): Promise<DistributedLock[]>;

  /**
   * تنظيف الأقفال المنتهية
   */
  cleanupExpiredLocks(): Promise<number>;

  // ==================== Semaphore ====================

  /**
   * إنشاء سيمافور
   */
  createSemaphore(key: string, maxCount: number): Promise<void>;

  /**
   * طلب تصريح
   */
  acquireSemaphore(key: string, holder: string, options?: SemaphoreOptions): Promise<Result<boolean, Error>>;

  /**
   * تحرير تصريح
   */
  releaseSemaphore(key: string, holder: string): Promise<void>;

  /**
   * معلومات السيمافور
   */
  getSemaphoreInfo(key: string): Promise<Semaphore | null>;

  /**
   * حذف سيمافور
   */
  deleteSemaphore(key: string): Promise<void>;

  // ==================== Rate Limiting ====================

  /**
   * إنشاء Rate Limiter
   */
  createRateLimiter(config: RateLimiterConfig): Promise<void>;

  /**
   * التحقق من Rate Limit
   */
  checkRateLimit(key: string, identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
  }>;

  /**
   * حالة Rate Limiter
   */
  getRateLimiterStatus(key: string, identifier: string): Promise<RateLimiterStatus>;

  /**
   * إعادة تعيين Rate Limiter
   */
  resetRateLimiter(key: string, identifier?: string): Promise<void>;

  /**
   * حذف Rate Limiter
   */
  deleteRateLimiter(key: string): Promise<void>;

  // ==================== Circuit Breaker ====================

  /**
   * إنشاء Circuit Breaker
   */
  createCircuitBreaker(name: string, config: CircuitBreakerConfig): Promise<void>;

  /**
   * تنفيذ مع Circuit Breaker
   */
  executeWithCircuitBreaker<T>(name: string, fn: () => Promise<T>): Promise<Result<T, Error>>;

  /**
   * حالة Circuit Breaker
   */
  getCircuitBreakerState(name: string): Promise<CircuitBreakerState>;

  /**
   * إحصائيات Circuit Breaker
   */
  getCircuitBreakerStats(name: string): Promise<CircuitBreakerStats>;

  /**
   * إعادة تعيين Circuit Breaker
   */
  resetCircuitBreaker(name: string): Promise<void>;

  /**
   * حذف Circuit Breaker
   */
  deleteCircuitBreaker(name: string): Promise<void>;

  // ==================== Job Queue ====================

  /**
   * إنشاء قائمة انتظار
   */
  createQueue(name: string, options?: QueueOptions): Promise<void>;

  /**
   * إضافة مهمة
   */
  enqueue<T>(queueName: string, data: T, options?: { priority?: number; delay?: number }): Promise<string>;

  /**
   * إضافة مهام متعددة
   */
  enqueueBatch<T>(queueName: string, items: T[]): Promise<string[]>;

  /**
   * الحصول على مهمة
   */
  dequeue<T>(queueName: string): Promise<QueueTask<T> | null>;

  /**
   * إكمال المهمة
   */
  completeTask(queueName: string, taskId: string, result?: unknown): Promise<void>;

  /**
   * فشل المهمة
   */
  failTask(queueName: string, taskId: string, error: string): Promise<void>;

  /**
   * إعادة محاولة المهمة
   */
  retryTask(queueName: string, taskId: string): Promise<void>;

  /**
   * إحصائيات القائمة
   */
  getQueueStats(queueName: string): Promise<QueueStats>;

  /**
   * مهام القائمة
   */
  getQueueTasks(queueName: string, status?: QueueTask['status'], options?: { limit?: number; offset?: number }): Promise<QueueTask[]>;

  /**
   * حذف مهمة
   */
  deleteTask(queueName: string, taskId: string): Promise<void>;

  /**
   * حذف القائمة
   */
  deleteQueue(queueName: string): Promise<void>;

  // ==================== Leader Election ====================

  /**
   * الترشح للقيادة
   */
  runForLeadership(electionKey: string, candidateId: string, ttl: number): Promise<boolean>;

  /**
   * التحقق من القيادة
   */
  isLeader(electionKey: string, candidateId: string): Promise<boolean>;

  /**
   * الحصول على القائد
   */
  getLeader(electionKey: string): Promise<string | null>;

  /**
   * التنازل عن القيادة
   */
  resignLeadership(electionKey: string, candidateId: string): Promise<void>;

  // ==================== Stats ====================

  /**
   * إحصائيات عامة
   */
  getStats(): Promise<{
    activeLocks: number;
    activeSemaphores: number;
    activeQueues: number;
    rateLimiters: number;
    circuitBreakers: number;
    totalQueuedTasks: number;
    processedTasks: number;
  }>;
}
