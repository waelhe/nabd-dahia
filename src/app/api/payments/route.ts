/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payments API Endpoint
 * 
 * نقطة نهاية API للمدفوعات
 * 
 * @route GET /api/payments - قائمة المدفوعات
 * @route POST /api/payments - إنشاء دفعة جديدة
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  getUserPayments,
  getPaymentStats,
  createPayment,
} from '@/application/payments/use-cases';

// ==================== GET - List Payments ====================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    
    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
      const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;
      
      const statsResult = await getPaymentStats({ userId: user.id, from, to });
      
      if (statsResult.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإحصائيات', 500);
      }
      
      return successResponse(statsResult.value);
    }
    
    // Get user payments
    const result = await getUserPayments(user.id, { page, limit });
    
    if (result.isErr()) {
      return errorResponse('INTERNAL_ERROR', 'فشل في جلب المدفوعات', 500);
    }
    
    return paginatedResponse(result.value.items, {
      page: result.value.page,
      limit: result.value.limit,
      total: result.value.total,
      totalPages: result.value.totalPages,
      hasMore: result.value.hasMore,
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب المدفوعات', 500);
  }
}

// ==================== POST - Create Payment ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const body = await request.json();
    
    // Validation
    if (!body.bookingId || !body.amount || !body.currency || !body.method) {
      return errorResponse('INVALID_INPUT', 'بيانات غير مكتملة', 400);
    }
    
    if (body.amount <= 0) {
      return errorResponse('INVALID_INPUT', 'المبلغ يجب أن يكون أكبر من صفر', 400);
    }
    
    const result = await createPayment({
      bookingId: body.bookingId,
      userId: user.id,
      amount: body.amount,
      currency: body.currency,
      type: body.type || 'booking',
      method: body.method,
      transactionId: body.transactionId,
      gatewayResponse: body.gatewayResponse,
    });
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return createdResponse(result.value);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء الدفعة', 500);
  }
}
