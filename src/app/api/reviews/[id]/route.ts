/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single Review API Endpoint
 * 
 * نقطة نهاية API لتقييم واحد
 * 
 * @route GET /api/reviews/[id] - تفاصيل التقييم
 * @route PATCH /api/reviews/[id] - تحديث التقييم
 * @route DELETE /api/reviews/[id] - حذف التقييم
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  getReview,
  updateReview,
  deleteReview,
  addReviewResponse,
} from '@/application/reviews/use-cases';

// ==================== GET - Review Details ====================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await getReview(id);
    
    if (result.isErr()) {
      return errorResponse('NOT_FOUND', 'التقييم غير موجود', 404);
    }
    
    return successResponse(result.value);
    
  } catch (error) {
    console.error('Error fetching review:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب التقييم', 500);
  }
}

// ==================== PATCH - Update Review ====================

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
    
    // Handle response action (for hosts)
    if (body.action === 'respond') {
      if (!body.response) {
        return errorResponse('INVALID_INPUT', 'الرد مطلوب', 400);
      }
      
      const result = await addReviewResponse(id, body.response, user.id);
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تم إضافة الرد بنجاح' });
    }
    
    // Update review (for reviewer)
    const result = await updateReview(id, {
      ratings: body.ratings,
      comment: body.comment,
    }, user.id);
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return successResponse(result.value);
    
  } catch (error) {
    console.error('Error updating review:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث التقييم', 500);
  }
}

// ==================== DELETE - Delete Review ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    const result = await deleteReview(id, user.id);
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return successResponse({ message: 'تم حذف التقييم' });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء حذف التقييم', 500);
  }
}
