/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single Notification API Endpoint
 * 
 * نقطة نهاية API لإشعار واحد
 * 
 * @route GET /api/notifications/[id] - تفاصيل الإشعار
 * @route PATCH /api/notifications/[id] - تعليم كمقروء
 * @route DELETE /api/notifications/[id] - حذف الإشعار
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  getNotification,
  markNotificationAsRead,
  deleteNotification,
} from '@/application/notifications/use-cases';

// ==================== GET - Notification Details ====================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    const result = await getNotification(id);
    
    if (result.isErr()) {
      return errorResponse('NOT_FOUND', 'الإشعار غير موجود', 404);
    }
    
    // Verify ownership
    const notification = result.value;
    if (notification.userId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'غير مصرح بالوصول', 403);
    }
    
    return successResponse(notification);
    
  } catch (error) {
    console.error('Error fetching notification:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الإشعار', 500);
  }
}

// ==================== PATCH - Mark as Read ====================

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    const result = await markNotificationAsRead(id);
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return successResponse({ message: 'تم تعليم الإشعار كمقروء' });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الإشعار', 500);
  }
}

// ==================== DELETE - Delete Notification ====================

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
    
    const result = await deleteNotification(id);
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return successResponse({ message: 'تم حذف الإشعار' });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء حذف الإشعار', 500);
  }
}
