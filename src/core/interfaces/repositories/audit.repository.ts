/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Audit Repository Interface - واجهة مستودع التدقيق
 * 
 * @module core/interfaces/repositories/audit.repository
 */

import type { Result } from '../../types/result';
import type { PaginatedResult, PaginationOptions } from './base.repository';

// ==================== Types ====================

/**
 * سجل التدقيق
 */
export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
  } | null;
}

/**
 * بيانات إنشاء سجل التدقيق
 */
export interface CreateAuditLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * فلاتر سجل التدقيق
 */
export interface AuditLogFilter {
  id?: string;
  userId?: string | string[];
  action?: string | string[];
  entityType?: string | string[];
  entityId?: string;
  ipAddress?: string | string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * معايير البحث
 */
export interface AuditLogSearchCriteria {
  where?: AuditLogFilter;
  orderBy?: {
    field: keyof AuditLogEntry;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
}

/**
 * إحصائيات التدقيق
 */
export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  recentActivity: number; // آخر 24 ساعة
  errors: number;
}

/**
 * ملخص نشاط المستخدم
 */
export interface UserActivitySummary {
  userId: string;
  totalActions: number;
  lastActivity?: Date;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  recentSessions: Array<{
    ipAddress: string;
    userAgent?: string;
    actions: number;
    firstActivity: Date;
    lastActivity: Date;
  }>;
}

/**
 * تقرير الأمان
 */
export interface SecurityReport {
  failedLogins: number;
  suspiciousActivity: number;
  uniqueIpAddresses: number;
  uniqueUsers: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topIpAddresses: Array<{
    ipAddress: string;
    count: number;
  }>;
}

// ==================== Repository Interface ====================

/**
 * واجهة مستودع التدقيق
 */
export interface IAuditRepository {
  // ==================== Create ====================

  /**
   * إنشاء سجل تدقيق
   */
  log(data: CreateAuditLogData): Promise<Result<AuditLogEntry, Error>>;

  /**
   * إنشاء سجلات متعددة
   */
  logMany(data: CreateAuditLogData[]): Promise<Result<AuditLogEntry[], Error>>;

  // ==================== Read ====================

  /**
   * البحث بالمعرف
   */
  findById(id: string): Promise<Result<AuditLogEntry, Error>>;

  /**
   * البحث بمعايير
   */
  findMany(criteria: AuditLogSearchCriteria): Promise<AuditLogEntry[]>;

  /**
   * البحث مع التصفح
   */
  findPaginated(options: PaginationOptions, criteria?: AuditLogSearchCriteria): Promise<PaginatedResult<AuditLogEntry>>;

  /**
   * سجلات المستخدم
   */
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResult<AuditLogEntry>>;

  /**
   * سجلات الكيان
   */
  findByEntity(entityType: string, entityId: string, options?: PaginationOptions): Promise<PaginatedResult<AuditLogEntry>>;

  /**
   * سجلات الإجراء
   */
  findByAction(action: string, options?: PaginationOptions): Promise<PaginatedResult<AuditLogEntry>>;

  /**
   * آخر نشاط للمستخدم
   */
  findLastUserActivity(userId: string): Promise<AuditLogEntry | null>;

  /**
   * سجلات الفترة
   */
  findByDateRange(from: Date, to: Date, options?: PaginationOptions): Promise<PaginatedResult<AuditLogEntry>>;

  // ==================== History ====================

  /**
   * تاريخ التغييرات لكيان
   */
  getEntityHistory(entityType: string, entityId: string): Promise<AuditLogEntry[]>;

  /**
   * مقارنة بين نسختين
   */
  compareVersions(logId1: string, logId2: string): Promise<{
    oldValue: Record<string, unknown>;
    newValue: Record<string, unknown>;
    differences: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }[];
  }>;

  /**
   * استرجاع نسخة سابقة
   */
  getVersionAt(entityType: string, entityId: string, at: Date): Promise<Record<string, unknown> | null>;

  // ==================== Stats ====================

  /**
   * إحصائيات التدقيق
   */
  getStats(filter?: { from?: Date; to?: Date }): Promise<AuditStats>;

  /**
   * ملخص نشاط المستخدم
   */
  getUserActivitySummary(userId: string, days?: number): Promise<UserActivitySummary>;

  /**
   * تقرير الأمان
   */
  getSecurityReport(filter?: { from?: Date; to?: Date }): Promise<SecurityReport>;

  /**
   * عدد السجلات
   */
  count(criteria?: AuditLogSearchCriteria): Promise<number>;

  // ==================== Cleanup ====================

  /**
   * حذف السجلات القديمة
   */
  deleteOlderThan(days: number): Promise<Result<number, Error>>;

  /**
   * أرشفة السجلات القديمة
   */
  archiveOlderThan(days: number): Promise<Result<{ archived: number; archivedAt: Date }, Error>>;

  // ==================== Export ====================

  /**
   * تصدير السجلات
   */
  export(filter: AuditLogFilter, format: 'json' | 'csv'): Promise<Result<Blob, Error>>;
}
