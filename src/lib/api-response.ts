/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Response Utilities
 * 
 * أدوات مساعدة للاستجابات الموحدة
 * 
 * @module lib/api-response
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ==================== Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// ==================== Success Responses ====================

/**
 * استجابة ناجحة
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

/**
 * تم الإنشاء بنجاح
 */
export function createdResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201, meta);
}

/**
 * لا يوجد محتوى
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * استجابة مع صفحات
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination,
        ...meta,
      },
    },
    { status: 200 }
  );
}

// ==================== Error Responses ====================

/**
 * استجابة خطأ
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * خطأ في التحقق
 */
export function validationErrorResponse(
  error: ZodError | string | Array<{ path: string; message: string }>,
  message: string = 'خطأ في التحقق من البيانات'
): NextResponse<ApiResponse> {
  let details: unknown;
  
  if (typeof error === 'string') {
    details = error;
  } else if (Array.isArray(error)) {
    details = error;
  } else {
    details = error.issues.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }
  
  return errorResponse('VALIDATION_ERROR', message, 400, details);
}

/**
 * خطأ عدم العثور
 */
export function notFoundResponse(
  resource: string = 'المورد'
): NextResponse<ApiResponse> {
  return errorResponse('NOT_FOUND', `${resource} غير موجود`, 404);
}

/**
 * خطأ عدم التصريح
 */
export function unauthorizedResponse(
  message: string = 'يجب تسجيل الدخول'
): NextResponse<ApiResponse> {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * خطأ محظور
 */
export function forbiddenResponse(
  message: string = 'ليس لديك صلاحية للوصول'
): NextResponse<ApiResponse> {
  return errorResponse('FORBIDDEN', message, 403);
}

/**
 * خطأ تعارض
 */
export function conflictResponse(
  message: string,
  details?: unknown
): NextResponse<ApiResponse> {
  return errorResponse('CONFLICT', message, 409, details);
}

/**
 * خطأ داخلي
 */
export function internalErrorResponse(
  message: string = 'حدث خطأ داخلي في الخادم'
): NextResponse<ApiResponse> {
  return errorResponse('INTERNAL_ERROR', message, 500);
}

/**
 * خطأ الخدمة غير متاحة
 */
export function serviceUnavailableResponse(
  message: string = 'الخدمة غير متاحة حالياً'
): NextResponse<ApiResponse> {
  return errorResponse('SERVICE_UNAVAILABLE', message, 503);
}

/**
 * خطأ عدد الطلبات
 */
export function tooManyRequestsResponse(
  retryAfter: number = 60
): NextResponse<ApiResponse> {
  const response = errorResponse(
    'TOO_MANY_REQUESTS',
    'تم تجاوز الحد المسموح من الطلبات',
    429
  );
  response.headers.set('Retry-After', String(retryAfter));
  return response;
}

// ==================== Error Codes ====================

export const ErrorCodes = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic
  BOOKING_NOT_AVAILABLE: 'BOOKING_NOT_AVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CANCELLATION_NOT_ALLOWED: 'CANCELLATION_NOT_ALLOWED',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

// ==================== Helper Functions ====================

/**
 * استخراج معلمات الصفحات
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * استخراج معلمات الفرز
 */
export function getSortParams(
  searchParams: URLSearchParams,
  defaultField: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  const sortBy = searchParams.get('sortBy') || defaultField;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultOrder;
  
  return { sortBy, sortOrder };
}

/**
 * استخراج معلمات البحث
 */
export function getSearchParams(searchParams: URLSearchParams): {
  search: string | null;
  fields: string[];
} {
  const search = searchParams.get('search');
  const fields = searchParams.get('fields')?.split(',').filter(Boolean) || [];
  
  return { search, fields };
}

// ==================== Re-exports ====================

/**
 * إعادة تصدير من api-validation للتوافق
 */
export { formatValidationErrors } from './api-validation';
