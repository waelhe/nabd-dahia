/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Transaction Service Implementation
 * 
 * تنفيذ خدمة المعاملات
 * 
 * @module infrastructure/services/transaction.service
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
  ITransactionService,
  TransactionContext,
  TransactionOptions,
  TransactionResult,
  TransactionCallback,
  TransactionLock,
  LockType,
  LockOptions,
  LockStatus,
  Savepoint,
  IsolationLevel,
} from '@/core/interfaces/services/transaction.service';
import { Result, ok, err } from '@/core/types/result';

// ==================== Transaction Service ====================

/**
 * تنفيذ خدمة المعاملات
 */
export class TransactionService implements ITransactionService {
  private activeTransactions: Map<string, TransactionContext> = new Map();
  private activeLocks: Map<string, TransactionLock> = new Map();
  private transactionCounter = 0;

  // ==================== Transaction ====================

  async run<T>(
    callback: TransactionCallback<T>,
    options?: TransactionOptions,
  ): Promise<Result<TransactionResult<T>, Error>> {
    const transactionId = this.generateTransactionId();
    const startTime = Date.now();

    const context: TransactionContext = {
      id: transactionId,
      startedAt: new Date(),
      isCompleted: false,
      isRolledBack: false,
      isolationLevel: options?.isolationLevel,
      metadata: {},
    };

    this.activeTransactions.set(transactionId, context);

    let retryCount = 0;
    const maxRetries = options?.retry?.maxAttempts ?? 1;

    while (retryCount < maxRetries) {
      try {
        // Set Prisma transaction options
        const txOptions: Prisma.TransactionOptions = {
          maxWait: options?.timeout ?? 5000,
          timeout: options?.timeout ?? 10000,
        };

        // Execute transaction
        const result = await db.$transaction(
          async (prismaTx) => {
            // Attach Prisma transaction to context
            (context as unknown as Record<string, unknown>).prismaTx = prismaTx;
            return callback(context);
          },
          txOptions,
        );

        context.isCompleted = true;
        this.activeTransactions.delete(transactionId);

        return ok({
          result,
          transactionId,
          duration: Date.now() - startTime,
          retryCount,
        });
      } catch (error) {
        retryCount++;

        const shouldRetry = this.shouldRetryTransaction(error as Error, retryCount, maxRetries);

        if (!shouldRetry) {
          context.isRolledBack = true;
          this.activeTransactions.delete(transactionId);

          return err(error instanceof Error ? error : new Error('Transaction failed'));
        }

        // Wait before retry
        if (options?.retry?.delay) {
          await this.delay(options.retry.delay * (options.retry.backoff === 'exponential' ? retryCount : 1));
        }

        // Call retry callback
        if (options?.retry?.onRetry) {
          options.retry.onRetry(retryCount, error as Error);
        }
      }
    }

    context.isRolledBack = true;
    this.activeTransactions.delete(transactionId);

    return err(new Error('Transaction failed after maximum retries'));
  }

  async runReadOnly<T>(callback: TransactionCallback<T>): Promise<Result<T, Error>> {
    try {
      const result = await db.$transaction(callback, {
        accessMode: 'ReadOnly',
      });
      return ok(result);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Read-only transaction failed'));
    }
  }

  async runSequential<T>(callbacks: TransactionCallback<T>[]): Promise<Result<T[], Error>> {
    const results: T[] = [];

    for (const callback of callbacks) {
      const result = await this.run(callback);
      if (result.isErr()) {
        return err(result.error);
      }
      results.push(result.value.result);
    }

    return ok(results);
  }

  async runParallel<T>(callbacks: TransactionCallback<T>[]): Promise<Result<T[], Error>> {
    try {
      const results = await Promise.all(
        callbacks.map((callback) =>
          db.$transaction((tx) => callback({
            id: this.generateTransactionId(),
            startedAt: new Date(),
            isCompleted: false,
            isRolledBack: false,
            metadata: {},
          })),
        ),
      );
      return ok(results);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Parallel transactions failed'));
    }
  }

  // ==================== Savepoint ====================

  async createSavepoint(tx: TransactionContext, name: string): Promise<Result<Savepoint, Error>> {
    // SQLite/Prisma doesn't support savepoints natively
    // This is a placeholder for future implementation
    const savepoint: Savepoint = {
      id: `sp_${Date.now()}`,
      transactionId: tx.id,
      name,
      createdAt: new Date(),
    };

    return ok(savepoint);
  }

  async rollbackToSavepoint(_tx: TransactionContext, _name: string): Promise<Result<void, Error>> {
    return err(new Error('Savepoints are not supported in the current configuration'));
  }

  async releaseSavepoint(_tx: TransactionContext, _name: string): Promise<Result<void, Error>> {
    return err(new Error('Savepoints are not supported in the current configuration'));
  }

  // ==================== Locking ====================

  async acquireLock(
    tx: TransactionContext,
    resourceType: string,
    resourceId: string,
    lockType: LockType,
    options?: LockOptions,
  ): Promise<Result<TransactionLock, Error>> {
    const lockId = `${resourceType}:${resourceId}`;
    const existingLock = this.activeLocks.get(lockId);

    // Check if resource is already locked
    if (existingLock) {
      // Check if lock is expired
      if (existingLock.expiresAt && existingLock.expiresAt < new Date()) {
        this.activeLocks.delete(lockId);
      } else if (lockType === 'exclusive' || existingLock.lockType === 'exclusive') {
        return err(new Error(`Resource ${lockId} is already locked with ${existingLock.lockType} lock`));
      }
    }

    const lock: TransactionLock = {
      id: this.generateLockId(),
      resourceId,
      resourceType,
      transactionId: tx.id,
      lockType,
      acquiredAt: new Date(),
      expiresAt: options?.timeout ? new Date(Date.now() + options.timeout) : undefined,
    };

    this.activeLocks.set(lockId, lock);

    return ok(lock);
  }

  async releaseLock(lockId: string): Promise<Result<void, Error>> {
    const deleted = this.activeLocks.delete(lockId);
    if (!deleted) {
      // Try to find by lock.id
      for (const [key, lock] of this.activeLocks.entries()) {
        if (lock.id === lockId) {
          this.activeLocks.delete(key);
          return ok(undefined);
        }
      }
      return err(new Error(`Lock ${lockId} not found`));
    }
    return ok(undefined);
  }

  async releaseTransactionLocks(transactionId: string): Promise<number> {
    let count = 0;

    for (const [key, lock] of this.activeLocks.entries()) {
      if (lock.transactionId === transactionId) {
        this.activeLocks.delete(key);
        count++;
      }
    }

    return count;
  }

  async getLockStatus(resourceType: string, resourceId: string): Promise<LockStatus> {
    const lockId = `${resourceType}:${resourceId}`;
    const lock = this.activeLocks.get(lockId);

    if (!lock) {
      return { locked: false };
    }

    // Check expiration
    if (lock.expiresAt && lock.expiresAt < new Date()) {
      this.activeLocks.delete(lockId);
      return { locked: false };
    }

    return {
      locked: true,
      lock,
      holder: {
        transactionId: lock.transactionId,
        acquiredAt: lock.acquiredAt,
      },
    };
  }

  async getActiveLocks(filter?: {
    resourceType?: string;
    transactionId?: string;
  }): Promise<TransactionLock[]> {
    let locks = Array.from(this.activeLocks.values());

    if (filter?.resourceType) {
      locks = locks.filter((l) => l.resourceType === filter.resourceType);
    }

    if (filter?.transactionId) {
      locks = locks.filter((l) => l.transactionId === filter.transactionId);
    }

    return locks;
  }

  async extendLock(lockId: string, duration: number): Promise<Result<void, Error>> {
    for (const lock of this.activeLocks.values()) {
      if (lock.id === lockId) {
        lock.expiresAt = new Date(Date.now() + duration);
        return ok(undefined);
      }
    }

    return err(new Error(`Lock ${lockId} not found`));
  }

  // ==================== Distributed ====================

  async runDistributed<T>(
    _callbacks: Array<{ service: string; callback: TransactionCallback<unknown> }>,
    _options?: TransactionOptions,
  ): Promise<Result<TransactionResult<T>, Error>> {
    // Distributed transactions require a saga pattern or 2PC coordinator
    return err(new Error('Distributed transactions are not implemented yet'));
  }

  async registerParticipant(_transactionId: string, _service: string): Promise<void> {
    // Placeholder for distributed transaction participants
  }

  async getParticipants(_transactionId: string): Promise<string[]> {
    return [];
  }

  // ==================== Status ====================

  async isActive(transactionId: string): Promise<boolean> {
    return this.activeTransactions.has(transactionId);
  }

  async getTransaction(transactionId: string): Promise<TransactionContext | null> {
    return this.activeTransactions.get(transactionId) || null;
  }

  async getActiveTransactions(): Promise<TransactionContext[]> {
    return Array.from(this.activeTransactions.values());
  }

  async getActiveCount(): Promise<number> {
    return this.activeTransactions.size;
  }

  // ==================== Timeout ====================

  async getTimedOutTransactions(): Promise<TransactionContext[]> {
    const now = new Date();
    const timedOut: TransactionContext[] = [];

    for (const tx of this.activeTransactions.values()) {
      // Consider a transaction timed out after 30 seconds
      const duration = now.getTime() - tx.startedAt.getTime();
      if (duration > 30000) {
        timedOut.push(tx);
      }
    }

    return timedOut;
  }

  async cleanupTimedOut(): Promise<number> {
    const timedOut = await this.getTimedOutTransactions();
    let count = 0;

    for (const tx of timedOut) {
      this.activeTransactions.delete(tx.id);
      await this.releaseTransactionLocks(tx.id);
      count++;
    }

    return count;
  }

  // ==================== Stats ====================

  async getStats(filter?: { from?: Date; to?: Date }): Promise<{
    total: number;
    committed: number;
    rolledBack: number;
    timedOut: number;
    averageDuration: number;
    maxDuration: number;
    byIsolationLevel: Record<IsolationLevel, number>;
    lockContentions: number;
    deadlockCount: number;
  }> {
    // This would typically query a database table for transaction logs
    // For now, return basic stats
    return {
      total: this.transactionCounter,
      committed: this.transactionCounter - this.activeTransactions.size,
      rolledBack: 0,
      timedOut: 0,
      averageDuration: 0,
      maxDuration: 0,
      byIsolationLevel: {
        read_uncommitted: 0,
        read_committed: 0,
        repeatable_read: 0,
        serializable: 0,
      },
      lockContentions: 0,
      deadlockCount: 0,
    };
  }

  // ==================== Recovery ====================

  async recoverPendingTransactions(): Promise<number> {
    // Clean up any orphaned transactions
    return this.cleanupTimedOut();
  }

  async retryFailed(_transactionId: string): Promise<Result<void, Error>> {
    return err(new Error('Transaction retry not available - original transaction data not persisted'));
  }

  // ==================== Private Methods ====================

  private generateTransactionId(): string {
    this.transactionCounter++;
    return `tx_${Date.now()}_${this.transactionCounter}`;
  }

  private generateLockId(): string {
    return `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private shouldRetryTransaction(error: Error, attempt: number, maxAttempts: number): boolean {
    if (attempt >= maxAttempts) return false;

    // Check for retryable errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2034: Transaction failed due to concurrent write
      // P2037: Transaction failed due to write conflict
      return error.code === 'P2034' || error.code === 'P2037';
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== Singleton ====================

export const transactionService = new TransactionService();
