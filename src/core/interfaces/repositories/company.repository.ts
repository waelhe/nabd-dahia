/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Company Repository Interface
 * 
 * واجهة مستودع الشركات
 * 
 * @module core/interfaces/repositories/company.repository
 */

import { IRepository, FindOptions, PaginatedResult, OperationResult, WriteOptions } from './base.repository';
import { Company, CompanyType, CompanyStatus } from '../../domain/entities/Company';
import { UniqueEntityId } from '../../domain/value-objects/UniqueEntityId';

// ==================== Types ====================

export interface CompanyFilter {
  type?: CompanyType;
  status?: CompanyStatus | CompanyStatus[];
  city?: string;
  country?: string;
  verified?: boolean;
  search?: string;
  ownerId?: string;
  employeeId?: string;
}

export interface CompanyCreateData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: CompanyType;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  ownerId: string;
}

export interface CompanyUpdateData {
  name?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  registrationNumber?: string;
  taxId?: string;
  status?: CompanyStatus;
  settings?: Record<string, unknown>;
  businessHours?: Array<{
    day: number;
    open: string;
    close: string;
    closed?: boolean;
  }>;
}

export interface CompanyEmployeeData {
  userId: string;
  role: 'owner' | 'manager' | 'staff';
  permissions?: string[];
}

// ==================== Interface ====================

export interface ICompanyRepository extends IRepository<Company, UniqueEntityId> {
  // ==================== Query Methods ====================

  /**
   * البحث بالـ slug
   */
  findBySlug(slug: string): Promise<Company | null>;

  /**
   * البحث بالنوع
   */
  findByType(type: CompanyType, options?: FindOptions): Promise<PaginatedResult<Company>>;

  /**
   * البحث بالمالك
   */
  findByOwnerId(ownerId: string, options?: FindOptions): Promise<PaginatedResult<Company>>;

  /**
   * البحث بالموظف
   */
  findByEmployeeId(employeeId: string, options?: FindOptions): Promise<PaginatedResult<Company>>;

  /**
   * البحث بالتحقق
   */
  findVerified(options?: FindOptions): Promise<PaginatedResult<Company>>;

  /**
   * البحث المتقدم
   */
  search(filter: CompanyFilter, options?: FindOptions): Promise<PaginatedResult<Company>>;

  // ==================== Employee Management ====================

  /**
   * إضافة موظف
   */
  addEmployee(
    companyId: string,
    data: CompanyEmployeeData
  ): Promise<OperationResult>;

  /**
   * تحديث موظف
   */
  updateEmployee(
    companyId: string,
    userId: string,
    data: Partial<CompanyEmployeeData>
  ): Promise<OperationResult>;

  /**
   * إزالة موظف
   */
  removeEmployee(companyId: string, userId: string): Promise<OperationResult>;

  /**
   * الحصول على موظفي الشركة
   */
  getEmployees(companyId: string): Promise<Array<{
    userId: string;
    role: string;
    permissions?: string[];
    joinedAt: Date;
  }>>;

  /**
   * التحقق من موظف
   */
  isEmployee(companyId: string, userId: string): Promise<boolean>;

  /**
   * الحصول على دور الموظف
   */
  getEmployeeRole(companyId: string, userId: string): Promise<string | null>;

  // ==================== Verification ====================

  /**
   * تحديث حالة التحقق
   */
  updateVerification(
    companyId: string,
    verified: boolean,
    verifiedBy?: string
  ): Promise<OperationResult>;

  // ==================== Statistics ====================

  /**
   * تحديث التقييم
   */
  updateRating(
    companyId: string,
    ratingAverage: number,
    ratingCount: number
  ): Promise<OperationResult>;

  /**
   * تحديث عداد الإقامات
   */
  updateListingCount(companyId: string, increment: number): Promise<OperationResult>;

  /**
   * تحديث عداد الحجوزات
   */
  updateBookingCount(companyId: string, increment: number): Promise<OperationResult>;

  // ==================== Services ====================

  /**
   * إضافة خدمة
   */
  addService(
    companyId: string,
    service: {
      name: string;
      description?: string;
      type: string;
      price?: number;
      currency?: string;
    }
  ): Promise<OperationResult>;

  /**
   * تحديث خدمة
   */
  updateService(
    companyId: string,
    serviceId: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      currency: string;
      isActive: boolean;
    }>
  ): Promise<OperationResult>;

  /**
   * حذف خدمة
   */
  removeService(companyId: string, serviceId: string): Promise<OperationResult>;

  /**
   * الحصول على خدمات الشركة
   */
  getServices(companyId: string): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    type: string;
    price?: number;
    currency: string;
    isActive: boolean;
  }>>;
}
