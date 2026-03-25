/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * User Repository Interface - واجهة مستودع المستخدمين
 * 
 * @module core/interfaces/repositories/user.repository
 */

import type { Result } from '../../types/result';
import type { PaginatedResult, PaginationOptions, SearchCriteria } from './base.repository';

// ==================== Types ====================

/**
 * المستخدم مع العلاقات
 */
export interface UserWithRelations {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
  status: string;
  role: string;
  company?: {
    id: string;
    name: string;
    type: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * بيانات إنشاء المستخدم
 */
export interface CreateUserData {
  email?: string;
  phone?: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  country?: string;
  city?: string;
  role?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
}

/**
 * بيانات تحديث المستخدم
 */
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  country?: string;
  city?: string;
  address?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  notificationSettings?: Record<string, boolean>;
}

/**
 * فلاتر المستخدم
 */
export interface UserFilter {
  id?: string;
  email?: string;
  phone?: string;
  status?: string | string[];
  role?: string | string[];
  companyId?: string;
  country?: string;
  city?: string;
  membershipLevel?: string | string[];
  isVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * معايير البحث للمستخدم
 */
export interface UserSearchCriteria extends SearchCriteria<UserFilter> {
  where?: UserFilter;
}

/**
 * إحصائيات المستخدمين
 */
export interface UserStats {
  total: number;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  byCountry: Record<string, number>;
  verified: number;
  unverified: number;
  newThisMonth: number;
}

/**
 * خيارات البحث
 */
export interface UserFindOptions {
  include?: ('company' | 'sessions' | 'preferences')[];
  withDeleted?: boolean;
}

// ==================== Repository Interface ====================

/**
 * واجهة مستودع المستخدمين
 */
export interface IUserRepository {
  // ==================== Create ====================

  /**
   * إنشاء مستخدم جديد
   */
  create(data: CreateUserData): Promise<Result<UserWithRelations, Error>>;

  /**
   * إنشاء مستخدمين متعددين
   */
  createMany(data: CreateUserData[]): Promise<Result<UserWithRelations[], Error>>;

  // ==================== Read ====================

  /**
   * البحث بالمعرف
   */
  findById(id: string, options?: UserFindOptions): Promise<Result<UserWithRelations, Error>>;

  /**
   * البحث بالمعرف أو null
   */
  findByIdOrNull(id: string, options?: UserFindOptions): Promise<UserWithRelations | null>;

  /**
   * البحث بالبريد الإلكتروني
   */
  findByEmail(email: string): Promise<Result<UserWithRelations, Error>>;

  /**
   * البحث برقم الهاتف
   */
  findByPhone(phone: string): Promise<Result<UserWithRelations, Error>>;

  /**
   * البحث بمعايير
   */
  findMany(criteria: UserSearchCriteria): Promise<UserWithRelations[]>;

  /**
   * البحث مع التصفح
   */
  findPaginated(options: PaginationOptions, criteria?: UserSearchCriteria): Promise<PaginatedResult<UserWithRelations>>;

  /**
   * البحث عن الكل
   */
  findAll(options?: UserFindOptions): Promise<UserWithRelations[]>;

  // ==================== Update ====================

  /**
   * تحديث مستخدم
   */
  update(id: string, data: UpdateUserData): Promise<Result<UserWithRelations, Error>>;

  /**
   * تحديث كلمة المرور
   */
  updatePassword(id: string, passwordHash: string): Promise<Result<void, Error>>;

  /**
   * تحديث الحالة
   */
  updateStatus(id: string, status: string, reason?: string): Promise<Result<void, Error>>;

  /**
   * تحديث الدور
   */
  updateRole(id: string, role: string): Promise<Result<void, Error>>;

  /**
   * تأكيد البريد الإلكتروني
   */
  verifyEmail(id: string): Promise<Result<void, Error>>;

  /**
   * تأكيد رقم الهاتف
   */
  verifyPhone(id: string): Promise<Result<void, Error>>;

  // ==================== Delete ====================

  /**
   * حذف ناعم
   */
  softDelete(id: string, deletedBy: string): Promise<Result<void, Error>>;

  /**
   * استعادة
   */
  restore(id: string): Promise<Result<void, Error>>;

  /**
   * حذف نهائي
   */
  hardDelete(id: string): Promise<Result<void, Error>>;

  // ==================== Existence ====================

  /**
   * التحقق من الوجود
   */
  exists(id: string): Promise<boolean>;

  /**
   * التحقق من وجود البريد
   */
  emailExists(email: string, excludeId?: string): Promise<boolean>;

  /**
   * التحقق من وجود الهاتف
   */
  phoneExists(phone: string, excludeId?: string): Promise<boolean>;

  // ==================== Stats ====================

  /**
   * إحصائيات المستخدمين
   */
  getStats(): Promise<UserStats>;

  /**
   * عدد المستخدمين
   */
  count(criteria?: UserSearchCriteria): Promise<number>;

  // ==================== Special ====================

  /**
   * البحث عن المضيفين
   */
  findHosts(options?: PaginationOptions): Promise<PaginatedResult<UserWithRelations>>;

  /**
   * تحديث آخر تسجيل دخول
   */
  updateLastLogin(id: string): Promise<void>;

  /**
   * إضافة نقاط الولاء
   */
  addLoyaltyPoints(id: string, points: number): Promise<Result<void, Error>>;

  /**
   * تحديث التقييم
   */
  updateRating(id: string, rating: number): Promise<Result<void, Error>>;
}
