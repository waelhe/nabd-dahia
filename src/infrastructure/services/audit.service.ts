/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Audit Service Implementation
 * 
 * تنفيذ خدمة التدقيق
 * 
 * @module infrastructure/services/audit.service
 */

import { db } from '@/lib/db';
import {
  IAuditService,
  AuditEntry,
  AuditActionType,
  AuditSeverity,
  AuditOutcome,
  AuditChange,
  LogOptions,
  AuditSearchOptions,
  AuditStats,
  AuditReport,
  UserAuditReport,
  AuditAlertRule,
} from '@/core/interfaces/services/audit.service';
import { Result, ok, err } from '@/core/types/result';

// ==================== Audit Service ====================

/**
 * تنفيذ خدمة التدقيق
 */
export class AuditService implements IAuditService {
  private currentUser: {
    userId?: string;
    userName?: string;
    impersonatedBy?: string;
  } = {};

  private requestContext: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    sessionId?: string;
  } = {};

  private alertRules: Map<string, AuditAlertRule> = new Map();

  // ==================== Logging ====================

  async log(
    action: AuditActionType,
    entityType: string,
    entityId: string,
    options?: {
      oldValue?: Record<string, unknown>;
      newValue?: Record<string, unknown>;
      outcome?: AuditOutcome;
      severity?: AuditSeverity;
      metadata?: Record<string, unknown>;
    },
  ): Promise<Result<AuditEntry, Error>> {
    try {
      const entry: AuditEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        userId: this.currentUser.userId,
        userType: undefined,
        userName: this.currentUser.userName,
        impersonatedBy: this.currentUser.impersonatedBy,
        action,
        actionCategory: this.getActionCategory(action),
        outcome: options?.outcome ?? 'success',
        severity: options?.severity ?? this.getDefaultSeverity(action),
        entityType,
        entityId,
        oldValue: options?.oldValue,
        newValue: options?.newValue,
        changes: options?.oldValue && options?.newValue
          ? this.computeChanges(options.oldValue, options.newValue)
          : undefined,
        ipAddress: this.requestContext.ipAddress,
        userAgent: this.requestContext.userAgent,
        deviceId: this.requestContext.deviceId,
        sessionId: this.requestContext.sessionId,
        requestId: this.requestContext.requestId,
        correlationId: this.requestContext.correlationId,
        metadata: options?.metadata,
      };

      // Store in database
      await db.auditLog.create({
        data: {
          id: entry.id,
          userId: entry.userId,
          action: entry.action,
          actionCategory: entry.actionCategory,
          entityType: entry.entityType,
          entityId: entry.entityId,
          outcome: entry.outcome,
          severity: entry.severity,
          oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
          newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
          createdAt: entry.timestamp,
        },
      });

      // Check alert rules
      await this.checkAlertRules(entry);

      return ok(entry);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to log audit entry'));
    }
  }

  async logCreate(
    entityType: string,
    entityId: string,
    newValue: Record<string, unknown>,
    options?: LogOptions,
  ): Promise<void> {
    await this.log('create', entityType, entityId, {
      newValue,
      outcome: 'success',
      severity: options?.severity ?? 'low',
      metadata: options?.metadata,
    });
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    oldValue: Record<string, unknown>,
    newValue: Record<string, unknown>,
    options?: LogOptions,
  ): Promise<void> {
    if (options?.skipIfSame && JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return;
    }

    await this.log('update', entityType, entityId, {
      oldValue,
      newValue,
      outcome: 'success',
      severity: options?.severity ?? 'medium',
      metadata: options?.metadata,
    });
  }

  async logDelete(
    entityType: string,
    entityId: string,
    oldValue: Record<string, unknown>,
    options?: LogOptions,
  ): Promise<void> {
    await this.log('delete', entityType, entityId, {
      oldValue,
      outcome: 'success',
      severity: options?.severity ?? 'high',
      metadata: options?.metadata,
    });
  }

  async logRead(entityType: string, entityId: string, options?: LogOptions): Promise<void> {
    await this.log('read', entityType, entityId, {
      outcome: 'success',
      severity: options?.severity ?? 'low',
      metadata: options?.metadata,
    });
  }

  async logLogin(
    userId: string,
    success: boolean,
    options?: { ipAddress?: string; userAgent?: string; failureReason?: string },
  ): Promise<void> {
    await this.log(success ? 'login' : 'login_failed', 'user', userId, {
      outcome: success ? 'success' : 'failure',
      severity: success ? 'low' : 'medium',
      metadata: {
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        failureReason: options?.failureReason,
      },
    });
  }

  async logLogout(userId: string): Promise<void> {
    await this.log('logout', 'user', userId, {
      outcome: 'success',
      severity: 'low',
    });
  }

  async logCustom(
    action: string,
    data: Record<string, unknown>,
    options?: LogOptions,
  ): Promise<void> {
    await this.log(action as AuditActionType, data.entityType as string ?? 'custom', data.entityId as string ?? 'n/a', {
      outcome: 'success',
      severity: options?.severity ?? 'medium',
      metadata: { ...data, ...options?.metadata },
    });
  }

  // ==================== Querying ====================

  async search(options: AuditSearchOptions): Promise<AuditEntry[]> {
    try {
      const where: Record<string, unknown> = {};

      if (options.userId) {
        where.userId = Array.isArray(options.userId)
          ? { in: options.userId }
          : options.userId;
      }

      if (options.action) {
        where.action = Array.isArray(options.action)
          ? { in: options.action }
          : options.action;
      }

      if (options.entityType) {
        where.entityType = Array.isArray(options.entityType)
          ? { in: options.entityType }
          : options.entityType;
      }

      if (options.entityId) {
        where.entityId = options.entityId;
      }

      if (options.outcome) {
        where.outcome = Array.isArray(options.outcome)
          ? { in: options.outcome }
          : options.outcome;
      }

      if (options.severity) {
        where.severity = Array.isArray(options.severity)
          ? { in: options.severity }
          : options.severity;
      }

      if (options.from || options.to) {
        where.createdAt = {
          ...(options.from && { gte: options.from }),
          ...(options.to && { lte: options.to }),
        };
      }

      if (options.ipAddress) {
        where.ipAddress = Array.isArray(options.ipAddress)
          ? { in: options.ipAddress }
          : options.ipAddress;
      }

      const logs = await db.auditLog.findMany({
        where,
        orderBy: { [options.orderBy ?? 'createdAt']: options.orderDirection ?? 'desc' },
        skip: options.offset,
        take: options.limit ?? 20,
      });

      return logs.map(this.mapToEntry);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<AuditEntry | null> {
    try {
      const log = await db.auditLog.findUnique({ where: { id } });
      return log ? this.mapToEntry(log) : null;
    } catch {
      return null;
    }
  }

  async getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<AuditEntry[]> {
    return this.search({
      userId,
      limit: options?.limit ?? 50,
      offset: options?.offset,
    });
  }

  async getByEntity(entityType: string, entityId: string): Promise<AuditEntry[]> {
    return this.search({ entityType, entityId, limit: 100 });
  }

  async getEntityHistory(
    entityType: string,
    entityId: string,
  ): Promise<Array<{
    timestamp: Date;
    action: AuditActionType;
    userId?: string;
    userName?: string;
    changes?: AuditChange[];
  }>> {
    const entries = await this.getByEntity(entityType, entityId);

    return entries.map((e) => ({
      timestamp: e.timestamp,
      action: e.action,
      userId: e.userId,
      userName: e.userName,
      changes: e.changes,
    }));
  }

  async compareVersions(entryId1: string, entryId2: string): Promise<{
    entry1: AuditEntry;
    entry2: AuditEntry;
    differences: AuditChange[];
  }> {
    const entry1 = await this.findById(entryId1);
    const entry2 = await this.findById(entryId2);

    if (!entry1 || !entry2) {
      throw new Error('One or both entries not found');
    }

    const differences = this.computeChanges(
      entry1.newValue ?? {},
      entry2.newValue ?? {},
    );

    return { entry1, entry2, differences };
  }

  // ==================== Stats & Reports ====================

  async getStats(from?: Date, to?: Date): Promise<AuditStats> {
    try {
      const where = {
        createdAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      };

      const logs = await db.auditLog.findMany({ where });

      const byAction: Record<string, number> = {};
      const byEntityType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};
      const byOutcome: Record<string, number> = {};
      const userCounts: Record<string, { userName: string; count: number }> = {};

      for (const log of logs) {
        byAction[log.action] = (byAction[log.action] ?? 0) + 1;
        byEntityType[log.entityType] = (byEntityType[log.entityType] ?? 0) + 1;
        bySeverity[log.severity] = (bySeverity[log.severity] ?? 0) + 1;
        byOutcome[log.outcome] = (byOutcome[log.outcome] ?? 0) + 1;

        if (log.userId) {
          if (!userCounts[log.userId]) {
            userCounts[log.userId] = { userName: 'Unknown', count: 0 };
          }
          userCounts[log.userId].count++;
        }
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentActivity = logs.filter((l) => l.createdAt >= oneHourAgo).length;

      return {
        total: logs.length,
        byAction: byAction as Record<AuditActionType, number>,
        byEntityType,
        bySeverity: bySeverity as Record<AuditSeverity, number>,
        byOutcome: byOutcome as Record<AuditOutcome, number>,
        byUser: Object.entries(userCounts).map(([userId, data]) => ({
          userId,
          userName: data.userName,
          count: data.count,
        })),
        recentActivity,
        failedActions: byOutcome.failure ?? 0,
        criticalActions: bySeverity.critical ?? 0,
      };
    } catch {
      return {
        total: 0,
        byAction: {} as Record<AuditActionType, number>,
        byEntityType: {},
        bySeverity: {} as Record<AuditSeverity, number>,
        byOutcome: {} as Record<AuditOutcome, number>,
        byUser: [],
        recentActivity: 0,
        failedActions: 0,
        criticalActions: 0,
      };
    }
  }

  async getReport(from: Date, to: Date): Promise<AuditReport> {
    const stats = await this.getStats(from, to);
    const entries = await this.search({ from, to, limit: 1000 });

    const topActions = Object.entries(stats.byAction)
      .map(([action, count]) => ({ action: action as AuditActionType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topUsers = stats.byUser.slice(0, 10);

    const entityCounts: Record<string, Record<string, number>> = {};
    for (const entry of entries) {
      const key = `${entry.entityType}:${entry.entityId}`;
      if (!entityCounts[key]) {
        entityCounts[key] = { count: 0, name: entry.entityName ?? '' };
      }
      entityCounts[key].count++;
    }

    const topEntities = Object.entries(entityCounts)
      .map(([key, data]) => {
        const [entityType, entityId] = key.split(':');
        return { entityType, entityId, name: data.name, actions: data.count };
      })
      .sort((a, b) => b.actions - a.actions)
      .slice(0, 10);

    const suspiciousActivity = entries.filter(
      (e) => e.severity === 'critical' || (e.outcome === 'failure' && e.action.includes('login')),
    );

    const errors = entries.filter((e) => e.outcome === 'failure');

    return {
      period: { from, to },
      stats,
      topActions,
      topUsers,
      topEntities,
      suspiciousActivity,
      errors,
    };
  }

  async getUserReport(userId: string, from?: Date, to?: Date): Promise<UserAuditReport> {
    const entries = await this.search({ userId, from, to, limit: 1000 });

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const devices: Record<string, { info: string; ip: string; lastUsed: Date; count: number }> = {};
    const locations: Record<string, { location: string; count: number; firstSeen: Date; lastSeen: Date }> = {};

    let failedActions = 0;
    let suspiciousActivity = 0;
    let firstActivity: Date | undefined;
    let lastActivity: Date | undefined;

    for (const entry of entries) {
      byAction[entry.action] = (byAction[entry.action] ?? 0) + 1;
      byEntityType[entry.entityType] = (byEntityType[entry.entityType] ?? 0) + 1;

      if (entry.outcome === 'failure') failedActions++;
      if (entry.severity === 'critical') suspiciousActivity++;

      if (!firstActivity || entry.timestamp < firstActivity) firstActivity = entry.timestamp;
      if (!lastActivity || entry.timestamp > lastActivity) lastActivity = entry.timestamp;

      // Device tracking
      if (entry.userAgent) {
        const key = `${entry.userAgent}:${entry.ipAddress}`;
        if (!devices[key]) {
          devices[key] = {
            info: entry.userAgent,
            ip: entry.ipAddress ?? 'unknown',
            lastUsed: entry.timestamp,
            count: 0,
          };
        }
        devices[key].count++;
        devices[key].lastUsed = entry.timestamp;
      }

      // Location tracking
      if (entry.location) {
        const loc = `${entry.location.country}-${entry.location.city}`;
        if (!locations[loc]) {
          locations[loc] = {
            location: loc,
            count: 0,
            firstSeen: entry.timestamp,
            lastSeen: entry.timestamp,
          };
        }
        locations[loc].count++;
        locations[loc].lastSeen = entry.timestamp;
      }
    }

    return {
      userId,
      userName: entries[0]?.userName ?? 'Unknown',
      totalActions: entries.length,
      byAction: byAction as Record<AuditActionType, number>,
      byEntityType,
      failedActions,
      suspiciousActivity,
      firstActivity: firstActivity ?? new Date(),
      lastActivity: lastActivity ?? new Date(),
      devices: Object.values(devices).map((d) => ({
        userAgent: d.info,
        ipAddress: d.ip,
        lastUsed: d.lastUsed,
        actions: d.count,
      })),
      locations: Object.values(locations).map((l) => ({
        location: l.location,
        actions: l.count,
        firstSeen: l.firstSeen,
        lastSeen: l.lastSeen,
      })),
    };
  }

  async getRecentActivity(minutes: number = 30): Promise<AuditEntry[]> {
    const from = new Date(Date.now() - minutes * 60 * 1000);
    return this.search({ from, limit: 100 });
  }

  async getSuspiciousActivity(from?: Date, to?: Date): Promise<AuditEntry[]> {
    const entries = await this.search({ from, to, limit: 500 });
    return entries.filter(
      (e) =>
        e.severity === 'critical' ||
        e.outcome === 'failure' ||
        e.action === 'login_failed',
    );
  }

  // ==================== Alerts ====================

  async createAlertRule(
    rule: Omit<AuditAlertRule, 'id' | 'triggerCount'>,
  ): Promise<Result<AuditAlertRule, Error>> {
    const newRule: AuditAlertRule = {
      ...rule,
      id: this.generateId(),
      triggerCount: 0,
    };

    this.alertRules.set(newRule.id, newRule);
    return ok(newRule);
  }

  async updateAlertRule(
    id: string,
    rule: Partial<AuditAlertRule>,
  ): Promise<Result<AuditAlertRule, Error>> {
    const existing = this.alertRules.get(id);
    if (!existing) {
      return err(new Error('Alert rule not found'));
    }

    const updated = { ...existing, ...rule };
    this.alertRules.set(id, updated);
    return ok(updated);
  }

  async deleteAlertRule(id: string): Promise<void> {
    this.alertRules.delete(id);
  }

  async getAlertRules(): Promise<AuditAlertRule[]> {
    return Array.from(this.alertRules.values());
  }

  async toggleAlertRule(id: string, isActive: boolean): Promise<void> {
    const rule = this.alertRules.get(id);
    if (rule) {
      rule.isActive = isActive;
      this.alertRules.set(id, rule);
    }
  }

  private async checkAlertRules(entry: AuditEntry): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.isActive) continue;

      const { conditions } = rule;

      // Check if entry matches conditions
      let matches = true;

      if (conditions.action) {
        const actions = Array.isArray(conditions.action) ? conditions.action : [conditions.action];
        if (!actions.includes(entry.action)) matches = false;
      }

      if (conditions.entityType && conditions.entityType !== entry.entityType) {
        matches = false;
      }

      if (conditions.severity) {
        const severities = Array.isArray(conditions.severity) ? conditions.severity : [conditions.severity];
        if (!severities.includes(entry.severity)) matches = false;
      }

      if (conditions.outcome && conditions.outcome !== entry.outcome) {
        matches = false;
      }

      if (matches) {
        // Trigger alert (simplified - in production, send notification)
        console.log(`[ALERT] Rule "${rule.name}" triggered by action: ${entry.action}`);
        rule.lastTriggered = new Date();
        rule.triggerCount++;
      }
    }
  }

  // ==================== Cleanup ====================

  async purgeOlderThan(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
      const result = await db.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      return result.count;
    } catch {
      return 0;
    }
  }

  async archiveOlderThan(days: number): Promise<{ archived: number; archivedAt: Date }> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
      const logs = await db.auditLog.findMany({
        where: { createdAt: { lt: cutoff } },
      });

      // In production, write to archive storage (S3, etc.)
      console.log(`[ARCHIVE] Archiving ${logs.length} audit logs older than ${days} days`);

      await db.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      return { archived: logs.length, archivedAt: new Date() };
    } catch {
      return { archived: 0, archivedAt: new Date() };
    }
  }

  async export(options: AuditSearchOptions, format: 'json' | 'csv'): Promise<Blob> {
    const entries = await this.search({ ...options, limit: 10000 });

    if (format === 'json') {
      return new Blob([JSON.stringify(entries, null, 2)], {
        type: 'application/json',
      });
    }

    // CSV format
    const headers = [
      'id', 'timestamp', 'userId', 'action', 'entityType', 'entityId',
      'outcome', 'severity', 'ipAddress', 'userAgent',
    ];

    const rows = entries.map((e) =>
      headers.map((h) => String((e as Record<string, unknown>)[h] ?? '')).join(','),
    );

    const csv = [headers.join(','), ...rows].join('\n');

    return new Blob([csv], { type: 'text/csv' });
  }

  // ==================== Context ====================

  setCurrentUser(userId: string, userName?: string, impersonatedBy?: string): void {
    this.currentUser = { userId, userName, impersonatedBy };
  }

  setRequestContext(requestId: string, correlationId?: string): void {
    this.requestContext.requestId = requestId;
    this.requestContext.correlationId = correlationId;
  }

  setIpAddress(ip: string): void {
    this.requestContext.ipAddress = ip;
  }

  setUserAgent(userAgent: string): void {
    this.requestContext.userAgent = userAgent;
  }

  setDeviceId(deviceId: string): void {
    this.requestContext.deviceId = deviceId;
  }

  setSessionId(sessionId: string): void {
    this.requestContext.sessionId = sessionId;
  }

  getCurrentContext(): {
    userId?: string;
    userName?: string;
    impersonatedBy?: string;
    requestId?: string;
    correlationId?: string;
  } {
    return {
      ...this.currentUser,
      requestId: this.requestContext.requestId,
      correlationId: this.requestContext.correlationId,
    };
  }

  clearContext(): void {
    this.currentUser = {};
    this.requestContext = {};
  }

  // ==================== Private Methods ====================

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getActionCategory(action: AuditActionType): string {
    if (['create', 'read', 'update', 'delete'].includes(action)) return 'crud';
    if (['login', 'logout', 'login_failed'].includes(action)) return 'auth';
    if (['password_change', 'password_reset'].includes(action)) return 'security';
    if (['role_change', 'permission_change'].includes(action)) return 'admin';
    return 'other';
  }

  private getDefaultSeverity(action: AuditActionType): AuditSeverity {
    if (['delete', 'role_change', 'permission_change'].includes(action)) return 'high';
    if (['create', 'update', 'password_change'].includes(action)) return 'medium';
    if (['login_failed'].includes(action)) return 'medium';
    return 'low';
  }

  private computeChanges(oldValue: Record<string, unknown>, newValue: Record<string, unknown>): AuditChange[] {
    const changes: AuditChange[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    for (const key of allKeys) {
      const oldVal = oldValue[key];
      const newVal = newValue[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        let type: 'added' | 'removed' | 'modified' = 'modified';
        if (oldVal === undefined) type = 'added';
        else if (newVal === undefined) type = 'removed';

        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal,
          type,
        });
      }
    }

    return changes;
  }

  private mapToEntry(log: { id: string; userId: string | null; action: string; actionCategory: string; entityType: string; entityId: string; outcome: string; severity: string; oldValue: string | null; newValue: string | null; ipAddress: string | null; userAgent: string | null; metadata: string | null; createdAt: Date }): AuditEntry {
    return {
      id: log.id,
      timestamp: log.createdAt,
      userId: log.userId ?? undefined,
      action: log.action as AuditActionType,
      actionCategory: log.actionCategory,
      entityType: log.entityType,
      entityId: log.entityId,
      outcome: log.outcome as AuditOutcome,
      severity: log.severity as AuditSeverity,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : undefined,
      newValue: log.newValue ? JSON.parse(log.newValue) : undefined,
      ipAddress: log.ipAddress ?? undefined,
      userAgent: log.userAgent ?? undefined,
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
    };
  }
}

// ==================== Singleton ====================

export const auditService = new AuditService();
