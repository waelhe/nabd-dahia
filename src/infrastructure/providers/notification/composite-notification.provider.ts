/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Composite Notification Provider - مزود الإشعارات المركب
 * 
 * @module infrastructure/providers/notification/composite-notification.provider
 */

import {
  INotificationProvider,
  NotificationChannel,
  NotificationStatus,
  NotificationRequest,
  NotificationResult,
  BulkNotificationResult,
  NotificationTemplateInfo,
  NotificationPreferences,
  UpdatePreferencesRequest,
  DeviceToken,
} from '@/core/interfaces/providers/notification.provider';
import { Result, ok, err } from '@/core/types/result';

// ==================== Channel Providers ====================

/**
 * واجهة مزود قناة الإشعارات
 */
export interface IChannelProvider {
  readonly channel: NotificationChannel;
  send(request: NotificationRequest): Promise<Result<NotificationResult, Error>>;
  testConnection(): Promise<Result<boolean, Error>>;
}

// ==================== Email Channel Provider ====================

/**
 * مزود قناة البريد الإلكتروني
 */
export class EmailChannelProvider implements IChannelProvider {
  readonly channel: NotificationChannel = 'email';
  private readonly apiKey?: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(config: { apiKey?: string; fromEmail: string; fromName: string }) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  async send(request: NotificationRequest): Promise<Result<NotificationResult, Error>> {
    try {
      const emailRequest = request as Extract<NotificationRequest, { subject: string }>;
      const recipients = Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to];

      // In production, use Resend, SendGrid, or similar
      if (this.apiKey) {
        // Simulate API call
        console.log(`[Email] Sending to ${recipients.join(', ')}: ${emailRequest.subject}`);
      }

      const id = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return ok({
        id,
        channel: 'email',
        status: 'sent',
        recipient: recipients[0],
        sentAt: new Date(),
        metadata: {
          allRecipients: recipients,
          subject: emailRequest.subject,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Email send failed'));
    }
  }

  async testConnection(): Promise<Result<boolean, Error>> {
    return ok(true);
  }
}

// ==================== SMS Channel Provider ====================

/**
 * مزود قناة الرسائل القصيرة
 */
export class SmsChannelProvider implements IChannelProvider {
  readonly channel: NotificationChannel = 'sms';
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly fromNumber: string;

  constructor(config: { accountSid?: string; authToken?: string; fromNumber: string }) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
  }

  async send(request: NotificationRequest): Promise<Result<NotificationResult, Error>> {
    try {
      const smsRequest = request as Extract<NotificationRequest, { message: string }>;
      const recipients = Array.isArray(smsRequest.to) ? smsRequest.to : [smsRequest.to];

      // In production, use Twilio, Vonage, or similar
      if (this.accountSid && this.authToken) {
        // Simulate API call
        console.log(`[SMS] Sending to ${recipients.join(', ')}: ${smsRequest.message.substring(0, 50)}...`);
      }

      const id = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return ok({
        id,
        channel: 'sms',
        status: 'sent',
        recipient: recipients[0],
        sentAt: new Date(),
        metadata: {
          allRecipients: recipients,
          messageLength: smsRequest.message.length,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('SMS send failed'));
    }
  }

  async testConnection(): Promise<Result<boolean, Error>> {
    return ok(true);
  }
}

// ==================== Push Channel Provider ====================

/**
 * مزود قناة الإشعارات الفورية
 */
export class PushChannelProvider implements IChannelProvider {
  readonly channel: NotificationChannel = 'push';
  private readonly serverKey?: string;
  private readonly projectId?: string;

  constructor(config?: { serverKey?: string; projectId?: string }) {
    this.serverKey = config?.serverKey;
    this.projectId = config?.projectId;
  }

  async send(request: NotificationRequest): Promise<Result<NotificationResult, Error>> {
    try {
      const pushRequest = request as Extract<NotificationRequest, { title: string; body: string }>;
      const tokens = Array.isArray(pushRequest.to) ? pushRequest.to : [pushRequest.to];

      // In production, use FCM, APNs, or similar
      if (this.serverKey) {
        // Simulate API call
        console.log(`[Push] Sending to ${tokens.length} device(s): ${pushRequest.title}`);
      }

      const id = `push_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return ok({
        id,
        channel: 'push',
        status: 'sent',
        recipient: tokens[0],
        sentAt: new Date(),
        metadata: {
          allTokens: tokens,
          title: pushRequest.title,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Push send failed'));
    }
  }

  async testConnection(): Promise<Result<boolean, Error>> {
    return ok(true);
  }
}

// ==================== WhatsApp Channel Provider ====================

/**
 * مزود قناة واتساب
 */
export class WhatsAppChannelProvider implements IChannelProvider {
  readonly channel: NotificationChannel = 'whatsapp';
  private readonly accessToken?: string;
  private readonly phoneNumberId?: string;

  constructor(config?: { accessToken?: string; phoneNumberId?: string }) {
    this.accessToken = config?.accessToken;
    this.phoneNumberId = config?.phoneNumberId;
  }

  async send(request: NotificationRequest): Promise<Result<NotificationResult, Error>> {
    try {
      const waRequest = request as Extract<NotificationRequest, { templateName: string }>;
      const recipients = Array.isArray(waRequest.to) ? waRequest.to : [waRequest.to];

      // In production, use WhatsApp Business API
      if (this.accessToken) {
        // Simulate API call
        console.log(`[WhatsApp] Sending to ${recipients.join(', ')}: ${waRequest.templateName}`);
      }

      const id = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return ok({
        id,
        channel: 'whatsapp',
        status: 'sent',
        recipient: recipients[0],
        sentAt: new Date(),
        metadata: {
          allRecipients: recipients,
          templateName: waRequest.templateName,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('WhatsApp send failed'));
    }
  }

  async testConnection(): Promise<Result<boolean, Error>> {
    return ok(true);
  }
}

// ==================== Composite Notification Provider ====================

/**
 * مزود الإشعارات المركب - يجمع كل قنوات الإشعارات
 */
export class CompositeNotificationProvider implements INotificationProvider {
  private readonly channelProviders: Map<NotificationChannel, IChannelProvider> = new Map();
  private readonly templates: Map<string, NotificationTemplateInfo> = new Map();
  private readonly deviceTokens: Map<string, DeviceToken[]> = new Map();
  private readonly preferences: Map<string, NotificationPreferences> = new Map();

  constructor(channelProviders: IChannelProvider[]) {
    for (const provider of channelProviders) {
      this.channelProviders.set(provider.channel, provider);
    }
  }

  private getChannelProvider(channel: NotificationChannel): IChannelProvider | undefined {
    return this.channelProviders.get(channel);
  }

  // ==================== Send ====================

  async sendEmail(request: Extract<NotificationRequest, { subject: string }>): Promise<Result<NotificationResult, Error>> {
    const provider = this.getChannelProvider('email');
    if (!provider) {
      return err(new Error('Email channel not configured'));
    }
    return provider.send({ ...request, channels: ['email'] });
  }

  async sendSms(request: Extract<NotificationRequest, { message: string }>): Promise<Result<NotificationResult, Error>> {
    const provider = this.getChannelProvider('sms');
    if (!provider) {
      return err(new Error('SMS channel not configured'));
    }
    return provider.send({ ...request, channels: ['sms'] });
  }

  async sendPush(request: Extract<NotificationRequest, { title: string; body: string }>): Promise<Result<NotificationResult, Error>> {
    const provider = this.getChannelProvider('push');
    if (!provider) {
      return err(new Error('Push channel not configured'));
    }
    return provider.send({ ...request, channels: ['push'] });
  }

  async sendWhatsApp(request: Extract<NotificationRequest, { templateName: string }>): Promise<Result<NotificationResult, Error>> {
    const provider = this.getChannelProvider('whatsapp');
    if (!provider) {
      return err(new Error('WhatsApp channel not configured'));
    }
    return provider.send({ ...request, channels: ['whatsapp'] });
  }

  async send(request: NotificationRequest): Promise<Result<NotificationResult, Error>> {
    const channels = request.channels;
    const results: NotificationResult[] = [];
    const errors: Error[] = [];

    for (const channel of channels) {
      const provider = this.getChannelProvider(channel);
      if (!provider) {
        errors.push(new Error(`Channel ${channel} not configured`));
        continue;
      }

      const result = await provider.send(request);
      if (result.isOk()) {
        results.push(result.value);
      } else {
        errors.push(result.error);
      }
    }

    if (results.length === 0) {
      return err(new Error(`All channels failed: ${errors.map((e) => e.message).join(', ')}`));
    }

    // Return first successful result
    return ok(results[0]);
  }

  async sendBulk(requests: NotificationRequest[]): Promise<Result<BulkNotificationResult, Error>> {
    const results: NotificationResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const request of requests) {
      const result = await this.send(request);
      if (result.isOk()) {
        results.push(result.value);
        sent++;
      } else {
        failed++;
        results.push({
          id: `failed_${Date.now()}`,
          channel: request.channels[0],
          status: 'failed',
          recipient: 'unknown',
          failedAt: new Date(),
          error: result.error.message,
        });
      }
    }

    return ok({ total: requests.length, sent, failed, results });
  }

  async sendToGroup(
    channel: NotificationChannel,
    group: string,
    request: Omit<NotificationRequest, 'channels' | 'to'>,
  ): Promise<Result<BulkNotificationResult, Error>> {
    // In production, fetch group members from database
    const groupMembers: string[] = []; // Placeholder

    const requests: NotificationRequest[] = groupMembers.map((member) => ({
      ...request,
      to: member,
      channels: [channel],
    } as NotificationRequest));

    return this.sendBulk(requests);
  }

  // ==================== Status ====================

  async getStatus(notificationId: string): Promise<Result<NotificationStatus, Error>> {
    // In production, fetch from database
    return ok('sent');
  }

  async getInfo(notificationId: string): Promise<Result<NotificationResult, Error>> {
    // In production, fetch from database
    return ok({
      id: notificationId,
      channel: 'email',
      status: 'sent',
      recipient: 'unknown',
      sentAt: new Date(),
    });
  }

  async cancel(notificationId: string): Promise<Result<void, Error>> {
    // In production, update status in database
    return ok(undefined);
  }

  // ==================== Templates ====================

  async createTemplate(
    template: Omit<NotificationTemplateInfo, 'id'>,
  ): Promise<Result<NotificationTemplateInfo, Error>> {
    const id = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newTemplate: NotificationTemplateInfo = { ...template, id };

    this.templates.set(id, newTemplate);
    return ok(newTemplate);
  }

  async updateTemplate(
    id: string,
    template: Partial<NotificationTemplateInfo>,
  ): Promise<Result<NotificationTemplateInfo, Error>> {
    const existing = this.templates.get(id);
    if (!existing) {
      return err(new Error('Template not found'));
    }

    const updated = { ...existing, ...template };
    this.templates.set(id, updated);
    return ok(updated);
  }

  async deleteTemplate(id: string): Promise<Result<void, Error>> {
    if (!this.templates.has(id)) {
      return err(new Error('Template not found'));
    }
    this.templates.delete(id);
    return ok(undefined);
  }

  async getTemplate(id: string): Promise<Result<NotificationTemplateInfo, Error>> {
    const template = this.templates.get(id);
    if (!template) {
      return err(new Error('Template not found'));
    }
    return ok(template);
  }

  async getTemplatesByChannel(channel: NotificationChannel): Promise<NotificationTemplateInfo[]> {
    return Array.from(this.templates.values()).filter((t) => t.type === channel);
  }

  async renderTemplate(
    templateId: string,
    data: Record<string, unknown>,
  ): Promise<Result<{ subject?: string; body: string }, Error>> {
    const template = this.templates.get(templateId);
    if (!template) {
      return err(new Error('Template not found'));
    }

    // Simple template rendering - in production use a proper template engine
    let body = template.body;
    for (const [key, value] of Object.entries(data)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    let subject = template.subject;
    if (subject) {
      for (const [key, value] of Object.entries(data)) {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
    }

    return ok({ subject, body });
  }

  // ==================== Device Tokens ====================

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
  ): Promise<Result<void, Error>> {
    const devices = this.deviceTokens.get(userId) || [];
    const existingIndex = devices.findIndex((d) => d.token === token);

    const deviceToken: DeviceToken = {
      token,
      platform,
      userId,
      createdAt: existingIndex >= 0 ? devices[existingIndex].createdAt : new Date(),
      lastUsedAt: new Date(),
      isActive: true,
    };

    if (existingIndex >= 0) {
      devices[existingIndex] = deviceToken;
    } else {
      devices.push(deviceToken);
    }

    this.deviceTokens.set(userId, devices);
    return ok(undefined);
  }

  async unregisterDeviceToken(token: string): Promise<Result<void, Error>> {
    for (const [userId, devices] of this.deviceTokens.entries()) {
      const index = devices.findIndex((d) => d.token === token);
      if (index >= 0) {
        devices[index].isActive = false;
        this.deviceTokens.set(userId, devices);
        return ok(undefined);
      }
    }
    return ok(undefined);
  }

  async getUserDevices(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokens.get(userId) || [];
  }

  async deactivateOldDevices(olderThanDays: number): Promise<Result<number, Error>> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    let count = 0;

    for (const [userId, devices] of this.deviceTokens.entries()) {
      for (const device of devices) {
        if (device.lastUsedAt < cutoffDate && device.isActive) {
          device.isActive = false;
          count++;
        }
      }
      this.deviceTokens.set(userId, devices);
    }

    return ok(count);
  }

  // ==================== Preferences ====================

  async getPreferences(userId: string): Promise<Result<NotificationPreferences, Error>> {
    let prefs = this.preferences.get(userId);
    if (!prefs) {
      // Default preferences
      prefs = {
        userId,
        channels: {
          email: { enabled: true, types: {} },
          sms: { enabled: true, types: {} },
          push: { enabled: true, types: {} },
          in_app: { enabled: true, types: {} },
          whatsapp: { enabled: false, types: {} },
        },
        language: 'ar',
      };
      this.preferences.set(userId, prefs);
    }
    return ok(prefs);
  }

  async updatePreferences(
    userId: string,
    preferences: UpdatePreferencesRequest,
  ): Promise<Result<NotificationPreferences, Error>> {
    const current = await this.getPreferences(userId);
    if (current.isErr()) {
      return err(current.error);
    }

    const updated: NotificationPreferences = {
      ...current.value,
      ...preferences,
      channels: {
        ...current.value.channels,
        ...(preferences.channels || {}),
      },
    };

    this.preferences.set(userId, updated);
    return ok(updated);
  }

  async isChannelEnabled(
    userId: string,
    channel: NotificationChannel,
    type?: string,
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    if (prefs.isErr()) {
      return true; // Default to enabled
    }

    const channelPrefs = prefs.value.channels[channel];
    if (!channelPrefs?.enabled) {
      return false;
    }

    if (type && channelPrefs.types[type] === false) {
      return false;
    }

    return true;
  }

  // ==================== Quiet Hours ====================

  async isInQuietHours(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    if (prefs.isErr() || !prefs.value.quietHours) {
      return false;
    }

    const now = new Date();
    const quietHours = prefs.value.quietHours;

    // Simple check - in production, use proper timezone handling
    const currentTime = now.toTimeString().substring(0, 5);
    return currentTime >= quietHours.start && currentTime <= quietHours.end;
  }

  async getNextQuietHoursEnd(userId: string): Promise<Date | null> {
    const prefs = await this.getPreferences(userId);
    if (prefs.isErr() || !prefs.value.quietHours) {
      return null;
    }

    // Simple calculation - in production, use proper timezone handling
    const [hours, minutes] = prefs.value.quietHours.end.split(':').map(Number);
    const end = new Date();
    end.setHours(hours, minutes, 0, 0);

    return end;
  }

  // ==================== Stats ====================

  async getStats(filter?: {
    channel?: NotificationChannel;
    from?: Date;
    to?: Date;
  }): Promise<{
    total: number;
    byStatus: Record<NotificationStatus, number>;
    byChannel: Record<NotificationChannel, number>;
    deliveryRate: number;
    openRate?: number;
    clickRate?: number;
    bounceRate?: number;
  }> {
    // Placeholder - in production, fetch from database
    return {
      total: 0,
      byStatus: {
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
      },
      byChannel: {
        email: 0,
        sms: 0,
        push: 0,
        in_app: 0,
        whatsapp: 0,
      },
      deliveryRate: 0,
    };
  }

  async count(filter?: {
    channel?: NotificationChannel;
    status?: NotificationStatus;
    from?: Date;
    to?: Date;
  }): Promise<number> {
    // Placeholder - in production, fetch from database
    return 0;
  }

  // ==================== Health ====================

  async testConnection(): Promise<Result<boolean, Error>> {
    const results = await Promise.all(
      Array.from(this.channelProviders.values()).map((p) => p.testConnection()),
    );
    return ok(results.every((r) => r.isOk()));
  }

  async validateChannel(channel: NotificationChannel): Promise<{
    valid: boolean;
    issues?: string[];
  }> {
    const provider = this.getChannelProvider(channel);
    if (!provider) {
      return { valid: false, issues: ['Channel provider not configured'] };
    }

    const testResult = await provider.testConnection();
    return {
      valid: testResult.isOk(),
      issues: testResult.isErr() ? [testResult.error.message] : undefined,
    };
  }
}
