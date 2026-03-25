/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notifications Use Cases
 * 
 * حالات استخدام الإشعارات
 * 
 * @module application/notifications/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { notificationRepository } from '@/infrastructure/repositories/notification.repository';

// ==================== Types ====================

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sentVia?: string;
  scheduledAt?: Date;
}

export interface CreateBulkNotificationInput {
  userIds: string[];
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sentVia?: string;
}

export interface NotificationFilter {
  userId?: string;
  type?: string | string[];
  read?: boolean;
  sentVia?: string | string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface NotificationOutput {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  read: boolean;
  sentVia?: string;
  sentAt?: Date;
  createdAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

export interface PaginatedNotifications {
  items: NotificationOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  recentCount: number;
}

// ==================== Notification Types ====================

export const NotificationTypes = {
  // Bookings
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  CHECK_IN_REMINDER: 'check_in_reminder',
  CHECK_OUT_REMINDER: 'check_out_reminder',
  
  // Payments
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_PROCESSED: 'refund_processed',
  
  // Reviews
  REVIEW_REQUEST: 'review_request',
  REVIEW_RECEIVED: 'review_received',
  REVIEW_RESPONDED: 'review_responded',
  
  // Messages
  NEW_MESSAGE: 'new_message',
  
  // System
  SYSTEM_ALERT: 'system_alert',
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  ACCOUNT_SUSPENDED: 'account_suspended',
} as const;

// ==================== Use Cases ====================

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Result<NotificationOutput, Error>> {
  try {
    const result = await notificationRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      sentVia: input.sentVia,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(mapToNotificationOutput(result.value));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create notification'));
  }
}

/**
 * إنشاء إشعارات متعددة
 */
export async function createBulkNotifications(
  input: CreateBulkNotificationInput
): Promise<Result<NotificationOutput[], Error>> {
  try {
    const result = await notificationRepository.createBulk({
      userIds: input.userIds,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      sentVia: input.sentVia,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value.map(mapToNotificationOutput));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create notifications'));
  }
}

/**
 * الحصول على إشعار بالمعرف
 */
export async function getNotification(
  id: string
): Promise<Result<NotificationOutput, Error>> {
  try {
    const result = await notificationRepository.findById(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(mapToNotificationOutput(result.value));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get notification'));
  }
}

/**
 * إشعارات المستخدم
 */
export async function getUserNotifications(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedNotifications, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const result = await notificationRepository.findByUserId(userId, { page, limit });

    return ok({
      items: result.items.map(mapToNotificationOutput),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get notifications'));
  }
}

/**
 * الإشعارات غير المقروءة
 */
export async function getUnreadNotifications(
  userId: string
): Promise<Result<NotificationOutput[], Error>> {
  try {
    const notifications = await notificationRepository.findUnread(userId);
    return ok(notifications.map(mapToNotificationOutput));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get unread notifications'));
  }
}

/**
 * عدد الإشعارات غير المقروءة
 */
export async function getUnreadCount(userId: string): Promise<Result<number, Error>> {
  try {
    const count = await notificationRepository.countUnread(userId);
    return ok(count);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get unread count'));
  }
}

/**
 * تعليم إشعار كمقروء
 */
export async function markNotificationAsRead(
  id: string
): Promise<Result<void, Error>> {
  try {
    const result = await notificationRepository.markAsRead(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to mark as read'));
  }
}

/**
 * تعليم جميع الإشعارات كمقروءة
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<Result<number, Error>> {
  try {
    const result = await notificationRepository.markAllAsRead(userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to mark all as read'));
  }
}

/**
 * تعليم عدة إشعارات كمقروءة
 */
export async function markManyNotificationsAsRead(
  ids: string[]
): Promise<Result<void, Error>> {
  try {
    const result = await notificationRepository.markManyAsRead(ids);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to mark as read'));
  }
}

/**
 * حذف إشعار
 */
export async function deleteNotification(
  id: string
): Promise<Result<void, Error>> {
  try {
    const result = await notificationRepository.delete(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete notification'));
  }
}

/**
 * حذف جميع إشعارات المستخدم
 */
export async function deleteAllUserNotifications(
  userId: string
): Promise<Result<number, Error>> {
  try {
    const result = await notificationRepository.deleteByUserId(userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete notifications'));
  }
}

/**
 * إحصائيات الإشعارات
 */
export async function getNotificationStats(
  userId?: string
): Promise<Result<NotificationStats, Error>> {
  try {
    const stats = await notificationRepository.getStats(userId);
    return ok(stats);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get notification stats'));
  }
}

// ==================== Helper Functions ====================

function mapToNotificationOutput(
  notification: Record<string, unknown>
): NotificationOutput {
  return {
    id: notification.id as string,
    userId: notification.userId as string,
    type: notification.type as string,
    title: notification.title as string,
    message: notification.message as string,
    data: notification.data as Record<string, unknown> | undefined,
    readAt: notification.readAt as Date | undefined,
    read: notification.read as boolean,
    sentVia: notification.sentVia as string | undefined,
    sentAt: notification.sentAt as Date | undefined,
    createdAt: notification.createdAt as Date,
    user: notification.user as NotificationOutput['user'],
  };
}
