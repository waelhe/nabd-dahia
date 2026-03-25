/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base Repository Interface - واجهة المستودع الأساسية
 * 
 * @module core/interfaces/repositories/base.repository
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * خيارات البحث
 */
export interface FindOptions {
  include?: string[];
  select?: string[];
  withDeleted?: boolean;
}

/**
 * خيارات التصفح
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: OrderBy[];
  include?: string[];
  select?: string[];
}

/**
 * الترتيب
 */
export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * نتيجة التصفح
 */
export interface PaginatedResult<T> {
  /** البيانات */
  data: T[];
  /** البيانات (alias for data) */
  items: T[];
  /** العدد الإجمالي */
  total: number;
  /** الصفحة الحالية */
  page: number;
  /** عدد العناصر في الصفحة */
  limit: number;
  /** عدد الصفحات الإجمالي */
  totalPages: number;
  /** هل يوجد صفحة تالية */
  hasMore: boolean;
  /** معلومات التصفح التفصيلية */
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * معايير البحث الأساسية
 */
export interface SearchCriteria<T = Record<string, unknown>> {
  where?: T;
  query?: string;
  searchFields?: string[];
  orderBy?: OrderBy[];
  limit?: number;
  offset?: number;
}

/**
 * خيارات الكتابة
 */
export interface WriteOptions {
  userId?: string;
  reason?: string;
  skipValidation?: boolean;
}

/**
 * نتيجة العملية
 */
export interface OperationResult {
  success: boolean;
  affected?: number;
  message?: string;
  error?: Error;
}

// ==================== Base Repository Interface ====================

/**
 * واجهة المستودع الأساسية
 */
export interface IBaseRepository<T, TId = string, TCreate = Partial<T>, TUpdate = Partial<T>> {
  // ==================== Read ====================

  /**
   * البحث بالمعرف
   */
  findById(id: TId, options?: FindOptions): Promise<Result<T, Error>>;

  /**
   * البحث بالمعرف أو null
   */
  findByIdOrNull(id: TId, options?: FindOptions): Promise<T | null>;

  /**
   * البحث عن عنصر واحد
   */
  findOne(criteria: SearchCriteria): Promise<Result<T, Error>>;

  /**
   * البحث عن عنصر واحد أو null
   */
  findOneOrNull(criteria: SearchCriteria): Promise<T | null>;

  /**
   * البحث عن جميع العناصر
   */
  findAll(options?: FindOptions): Promise<T[]>;

  /**
   * البحث بمعايير
   */
  findMany(criteria: SearchCriteria): Promise<T[]>;

  /**
   * البحث مع التصفح
   */
  findPaginated(options: PaginationOptions, criteria?: SearchCriteria): Promise<PaginatedResult<T>>;

  /**
   * العد
   */
  count(criteria?: SearchCriteria): Promise<number>;

  /**
   * التحقق من الوجود
   */
  exists(id: TId): Promise<boolean>;

  /**
   * التحقق من الوجود بمعايير
   */
  existsBy(criteria: SearchCriteria): Promise<boolean>;

  // ==================== Create ====================

  /**
   * إنشاء
   */
  create(entity: TCreate, options?: WriteOptions): Promise<Result<T, Error>>;

  /**
   * إنشاء متعدد
   */
  createMany(entities: TCreate[], options?: WriteOptions): Promise<Result<T[], Error>>;

  // ==================== Update ====================

  /**
   * تحديث
   */
  update(id: TId, entity: TUpdate, options?: WriteOptions): Promise<Result<T, Error>>;

  /**
   * تحديث متعدد
   */
  updateMany(criteria: SearchCriteria, entity: TUpdate, options?: WriteOptions): Promise<Result<OperationResult, Error>>;

  // ==================== Delete ====================

  /**
   * حذف
   */
  delete(id: TId, options?: WriteOptions): Promise<Result<OperationResult, Error>>;

  /**
   * حذف متعدد
   */
  deleteMany(criteria: SearchCriteria, options?: WriteOptions): Promise<Result<OperationResult, Error>>;

  /**
   * حذف ناعم
   */
  softDelete?(id: TId, options?: WriteOptions): Promise<Result<OperationResult, Error>>;

  /**
   * استعادة
   */
  restore?(id: TId, options?: WriteOptions): Promise<Result<T, Error>>;
}

/**
 * مستودع للقراءة فقط
 */
export interface IReadOnlyRepository<T, TId = string> {
  findById(id: TId, options?: FindOptions): Promise<Result<T, Error>>;
  findByIdOrNull(id: TId, options?: FindOptions): Promise<T | null>;
  findOne(criteria: SearchCriteria): Promise<Result<T, Error>>;
  findOneOrNull(criteria: SearchCriteria): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  findMany(criteria: SearchCriteria): Promise<T[]>;
  findPaginated(options: PaginationOptions, criteria?: SearchCriteria): Promise<PaginatedResult<T>>;
  count(criteria?: SearchCriteria): Promise<number>;
  exists(id: TId): Promise<boolean>;
  existsBy(criteria: SearchCriteria): Promise<boolean>;
}

/**
 * مستودع يدعم الحذف الناعم
 */
export interface ISoftDeletableRepository<T, TId = string> extends IBaseRepository<T, TId> {
  findDeleted(options?: FindOptions): Promise<T[]>;
  findWithDeleted(options?: FindOptions): Promise<T[]>;
  forceDelete(id: TId, options?: WriteOptions): Promise<Result<OperationResult, Error>>;
}

/**
 * مستودع يدعم الإصدارات
 */
export interface IVersionedRepository<T, TId = string> extends IBaseRepository<T, TId> {
  updateWithVersion(id: TId, version: number, entity: Partial<T>, options?: WriteOptions): Promise<Result<T, Error>>;
}

/**
 * مستودع يدعم المعاملات
 */
export interface ITransactionalRepository<T, TId = string> extends IBaseRepository<T, TId> {
  transaction<R>(fn: (repo: this) => Promise<R>): Promise<R>;
}
