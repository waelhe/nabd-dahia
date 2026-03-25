/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Entity - كيان الإشعار
 * 
 * يمثل إشعاراً في النظام.
 * يدعم أنواع متعددة: بريد، SMS، Push، داخل التطبيق.
 * 
 * @module core/domain/entities/Notification
 */

import { Entity, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Translation } from '../value-objects/Translation';
import type { Result, ValidationError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isObject } from '../../types/guards';

// ==================== Types ====================

/**
 * نوع الإشعار
 */
export type NotificationType = 
  | 'booking' 
  | 'payment' 
  | 'review' 
  | 'message' 
  | 'system' 
  | 'promotion'
  | 'security'
  | 'reminder'
  | 'alert';

/**
 * حالة الإشعار
 */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * قناة الإرسال
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

/**
 * أولوية الإشعار
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * بيانات الإشعار
 */
export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  imageUrl?: string;
}

/**
 * خصائص الإشعار
 */
export interface NotificationProps {
  id: UniqueEntityId | string;
  
  // المستلم
  userId: string;
  
  // المحتوى
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  
  // الروابط
  actionUrl: string | null;
  imageUrl: string | null;
  
  // القنوات
  channels: NotificationChannel[];
  sentVia: NotificationChannel | null;
  
  // الحالة
  status: NotificationStatus;
  priority: NotificationPriority;
  
  // التواريخ
  readAt: Date | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  
  // إعادة المحاولة
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  
  // انتهاء الصلاحية
  expiresAt: Date | null;
  
  // التواريخ
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Notification Errors ====================

export class NotificationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NotificationError';
  }

  static invalidMessage(): NotificationError {
    return new NotificationError('INVALID_MESSAGE', 'Notification message is required');
  }

  static alreadySent(): NotificationError {
    return new NotificationError('ALREADY_SENT', 'Notification has already been sent');
  }

  static maxRetriesExceeded(): NotificationError {
    return new NotificationError('MAX_RETRIES', 'Maximum retry attempts exceeded');
  }

  static expired(): NotificationError {
    return new NotificationError('EXPIRED', 'Notification has expired');
  }
}

// ==================== Notification Entity ====================

export class Notification extends Entity<NotificationProps> {
  
  // ==================== Getters ====================
  
  get userId(): string {
    return this.props.userId;
  }
  
  get type(): NotificationType {
    return this.props.type;
  }
  
  get title(): string {
    return this.props.title;
  }
  
  get message(): string {
    return this.props.message;
  }
  
  get status(): NotificationStatus {
    return this.props.status;
  }
  
  get priority(): NotificationPriority {
    return this.props.priority;
  }
  
  get isRead(): boolean {
    return this.props.readAt !== null;
  }
  
  get isSent(): boolean {
    return this.props.status !== 'pending' && this.props.status !== 'failed';
  }
  
  get isExpired(): boolean {
    return this.props.expiresAt !== null && this.props.expiresAt < new Date();
  }
  
  get channels(): NotificationChannel[] {
    return [...this.props.channels];
  }
  
  // ==================== Business Methods ====================
  
  /**
   * تحديد الإشعار كمقروء
   */
  markAsRead(): void {
    if (this.props.readAt === null) {
      this.props.readAt = new Date();
      this.props.status = 'read';
      this.touch();
    }
  }
  
  /**
   * تحديد الإشعار كغير مقروء
   */
  markAsUnread(): void {
    this.props.readAt = null;
    if (this.props.status === 'read') {
      this.props.status = 'delivered';
    }
    this.touch();
  }
  
  /**
   * تحديد الإشعار كمرسل
   */
  markAsSent(channel: NotificationChannel): Result<void, NotificationError> {
    if (this.props.status !== 'pending' && this.props.status !== 'failed') {
      return err(NotificationError.alreadySent());
    }
    
    if (this.isExpired) {
      return err(NotificationError.expired());
    }
    
    this.props.status = 'sent';
    this.props.sentAt = new Date();
    this.props.sentVia = channel;
    this.touch();
    
    return ok(undefined);
  }
  
  /**
   * تحديد الإشعار كمُسلَّم
   */
  markAsDelivered(): void {
    this.props.status = 'delivered';
    this.props.deliveredAt = new Date();
    this.touch();
  }
  
  /**
   * تسجيل فشل الإرسال
   */
  markAsFailed(error: string): Result<void, NotificationError> {
    if (this.props.retryCount >= this.props.maxRetries) {
      return err(NotificationError.maxRetriesExceeded());
    }
    
    this.props.status = 'failed';
    this.props.lastError = error;
    this.props.retryCount += 1;
    this.touch();
    
    return ok(undefined);
  }
  
  /**
   * إعادة المحاولة
   */
  retry(): Result<void, NotificationError> {
    if (this.props.retryCount >= this.props.maxRetries) {
      return err(NotificationError.maxRetriesExceeded());
    }
    
    if (this.isExpired) {
      return err(NotificationError.expired());
    }
    
    this.props.status = 'pending';
    this.touch();
    
    return ok(undefined);
  }
  
  /**
   * إضافة بيانات
   */
  setData(key: string, value: unknown): void {
    if (!this.props.data) {
      this.props.data = {};
    }
    this.props.data[key] = value;
    this.touch();
  }
  
  /**
   * الحصول على بيانات
   */
  getData<T = unknown>(key: string): T | undefined {
    return this.props.data?.[key] as T | undefined;
  }
  
  /**
   * تحديث الأولوية
   */
  setPriority(priority: NotificationPriority): void {
    this.props.priority = priority;
    this.touch();
  }
  
  /**
   * التحقق من إمكانية الإرسال
   */
  canBeSent(): boolean {
    return (this.props.status === 'pending' || this.props.status === 'failed') && 
           !this.isExpired && 
           this.props.retryCount < this.props.maxRetries;
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء إشعار جديد
   */
  static create(props: Omit<NotificationProps, 'id' | 'createdAt' | 'updatedAt' | 'readAt' | 'sentAt' | 'deliveredAt' | 'sentVia' | 'retryCount' | 'lastError'> & { id?: string }): Result<Notification, ValidationError | NotificationError> {
    // التحقق من المحتوى
    if (!props.title || props.title.trim().length === 0) {
      return err(new ValidationError('Title is required', 'title'));
    }
    
    if (!props.message || props.message.trim().length === 0) {
      return err(new ValidationError('Message is required', 'message'));
    }
    
    // التحقق من المستخدم
    if (!props.userId) {
      return err(new ValidationError('User ID is required', 'userId'));
    }
    
    const now = new Date();
    
    const notification = new Notification({
      ...props,
      id: props.id || new UniqueEntityId(),
      readAt: null,
      sentAt: null,
      deliveredAt: null,
      sentVia: null,
      retryCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    });
    
    return ok(notification);
  }
  
  /**
   * إنشاء إشعار حجز
   */
  static createBookingNotification(
    userId: string,
    bookingId: string,
    title: string,
    message: string,
    channels: NotificationChannel[] = ['in_app', 'email']
  ): Result<Notification, ValidationError | NotificationError> {
    return Notification.create({
      userId,
      type: 'booking',
      title,
      message,
      data: { bookingId },
      channels,
      status: 'pending',
      priority: 'high',
      actionUrl: `/bookings/${bookingId}`,
      imageUrl: null,
      maxRetries: 3,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
    });
  }
  
  /**
   * إنشاء إشعار دفع
   */
  static createPaymentNotification(
    userId: string,
    paymentId: string,
    title: string,
    message: string,
    channels: NotificationChannel[] = ['in_app', 'email', 'sms']
  ): Result<Notification, ValidationError | NotificationError> {
    return Notification.create({
      userId,
      type: 'payment',
      title,
      message,
      data: { paymentId },
      channels,
      status: 'pending',
      priority: 'urgent',
      actionUrl: `/payments/${paymentId}`,
      imageUrl: null,
      maxRetries: 5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
    });
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      userId: this.props.userId,
      type: this.props.type,
      title: this.props.title,
      message: this.props.message,
      data: this.props.data,
      actionUrl: this.props.actionUrl,
      imageUrl: this.props.imageUrl,
      channels: this.props.channels,
      sentVia: this.props.sentVia,
      status: this.props.status,
      priority: this.props.priority,
      isRead: this.isRead,
      readAt: this.props.readAt?.toISOString() || null,
      sentAt: this.props.sentAt?.toISOString() || null,
      deliveredAt: this.props.deliveredAt?.toISOString() || null,
      retryCount: this.props.retryCount,
      expiresAt: this.props.expiresAt?.toISOString() || null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
