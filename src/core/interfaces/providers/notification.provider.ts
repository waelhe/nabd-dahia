/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Provider Interface - واجهة مزود الإشعارات
 * 
 * @module core/interfaces/providers/notification.provider
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * قنوات الإشعارات
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'whatsapp';

/**
 * أولوية الإشعار
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * حالة الإشعار
 */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';

/**
 * طلب الإشعار الأساسي
 */
export interface BaseNotificationRequest {
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
  templateId?: string;
  templateData?: Record<string, unknown>;
}

/**
 * طلب إشعار البريد
 */
export interface EmailNotificationRequest extends BaseNotificationRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: string[];
}

/**
 * مرفق البريد
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  contentId?: string;
}

/**
 * طلب إشعار SMS
 */
export interface SmsNotificationRequest extends BaseNotificationRequest {
  to: string | string[];
  message: string;
  from?: string;
  countryCode?: string;
}

/**
 * طلب إشعار Push
 */
export interface PushNotificationRequest extends BaseNotificationRequest {
  to: string | string[]; // device tokens or user IDs
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  image?: string;
  actionUrl?: string;
  actions?: PushAction[];
  data?: Record<string, unknown>;
  ttl?: number; // Time to live in seconds
}

/**
 * إجراء Push
 */
export interface PushAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * طلب إشعار WhatsApp
 */
export interface WhatsAppNotificationRequest extends BaseNotificationRequest {
  to: string | string[];
  templateName: string;
  languageCode: string;
  templateParams?: Record<string, string>;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    caption?: string;
  };
}

/**
 * طلب إشعار موحد
 */
export type NotificationRequest = 
  | EmailNotificationRequest 
  | SmsNotificationRequest 
  | PushNotificationRequest 
  | WhatsAppNotificationRequest;

/**
 * نتيجة الإشعار
 */
export interface NotificationResult {
  id: string;
  externalId?: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  error?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

/**
 * نتيجة إرسال متعدد
 */
export interface BulkNotificationResult {
  total: number;
  sent: number;
  failed: number;
  results: NotificationResult[];
}

/**
 * قالب الإشعار
 */
export interface NotificationTemplateInfo {
  id: string;
  name: string;
  type: NotificationChannel;
  subject?: string;
  body: string;
  variables?: string[];
  isActive: boolean;
}

/**
 * إحصائيات الإشعارات
 */
export interface NotificationStats {
  total: number;
  byStatus: Record<NotificationStatus, number>;
  byChannel: Record<NotificationChannel, number>;
  deliveryRate: number;
  openRate?: number;
  clickRate?: number;
  bounceRate?: number;
}

/**
 * تفضيلات الإشعارات للمستخدم
 */
export interface NotificationPreferences {
  userId: string;
  channels: Record<NotificationChannel, {
    enabled: boolean;
    types: Record<string, boolean>;
  }>;
  quietHours?: {
    start: string; // HH:mm
    end: string;
    timezone: string;
  };
  language: string;
}

/**
 * طلب التفضيلات
 */
export interface UpdatePreferencesRequest {
  channels?: Partial<Record<NotificationChannel, {
    enabled?: boolean;
    types?: Record<string, boolean>;
  }>>;
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  } | null;
  language?: string;
}

/**
 * Device Token
 */
export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  userId: string;
  deviceId?: string;
  createdAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

// ==================== Provider Interface ====================

/**
 * واجهة مزود الإشعارات
 */
export interface INotificationProvider {
  // ==================== Send ====================

  /**
   * إرسال إشعار بريد
   */
  sendEmail(request: EmailNotificationRequest): Promise<Result<NotificationResult, Error>>;

  /**
   * إرسال إشعار SMS
   */
  sendSms(request: SmsNotificationRequest): Promise<Result<NotificationResult, Error>>;

  /**
   * إرسال إشعار Push
   */
  sendPush(request: PushNotificationRequest): Promise<Result<NotificationResult, Error>>;

  /**
   * إرسال إشعار WhatsApp
   */
  sendWhatsApp(request: WhatsAppNotificationRequest): Promise<Result<NotificationResult, Error>>;

  /**
   * إرسال إشعار عام
   */
  send(request: NotificationRequest): Promise<Result<NotificationResult, Error>>;

  /**
   * إرسال متعدد
   */
  sendBulk(requests: NotificationRequest[]): Promise<Result<BulkNotificationResult, Error>>;

  /**
   * إرسال لأعضاء مجموعة
   */
  sendToGroup(channel: NotificationChannel, group: string, request: Omit<NotificationRequest, 'channels' | 'to'>): Promise<Result<BulkNotificationResult, Error>>;

  // ==================== Status ====================

  /**
   * حالة الإشعار
   */
  getStatus(notificationId: string): Promise<Result<NotificationStatus, Error>>;

  /**
   * معلومات الإشعار
   */
  getInfo(notificationId: string): Promise<Result<NotificationResult, Error>>;

  /**
   * إلغاء الإشعار
   */
  cancel(notificationId: string): Promise<Result<void, Error>>;

  // ==================== Templates ====================

  /**
   * إنشاء قالب
   */
  createTemplate(template: Omit<NotificationTemplateInfo, 'id'>): Promise<Result<NotificationTemplateInfo, Error>>;

  /**
   * تحديث قالب
   */
  updateTemplate(id: string, template: Partial<NotificationTemplateInfo>): Promise<Result<NotificationTemplateInfo, Error>>;

  /**
   * حذف قالب
   */
  deleteTemplate(id: string): Promise<Result<void, Error>>;

  /**
   * البحث عن قالب
   */
  getTemplate(id: string): Promise<Result<NotificationTemplateInfo, Error>>;

  /**
   * قوالب القناة
   */
  getTemplatesByChannel(channel: NotificationChannel): Promise<NotificationTemplateInfo[]>;

  /**
   * عرض القالب
   */
  renderTemplate(templateId: string, data: Record<string, unknown>): Promise<Result<{ subject?: string; body: string }, Error>>;

  // ==================== Device Tokens ====================

  /**
   * تسجيل Device Token
   */
  registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<Result<void, Error>>;

  /**
   * إلغاء تسجيل Device Token
   */
  unregisterDeviceToken(token: string): Promise<Result<void, Error>>;

  /**
   * أجهزة المستخدم
   */
  getUserDevices(userId: string): Promise<DeviceToken[]>;

  /**
   * إلغاء تنشيط الأجهزة القديمة
   */
  deactivateOldDevices(olderThanDays: number): Promise<Result<number, Error>>;

  // ==================== Preferences ====================

  /**
   * تفضيلات المستخدم
   */
  getPreferences(userId: string): Promise<Result<NotificationPreferences, Error>>;

  /**
   * تحديث التفضيلات
   */
  updatePreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<Result<NotificationPreferences, Error>>;

  /**
   * التحقق من تفضيلات القناة
   */
  isChannelEnabled(userId: string, channel: NotificationChannel, type?: string): Promise<boolean>;

  // ==================== Quiet Hours ====================

  /**
   * التحقق من ساعات الهدوء
   */
  isInQuietHours(userId: string): Promise<boolean>;

  /**
   * وقت الانتهاء القادم من ساعات الهدوء
   */
  getNextQuietHoursEnd(userId: string): Promise<Date | null>;

  // ==================== Stats ====================

  /**
   * إحصائيات الإشعارات
   */
  getStats(filter?: {
    channel?: NotificationChannel;
    from?: Date;
    to?: Date;
  }): Promise<NotificationStats>;

  /**
   * عدد الإشعارات
   */
  count(filter?: {
    channel?: NotificationChannel;
    status?: NotificationStatus;
    from?: Date;
    to?: Date;
  }): Promise<number>;

  // ==================== Health ====================

  /**
   * اختبار الاتصال
   */
  testConnection(): Promise<Result<boolean, Error>>;

  /**
   * التحقق من صحة القناة
   */
  validateChannel(channel: NotificationChannel): Promise<{
    valid: boolean;
    issues?: string[];
  }>;
}
