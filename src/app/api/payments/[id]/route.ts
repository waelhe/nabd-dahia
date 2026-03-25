/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single Payment API Endpoint
 * 
 * نقطة نهاية API لدفعة واحدة
 * 
 * @route GET /api/payments/[id] - تفاصيل الدفعة
 * @route PATCH /api/payments/[id] - تحديث حالة الدفعة
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  getPayment,
  updatePaymentStatus,
  markPaymentProcessed,
  markPaymentFailed,
  getPaymentRefunds,
  createRefund,
} from '@/application/payments/use-cases';

// ==================== GET - Payment Details ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    // Check if requesting refunds
    const url = new URL(request.url);
    if (url.searchParams.get('refunds') === 'true') {
      const refundsResult = await getPaymentRefunds(id);
      
      if (refundsResult.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الاستردادات', 500);
      }
      
      return successResponse(refundsResult.value);
    }
    
    const result = await getPayment(id);
    
    if (result.isErr()) {
      return errorResponse('NOT_FOUND', 'الدفعة غير موجودة', 404);
    }
    
    // Verify ownership
    const payment = result.value;
    if (payment.userId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'غير مصرح بالوصول', 403);
    }
    
    return successResponse(payment);
    
  } catch (error) {
    console.error('Error fetching payment:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الدفعة', 500);
  }
}

// ==================== PATCH - Update Payment Status ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Handle different status updates
    if (body.action === 'process') {
      // Mark as processed
      if (!body.transactionId) {
        return errorResponse('INVALID_INPUT', 'معرف المعاملة مطلوب', 400);
      }
      
      const result = await markPaymentProcessed(id, body.transactionId, body.gatewayResponse);
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تمت معالجة الدفعة بنجاح' });
    }
    
    if (body.action === 'fail') {
      // Mark as failed
      const result = await markPaymentFailed(id, body.reason, body.gatewayResponse);
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تم تحديث حالة الدفعة' });
    }
    
    if (body.action === 'refund') {
      // Create refund
      if (!body.amount || !body.currency) {
        return errorResponse('INVALID_INPUT', 'المبلغ والعملة مطلوبان', 400);
      }
      
      const result = await createRefund({
        paymentId: id,
        amount: body.amount,
        currency: body.currency,
        reason: body.reason,
      });
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse(result.value);
    }
    
    // Generic status update
    if (body.status) {
      const result = await updatePaymentStatus(id, body.status, {
        transactionId: body.transactionId,
        gatewayResponse: body.gatewayResponse,
      });
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تم تحديث حالة الدفعة' });
    }
    
    return errorResponse('INVALID_INPUT', 'إجراء غير صالح', 400);
    
  } catch (error) {
    console.error('Error updating payment:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الدفعة', 500);
  }
}
