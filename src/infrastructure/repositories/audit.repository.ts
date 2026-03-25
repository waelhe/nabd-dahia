/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Audit Repository Implementation
 * 
 * تنفيذ مستودع التدقيق باستخدام Prisma
 * 
 * @module infrastructure/repositories/audit.repository
 */

import { db } from '@/lib/db';
import type {
  IAuditRepository,
  AuditLogEntry,
  CreateAuditLogData,
  AuditLogFilter,
  AuditLogSearchCriteria,
  AuditStats,
  UserActivitySummary,
  SecurityReport,
} from '@/core/interfaces/repositories/audit.repository';
import type { PaginatedResult, PaginationOptions } from '@/core/interfaces/repositories/base.repository';
import type { Result } from '@/core/types/result';
import { ok, err } from '@/core/types/result';
import type { AuditLog } from '@prisma/client';

// ==================== Audit Repository ====================

export class AuditRepository implements IAuditRepository {
  // ==================== Create ====================

  async log(data: CreateAuditLogData): Promise<Result<AuditLogEntry, Error>> {
    try {
      const entry = await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValue: data.oldValue as object,
          newValue: data.newValue as object,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata as object,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return ok(this.mapToEntry(entry));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create audit log'));
    }
  }

  async logMany(data: CreateAuditLogData[]): Promise<Result<AuditLogEntry[], Error>> {
    try {
      const entries = await db.$transaction(
        data.map(item =>
          db.auditLog.create({
            data: {
              userId: item.userId,
              action: item.action,
              entityType: item.entityType,
              entityId: item.entityId,
              oldValue: item.oldValue as object,
              newValue: item.newValue as object,
              ipAddress: item.ipAddress,
              userAgent: item.userAgent,
              metadata: item.metadata as object,
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          })
        )
      );

      return ok(entries.map(e => this.mapToEntry(e)));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create audit logs'));
    }
  }

  // ==================== Read ====================

  async findById(id: string): Promise<Result<AuditLogEntry, Error>> {
    try {
      const entry = await db.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!entry) {
        return err(new Error('Audit log not found'));
      }

      return ok(this.mapToEntry(entry));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to find audit log'));
    }
  }

  async findMany(criteria: AuditLogSearchCriteria): Promise<AuditLogEntry[]> {
    const where = this.buildFilter(criteria.where);

    const entries = await db.auditLog.findMany({
      where,
      orderBy: criteria.orderBy ?? { createdAt: 'desc' },
      skip: criteria.offset,
      take: criteria.limit ?? 100,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return entries.map(e => this.mapToEntry(e));
  }

  async findPaginated(
    options: PaginationOptions,
    criteria?: AuditLogSearchCriteria
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = criteria?.where ? this.buildFilter(criteria.where) : {};

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
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
            },
          },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntry(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { userId };

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
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
            },
          },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntry(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { entityType, entityId };

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
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
            },
          },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntry(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByAction(
    action: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { action };

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
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
            },
          },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntry(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findLastUserActivity(userId: string): Promise<AuditLogEntry | null> {
    const entry = await db.auditLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return entry ? this.mapToEntry(entry) : null;
  }

  async findByDateRange(
    from: Date,
    to: Date,
    options?: PaginationOptions
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = {
      createdAt: {
        gte: from,
        lte: to,
      },
    };

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
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
            },
          },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntry(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  // ==================== History ====================

  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const entries = await db.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return entries.map(e => this.mapToEntry(e));
  }

  async compareVersions(logId1: string, logId2: string): Promise<{
    oldValue: Record<string, unknown>;
    newValue: Record<string, unknown>;
    differences: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }[];
  }> {
    const [log1, log2] = await Promise.all([
      db.auditLog.findUnique({ where: { id: logId1 } }),
      db.auditLog.findUnique({ where: { id: logId2 } }),
    ]);

    const oldValue = (log1?.newValue as Record<string, unknown>) ?? {};
    const newValue = (log2?.newValue as Record<string, unknown>) ?? {};

    const differences: { field: string; oldValue: unknown; newValue: unknown }[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
        differences.push({
          field: key,
          oldValue: oldValue[key],
          newValue: newValue[key],
        });
      }
    }

    return { oldValue, newValue, differences };
  }

  async getVersionAt(
    entityType: string,
    entityId: string,
    at: Date
  ): Promise<Record<string, unknown> | null> {
    const entry = await db.auditLog.findFirst({
      where: {
        entityType,
        entityId,
        createdAt: { lte: at },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (entry?.newValue as Record<string, unknown>) ?? null;
  }

  // ==================== Stats ====================

  async getStats(filter?: { from?: Date; to?: Date }): Promise<AuditStats> {
    const where: Record<string, unknown> = {};
    
    if (filter?.from || filter?.to) {
      where.createdAt = {
        ...(filter.from && { gte: filter.from }),
        ...(filter.to && { lte: filter.to }),
      };
    }

    const [total, byAction, byEntityType, recentCount] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { id: true },
      }),
      db.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: { id: true },
      }),
      db.auditLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get by user (top 10)
    const byUserRaw = await db.auditLog.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get user names
    const userIds = byUserRaw.filter(u => u.userId).map(u => u.userId as string);
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

    const byUser = byUserRaw
      .filter(u => u.userId)
      .map(u => ({
        userId: u.userId as string,
        userName: userMap.get(u.userId as string) ?? 'Unknown',
        count: u._count.id,
      }));

    // Count errors
    const errors = await db.auditLog.count({
      where: {
        ...where,
        action: { contains: 'error' },
      },
    });

    return {
      total,
      byAction: Object.fromEntries(byAction.map(a => [a.action, a._count.id])),
      byEntityType: Object.fromEntries(byEntityType.map(e => [e.entityType, e._count.id])),
      byUser,
      recentActivity: recentCount,
      errors,
    };
  }

  async getUserActivitySummary(userId: string, days: number = 30): Promise<UserActivitySummary> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const where = { userId, createdAt: { gte: from } };

    const [totalActions, byAction, byEntityType, sessions] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { id: true },
      }),
      db.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: { id: true },
      }),
      db.auditLog.findMany({
        where,
        select: { ipAddress: true, userAgent: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group sessions by IP
    const sessionMap = new Map<string, {
      ipAddress: string;
      userAgent?: string;
      actions: number;
      firstActivity: Date;
      lastActivity: Date;
    }>();

    for (const s of sessions) {
      if (!s.ipAddress) continue;
      
      const existing = sessionMap.get(s.ipAddress);
      if (existing) {
        existing.actions++;
        existing.lastActivity = s.createdAt;
      } else {
        sessionMap.set(s.ipAddress, {
          ipAddress: s.ipAddress,
          userAgent: s.userAgent ?? undefined,
          actions: 1,
          firstActivity: s.createdAt,
          lastActivity: s.createdAt,
        });
      }
    }

    // Get last activity
    const lastEntry = await db.auditLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      userId,
      totalActions,
      lastActivity: lastEntry?.createdAt ?? undefined,
      byAction: Object.fromEntries(byAction.map(a => [a.action, a._count.id])),
      byEntityType: Object.fromEntries(byEntityType.map(e => [e.entityType, e._count.id])),
      recentSessions: Array.from(sessionMap.values()),
    };
  }

  async getSecurityReport(filter?: { from?: Date; to?: Date }): Promise<SecurityReport> {
    const where: Record<string, unknown> = {};
    
    if (filter?.from || filter?.to) {
      where.createdAt = {
        ...(filter.from && { gte: filter.from }),
        ...(filter.to && { lte: filter.to }),
      };
    }

    const [failedLogins, suspiciousActivity, uniqueIPs, uniqueUsers, topActions, topIPs] = await Promise.all([
      // Failed logins
      db.auditLog.count({
        where: { ...where, action: 'login_failed' },
      }),
      // Suspicious activity (multiple failed logins, unusual patterns, etc.)
      db.auditLog.count({
        where: {
          ...where,
          OR: [
            { action: 'login_failed' },
            { action: 'suspicious_activity' },
            { action: 'permission_denied' },
          ],
        },
      }),
      // Unique IPs
      db.auditLog.groupBy({
        by: ['ipAddress'],
        where: { ...where, ipAddress: { not: null } },
      }),
      // Unique users
      db.auditLog.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
      }),
      // Top actions
      db.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Top IPs
      db.auditLog.groupBy({
        by: ['ipAddress'],
        where: { ...where, ipAddress: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      failedLogins,
      suspiciousActivity,
      uniqueIpAddresses: uniqueIPs.length,
      uniqueUsers: uniqueUsers.length,
      topActions: topActions.map(a => ({
        action: a.action,
        count: a._count.id,
      })),
      topIpAddresses: topIPs
        .filter(ip => ip.ipAddress)
        .map(ip => ({
          ipAddress: ip.ipAddress as string,
          count: ip._count.id,
        })),
    };
  }

  async count(criteria?: AuditLogSearchCriteria): Promise<number> {
    const where = criteria?.where ? this.buildFilter(criteria.where) : {};
    return db.auditLog.count({ where });
  }

  // ==================== Cleanup ====================

  async deleteOlderThan(days: number): Promise<Result<number, Error>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await db.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      return ok(result.count);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete old logs'));
    }
  }

  async archiveOlderThan(days: number): Promise<Result<{ archived: number; archivedAt: Date }, Error>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // In production, this would move to an archive table
      // For now, we'll just count what would be archived
      const count = await db.auditLog.count({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      // For now, just return the count (actual archiving would require a separate table)
      return ok({
        archived: count,
        archivedAt: new Date(),
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to archive logs'));
    }
  }

  // ==================== Export ====================

  async export(filter: AuditLogFilter, format: 'json' | 'csv'): Promise<Result<Blob, Error>> {
    try {
      const where = this.buildFilter(filter);

      const entries = await db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (format === 'json') {
        const json = JSON.stringify(entries, null, 2);
        return ok(new Blob([json], { type: 'application/json' }));
      } else {
        // CSV format
        const headers = ['id', 'userId', 'action', 'entityType', 'entityId', 'ipAddress', 'createdAt'];
        const rows = entries.map(e =>
          headers.map(h => {
            const value = e[h as keyof typeof e];
            return typeof value === 'string' ? `"${value}"` : String(value ?? '');
          }).join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        return ok(new Blob([csv], { type: 'text/csv' }));
      }
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to export logs'));
    }
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter?: AuditLogFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter?.id) where.id = filter.id;
    
    if (filter?.userId) {
      where.userId = Array.isArray(filter.userId)
        ? { in: filter.userId }
        : filter.userId;
    }
    
    if (filter?.action) {
      where.action = Array.isArray(filter.action)
        ? { in: filter.action }
        : filter.action;
    }
    
    if (filter?.entityType) {
      where.entityType = Array.isArray(filter.entityType)
        ? { in: filter.entityType }
        : filter.entityType;
    }
    
    if (filter?.entityId) where.entityId = filter.entityId;
    
    if (filter?.ipAddress) {
      where.ipAddress = Array.isArray(filter.ipAddress)
        ? { in: filter.ipAddress }
        : filter.ipAddress;
    }

    if (filter?.createdAfter || filter?.createdBefore) {
      where.createdAt = {
        ...(filter.createdAfter && { gte: filter.createdAfter }),
        ...(filter.createdBefore && { lte: filter.createdBefore }),
      };
    }

    return where;
  }

  private mapToEntry(entry: AuditLog & { user?: { id: string; firstName: string; lastName: string; email: string | null } | null }): AuditLogEntry {
    return {
      id: entry.id,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValue: entry.oldValue as Record<string, unknown> | null,
      newValue: entry.newValue as Record<string, unknown> | null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata as Record<string, unknown> | null,
      createdAt: entry.createdAt,
      user: entry.user,
    };
  }
}

// ==================== Singleton Instance ====================

export const auditRepository = new AuditRepository();
