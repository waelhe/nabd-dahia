/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Domain Service
 * 
 * خدمة مجال الإشعارات - تنسق إرسال الإشعارات عبر القنوات المختلفة
 * 
 * @module application/services/notification.service
 */

import { db } from '@/lib/db';
import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

export interface SendNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: ('in_app' | 'email' | 'sms' | 'push')[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SendBulkNotificationInput {
  userIds: string[];
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: ('in_app' | 'email' | 'sms' | 'push')[];
}

export interface NotificationTemplateData {
  bookingId?: string;
  listingId?: string;
  guestName?: string;
  hostName?: string;
  listingTitle?: string;
  checkIn?: Date;
  checkOut?: Date;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

// ==================== Notification Types ====================

export const NotificationType = {
  // Bookings
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_REMINDER: 'booking_reminder',
  CHECK_IN_TOMORROW: 'check_in_tomorrow',
  CHECK_OUT_TODAY: 'check_out_today',
  
  // Payments
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_PROCESSED: 'refund_processed',
  PAYOUT_INITIATED: 'payout_initiated',
  
  // Reviews
  REVIEW_REQUEST: 'review_request',
  REVIEW_RECEIVED: 'review_received',
  REVIEW_RESPONDED: 'review_responded',
  
  // Messages
  NEW_MESSAGE: 'new_message',
  
  // System
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  ACCOUNT_SUSPENDED: 'account_suspended',
  SYSTEM_ALERT: 'system_alert',
} as const;

// ==================== Templates ====================

const NOTIFICATION_TEMPLATES: Record<string, {
  title: { ar: string; en: string };
  message: { ar: string; en: string };
}> = {
  [NotificationType.BOOKING_CREATED]: {
    title: { ar: 'حجز جديد', en: 'New Booking' },
    message: { ar: 'لديك حجز جديد من {guestName}', en: 'You have a new booking from {guestName}' },
  },
  [NotificationType.BOOKING_CONFIRMED]: {
    title: { ar: 'تم تأكيد الحجز', en: 'Booking Confirmed' },
    message: { ar: 'تم تأكيد حجزك في {listingTitle}', en: 'Your booking at {listingTitle} has been confirmed' },
  },
  [NotificationType.BOOKING_CANCELLED]: {
    title: { ar: 'تم إلغاء الحجز', en: 'Booking Cancelled' },
    message: { ar: 'تم إلغاء الحجز في {listingTitle}', en: 'Your booking at {listingTitle} has been cancelled' },
  },
  [NotificationType.PAYMENT_RECEIVED]: {
    title: { ar: 'تم استلام الدفعة', en: 'Payment Received' },
    message: { ar: 'تم استلام دفعة بقيمة {amount} {currency}', en: 'Payment of {amount} {currency} has been received' },
  },
  [NotificationType.REVIEW_REQUEST]: {
    title: { ar: 'قيّم إقامتك', en: 'Review Your Stay' },
    message: { ar: 'كيف كانت إقامتك في {listingTitle}؟', en: 'How was your stay at {listingTitle}?' },
  },
  [NotificationType.REVIEW_RECEIVED]: {
    title: { ar: 'تقييم جديد', en: 'New Review' },
    message: { ar: 'قام {guestName} بتقييم إقامتك', en: '{guestName} left a review for your listing' },
  },
  [NotificationType.NEW_MESSAGE]: {
    title: { ar: 'رسالة جديدة', en: 'New Message' },
    message: { ar: 'لديك رسالة جديدة', en: 'You have a new message' },
  },
};

// ==================== Service ====================

/**
 * إرسال إشعار
 */
export async function sendNotification(
  input: SendNotificationInput
): Promise<Result<{ notificationId: string; sent: boolean }, Error>> {
  try {
    // Get user preferences
    const userPrefs = await db.userPreference.findUnique({
      where: { userId: input.userId },
    });

    // Determine channels
    const channels = input.channels ?? ['in_app'];
    const enabledChannels = channels.filter(channel => {
      if (channel === 'email') return userPrefs?.emailNotifications ?? true;
      if (channel === 'sms') return userPrefs?.smsNotifications ?? false;
      if (channel === 'push') return userPrefs?.pushNotifications ?? true;
      return true;
    });

    // Create notification
    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data as object,
        sentVia: enabledChannels.join(','),
        read: false,
      },
    });

    // Send through each channel
    const results = await Promise.allSettled(
      enabledChannels.map(channel => 
        sendThroughChannel(channel, {
          userId: input.userId,
          title: input.title,
          message: input.message,
          data: input.data,
          priority: input.priority,
        })
      )
    );

    // Update sent status
    const sentAt = new Date();
    await db.notification.update({
      where: { id: notification.id },
      data: { sentAt },
    });

    const allSent = results.every(r => r.status === 'fulfilled');

    return ok({
      notificationId: notification.id,
      sent: allSent,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to send notification'));
  }
}

/**
 * إرسال إشعارات متعددة
 */
export async function sendBulkNotifications(
  input: SendBulkNotificationInput
): Promise<Result<{ sent: number; failed: number }, Error>> {
  try {
    const results = await Promise.allSettled(
      input.userIds.map(userId =>
        sendNotification({
          userId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
          channels: input.channels,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return ok({ sent, failed });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to send bulk notifications'));
  }
}

/**
 * إرسال إشعار من قالب
 */
export async function sendTemplatedNotification(
  userId: string,
  type: keyof typeof NotificationType,
  data: NotificationTemplateData,
  language: 'ar' | 'en' = 'ar'
): Promise<Result<{ notificationId: string; sent: boolean }, Error>> {
  try {
    const template = NOTIFICATION_TEMPLATES[type];
    
    if (!template) {
      return err(new Error(`Template not found for type: ${type}`));
    }

    // Replace placeholders
    let title = template.title[language];
    let message = template.message[language];

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{${key}}`;
      const stringValue = value instanceof Date 
        ? value.toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US')
        : String(value ?? '');
      
      title = title.replace(placeholder, stringValue);
      message = message.replace(placeholder, stringValue);
    }

    return sendNotification({
      userId,
      type,
      title,
      message,
      data,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to send templated notification'));
  }
}

/**
 * إرسال تذكير
 */
export async function sendReminder(
  userId: string,
  type: 'check_in' | 'check_out' | 'review' | 'payment',
  data: NotificationTemplateData
): Promise<Result<void, Error>> {
  try {
    const reminderTypes = {
      check_in: NotificationType.CHECK_IN_TOMORROW,
      check_out: NotificationType.CHECK_OUT_TODAY,
      review: NotificationType.REVIEW_REQUEST,
      payment: NotificationType.PAYMENT_FAILED,
    };

    await sendTemplatedNotification(userId, reminderTypes[type], data);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to send reminder'));
  }
}

// ==================== Helper Functions ====================

interface ChannelInput {
  userId: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

async function sendThroughChannel(
  channel: string,
  input: ChannelInput
): Promise<void> {
  switch (channel) {
    case 'in_app':
      // Already saved to database
      break;
    case 'email':
      // TODO: Integrate with email provider
      console.log(`[Email] To: ${input.userId}, Subject: ${input.title}`);
      break;
    case 'sms':
      // TODO: Integrate with SMS provider
      console.log(`[SMS] To: ${input.userId}, Message: ${input.message}`);
      break;
    case 'push':
      // TODO: Integrate with push notification service
      console.log(`[Push] To: ${input.userId}, Title: ${input.title}`);
      break;
  }
}
