/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notifications API Endpoint
 * 
 * نقطة نهاية API للإشعارات
 * 
 * @route GET /api/notifications - قائمة الإشعارات
 * @route POST /api/notifications - إنشاء إشعار جديد
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
  getUserNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationStats,
  createNotification,
  markAllNotificationsAsRead,
} from '@/application/notifications/use-cases';

// ==================== GET - List Notifications ====================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    
    // Check for unread only
    if (searchParams.get('unread') === 'true') {
      const result = await getUnreadNotifications(user.id);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإشعارات', 500);
      }
      
      return successResponse(result.value);
    }
    
    // Check for unread count
    if (searchParams.get('count') === 'true') {
      const result = await getUnreadCount(user.id);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب العدد', 500);
      }
      
      return successResponse({ unreadCount: result.value });
    }
    
    // Check for stats
    if (searchParams.get('stats') === 'true') {
      const result = await getNotificationStats(user.id);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإحصائيات', 500);
      }
      
      return successResponse(result.value);
    }
    
    // Get user notifications
    const result = await getUserNotifications(user.id, { page, limit });
    
    if (result.isErr()) {
      return errorResponse('INTERNAL_ERROR', 'فشل في جلب الإشعارات', 500);
    }
    
    return paginatedResponse(result.value.items, {
      page: result.value.page,
      limit: result.value.limit,
      total: result.value.total,
      totalPages: result.value.totalPages,
      hasMore: result.value.hasMore,
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الإشعارات', 500);
  }
}

// ==================== POST - Create Notification ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    // Only admins can create notifications for other users
    const body = await request.json();
    
    if (!body.userId || !body.type || !body.title || !body.message) {
      return errorResponse('INVALID_INPUT', 'بيانات غير مكتملة', 400);
    }
    
    const result = await createNotification({
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data,
      sentVia: body.sentVia,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return createdResponse(result.value);
    
  } catch (error) {
    console.error('Error creating notification:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء الإشعار', 500);
  }
}

// ==================== PUT - Mark All as Read ====================

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const result = await markAllNotificationsAsRead(user.id);
    
    if (result.isErr()) {
      return errorResponse('INTERNAL_ERROR', 'فشل في تحديث الإشعارات', 500);
    }
    
    return successResponse({ 
      message: 'تم تعليم جميع الإشعارات كمقروءة',
      count: result.value 
    });
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الإشعارات', 500);
  }
}
