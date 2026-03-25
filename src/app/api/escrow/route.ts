/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow API Endpoint
 * 
 * نقطة نهاية API للضمان
 * 
 * @route GET /api/escrow - قائمة الضمانات
 * @route POST /api/escrow - إنشاء ضمان جديد
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
  getHeldEscrows,
  getDisputedEscrows,
  getEscrowStats,
  getTotalHeld,
  createEscrow,
} from '@/application/escrow/use-cases';

// ==================== GET - List Escrows ====================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    // Only admins can list all escrows
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'غير مصرح بالوصول', 403);
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    
    // Check for stats
    if (searchParams.get('stats') === 'true') {
      const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
      const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;
      
      const result = await getEscrowStats(from, to);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإحصائيات', 500);
      }
      
      return successResponse(result.value);
    }
    
    // Check for total held
    if (searchParams.get('total') === 'true') {
      const currency = searchParams.get('currency') || undefined;
      const result = await getTotalHeld(currency);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإجمالي', 500);
      }
      
      return successResponse({ totalHeld: result.value });
    }
    
    // Get by status
    const status = searchParams.get('status');
    
    if (status === 'disputed') {
      const result = await getDisputedEscrows({ page, limit });
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب النزاعات', 500);
      }
      
      return paginatedResponse(result.value.items, {
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
        hasMore: result.value.hasMore,
      });
    }
    
    // Default: held escrows
    const result = await getHeldEscrows({ page, limit });
    
    if (result.isErr()) {
      return errorResponse('INTERNAL_ERROR', 'فشل في جلب الضمانات', 500);
    }
    
    return paginatedResponse(result.value.items, {
      page: result.value.page,
      limit: result.value.limit,
      total: result.value.total,
      totalPages: result.value.totalPages,
      hasMore: result.value.hasMore,
    });
    
  } catch (error) {
    console.error('Error fetching escrows:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الضمانات', 500);
  }
}

// ==================== POST - Create Escrow ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const body = await request.json();
    
    if (!body.bookingId) {
      return errorResponse('INVALID_INPUT', 'معرف الحجز مطلوب', 400);
    }
    
    const result = await createEscrow(body.bookingId);
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return createdResponse(result.value);
    
  } catch (error) {
    console.error('Error creating escrow:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء الضمان', 500);
  }
}
