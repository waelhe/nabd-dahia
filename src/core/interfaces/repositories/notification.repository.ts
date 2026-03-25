/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Repository Interface - واجهة مستودع الإشعارات
 * 
 * @module core/interfaces/repositories/notification.repository
 */

import type { Result } from '../../types/result';
import type { PaginatedResult, PaginationOptions } from './base.repository';

// ==================== Types ====================

/**
 * الإشعار مع العلاقات
 */
export interface NotificationWithRelations {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  readAt?: Date | null;
  read: boolean;
  sentVia?: string | null;
  sentAt?: Date | null;
  createdAt: Date;
  
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  };
}

/**
 * بيانات إنشاء الإشعار
 */
export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sentVia?: string;
  scheduledAt?: Date;
}

/**
 * بيانات إنشاء إشعارات متعددة
 */
export interface CreateBulkNotificationData {
  userIds: string[];
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sentVia?: string;
}

/**
 * فلاتر الإشعارات
 */
export interface NotificationFilter {
  userId?: string;
  type?: string | string[];
  read?: boolean;
  sentVia?: string | string[];
  createdAfter?: Date;
  createdBefore?: Date;
  sentAfter?: Date;
  sentBefore?: Date;
}

/**
 * إحصائيات الإشعارات
 */
export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  recentCount: number; // آخر 24 ساعة
}

/**
 * قالب الإشعار
 */
export interface NotificationTemplate {
  id: string;
  type: string;
  subject?: string | null;
  title: string;
  body: string;
  variables?: string[] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * بيانات إنشاء القالب
 */
export interface CreateTemplateData {
  type: string;
  subject?: string;
  title: string;
  body: string;
  variables?: string[];
  isActive?: boolean;
}

// ==================== Repository Interface ====================

/**
 * واجهة مستودع الإشعارات
 */
export interface INotificationRepository {
  // ==================== Create ====================

  /**
   * إنشاء إشعار
   */
  create(data: CreateNotificationData): Promise<Result<NotificationWithRelations, Error>>;

  /**
   * إنشاء إشعارات متعددة
   */
  createBulk(data: CreateBulkNotificationData): Promise<Result<NotificationWithRelations[], Error>>;

  // ==================== Read ====================

  /**
   * البحث بالمعرف
   */
  findById(id: string): Promise<Result<NotificationWithRelations, Error>>;

  /**
   * البحث بالمعرف أو null
   */
  findByIdOrNull(id: string): Promise<NotificationWithRelations | null>;

  /**
   * إشعارات المستخدم
   */
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResult<NotificationWithRelations>>;

  /**
   * الإشعارات غير المقروءة
   */
  findUnread(userId: string): Promise<NotificationWithRelations[]>;

  /**
   * عدد الإشعارات غير المقروءة
   */
  countUnread(userId: string): Promise<number>;

  /**
   * البحث بمعايير
   */
  findMany(filter: NotificationFilter, options?: PaginationOptions): Promise<PaginatedResult<NotificationWithRelations>>;

  // ==================== Update ====================

  /**
   * تعليم كمقروء
   */
  markAsRead(id: string): Promise<Result<void, Error>>;

  /**
   * تعليم الكل كمقروء
   */
  markAllAsRead(userId: string): Promise<Result<number, Error>>; // عدد المحذوفة

  /**
   * تعليم عدة إشعارات كمقروءة
   */
  markManyAsRead(ids: string[]): Promise<Result<void, Error>>;

  // ==================== Delete ====================

  /**
   * حذف إشعار
   */
  delete(id: string): Promise<Result<void, Error>>;

  /**
   * حذف إشعارات المستخدم
   */
  deleteByUserId(userId: string): Promise<Result<number, Error>>;

  /**
   * حذف الإشعارات القديمة
   */
  deleteOlderThan(days: number): Promise<Result<number, Error>>;

  // ==================== Stats ====================

  /**
   * إحصائيات الإشعارات
   */
  getStats(userId?: string): Promise<NotificationStats>;

  /**
   * عدد الإشعارات
   */
  count(filter?: NotificationFilter): Promise<number>;

  // ==================== Templates ====================

  /**
   * إنشاء قالب
   */
  createTemplate(data: CreateTemplateData): Promise<Result<NotificationTemplate, Error>>;

  /**
   * البحث عن قالب
   */
  findTemplateByType(type: string): Promise<NotificationTemplate | null>;

  /**
   * كل القوالب
   */
  findAllTemplates(): Promise<NotificationTemplate[]>;

  /**
   * تحديث قالب
   */
  updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<Result<NotificationTemplate, Error>>;

  /**
   * حذف قالب
   */
  deleteTemplate(id: string): Promise<Result<void, Error>>;

  // ==================== Batch Operations ====================

  /**
   * الإشعارات المحدولة للإرسال
   */
  findPendingToSend(limit?: number): Promise<NotificationWithRelations[]>;

  /**
   * تعليم كمُرسل
   */
  markAsSent(id: string, sentVia: string): Promise<Result<void, Error>>;
}
