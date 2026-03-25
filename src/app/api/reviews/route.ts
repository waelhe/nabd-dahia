/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Reviews API Endpoint
 * 
 * نقطة نهاية API للتقييمات
 * 
 * @route GET /api/reviews - قائمة التقييمات
 * @route POST /api/reviews - إنشاء تقييم جديد
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
  getListingReviews,
  getUserReviews,
  createReview,
  getListingReviewStats,
} from '@/application/reviews/use-cases';

// ==================== GET - List Reviews ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10', 10));
    
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');
    
    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      if (!listingId && !userId) {
        return errorResponse('INVALID_INPUT', 'معرف الإقامة أو المستخدم مطلوب', 400);
      }
      
      const statsResult = listingId 
        ? await getListingReviewStats(listingId)
        : await getUserReviews(userId!, { page: 1, limit: 1 });
      
      if (statsResult.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإحصائيات', 500);
      }
      
      return successResponse(statsResult.value);
    }
    
    // Get reviews by listing or user
    if (listingId) {
      const result = await getListingReviews(listingId, { page, limit });
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب التقييمات', 500);
      }
      
      return paginatedResponse(result.value.items, {
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
        hasMore: result.value.hasMore,
      });
    }
    
    if (userId) {
      const result = await getUserReviews(userId, { page, limit });
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب التقييمات', 500);
      }
      
      return paginatedResponse(result.value.items, {
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
        hasMore: result.value.hasMore,
      });
    }
    
    return errorResponse('INVALID_INPUT', 'معرف الإقامة أو المستخدم مطلوب', 400);
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب التقييمات', 500);
  }
}

// ==================== POST - Create Review ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const body = await request.json();
    
    // Validation
    if (!body.bookingId || !body.listingId || !body.revieweeId) {
      return errorResponse('INVALID_INPUT', 'بيانات غير مكتملة', 400);
    }
    
    if (!body.ratings || !body.ratings.overall) {
      return errorResponse('INVALID_INPUT', 'التقييم العام مطلوب', 400);
    }
    
    if (body.ratings.overall < 1 || body.ratings.overall > 5) {
      return errorResponse('INVALID_INPUT', 'التقييم يجب أن يكون بين 1 و 5', 400);
    }
    
    const result = await createReview({
      bookingId: body.bookingId,
      listingId: body.listingId,
      reviewerId: user.id,
      revieweeId: body.revieweeId,
      ratings: {
        overall: body.ratings.overall,
        cleanliness: body.ratings.cleanliness,
        communication: body.ratings.communication,
        location: body.ratings.location,
        checkIn: body.ratings.checkIn,
        value: body.ratings.value,
      },
      comment: body.comment,
    });
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return createdResponse(result.value);
    
  } catch (error) {
    console.error('Error creating review:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء التقييم', 500);
  }
}
