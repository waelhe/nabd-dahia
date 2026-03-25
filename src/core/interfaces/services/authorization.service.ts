/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Authorization Service Interface - واجهة خدمة التفويض
 * 
 * @module core/interfaces/services/authorization.service
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * مورد النظام
 */
export type Resource = 
  | 'user' | 'company' | 'listing' | 'booking' | 'payment' 
  | 'review' | 'notification' | 'report' | 'setting' | 'file'
  | 'medical_center' | 'doctor' | 'medical_booking'
  | 'institution' | 'program' | 'course' | 'student_application'
  | 'opportunity' | 'conference' | 'business_application'
  | 'post' | 'comment' | 'marketplace_item' | 'translation' | string;

/**
 * إجراء
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export' | 'import' | 'approve' | 'reject' | 'moderate';

/**
 * سياق التفويض
 */
export interface AuthorizationContext {
  userId: string;
  role: string;
  companyId?: string;
  permissions?: string[];
  ip?: string;
  userAgent?: string;
}

/**
 * فحص الصلاحية
 */
export interface PermissionCheck {
  resource: Resource;
  action: Action;
  resourceId?: string;
  context?: Record<string, unknown>;
}

/**
 * نتيجة التفويض
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  conditions?: AuthorizationCondition[];
  missingPermissions?: string[];
  suggestions?: string[];
}

/**
 * شرط التفويض
 */
export interface AuthorizationCondition {
  type: 'role' | 'permission' | 'ownership' | 'company_membership' | 'custom';
  description: string;
  satisfied: boolean;
  details?: Record<string, unknown>;
}

/**
 * تعريف الصلاحية
 */
export interface PermissionDefinition {
  id: string;
  name: string;
  resource: Resource;
  action: Action;
  description: string;
  conditions?: PermissionCondition[];
  dependencies?: string[];
}

/**
 * شرط الصلاحية
 */
export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'exists' | 'matches' | 'custom';
  value: unknown;
  description?: string;
}

/**
 * سياسة التفويض
 */
export interface AuthorizationPolicy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  principals: string[]; // roles or user IDs
  resources: Resource[];
  actions: Action[];
  conditions?: PolicyCondition[];
  priority: number;
  isActive: boolean;
}

/**
 * شرط السياسة
 */
export interface PolicyCondition {
  type: 'ip' | 'time' | 'device' | 'location' | 'custom';
  operator: string;
  values: unknown[];
}

/**
 * طلب التحقق
 */
export interface CheckRequest {
  userId: string;
  permission: PermissionCheck;
  skipCache?: boolean;
}

/**
 * صلاحيات المستخدم
 */
export interface UserPermissions {
  userId: string;
  role: string;
  permissions: PermissionDefinition[];
  effectivePermissions: string[];
  policies: AuthorizationPolicy[];
}

/**
 * نتائج الفحص المتعدد
 */
export interface BatchCheckResult {
  results: Map<string, AuthorizationResult>;
  allowed: string[];
  denied: string[];
}

/**
 * تقرير التفويض
 */
export interface AuthorizationReport {
  totalChecks: number;
  allowed: number;
  denied: number;
  byResource: Record<Resource, { allowed: number; denied: number }>;
  byAction: Record<Action, { allowed: number; denied: number }>;
  deniedReasons: Record<string, number>;
}

// ==================== Service Interface ====================

/**
 * واجهة خدمة التفويض
 */
export interface IAuthorizationService {
  // ==================== Permission Checks ====================

  /**
   * فحص صلاحية واحدة
   */
  can(request: CheckRequest): Promise<Result<AuthorizationResult, Error>>;

  /**
   * فحص متعدد
   */
  canMany(userId: string, permissions: PermissionCheck[]): Promise<BatchCheckResult>;

  /**
   * فحص أي صلاحية
   */
  canAny(userId: string, permissions: PermissionCheck[]): Promise<boolean>;

  /**
   * فحص كل الصلاحيات
   */
  canAll(userId: string, permissions: PermissionCheck[]): Promise<boolean>;

  // ==================== Role-Based ====================

  /**
   * صلاحيات الدور
   */
  getRolePermissions(role: string): Promise<PermissionDefinition[]>;

  /**
   * أدوار المورد
   */
  getResourceRoles(resource: Resource): Promise<Array<{ role: string; actions: Action[] }>>;

  /**
   * ترقية الدور
   */
  canUpgradeRole(userId: string, targetRole: string): Promise<AuthorizationResult>;

  // ==================== Resource-Based ====================

  /**
   * التحقق من الملكية
   */
  isOwner(userId: string, resource: Resource, resourceId: string): Promise<boolean>;

  /**
   * التحقق من العضوية
   */
  isCompanyMember(userId: string, companyId: string): Promise<boolean>;

  /**
   * دور المستخدم في الشركة
   */
  getCompanyRole(userId: string, companyId: string): Promise<string | null>;

  /**
   * الموارد المسموحة
   */
  getAllowedResources(userId: string, action: Action): Promise<Resource[]>;

  /**
   * الإجراءات المسموحة
   */
  getAllowedActions(userId: string, resource: Resource): Promise<Action[]>;

  // ==================== Policy Management ====================

  /**
   * إنشاء سياسة
   */
  createPolicy(policy: Omit<AuthorizationPolicy, 'id'>): Promise<Result<AuthorizationPolicy, Error>>;

  /**
   * تحديث سياسة
   */
  updatePolicy(id: string, policy: Partial<AuthorizationPolicy>): Promise<Result<AuthorizationPolicy, Error>>;

  /**
   * حذف سياسة
   */
  deletePolicy(id: string): Promise<Result<void, Error>>;

  /**
   * سياسات المستخدم
   */
  getUserPolicies(userId: string): Promise<AuthorizationPolicy[]>;

  /**
   * سياسات الدور
   */
  getRolePolicies(role: string): Promise<AuthorizationPolicy[]>;

  // ==================== Permission Management ====================

  /**
   * صلاحيات المستخدم
   */
  getUserPermissions(userId: string): Promise<UserPermissions>;

  /**
   * منح صلاحية
   */
  grantPermission(userId: string, permission: string): Promise<Result<void, Error>>;

  /**
   * سحب صلاحية
   */
  revokePermission(userId: string, permission: string): Promise<Result<void, Error>>;

  /**
   * منح صلاحيات متعددة
   */
  grantPermissions(userId: string, permissions: string[]): Promise<Result<void, Error>>;

  // ==================== Scope ====================

  /**
   * فحص النطاق
   */
  checkScope(userId: string, scope: string): Promise<boolean>;

  /**
   * نطاقات المستخدم
   */
  getUserScopes(userId: string): Promise<string[]>;

  /**
   * التحقق من النطاق المطلوب
   */
  requireScope(userId: string, scope: string): Promise<Result<void, Error>>;

  // ==================== Caching ====================

  /**
   * تحديث الكاش
   */
  refreshCache(userId: string): Promise<void>;

  /**
   * مسح الكاش
   */
  clearCache(userId?: string): Promise<void>;

  // ==================== Reporting ====================

  /**
   * تقرير التفويض
   */
  getReport(filter?: { from?: Date; to?: Date; userId?: string }): Promise<AuthorizationReport>;

  /**
   * إحصائيات الرفض
   */
  getDenialStats(filter?: { from?: Date; to?: Date }): Promise<{
    total: number;
    byReason: Record<string, number>;
    byResource: Record<Resource, number>;
    byUser: Array<{ userId: string; count: number }>;
  }>;

  // ==================== Utilities ====================

  /**
   * التحقق من وجود صلاحية
   */
  permissionExists(permission: string): boolean;

  /**
   * معلومات الصلاحية
   */
  getPermissionInfo(permission: string): Promise<PermissionDefinition | null>;

  /**
   * جميع الصلاحيات المتاحة
   */
  getAllPermissions(): PermissionDefinition[];
}
