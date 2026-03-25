/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Middleware
 *
 * برمجيات وسيطة لمسارات API
 *
 * @module lib/api-middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

// ==================== Types ====================

export interface RequestContext {
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  requestId: string;
  startTime: number;
}

export interface MiddlewareResult {
  success: boolean;
  context?: RequestContext;
  error?: NextResponse;
}

export type MiddlewareFunction = (
  request: NextRequest,
  context: RequestContext
) => Promise<MiddlewareResult | NextResponse>;

// ==================== Rate Limiter ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * تنظيف السجلات القديمة
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// تنظيف كل 5 دقائق
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * التحقق من Rate Limit
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Rate Limit Middleware
 */
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): MiddlewareFunction {
  return async (request: NextRequest, context: RequestContext) => {
    const ip = context.ip || 'unknown';
    const key = `${ip}:${request.nextUrl.pathname}`;

    const { allowed, remaining, resetTime } = checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'تم تجاوز الحد المسموح من الطلبات',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 429 }
      );
      response.headers.set('X-RateLimit-Limit', String(maxRequests));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)));
      response.headers.set('Retry-After', String(Math.ceil((resetTime - Date.now()) / 1000)));
      return response;
    }

    return {
      success: true,
      context: {
        ...context,
        remaining,
      },
    };
  };
}

// ==================== Authentication ====================

/**
 * Require Auth Middleware
 */
export function requireAuth(): MiddlewareFunction {
  return async (request: NextRequest, context: RequestContext) => {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'يجب تسجيل الدخول',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 401 }
      );
    }

    return {
      success: true,
      context: {
        ...context,
        userId: user.id,
        userRole: user.role,
      },
    };
  };
}

/**
 * Require Role Middleware
 */
export function requireRole(...roles: string[]): MiddlewareFunction {
  return async (request: NextRequest, context: RequestContext) => {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'يجب تسجيل الدخول',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 401 }
      );
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'ليس لديك صلاحية للوصول',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 403 }
      );
    }

    return {
      success: true,
      context: {
        ...context,
        userId: user.id,
        userRole: user.role,
      },
    };
  };
}

// ==================== Request Logging ====================

/**
 * إنشاء معرف طلب فريد
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * استخراج IP من الطلب
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * تسجيل الطلب
 */
export function logRequest(
  request: NextRequest,
  context: RequestContext,
  statusCode: number,
  duration: number
): void {
  const logData = {
    requestId: context.requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    statusCode,
    duration: `${duration}ms`,
    userId: context.userId,
    ip: context.ip,
    userAgent: context.userAgent,
    timestamp: new Date().toISOString(),
  };

  // Log to console (can be replaced with proper logging service)
  if (statusCode >= 400) {
    console.error('[API Error]', JSON.stringify(logData));
  } else {
    console.log('[API]', JSON.stringify(logData));
  }
}

// ==================== Compose Middleware ====================

/**
 * تجميع عدة برمجيات وسيطة
 */
export function composeMiddleware(
  ...middlewares: MiddlewareFunction[]
): (request: NextRequest) => Promise<{ context: RequestContext; error?: NextResponse }> {
  return async (request: NextRequest) => {
    const context: RequestContext = {
      requestId: generateRequestId(),
      startTime: Date.now(),
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
    };

    for (const middleware of middlewares) {
      const result = await middleware(request, context);

      // If it's a NextResponse, it's an error response
      if (result instanceof NextResponse) {
        return { context, error: result };
      }

      // Update context if middleware succeeded
      if (result.success && result.context) {
        Object.assign(context, result.context);
      }

      // If middleware failed, return error
      if (!result.success && result.error) {
        return { context, error: result.error };
      }
    }

    return { context };
  };
}

// ==================== Error Handler ====================

/**
 * معالج الأخطاء العام
 */
export function handleApiError(
  error: unknown,
  context: RequestContext
): NextResponse {
  const requestId = context.requestId;

  // Log the error
  console.error('[API Error]', {
    requestId,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Return appropriate error response
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('not found') || error.message.includes('غير موجود')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 404 }
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('غير مصرح')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: error.message },
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 401 }
      );
    }

    if (error.message.includes('forbidden') || error.message.includes('صلاحية')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: error.message },
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 403 }
      );
    }

    if (error.message.includes('validation') || error.message.includes('خطأ في')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message },
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'حدث خطأ داخلي' },
        meta: { timestamp: new Date().toISOString(), requestId },
      },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'حدث خطأ غير متوقع' },
      meta: { timestamp: new Date().toISOString(), requestId },
    },
    { status: 500 }
  );
}

// ==================== CORS ====================

/**
 * إضافة CORS Headers
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

/**
 * CORS Preflight Handler
 */
export function handleCorsPreflightRequest(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}

// ==================== Request Helpers ====================

/**
 * استخراج معلمات الصفحات
 */
export function getPaginationParams(request: NextRequest): {
  page: number;
  limit: number;
  skip: number;
} {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * استخراج معلمات الفرز
 */
export function getSortParams(
  request: NextRequest,
  defaultField: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const { searchParams } = request.nextUrl;
  return {
    sortBy: searchParams.get('sortBy') || defaultField,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultOrder,
  };
}

/**
 * التحقق من طلب JSON
 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
