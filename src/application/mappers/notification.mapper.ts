/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Mapper
 *
 * مسئول عن التحويل بين:
 * - Domain Entity (Notification) ↔ Persistence Model (Prisma Notification)
 * - Domain Entity (Notification) ↔ DTO (API Response)
 *
 * @module application/mappers/notification.mapper
 */

import { Notification, NotificationProps, NotificationError, NotificationType, NotificationStatus, NotificationChannel, NotificationPriority } from '@/core/domain/entities/Notification';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';
import { BaseMapper, MapperError, parseJSON, dateToISO, isoToDate } from './base.mapper';

// ==================== Types ====================

/**
 * بيانات إنشاء الإشعار من API
 */
export interface NotificationCreateDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  imageUrl?: string;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  maxRetries?: number;
  expiresAt?: Date;
}

/**
 * بيانات تحديث الإشعار من API
 */
export interface NotificationUpdateDTO {
  status?: NotificationStatus;
  priority?: NotificationPriority;
  data?: Record<string, unknown>;
}

/**
 * استجابة API للإشعار
 */
export interface NotificationResponseDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  actionUrl: string | null;
  imageUrl: string | null;
  channels: NotificationChannel[];
  sentVia: NotificationChannel | null;
  status: NotificationStatus;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: Date | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  retryCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للإشعار (مختصرة)
 */
export interface NotificationSummaryDTO {
  id: string;
  type: NotificationType;
  title: string;
  isRead: boolean;
  priority: NotificationPriority;
  createdAt: Date;
}

// ==================== Prisma Types ====================

interface PrismaNotificationWithIncludes {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: string | null;
  actionUrl: string | null;
  imageUrl: string | null;
  channels: string | null;
  sentVia: NotificationChannel | null;
  status: NotificationStatus;
  priority: NotificationPriority;
  readAt: Date | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Mapper Class ====================

export class NotificationMapper extends BaseMapper<Notification, NotificationResponseDTO, PrismaNotificationWithIncludes, NotificationCreateDTO, NotificationUpdateDTO> {

  // ==================== To Domain ====================

  /**
   * تحويل Prisma Notification إلى Domain Entity
   */
  toDomain(prismaNotification: PrismaNotificationWithIncludes): Result<Notification, MapperError> {
    try {
      // Parse JSON fields
      const data = parseJSON<Record<string, unknown>>(prismaNotification.data, null);
      const channels = parseJSON<NotificationChannel[]>(prismaNotification.channels, ['in_app']);

      // إنشاء Notification Props
      const props: NotificationProps = {
        id: new UniqueEntityId(prismaNotification.id),
        userId: prismaNotification.userId,
        type: prismaNotification.type,
        title: prismaNotification.title,
        message: prismaNotification.message,
        data,
        actionUrl: prismaNotification.actionUrl,
        imageUrl: prismaNotification.imageUrl,
        channels,
        sentVia: prismaNotification.sentVia,
        status: prismaNotification.status,
        priority: prismaNotification.priority,
        readAt: prismaNotification.readAt,
        sentAt: prismaNotification.sentAt,
        deliveredAt: prismaNotification.deliveredAt,
        retryCount: prismaNotification.retryCount,
        maxRetries: prismaNotification.maxRetries,
        lastError: prismaNotification.lastError,
        expiresAt: prismaNotification.expiresAt,
        createdAt: prismaNotification.createdAt,
        updatedAt: prismaNotification.updatedAt,
      };

      // إعادة بناء الـ Entity
      return ok(Notification.reconstitute(props));
    } catch (error) {
      return err(MapperError.conversionFailed('PrismaNotification', 'Notification', String(error)));
    }
  }

  // ==================== To Persistence ====================

  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  toPersistence(notification: Notification): Record<string, unknown> {
    return {
      id: notification.idValue,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.getProps().data ? JSON.stringify(notification.getProps().data) : null,
      actionUrl: notification.getProps().actionUrl,
      imageUrl: notification.getProps().imageUrl,
      channels: JSON.stringify(notification.channels),
      sentVia: notification.getProps().sentVia,
      status: notification.status,
      priority: notification.priority,
      readAt: notification.getProps().readAt,
      sentAt: notification.getProps().sentAt,
      deliveredAt: notification.getProps().deliveredAt,
      retryCount: notification.getProps().retryCount,
      maxRetries: notification.getProps().maxRetries,
      lastError: notification.getProps().lastError,
      expiresAt: notification.getProps().expiresAt,
    };
  }

  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  createDTOToPersistence(dto: NotificationCreateDTO): Record<string, unknown> {
    return {
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data ? JSON.stringify(dto.data) : null,
      actionUrl: dto.actionUrl || null,
      imageUrl: dto.imageUrl || null,
      channels: JSON.stringify(dto.channels || ['in_app']),
      sentVia: null,
      status: 'pending',
      priority: dto.priority || 'normal',
      readAt: null,
      sentAt: null,
      deliveredAt: null,
      retryCount: 0,
      maxRetries: dto.maxRetries || 3,
      lastError: null,
      expiresAt: dto.expiresAt || null,
    };
  }

  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  updateDTOToPersistence(dto: NotificationUpdateDTO): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.data !== undefined) data.data = dto.data ? JSON.stringify(dto.data) : null;

    return data;
  }

  // ==================== To DTO ====================

  /**
   * تحويل Domain Entity إلى Response DTO
   */
  toDTO(notification: Notification): NotificationResponseDTO {
    return {
      id: notification.idValue,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.getProps().data,
      actionUrl: notification.getProps().actionUrl,
      imageUrl: notification.getProps().imageUrl,
      channels: notification.channels,
      sentVia: notification.getProps().sentVia,
      status: notification.status,
      priority: notification.priority,
      isRead: notification.isRead,
      readAt: notification.getProps().readAt,
      sentAt: notification.getProps().sentAt,
      deliveredAt: notification.getProps().deliveredAt,
      retryCount: notification.getProps().retryCount,
      expiresAt: notification.getProps().expiresAt,
      createdAt: notification.getProps().createdAt,
      updatedAt: notification.getProps().updatedAt,
    };
  }

  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  toSummaryDTO(notification: Notification): NotificationSummaryDTO {
    return {
      id: notification.idValue,
      type: notification.type,
      title: notification.title,
      isRead: notification.isRead,
      priority: notification.priority,
      createdAt: notification.getProps().createdAt,
    };
  }

  /**
   * تحويل Prisma Notification مباشرة إلى Response DTO
   */
  prismaToDTO(prismaNotification: PrismaNotificationWithIncludes): NotificationResponseDTO {
    const result = this.toDomain(prismaNotification);
    if (result.isFailure) {
      throw result.error;
    }
    return this.toDTO(result.value);
  }

  /**
   * حساب إحصائيات الإشعارات
   */
  static calculateStats(notifications: NotificationResponseDTO[]): {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byStatus: Record<NotificationStatus, number>;
  } {
    const byType: Record<NotificationType, number> = {} as Record<NotificationType, number>;
    const byStatus: Record<NotificationStatus, number> = {} as Record<NotificationStatus, number>;
    let unread = 0;

    for (const n of notifications) {
      // عد حسب النوع
      byType[n.type] = (byType[n.type] || 0) + 1;

      // عد حسب الحالة
      byStatus[n.status] = (byStatus[n.status] || 0) + 1;

      // عد غير المقروءة
      if (!n.isRead) unread++;
    }

    return {
      total: notifications.length,
      unread,
      byType,
      byStatus,
    };
  }
}
