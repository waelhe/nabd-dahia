/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Audit Service Interface - واجهة خدمة التدقيق
 * 
 * @module core/interfaces/services/audit.service
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * نوع الإجراء
 */
export type AuditActionType = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'login' | 'logout' | 'login_failed'
  | 'password_change' | 'password_reset'
  | 'role_change' | 'permission_change'
  | 'export' | 'import'
  | 'approve' | 'reject' | 'submit'
  | 'send' | 'receive'
  | 'activate' | 'deactivate' | 'suspend'
  | 'custom' | string;

/**
 * خطورة الإجراء
 */
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * نتيجة الإجراء
 */
export type AuditOutcome = 'success' | 'failure' | 'partial';

/**
 * إدخال سجل التدقيق
 */
export interface AuditEntry {
  id: string;
  timestamp: Date;
  
  // Who
  userId?: string;
  userType?: string;
  userName?: string;
  impersonatedBy?: string;
  
  // What
  action: AuditActionType;
  actionCategory: string;
  outcome: AuditOutcome;
  severity: AuditSeverity;
  
  // Where
  entityType: string;
  entityId: string;
  entityName?: string;
  
  // Details
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changes?: AuditChange[];
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Additional
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
  tags?: string[];
  
  // Duration
  duration?: number; // milliseconds
  
  // Error
  errorMessage?: string;
  errorCode?: string;
  errorStack?: string;
}

/**
 * تغيير
 */
export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'modified';
}

/**
 * خيارات السجل
 */
export interface LogOptions {
  severity?: AuditSeverity;
  tags?: string[];
  metadata?: Record<string, unknown>;
  skipIfSame?: boolean;
}

/**
 * خيارات البحث
 */
export interface AuditSearchOptions {
  userId?: string | string[];
  action?: AuditActionType | AuditActionType[];
  entityType?: string | string[];
  entityId?: string;
  outcome?: AuditOutcome | AuditOutcome[];
  severity?: AuditSeverity | AuditSeverity[];
  from?: Date;
  to?: Date;
  ipAddress?: string | string[];
  search?: string;
  tags?: string | string[];
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'severity' | 'action';
  orderDirection?: 'asc' | 'desc';
}

/**
 * إحصائيات التدقيق
 */
export interface AuditStats {
  total: number;
  byAction: Record<AuditActionType, number>;
  byEntityType: Record<string, number>;
  bySeverity: Record<AuditSeverity, number>;
  byOutcome: Record<AuditOutcome, number>;
  byUser: Array<{ userId: string; userName: string; count: number }>;
  recentActivity: number; // آخر ساعة
  failedActions: number;
  criticalActions: number;
}

/**
 * تقرير التدقيق
 */
export interface AuditReport {
  period: { from: Date; to: Date };
  stats: AuditStats;
  topActions: Array<{ action: AuditActionType; count: number }>;
  topUsers: Array<{ userId: string; userName: string; actions: number }>;
  topEntities: Array<{ entityType: string; entityId: string; name?: string; actions: number }>;
  suspiciousActivity: Array<AuditEntry>;
  errors: Array<AuditEntry>;
  recommendations?: string[];
}

/**
 * تقرير المستخدم
 */
export interface UserAuditReport {
  userId: string;
  userName: string;
  totalActions: number;
  byAction: Record<AuditActionType, number>;
  byEntityType: Record<string, number>;
  failedActions: number;
  suspiciousActivity: number;
  firstActivity: Date;
  lastActivity: Date;
  devices: Array<{
    deviceId?: string;
    userAgent: string;
    ipAddress: string;
    location?: string;
    lastUsed: Date;
    actions: number;
  }>;
  locations: Array<{
    country?: string;
    city?: string;
    actions: number;
    firstSeen: Date;
    lastSeen: Date;
  }>;
}

/**
 * قاعدة التنبيه
 */
export interface AuditAlertRule {
  id: string;
  name: string;
  description?: string;
  conditions: {
    action?: AuditActionType | AuditActionType[];
    entityType?: string;
    severity?: AuditSeverity | AuditSeverity[];
    outcome?: AuditOutcome;
    threshold?: number;
    timeWindow?: number; // milliseconds
  };
  notification: {
    type: 'email' | 'webhook' | 'slack';
    recipients?: string[];
    url?: string;
    template?: string;
  };
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

// ==================== Service Interface ====================

/**
 * واجهة خدمة التدقيق
 */
export interface IAuditService {
  // ==================== Logging ====================

  /**
   * تسجيل إجراء
   */
  log(
    action: AuditActionType,
    entityType: string,
    entityId: string,
    options?: {
      oldValue?: Record<string, unknown>;
      newValue?: Record<string, unknown>;
      outcome?: AuditOutcome;
      severity?: AuditSeverity;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Result<AuditEntry, Error>>;

  /**
   * تسجيل إنشاء
   */
  logCreate(entityType: string, entityId: string, newValue: Record<string, unknown>, options?: LogOptions): Promise<void>;

  /**
   * تسجيل تحديث
   */
  logUpdate(entityType: string, entityId: string, oldValue: Record<string, unknown>, newValue: Record<string, unknown>, options?: LogOptions): Promise<void>;

  /**
   * تسجيل حذف
   */
  logDelete(entityType: string, entityId: string, oldValue: Record<string, unknown>, options?: LogOptions): Promise<void>;

  /**
   * تسجيل قراءة (للبيانات الحساسة)
   */
  logRead(entityType: string, entityId: string, options?: LogOptions): Promise<void>;

  /**
   * تسجيل تسجيل دخول
   */
  logLogin(userId: string, success: boolean, options?: { ipAddress?: string; userAgent?: string; failureReason?: string }): Promise<void>;

  /**
   * تسجيل تسجيل خروج
   */
  logLogout(userId: string): Promise<void>;

  /**
   * تسجيل مخصص
   */
  logCustom(action: string, data: Record<string, unknown>, options?: LogOptions): Promise<void>;

  // ==================== Querying ====================

  /**
   * البحث
   */
  search(options: AuditSearchOptions): Promise<AuditEntry[]>;

  /**
   * البحث بمعرف
   */
  findById(id: string): Promise<AuditEntry | null>;

  /**
   * سجلات المستخدم
   */
  getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<AuditEntry[]>;

  /**
   * سجلات الكيان
   */
  getByEntity(entityType: string, entityId: string): Promise<AuditEntry[]>;

  /**
   * تاريخ الكيان
   */
  getEntityHistory(entityType: string, entityId: string): Promise<Array<{
    timestamp: Date;
    action: AuditActionType;
    userId?: string;
    userName?: string;
    changes?: AuditChange[];
  }>>;

  /**
   * مقارنة نسختين
   */
  compareVersions(entryId1: string, entryId2: string): Promise<{
    entry1: AuditEntry;
    entry2: AuditEntry;
    differences: AuditChange[];
  }>;

  // ==================== Stats & Reports ====================

  /**
   * إحصائيات
   */
  getStats(from?: Date, to?: Date): Promise<AuditStats>;

  /**
   * تقرير
   */
  getReport(from: Date, to: Date): Promise<AuditReport>;

  /**
   * تقرير المستخدم
   */
  getUserReport(userId: string, from?: Date, to?: Date): Promise<UserAuditReport>;

  /**
   * النشاط الأخير
   */
  getRecentActivity(minutes?: number): Promise<AuditEntry[]>;

  /**
   * النشاط المشبوه
   */
  getSuspiciousActivity(from?: Date, to?: Date): Promise<AuditEntry[]>;

  // ==================== Alerts ====================

  /**
   * إنشاء قاعدة تنبيه
   */
  createAlertRule(rule: Omit<AuditAlertRule, 'id' | 'triggerCount'>): Promise<Result<AuditAlertRule, Error>>;

  /**
   * تحديث قاعدة تنبيه
   */
  updateAlertRule(id: string, rule: Partial<AuditAlertRule>): Promise<Result<AuditAlertRule, Error>>;

  /**
   * حذف قاعدة تنبيه
   */
  deleteAlertRule(id: string): Promise<void>;

  /**
   * قواعد التنبيه
   */
  getAlertRules(): Promise<AuditAlertRule[]>;

  /**
   * تفعيل/تعطيل قاعدة
   */
  toggleAlertRule(id: string, isActive: boolean): Promise<void>;

  // ==================== Cleanup ====================

  /**
   * حذف السجلات القديمة
   */
  purgeOlderThan(days: number): Promise<number>;

  /**
   * أرشفة السجلات القديمة
   */
  archiveOlderThan(days: number): Promise<{ archived: number; archivedAt: Date }>;

  /**
   * تصدير السجلات
   */
  export(options: AuditSearchOptions, format: 'json' | 'csv'): Promise<Blob>;

  // ==================== Context ====================

  /**
   * تعيين سياق المستخدم الحالي
   */
  setCurrentUser(userId: string, userName?: string, impersonatedBy?: string): void;

  /**
   * تعيين سياق الطلب
   */
  setRequestContext(requestId: string, correlationId?: string): void;

  /**
   * الحصول على السياق الحالي
   */
  getCurrentContext(): {
    userId?: string;
    userName?: string;
    impersonatedBy?: string;
    requestId?: string;
    correlationId?: string;
  };

  /**
   * مسح السياق
   */
  clearContext(): void;
}
