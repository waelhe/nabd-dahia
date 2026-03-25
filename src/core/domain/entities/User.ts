/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * User Entity - كيان المستخدم
 * 
 * يمثل المستخدم الأساسي في النظام.
 * يدعم 6 أدوار: Guest, User, Host, Company, Admin, SuperAdmin.
 * يستخدم Result Pattern للعمليات الآمنة.
 * 
 * @module core/domain/entities/User
 */

import { AggregateRoot, createDomainEvent, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';
import { Address } from '../value-objects/Address';
import { Rating } from '../value-objects/Rating';
import { Role, Permission } from '../authorization';
import { Money, Currency } from '../value-objects/Money';
import { Translation } from '../value-objects/Translation';
import type { Result, ok, err, ValidationError, BusinessError } from '../../types/result';
import { isString, isDate, isObject, isRoleName, isUserStatus, isGender, isMembershipLevel, isCurrency } from '../../types/guards';

// ==================== Types ====================

export type Gender = 'male' | 'female' | 'other';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  bookingUpdates: boolean;
  reviewReminders: boolean;
  promotions: boolean;
}

export interface UserProps {
  id: UniqueEntityId | string;
  email: Email | null;
  phone: Phone | null;
  passwordHash: string | null;
  
  // المعلومات الأساسية
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
  bio: Translation | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  nationality: string | null;
  
  // معلومات الموقع
  address: Address | null;
  country: string | null;
  city: string | null;
  
  // الحالة والأدوار
  status: UserStatus;
  role: Role;
  emailVerified: Date | null;
  phoneVerified: Date | null;
  
  // العضوية والولاء
  membershipLevel: MembershipLevel;
  loyaltyPoints: number;
  totalSpent: Money;
  totalBookings: number;
  
  // للمضيفين
  hostingSince: Date | null;
  responseRate: number | null;
  responseTime: number | null; // بالدقائق
  totalListings: number;
  
  // للشركات
  companyId: string | null;
  
  // التقييمات
  rating: Rating | null;
  totalReviews: number;
  
  // التفضيلات
  preferredLanguage: string;
  preferredCurrency: Currency;
  notificationSettings: NotificationSettings;
  
  // التواريخ
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // السلوكيات
  deletedAt: Date | null;
  deletedBy: string | null;
  version: number;
}

export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: Money;
  loyaltyPoints: number;
  currentLevel: MembershipLevel;
  pointsToNextLevel: number;
}

// ==================== User Errors ====================

export class UserError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'UserError';
  }

  static invalidEmail(email: string): UserError {
    return new UserError('INVALID_EMAIL', `Invalid email: ${email}`, { email });
  }

  static invalidPhone(phone: string): UserError {
    return new UserError('INVALID_PHONE', `Invalid phone: ${phone}`, { phone });
  }

  static emailOrPhoneRequired(): UserError {
    return new UserError('EMAIL_OR_PHONE_REQUIRED', 'Email or phone is required');
  }

  static cannotSuspendSelf(): UserError {
    return new UserError('CANNOT_SUSPEND_SELF', 'Cannot suspend yourself');
  }

  static cannotDeleteSelf(): UserError {
    return new UserError('CANNOT_DELETE_SELF', 'Cannot delete yourself');
  }

  static insufficientPoints(required: number, available: number): UserError {
    return new UserError('INSUFFICIENT_POINTS', 
      `Insufficient loyalty points. Required: ${required}, Available: ${available}`,
      { required, available }
    );
  }

  static accountSuspended(): UserError {
    return new UserError('ACCOUNT_SUSPENDED', 'Account is suspended');
  }

  static accountDeleted(): UserError {
    return new UserError('ACCOUNT_DELETED', 'Account has been deleted');
  }
}

// ==================== User Entity ====================

export class User extends AggregateRoot<UserProps> {
  
  // ==================== Getters ====================
  
  get email(): Email | null {
    return this.props.email;
  }
  
  get phone(): Phone | null {
    return this.props.phone;
  }
  
  get firstName(): string {
    return this.props.firstName;
  }
  
  get lastName(): string {
    return this.props.lastName;
  }
  
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
  
  get displayName(): string {
    return this.props.displayName || this.fullName;
  }
  
  get avatar(): string | null {
    return this.props.avatar;
  }
  
  get bio(): Translation | null {
    return this.props.bio;
  }
  
  get role(): Role {
    return this.props.role;
  }
  
  get status(): UserStatus {
    return this.props.status;
  }
  
  get membershipLevel(): MembershipLevel {
    return this.props.membershipLevel;
  }
  
  get loyaltyPoints(): number {
    return this.props.loyaltyPoints;
  }
  
  get rating(): Rating | null {
    return this.props.rating;
  }
  
  get companyId(): string | null {
    return this.props.companyId;
  }
  
  get preferredLanguage(): string {
    return this.props.preferredLanguage;
  }
  
  get preferredCurrency(): Currency {
    return this.props.preferredCurrency;
  }
  
  get isVerified(): boolean {
    return !!(this.props.emailVerified || this.props.phoneVerified);
  }
  
  get isActive(): boolean {
    return this.props.status === 'active';
  }
  
  get isHost(): boolean {
    return ['host', 'company', 'admin', 'super_admin'].includes(this.props.role.name);
  }
  
  get isCompany(): boolean {
    return ['company', 'admin', 'super_admin'].includes(this.props.role.name);
  }
  
  get isAdmin(): boolean {
    return ['admin', 'super_admin'].includes(this.props.role.name);
  }
  
  // ==================== SoftDelete Implementation ====================
  
  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }
  
  get deletedBy(): string | null {
    return this.props.deletedBy;
  }
  
  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }
  
  // ==================== Business Methods ====================
  
  /**
   * تحديث الملف الشخصي
   */
  updateProfile(data: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    avatar: string;
    bio: Translation;
    dateOfBirth: Date;
    gender: Gender;
    nationality: string;
    address: Address;
  }>): Result<void, ValidationError> {
    if (data.firstName !== undefined) {
      if (!data.firstName || data.firstName.trim().length < 2) {
        return { isSuccess: false, isFailure: true, error: new ValidationError('firstName must be at least 2 characters', 'firstName') } as Result<void, ValidationError>;
      }
      this.props.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      if (!data.lastName || data.lastName.trim().length < 2) {
        return { isSuccess: false, isFailure: true, error: new ValidationError('lastName must be at least 2 characters', 'lastName') } as Result<void, ValidationError>;
      }
      this.props.lastName = data.lastName;
    }
    if (data.displayName !== undefined) this.props.displayName = data.displayName;
    if (data.avatar !== undefined) this.props.avatar = data.avatar;
    if (data.bio !== undefined) this.props.bio = data.bio;
    if (data.dateOfBirth !== undefined) this.props.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) this.props.gender = data.gender;
    if (data.nationality !== undefined) this.props.nationality = data.nationality;
    if (data.address !== undefined) this.props.address = data.address;
    
    this.incrementVersion();
    this.raiseEvent('user.profile_updated', { fields: Object.keys(data) });
    
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, ValidationError>;
  }
  
  /**
   * التحقق من وجود صلاحية معينة
   */
  hasPermission(permission: Permission): boolean {
    return this.props.role.hasPermission(permission);
  }
  
  /**
   * التحقق من وجود صلاحية بالاسم
   */
  hasPermissionByName(permissionName: string): boolean {
    return this.props.role.hasPermissionByName(permissionName);
  }
  
  /**
   * ترقية الدور
   */
  upgradeRole(newRole: Role, upgradedBy: User): Result<void, UserError> {
    // فقط المدير يمكنه ترقية الأدوار
    if (!upgradedBy.isAdmin) {
      return { isSuccess: false, isFailure: true, error: new UserError('UNAUTHORIZED', 'Only admins can upgrade roles') } as Result<void, UserError>;
    }
    
    // التحقق من أن الدور الجديد أعلى
    if (newRole.level <= this.props.role.level) {
      return { isSuccess: false, isFailure: true, error: new UserError('INVALID_ROLE_UPGRADE', 'New role must be higher than current role') } as Result<void, UserError>;
    }
    
    this.props.role = newRole;
    this.incrementVersion();
    this.raiseEvent('user.role_upgraded', { newRole: newRole.name, upgradedBy: upgradedBy.idValue });
    
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, UserError>;
  }
  
  /**
   * تعليق الحساب
   */
  suspend(suspendedBy: User, reason?: string): Result<void, UserError> {
    // لا يمكن للمستخدم تعليق نفسه
    if (this.equals(suspendedBy)) {
      return { isSuccess: false, isFailure: true, error: UserError.cannotSuspendSelf() } as Result<void, UserError>;
    }
    
    this.props.status = 'suspended';
    this.incrementVersion();
    this.raiseEvent('user.suspended', { reason, suspendedBy: suspendedBy.idValue });
    
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, UserError>;
  }
  
  /**
   * إعادة تفعيل الحساب
   */
  reactivate(reactivatedBy: User): void {
    if (this.props.status === 'suspended') {
      this.props.status = 'active';
      this.incrementVersion();
      this.raiseEvent('user.reactivated', { reactivatedBy: reactivatedBy.idValue });
    }
  }
  
  /**
   * تأكيد البريد الإلكتروني
   */
  verifyEmail(): void {
    this.props.emailVerified = new Date();
    if (this.props.status === 'pending') {
      this.props.status = 'active';
    }
    this.incrementVersion();
    this.raiseEvent('user.email_verified', {});
  }
  
  /**
   * تأكيد رقم الهاتف
   */
  verifyPhone(): void {
    this.props.phoneVerified = new Date();
    if (this.props.status === 'pending') {
      this.props.status = 'active';
    }
    this.incrementVersion();
    this.raiseEvent('user.phone_verified', {});
  }
  
  /**
   * تحديث آخر تسجيل دخول
   */
  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.incrementVersion();
  }
  
  /**
   * إضافة نقاط الولاء
   */
  addLoyaltyPoints(points: number): void {
    this.props.loyaltyPoints += points;
    this.updateMembershipLevel();
    this.incrementVersion();
    this.raiseEvent('user.loyalty_points_added', { points, total: this.props.loyaltyPoints });
  }
  
  /**
   * خصم نقاط الولاء
   */
  deductLoyaltyPoints(points: number): Result<void, UserError> {
    if (this.props.loyaltyPoints < points) {
      return { isSuccess: false, isFailure: true, error: UserError.insufficientPoints(points, this.props.loyaltyPoints) } as Result<void, UserError>;
    }
    this.props.loyaltyPoints -= points;
    this.incrementVersion();
    this.raiseEvent('user.loyalty_points_deducted', { points, total: this.props.loyaltyPoints });
    
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, UserError>;
  }
  
  /**
   * تحديث مستوى العضوية
   */
  private updateMembershipLevel(): void {
    const points = this.props.loyaltyPoints;
    
    if (points >= 5000) {
      this.props.membershipLevel = 'platinum';
    } else if (points >= 2000) {
      this.props.membershipLevel = 'gold';
    } else if (points >= 500) {
      this.props.membershipLevel = 'silver';
    } else {
      this.props.membershipLevel = 'bronze';
    }
  }
  
  /**
   * تحديث التقييم
   */
  updateRating(newRating: Rating): void {
    this.props.rating = newRating;
    this.props.totalReviews += 1;
    this.incrementVersion();
    this.raiseEvent('user.rating_updated', { rating: newRating.value, totalReviews: this.props.totalReviews });
  }
  
  /**
   * تحديث إحصائيات المضيف
   */
  updateHostStats(stats: {
    responseRate?: number;
    responseTime?: number;
    totalListings?: number;
  }): void {
    if (stats.responseRate !== undefined) this.props.responseRate = stats.responseRate;
    if (stats.responseTime !== undefined) this.props.responseTime = stats.responseTime;
    if (stats.totalListings !== undefined) this.props.totalListings = stats.totalListings;
    this.incrementVersion();
  }
  
  /**
   * تحديث إحصائيات الحجوزات
   */
  updateBookingStats(amount: Money): void {
    this.props.totalBookings += 1;
    const addResult = this.props.totalSpent.add(amount);
    if (addResult.isSuccess) {
      this.props.totalSpent = addResult.value;
    }
    this.incrementVersion();
  }
  
  /**
   * تحديث إعدادات الإشعارات
   */
  updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    this.props.notificationSettings = {
      ...this.props.notificationSettings,
      ...settings
    };
    this.incrementVersion();
  }
  
  /**
   * الحصول على إحصائيات المستخدم
   */
  getStats(): UserStats {
    const pointsThresholds = {
      bronze: 0,
      silver: 500,
      gold: 2000,
      platinum: 5000
    };
    
    const currentLevelPoints = pointsThresholds[this.props.membershipLevel];
    const nextLevel = this.getNextMembershipLevel();
    const pointsToNextLevel = nextLevel 
      ? pointsThresholds[nextLevel] - this.props.loyaltyPoints
      : 0;
    
    return {
      totalBookings: this.props.totalBookings,
      completedBookings: this.props.totalBookings,
      cancelledBookings: 0,
      totalSpent: this.props.totalSpent,
      loyaltyPoints: this.props.loyaltyPoints,
      currentLevel: this.props.membershipLevel,
      pointsToNextLevel: Math.max(0, pointsToNextLevel)
    };
  }
  
  /**
   * الحصول على مستوى العضوية التالي
   */
  private getNextMembershipLevel(): MembershipLevel | null {
    switch (this.props.membershipLevel) {
      case 'bronze': return 'silver';
      case 'silver': return 'gold';
      case 'gold': return 'platinum';
      default: return null;
    }
  }
  
  /**
   * الحذف الناعم
   */
  softDelete(deletedBy: User): Result<void, UserError> {
    if (this.equals(deletedBy)) {
      return { isSuccess: false, isFailure: true, error: UserError.cannotDeleteSelf() } as Result<void, UserError>;
    }
    
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy.idValue;
    this.props.status = 'deleted';
    this.incrementVersion();
    this.raiseEvent('user.deleted', { deletedBy: deletedBy.idValue });
    
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, UserError>;
  }
  
  /**
   * الاستعادة
   */
  restore(restoredBy: User): void {
    this.props.deletedAt = null;
    this.props.deletedBy = null;
    this.props.status = 'active';
    this.incrementVersion();
    this.raiseEvent('user.restored', { restoredBy: restoredBy.idValue });
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء مستخدم جديد
   */
  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deletedAt' | 'deletedBy'> & { id?: string }): Result<User, ValidationError | UserError> {
    // التحقق من وجود بريد أو هاتف
    if (!props.email && !props.phone) {
      return { isSuccess: false, isFailure: true, error: UserError.emailOrPhoneRequired() } as Result<User, ValidationError | UserError>;
    }
    
    // التحقق من الاسم
    if (!props.firstName || props.firstName.trim().length < 2) {
      return { isSuccess: false, isFailure: true, error: new ValidationError('firstName must be at least 2 characters', 'firstName') } as Result<User, ValidationError | UserError>;
    }
    
    if (!props.lastName || props.lastName.trim().length < 2) {
      return { isSuccess: false, isFailure: true, error: new ValidationError('lastName must be at least 2 characters', 'lastName') } as Result<User, ValidationError | UserError>;
    }
    
    const now = new Date();
    
    const user = new User({
      ...props,
      id: props.id || new UniqueEntityId(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
      deletedBy: null
    });
    
    user.raiseEvent('user.created', { 
      email: props.email?.toString(),
      role: props.role.name 
    });
    
    return { isSuccess: true, isFailure: false, value: user } as Result<User, ValidationError | UserError>;
  }
  
  /**
   * إنشاء ضيف (زائر)
   */
  static createGuest(): User {
    const now = new Date();
    return new User({
      id: new UniqueEntityId(),
      email: null,
      phone: null,
      passwordHash: null,
      firstName: 'Guest',
      lastName: '',
      displayName: null,
      avatar: null,
      bio: null,
      dateOfBirth: null,
      gender: null,
      nationality: null,
      address: null,
      country: null,
      city: null,
      status: 'active',
      role: Role.guest(),
      emailVerified: null,
      phoneVerified: null,
      membershipLevel: 'bronze',
      loyaltyPoints: 0,
      totalSpent: Money.zero('SYP'),
      totalBookings: 0,
      hostingSince: null,
      responseRate: null,
      responseTime: null,
      totalListings: 0,
      companyId: null,
      rating: null,
      totalReviews: 0,
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
      notificationSettings: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        bookingUpdates: true,
        reviewReminders: true,
        promotions: false
      },
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deletedBy: null,
      version: 1
    });
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: UserProps): User {
    return new User(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      email: this.props.email?.toString() || null,
      phone: this.props.phone?.toString() || null,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      displayName: this.props.displayName,
      fullName: this.fullName,
      avatar: this.props.avatar,
      bio: this.props.bio?.toJSON() || null,
      dateOfBirth: this.props.dateOfBirth?.toISOString() || null,
      gender: this.props.gender,
      nationality: this.props.nationality,
      address: this.props.address?.toJSON() || null,
      country: this.props.country,
      city: this.props.city,
      status: this.props.status,
      role: this.props.role.toJSON(),
      isVerified: this.isVerified,
      membershipLevel: this.props.membershipLevel,
      loyaltyPoints: this.props.loyaltyPoints,
      rating: this.props.rating?.value || null,
      totalReviews: this.props.totalReviews,
      preferredLanguage: this.props.preferredLanguage,
      preferredCurrency: this.props.preferredCurrency,
      companyId: this.props.companyId,
      isHost: this.isHost,
      isCompany: this.isCompany,
      isAdmin: this.isAdmin,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      version: this.version
    };
  }
}
