/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit of Work Pattern - نمط وحدة العمل
 * 
 * @module infrastructure/repositories/unit-of-work
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { Result, ok, err } from '@/core/types/result';

// ==================== Types ====================

/**
 * سياق المعاملة
 */
export interface ITransactionContext {
  /**
   * تنفيذ استعلام داخل المعاملة
   */
  execute<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}

/**
 * وحدة العمل
 */
export interface IUnitOfWork {
  /**
   * بدء معاملة جديدة
   */
  begin(): Promise<void>;

  /**
   * تأكيد المعاملة
   */
  commit(): Promise<void>;

  /**
   * تراجع عن المعاملة
   */
  rollback(): Promise<void>;

  /**
   * تنفيذ معاملة تلقائية
   */
  executeInTransaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

  /**
   * الحصول على سياق المعاملة
   */
  getTransactionContext(): Prisma.TransactionClient | null;

  /**
   * هل المعاملة نشطة
   */
  isActive(): boolean;
}

/**
 * نتيجة المعاملة
 */
export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

// ==================== Unit of Work Implementation ====================

/**
 * تنفيذ وحدة العمل
 */
export class UnitOfWork implements IUnitOfWork {
  private transaction: Prisma.TransactionClient | null = null;
  private active: boolean = false;

  constructor() {}

  async begin(): Promise<void> {
    if (this.active) {
      throw new Error('Transaction is already active');
    }

    this.transaction = await db.$begin();
    this.active = true;
  }

  async commit(): Promise<void> {
    if (!this.active || !this.transaction) {
      throw new Error('No active transaction to commit');
    }

    await this.transaction.$commit();
    this.active = false;
    this.transaction = null;
  }

  async rollback(): Promise<void> {
    if (!this.active || !this.transaction) {
      throw new Error('No active transaction to rollback');
    }

    await this.transaction.$rollback();
    this.active = false;
    this.transaction = null;
  }

  async executeInTransaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return db.$transaction(async (tx) => {
      this.transaction = tx;
      this.active = true;

      try {
        const result = await fn(this);
        return result;
      } finally {
        this.active = false;
        this.transaction = null;
      }
    });
  }

  getTransactionContext(): Prisma.TransactionClient | null {
    return this.transaction;
  }

  isActive(): boolean {
    return this.active;
  }
}

// ==================== Transactional Context ====================

/**
 * سياق المعاملة للعمليات المتعددة
 */
export class TransactionalContext implements ITransactionContext {
  private tx: Prisma.TransactionClient | null = null;

  constructor(tx?: Prisma.TransactionClient) {
    this.tx = tx || null;
  }

  setTransaction(tx: Prisma.TransactionClient): void {
    this.tx = tx;
  }

  clearTransaction(): void {
    this.tx = null;
  }

  async execute<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    if (this.tx) {
      return fn(this.tx);
    }

    return db.$transaction(fn);
  }
}

// ==================== Unit of Work Factory ====================

/**
 * مصنع وحدات العمل
 */
export class UnitOfWorkFactory {
  private static instance: UnitOfWorkFactory;
  private unitOfWorks: Map<string, UnitOfWork> = new Map();

  private constructor() {}

  static getInstance(): UnitOfWorkFactory {
    if (!UnitOfWorkFactory.instance) {
      UnitOfWorkFactory.instance = new UnitOfWorkFactory();
    }
    return UnitOfWorkFactory.instance;
  }

  /**
   * إنشاء وحدة عمل جديدة
   */
  create(id?: string): UnitOfWork {
    const unitOfWorkId = id || `uow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const uow = new UnitOfWork();
    this.unitOfWorks.set(unitOfWorkId, uow);
    return uow;
  }

  /**
   * الحصول على وحدة عمل موجودة
   */
  get(id: string): UnitOfWork | undefined {
    return this.unitOfWorks.get(id);
  }

  /**
   * حذف وحدة عمل
   */
  remove(id: string): void {
    this.unitOfWorks.delete(id);
  }

  /**
   * تنفيذ معاملة تلقائية
   */
  async withTransaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    const uow = new UnitOfWork();
    return uow.executeInTransaction(fn);
  }
}

// ==================== Helper Functions ====================

/**
 * تنفيذ معاملة بسيطة
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return db.$transaction(fn);
}

/**
 * تنفيذ معاملة مع إعادة المحاولة
 */
export async function withTransactionRetry<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxRetries?: number;
    delayMs?: number;
  },
): Promise<Result<T, Error>> {
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 100;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await db.$transaction(fn);
      return ok(result);
    } catch (error) {
      // Check if it's a retryable error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2034: Transaction failed due to concurrent write
        // P2037: Transaction failed due to write conflict
        if (error.code === 'P2034' || error.code === 'P2037') {
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
            continue;
          }
        }
      }

      return err(error instanceof Error ? error : new Error('Transaction failed'));
    }
  }

  return err(new Error('Transaction failed after max retries'));
}

/**
 * تنفيذ معاملة مع مهلة زمنية
 */
export async function withTransactionTimeout<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  timeoutMs: number = 5000,
): Promise<Result<T, Error>> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Transaction timeout')), timeoutMs);
  });

  try {
    const result = await Promise.race([
      db.$transaction(fn),
      timeoutPromise,
    ]);
    return ok(result);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Transaction timeout'));
  }
}

// ==================== Export ====================

export const unitOfWorkFactory = UnitOfWorkFactory.getInstance();
