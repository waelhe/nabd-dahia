/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Providers - مزودي الإشعارات
 * 
 * @module infrastructure/providers/notification
 */

export * from './composite-notification.provider';

import {
  INotificationProvider,
  NotificationChannel,
} from '@/core/interfaces/providers/notification.provider';
import {
  CompositeNotificationProvider,
  EmailChannelProvider,
  SmsChannelProvider,
  PushChannelProvider,
  WhatsAppChannelProvider,
  IChannelProvider,
} from './composite-notification.provider';

// ==================== Types ====================

export interface NotificationConfig {
  channels: {
    email?: {
      apiKey?: string;
      fromEmail: string;
      fromName: string;
    };
    sms?: {
      accountSid?: string;
      authToken?: string;
      fromNumber: string;
    };
    push?: {
      serverKey?: string;
      projectId?: string;
    };
    whatsapp?: {
      accessToken?: string;
      phoneNumberId?: string;
    };
  };
}

// ==================== Factory ====================

/**
 * إنشاء مزود الإشعارات
 */
export function createNotificationProvider(config: NotificationConfig): INotificationProvider {
  const channelProviders: IChannelProvider[] = [];

  // Email channel
  if (config.channels.email) {
    channelProviders.push(new EmailChannelProvider({
      apiKey: config.channels.email.apiKey,
      fromEmail: config.channels.email.fromEmail,
      fromName: config.channels.email.fromName,
    }));
  }

  // SMS channel
  if (config.channels.sms) {
    channelProviders.push(new SmsChannelProvider({
      accountSid: config.channels.sms.accountSid,
      authToken: config.channels.sms.authToken,
      fromNumber: config.channels.sms.fromNumber,
    }));
  }

  // Push channel
  if (config.channels.push) {
    channelProviders.push(new PushChannelProvider({
      serverKey: config.channels.push.serverKey,
      projectId: config.channels.push.projectId,
    }));
  }

  // WhatsApp channel
  if (config.channels.whatsapp) {
    channelProviders.push(new WhatsAppChannelProvider({
      accessToken: config.channels.whatsapp.accessToken,
      phoneNumberId: config.channels.whatsapp.phoneNumberId,
    }));
  }

  return new CompositeNotificationProvider(channelProviders);
}

// ==================== Singleton Instance ====================

let notificationInstance: INotificationProvider | null = null;

/**
 * تهيئة مزود الإشعارات
 */
export function initializeNotification(config: NotificationConfig): INotificationProvider {
  notificationInstance = createNotificationProvider(config);
  return notificationInstance;
}

/**
 * الحصول على مزود الإشعارات
 */
export function getNotificationProvider(): INotificationProvider {
  if (!notificationInstance) {
    throw new Error('Notification provider not initialized. Call initializeNotification() first.');
  }
  return notificationInstance;
}
