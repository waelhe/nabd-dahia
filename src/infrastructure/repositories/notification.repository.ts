/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notification Repository Implementation
 * 
 * تنفيذ مستودع الإشعارات باستخدام Prisma
 * 
 * @module infrastructure/repositories/notification.repository
 */

import { db } from '@/lib/db';
import type {
  INotificationRepository,
  NotificationWithRelations,
  CreateNotificationData,
  CreateBulkNotificationData,
  NotificationFilter,
  NotificationStats,
  NotificationTemplate,
  CreateTemplateData,
} from '@/core/interfaces/repositories/notification.repository';
import type { PaginatedResult, PaginationOptions } from '@/core/interfaces/repositories/base.repository';
import type { Result } from '@/core/types/result';
import { ok, err } from '@/core/types/result';
import type { Notification, NotificationTemplate as PrismaNotificationTemplate } from '@prisma/client';

// ==================== Notification Repository ====================

export class NotificationRepository implements INotificationRepository {
  // ==================== Create ====================

  async create(data: CreateNotificationData): Promise<Result<NotificationWithRelations, Error>> {
    try {
      const notification = await db.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data as object,
          sentVia: data.sentVia,
          read: false,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return ok(this.mapToWithRelations(notification));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create notification'));
    }
  }

  async createBulk(data: CreateBulkNotificationData): Promise<Result<NotificationWithRelations[], Error>> {
    try {
      const notifications = await db.$transaction(
        data.userIds.map(userId =>
          db.notification.create({
            data: {
              userId,
              type: data.type,
              title: data.title,
              message: data.message,
              data: data.data as object,
              sentVia: data.sentVia,
              read: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          })
        )
      );

      return ok(notifications.map(n => this.mapToWithRelations(n)));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create bulk notifications'));
    }
  }

  // ==================== Read ====================

  async findById(id: string): Promise<Result<NotificationWithRelations, Error>> {
    try {
      const notification = await db.notification.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!notification) {
        return err(new Error('Notification not found'));
      }

      return ok(this.mapToWithRelations(notification));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to find notification'));
    }
  }

  async findByIdOrNull(id: string): Promise<NotificationWithRelations | null> {
    const notification = await db.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return notification ? this.mapToWithRelations(notification) : null;
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<NotificationWithRelations>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      db.notification.count({ where: { userId } }),
    ]);

    return {
      items: items.map(n => this.mapToWithRelations(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findUnread(userId: string): Promise<NotificationWithRelations[]> {
    const notifications = await db.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return notifications.map(n => this.mapToWithRelations(n));
  }

  async countUnread(userId: string): Promise<number> {
    return db.notification.count({
      where: { userId, read: false },
    });
  }

  async findMany(
    filter: NotificationFilter,
    options?: PaginationOptions
  ): Promise<PaginatedResult<NotificationWithRelations>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = this.buildFilter(filter);

    const [items, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      db.notification.count({ where }),
    ]);

    return {
      items: items.map(n => this.mapToWithRelations(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  // ==================== Update ====================

  async markAsRead(id: string): Promise<Result<void, Error>> {
    try {
      await db.notification.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark as read'));
    }
  }

  async markAllAsRead(userId: string): Promise<Result<number, Error>> {
    try {
      const result = await db.notification.updateMany({
        where: { userId, read: false },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return ok(result.count);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark all as read'));
    }
  }

  async markManyAsRead(ids: string[]): Promise<Result<void, Error>> {
    try {
      await db.notification.updateMany({
        where: { id: { in: ids } },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark many as read'));
    }
  }

  // ==================== Delete ====================

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await db.notification.delete({
        where: { id },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete notification'));
    }
  }

  async deleteByUserId(userId: string): Promise<Result<number, Error>> {
    try {
      const result = await db.notification.deleteMany({
        where: { userId },
      });

      return ok(result.count);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete user notifications'));
    }
  }

  async deleteOlderThan(days: number): Promise<Result<number, Error>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await db.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          read: true,
        },
      });

      return ok(result.count);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete old notifications'));
    }
  }

  // ==================== Stats ====================

  async getStats(userId?: string): Promise<NotificationStats> {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const [total, read, unread, byType, byChannel, recentCount] = await Promise.all([
      db.notification.count({ where }),
      db.notification.count({ where: { ...where, read: true } }),
      db.notification.count({ where: { ...where, read: false } }),
      db.notification.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),
      db.notification.groupBy({
        by: ['sentVia'],
        where,
        _count: { id: true },
      }),
      db.notification.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      read,
      unread,
      byType: Object.fromEntries(byType.map(t => [t.type, t._count.id])),
      byChannel: Object.fromEntries(byChannel.filter(c => c.sentVia).map(c => [c.sentVia, c._count.id])),
      recentCount,
    };
  }

  async count(filter?: NotificationFilter): Promise<number> {
    const where = filter ? this.buildFilter(filter) : {};
    return db.notification.count({ where });
  }

  // ==================== Templates ====================

  async createTemplate(data: CreateTemplateData): Promise<Result<NotificationTemplate, Error>> {
    try {
      const template = await db.notificationTemplate.create({
        data: {
          type: data.type,
          subject: data.subject,
          title: data.title,
          body: data.body,
          variables: data.variables as string[],
          isActive: data.isActive ?? true,
        },
      });

      return ok(this.mapTemplate(template));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create template'));
    }
  }

  async findTemplateByType(type: string): Promise<NotificationTemplate | null> {
    const template = await db.notificationTemplate.findUnique({
      where: { type },
    });

    return template ? this.mapTemplate(template) : null;
  }

  async findAllTemplates(): Promise<NotificationTemplate[]> {
    const templates = await db.notificationTemplate.findMany({
      orderBy: { type: 'asc' },
    });

    return templates.map(t => this.mapTemplate(t));
  }

  async updateTemplate(
    id: string,
    data: Partial<CreateTemplateData>
  ): Promise<Result<NotificationTemplate, Error>> {
    try {
      const template = await db.notificationTemplate.update({
        where: { id },
        data: {
          subject: data.subject,
          title: data.title,
          body: data.body,
          variables: data.variables as string[],
          isActive: data.isActive,
        },
      });

      return ok(this.mapTemplate(template));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update template'));
    }
  }

  async deleteTemplate(id: string): Promise<Result<void, Error>> {
    try {
      await db.notificationTemplate.delete({
        where: { id },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete template'));
    }
  }

  // ==================== Batch Operations ====================

  async findPendingToSend(limit: number = 100): Promise<NotificationWithRelations[]> {
    const notifications = await db.notification.findMany({
      where: {
        sentAt: null,
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return notifications.map(n => this.mapToWithRelations(n));
  }

  async markAsSent(id: string, sentVia: string): Promise<Result<void, Error>> {
    try {
      await db.notification.update({
        where: { id },
        data: {
          sentAt: new Date(),
          sentVia,
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark as sent'));
    }
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter: NotificationFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter.userId) where.userId = filter.userId;
    
    if (filter.type) {
      where.type = Array.isArray(filter.type) 
        ? { in: filter.type } 
        : filter.type;
    }
    
    if (filter.read !== undefined) where.read = filter.read;
    
    if (filter.sentVia) {
      where.sentVia = Array.isArray(filter.sentVia) 
        ? { in: filter.sentVia } 
        : filter.sentVia;
    }

    if (filter.createdAfter || filter.createdBefore) {
      where.createdAt = {
        ...(filter.createdAfter && { gte: filter.createdAfter }),
        ...(filter.createdBefore && { lte: filter.createdBefore }),
      };
    }

    if (filter.sentAfter || filter.sentBefore) {
      where.sentAt = {
        ...(filter.sentAfter && { gte: filter.sentAfter }),
        ...(filter.sentBefore && { lte: filter.sentBefore }),
      };
    }

    return where;
  }

  private mapToWithRelations(notification: Record<string, unknown>): NotificationWithRelations {
    return {
      id: notification.id as string,
      userId: notification.userId as string,
      type: notification.type as string,
      title: notification.title as string,
      message: notification.message as string,
      data: notification.data as Record<string, unknown> | null | undefined,
      readAt: notification.readAt as Date | null | undefined,
      read: notification.read as boolean,
      sentVia: notification.sentVia as string | null | undefined,
      sentAt: notification.sentAt as Date | null | undefined,
      createdAt: notification.createdAt as Date,
      user: notification.user as NotificationWithRelations['user'],
    };
  }

  private mapTemplate(template: PrismaNotificationTemplate): NotificationTemplate {
    return {
      id: template.id,
      type: template.type,
      subject: template.subject,
      title: template.title,
      body: template.body,
      variables: template.variables as string[] | null,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}

// ==================== Singleton Instance ====================

export const notificationRepository = new NotificationRepository();
