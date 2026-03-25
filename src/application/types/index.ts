/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base Use Case Types - أنواع حالات الاستخدام الأساسية
 * 
 * @module application/types
 */

import type { Result } from '@/core/types/result';

// ==================== Pagination ====================

/**
 * إدخال التصفح
 */
export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * نتيجة التصفح
 */
export interface PaginatedOutput<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * إنشاء نتيجة تصفح
 */
export function createPaginatedOutput<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedOutput<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

// ==================== Filtering ====================

/**
 * فلتر التاريخ
 */
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

/**
 * فلتر البحث
 */
export interface SearchFilter {
  query?: string;
  fields?: string[];
}

/**
 * فلتر عام
 */
export interface BaseFilter {
  search?: string;
  status?: string | string[];
  createdFrom?: Date;
  createdTo?: Date;
}

// ==================== Use Case Types ====================

/**
 * نوع حالة الاستخدام
 */
export type UseCase<TInput, TOutput> = (input: TInput) => Promise<Result<TOutput, UseCaseError>>;

/**
 * نوع حالة الاستخدام المتزامن
 */
export type SyncUseCase<TInput, TOutput> = (input: TInput) => Result<TOutput, UseCaseError>;

/**
 * حالة الاستخدام مع السياق
 */
export type ContextualUseCase<TInput, TOutput, TContext> = (
  input: TInput,
  context: TContext,
) => Promise<Result<TOutput, UseCaseError>>;

// ==================== Errors ====================

/**
 * خطأ حالة الاستخدام
 */
export class UseCaseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'UseCaseError';
  }

  static notFound(entity: string, id: string): UseCaseError {
    return new UseCaseError('NOT_FOUND', `${entity} not found: ${id}`, { entity, id });
  }

  static alreadyExists(entity: string, field: string, value: string): UseCaseError {
    return new UseCaseError('ALREADY_EXISTS', `${entity} with ${field}='${value}' already exists`, {
      entity,
      field,
      value,
    });
  }

  static invalidInput(reason: string, details?: Record<string, unknown>): UseCaseError {
    return new UseCaseError('INVALID_INPUT', reason, details);
  }

  static unauthorized(message: string = 'Unauthorized'): UseCaseError {
    return new UseCaseError('UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Forbidden'): UseCaseError {
    return new UseCaseError('FORBIDDEN', message);
  }

  static conflict(message: string): UseCaseError {
    return new UseCaseError('CONFLICT', message);
  }

  static preconditionFailed(message: string): UseCaseError {
    return new UseCaseError('PRECONDITION_FAILED', message);
  }

  static internal(message: string = 'Internal server error'): UseCaseError {
    return new UseCaseError('INTERNAL_ERROR', message);
  }
}

// ==================== Input Validation ====================

/**
 * نتيجة التحقق
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

/**
 * التحقق من الإدخال
 */
export interface InputValidator<T> {
  validate(input: T): ValidationResult;
}

// ==================== Response Types ====================

/**
 * استجابة إنشاء
 */
export interface CreateOutput<T> {
  item: T;
  created: boolean;
}

/**
 * استجابة تحديث
 */
export interface UpdateOutput<T> {
  item: T;
  updated: boolean;
  previous?: Partial<T>;
}

/**
 * استجابة حذف
 */
export interface DeleteOutput {
  deleted: boolean;
  id: string;
}

/**
 * استجابة عملية جماعية
 */
export interface BulkOutput<T> {
  successful: T[];
  failed: Array<{ item: unknown; error: string }>;
  totalProcessed: number;
}

// ==================== Context ====================

/**
 * سياق المستخدم
 */
export interface UserContext {
  userId: string;
  role: string;
  companyId?: string;
  permissions?: string[];
}

/**
 * سياق الطلب
 */
export interface RequestContext {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * سياق كامل
 */
export interface FullContext extends UserContext, RequestContext {}

// ==================== Authorization ====================

/**
 * متطلبات الصلاحية
 */
export interface PermissionRequirement {
  resource: string;
  action: string;
  resourceId?: string;
}

/**
 * نتيجة التحقق من الصلاحية
 */
export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  missingPermissions?: string[];
}

// ==================== Sorting ====================

/**
 * نوع الترتيب
 */
export type SortDirection = 'asc' | 'desc';

/**
 * خيار الترتيب
 */
export interface SortOption {
  field: string;
  direction: SortDirection;
}

/**
 * إنشاء خيار ترتيب
 */
export function createSortOption(
  sortBy?: string,
  sortOrder?: SortDirection,
): SortOption | undefined {
  if (!sortBy) return undefined;
  return {
    field: sortBy,
    direction: sortOrder ?? 'desc',
  };
}

// ==================== Date Utilities ====================

/**
 * نطاق زمني
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * فترات زمنية محددة مسبقاً
 */
export const PREDEFINED_RANGES = {
  today: (): TimeRange => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { start, end };
  },
  
  yesterday: (): TimeRange => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { start, end };
  },
  
  thisWeek: (): TimeRange => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    return { start, end };
  },
  
  thisMonth: (): TimeRange => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  },
  
  last7Days: (): TimeRange => {
    const now = new Date();
    const end = new Date();
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  },
  
  last30Days: (): TimeRange => {
    const now = new Date();
    const end = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  },
  
  last90Days: (): TimeRange => {
    const now = new Date();
    const end = new Date();
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return { start, end };
  },
};

// ==================== ID Types ====================

/**
 * معرف الكيان
 */
export type EntityId = string;

/**
 * مجموعة معرفات
 */
export type EntityIds = EntityId[];

// ==================== Metrics ====================

/**
 * متريك
 */
export interface Metric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

/**
 * مجموعة متريات
 */
export interface MetricsCollection {
  metrics: Metric[];
  period: TimeRange;
}

// ==================== Cache ====================

/**
 * خيارات الكاش
 */
export interface CacheOptions {
  enabled?: boolean;
  ttlSeconds?: number;
  key?: string;
  tags?: string[];
}
