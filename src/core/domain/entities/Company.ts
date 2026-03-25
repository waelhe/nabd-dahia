/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Company Entity - كيان الشركة
 * 
 * يمثل الشركة في النظام (فنادق، وكالات سفر، مراكز طبية، مؤسسات تعليمية).
 * يدعم Result Pattern للعمليات الآمنة.
 * 
 * @module core/domain/entities/Company
 */

import { AggregateRoot, createDomainEvent, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';
import { Address } from '../value-objects/Address';
import { Rating } from '../value-objects/Rating';
import { Translation } from '../value-objects/Translation';
import { Money, Currency } from '../value-objects/Money';
import type { Result, ValidationError, BusinessError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isObject, isNumber } from '../../types/guards';

// ==================== Types ====================

/**
 * نوع الشركة
 */
export type CompanyType = 'hotel' | 'travel_agency' | 'medical' | 'education' | 'business' | 'other';

/**
 * حالة الشركة
 */
export type CompanyStatus = 'pending' | 'active' | 'suspended' | 'deleted';

/**
 * مستوى التحقق
 */
export type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium';

/**
 * إعدادات الشركة
 */
export interface CompanySettings {
  autoAcceptBookings: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  instantBooking: boolean;
  requireGuestVerification: boolean;
  minNoticeHours: number;
  maxAdvanceBookingDays: number;
  responseTimeTarget: number; // بالساعات
}

/**
 * ساعات العمل
 */
export interface BusinessHours {
  dayOfWeek: number; // 0-6
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isOpen: boolean;
}

/**
 * معلومات التواصل
 */
export interface ContactInfo {
  email: Email | null;
  phone: Phone | null;
  website: string | null;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

/**
 * خصائص الشركة
 */
export interface CompanyProps {
  id: UniqueEntityId | string;
  
  // المعلومات الأساسية
  name: string;
  slug: string;
  description: Translation | null;
  type: CompanyType;
  
  // الشعار والصور
  logo: string | null;
  coverImage: string | null;
  gallery: string[];
  
  // التسجيل القانوني
  registrationNumber: string | null;
  taxId: string | null;
  legalName: string | null;
  
  // معلومات التواصل
  contact: ContactInfo;
  
  // الموقع
  address: Address | null;
  country: string | null;
  city: string | null;
  coordinates: { lat: number; lng: number } | null;
  
  // الحالة والتحقق
  status: CompanyStatus;
  verificationLevel: VerificationLevel;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  
  // الإحصائيات
  rating: Rating | null;
  totalReviews: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: Money;
  
  // الموظفين
  ownerIds: string[];
  employeeCount: number;
  
  // الإعدادات
  settings: CompanySettings;
  businessHours: BusinessHours[];
  
  // التواريخ
  createdAt: Date;
  updatedAt: Date;
  
  // الحذف الناعم
  deletedAt: Date | null;
  deletedBy: string | null;
  
  // الإصدار
  version: number;
}

/**
 * إحصائيات الشركة
 */
export interface CompanyStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: Money;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  averageResponseTime: number;
}

// ==================== Company Errors ====================

export class CompanyError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CompanyError';
  }

  static invalidName(name: string): CompanyError {
    return new CompanyError('INVALID_NAME', `Invalid company name: ${name}`, { name });
  }

  static invalidSlug(slug: string): CompanyError {
    return new CompanyError('INVALID_SLUG', `Invalid slug: ${slug}`, { slug });
  }

  static slugAlreadyExists(slug: string): CompanyError {
    return new CompanyError('SLUG_EXISTS', `Slug already exists: ${slug}`, { slug });
  }

  static cannotSuspend(): CompanyError {
    return new CompanyError('CANNOT_SUSPEND', 'Cannot suspend company with active bookings');
  }

  static cannotDelete(): CompanyError {
    return new CompanyError('CANNOT_DELETE', 'Cannot delete company with active bookings');
  }

  static notVerified(): CompanyError {
    return new CompanyError('NOT_VERIFIED', 'Company is not verified');
  }

  static invalidType(type: string): CompanyError {
    return new CompanyError('INVALID_TYPE', `Invalid company type: ${type}`, { type });
  }
}

// ==================== Company Entity ====================

export class Company extends AggregateRoot<CompanyProps> {
  
  // ==================== Getters ====================
  
  get name(): string {
    return this.props.name;
  }
  
  get slug(): string {
    return this.props.slug;
  }
  
  get type(): CompanyType {
    return this.props.type;
  }
  
  get status(): CompanyStatus {
    return this.props.status;
  }
  
  get verificationLevel(): VerificationLevel {
    return this.props.verificationLevel;
  }
  
  get rating(): Rating | null {
    return this.props.rating;
  }
  
  get isVerified(): boolean {
    return this.props.verificationLevel !== 'unverified';
  }
  
  get isActive(): boolean {
    return this.props.status === 'active';
  }
  
  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }
  
  get ownerIds(): string[] {
    return [...this.props.ownerIds];
  }
  
  get settings(): CompanySettings {
    return { ...this.props.settings };
  }
  
  // ==================== Business Methods ====================
  
  /**
   * تحديث المعلومات الأساسية
   */
  updateBasicInfo(data: {
    name?: string;
    description?: Translation;
    logo?: string;
    coverImage?: string;
    gallery?: string[];
  }): Result<void, ValidationError> {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        return err(new ValidationError('Company name must be at least 2 characters', 'name'));
      }
      this.props.name = data.name;
    }
    
    if (data.description !== undefined) this.props.description = data.description;
    if (data.logo !== undefined) this.props.logo = data.logo;
    if (data.coverImage !== undefined) this.props.coverImage = data.coverImage;
    if (data.gallery !== undefined) this.props.gallery = data.gallery;
    
    this.incrementVersion();
    this.raiseEvent('company.updated', { fields: Object.keys(data) });
    
    return ok(undefined);
  }
  
  /**
   * تحديث معلومات التواصل
   */
  updateContact(contact: Partial<ContactInfo>): void {
    this.props.contact = {
      ...this.props.contact,
      ...contact,
    };
    this.incrementVersion();
    this.raiseEvent('company.contact_updated', {});
  }
  
  /**
   * تحديث الموقع
   */
  updateLocation(data: {
    address?: Address;
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number } | null;
  }): void {
    if (data.address !== undefined) this.props.address = data.address;
    if (data.country !== undefined) this.props.country = data.country;
    if (data.city !== undefined) this.props.city = data.city;
    if (data.coordinates !== undefined) this.props.coordinates = data.coordinates;
    
    this.incrementVersion();
    this.raiseEvent('company.location_updated', {});
  }
  
  /**
   * تحديث الإعدادات
   */
  updateSettings(settings: Partial<CompanySettings>): Result<void, ValidationError> {
    // التحقق من النسب
    if (settings.depositPercentage !== undefined) {
      if (settings.depositPercentage < 0 || settings.depositPercentage > 100) {
        return err(new ValidationError('Deposit percentage must be between 0 and 100', 'depositPercentage'));
      }
    }
    
    this.props.settings = {
      ...this.props.settings,
      ...settings,
    };
    
    this.incrementVersion();
    this.raiseEvent('company.settings_updated', { changes: Object.keys(settings) });
    
    return ok(undefined);
  }
  
  /**
   * تحديث ساعات العمل
   */
  updateBusinessHours(hours: BusinessHours[]): Result<void, ValidationError> {
    if (hours.length !== 7) {
      return err(new ValidationError('Business hours must cover all 7 days', 'businessHours'));
    }
    
    this.props.businessHours = hours;
    this.incrementVersion();
    this.raiseEvent('company.business_hours_updated', {});
    
    return ok(undefined);
  }
  
  /**
   * إضافة مالك
   */
  addOwner(userId: string): void {
    if (!this.props.ownerIds.includes(userId)) {
      this.props.ownerIds.push(userId);
      this.incrementVersion();
      this.raiseEvent('company.owner_added', { userId });
    }
  }
  
  /**
   * إزالة مالك
   */
  removeOwner(userId: string): Result<void, CompanyError> {
    const index = this.props.ownerIds.indexOf(userId);
    if (index === -1) {
      return err(new CompanyError('NOT_OWNER', 'User is not an owner of this company'));
    }
    
    if (this.props.ownerIds.length === 1) {
      return err(new CompanyError('LAST_OWNER', 'Cannot remove the last owner'));
    }
    
    this.props.ownerIds.splice(index, 1);
    this.incrementVersion();
    this.raiseEvent('company.owner_removed', { userId });
    
    return ok(undefined);
  }
  
  /**
   * التحقق مما إذا كان المستخدم مالكاً
   */
  isOwner(userId: string): boolean {
    return this.props.ownerIds.includes(userId);
  }
  
  /**
   * تعليق الشركة
   */
  suspend(suspendedBy: string, reason?: string): Result<void, CompanyError> {
    if (this.props.status === 'suspended') {
      return err(new CompanyError('ALREADY_SUSPENDED', 'Company is already suspended'));
    }
    
    this.props.status = 'suspended';
    this.incrementVersion();
    this.raiseEvent('company.suspended', { suspendedBy, reason });
    
    return ok(undefined);
  }
  
  /**
   * إعادة تفعيل الشركة
   */
  reactivate(reactivatedBy: string): void {
    if (this.props.status === 'suspended') {
      this.props.status = 'active';
      this.incrementVersion();
      this.raiseEvent('company.reactivated', { reactivatedBy });
    }
  }
  
  /**
   * تحقق الشركة
   */
  verify(verifiedBy: string, level: VerificationLevel = 'verified'): void {
    this.props.verificationLevel = level;
    this.props.verifiedAt = new Date();
    this.props.verifiedBy = verifiedBy;
    
    if (this.props.status === 'pending') {
      this.props.status = 'active';
    }
    
    this.incrementVersion();
    this.raiseEvent('company.verified', { verifiedBy, level });
  }
  
  /**
   * إلغاء التحقق
   */
  unverify(): void {
    this.props.verificationLevel = 'unverified';
    this.props.verifiedAt = null;
    this.props.verifiedBy = null;
    
    this.incrementVersion();
    this.raiseEvent('company.unverified', {});
  }
  
  /**
   * تحديث التقييم
   */
  updateRating(newRating: Rating): void {
    this.props.rating = newRating;
    this.props.totalReviews += 1;
    this.incrementVersion();
    this.raiseEvent('company.rating_updated', { rating: newRating.value });
  }
  
  /**
   * تحديث الإحصائيات
   */
  updateStats(stats: Partial<{
    totalListings: number;
    totalBookings: number;
    employeeCount: number;
  }>): void {
    if (stats.totalListings !== undefined) this.props.totalListings = stats.totalListings;
    if (stats.totalBookings !== undefined) this.props.totalBookings = stats.totalBookings;
    if (stats.employeeCount !== undefined) this.props.employeeCount = stats.employeeCount;
    
    this.incrementVersion();
  }
  
  /**
   * تحديث الإيرادات
   */
  updateRevenue(amount: Money): void {
    const addResult = this.props.totalRevenue.add(amount);
    if (addResult.isSuccess) {
      this.props.totalRevenue = addResult.value;
      this.incrementVersion();
    }
  }
  
  /**
   * الحذف الناعم
   */
  softDelete(deletedBy: string): Result<void, CompanyError> {
    if (this.props.deletedAt !== null) {
      return err(new CompanyError('ALREADY_DELETED', 'Company is already deleted'));
    }
    
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.status = 'deleted';
    this.incrementVersion();
    this.raiseEvent('company.deleted', { deletedBy });
    
    return ok(undefined);
  }
  
  /**
   * الاستعادة
   */
  restore(restoredBy: string): void {
    this.props.deletedAt = null;
    this.props.deletedBy = null;
    this.props.status = 'active';
    this.incrementVersion();
    this.raiseEvent('company.restored', { restoredBy });
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء شركة جديدة
   */
  static create(props: Omit<CompanyProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deletedAt' | 'deletedBy' | 'rating' | 'totalReviews' | 'totalListings' | 'totalBookings' | 'totalRevenue' | 'verificationLevel' | 'verifiedAt' | 'verifiedBy' | 'gallery' | 'employeeCount'> & { id?: string }): Result<Company, ValidationError | CompanyError> {
    // التحقق من الاسم
    if (!props.name || props.name.trim().length < 2) {
      return err(new ValidationError('Company name must be at least 2 characters', 'name'));
    }
    
    // التحقق من الـ slug
    if (!props.slug || !/^[a-z0-9-]+$/.test(props.slug)) {
      return err(new ValidationError('Slug must contain only lowercase letters, numbers, and hyphens', 'slug'));
    }
    
    // التحقق من نوع الشركة
    const validTypes: CompanyType[] = ['hotel', 'travel_agency', 'medical', 'education', 'business', 'other'];
    if (!validTypes.includes(props.type)) {
      return err(new ValidationError(`Invalid company type. Must be one of: ${validTypes.join(', ')}`, 'type'));
    }
    
    // التحقق من وجود مالك واحد على الأقل
    if (!props.ownerIds || props.ownerIds.length === 0) {
      return err(new ValidationError('Company must have at least one owner', 'ownerIds'));
    }
    
    const now = new Date();
    
    const company = new Company({
      ...props,
      id: props.id || new UniqueEntityId(),
      rating: null,
      totalReviews: 0,
      totalListings: 0,
      totalBookings: 0,
      totalRevenue: Money.zero('SYP'),
      verificationLevel: 'unverified' as VerificationLevel,
      verifiedAt: null,
      verifiedBy: null,
      gallery: [],
      employeeCount: 0,
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
      deletedBy: null,
    });
    
    company.raiseEvent('company.created', { name: props.name, type: props.type });
    
    return ok(company);
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: CompanyProps): Company {
    return new Company(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      name: this.props.name,
      slug: this.props.slug,
      type: this.props.type,
      logo: this.props.logo,
      coverImage: this.props.coverImage,
      gallery: this.props.gallery,
      description: this.props.description?.toJSON() || null,
      registrationNumber: this.props.registrationNumber,
      taxId: this.props.taxId,
      legalName: this.props.legalName,
      contact: {
        email: this.props.contact.email?.toString() || null,
        phone: this.props.contact.phone?.toString() || null,
        website: this.props.contact.website,
        socialMedia: this.props.contact.socialMedia,
      },
      address: this.props.address?.toJSON() || null,
      country: this.props.country,
      city: this.props.city,
      coordinates: this.props.coordinates,
      status: this.props.status,
      verificationLevel: this.props.verificationLevel,
      isVerified: this.isVerified,
      rating: this.props.rating?.value || null,
      totalReviews: this.props.totalReviews,
      totalListings: this.props.totalListings,
      totalBookings: this.props.totalBookings,
      ownerIds: this.props.ownerIds,
      employeeCount: this.props.employeeCount,
      settings: this.props.settings,
      businessHours: this.props.businessHours,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      deletedAt: this.props.deletedAt?.toISOString() || null,
      version: this.version,
    };
  }
}
