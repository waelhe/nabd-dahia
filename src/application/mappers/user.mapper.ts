/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * User Mapper
 * 
 * مسئول عن التحويل بين:
 * - Domain Entity (User) ↔ Persistence Model (Prisma User)
 * - Domain Entity (User) ↔ DTO (API Response)
 * 
 * @module application/mappers/user.mapper
 */

import { User, UserProps, UserError } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { Phone } from '@/core/domain/value-objects/Phone';
import { Address } from '@/core/domain/value-objects/Address';
import { Rating } from '@/core/domain/value-objects/Rating';
import { Money } from '@/core/domain/value-objects/Money';
import { Translation } from '@/core/domain/value-objects/Translation';
import { Role } from '@/core/domain/authorization/Role';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import type { User as PrismaUser } from '@prisma/client';
import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

/**
 * بيانات إنشاء المستخدم من API
 */
export interface UserCreateDTO {
  email?: string | null;
  phone?: string | null;
  firstName: string;
  lastName: string;
  displayName?: string;
  bio?: string;
  dateOfBirth?: Date | null;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  country?: string;
  city?: string;
  preferredLanguage?: 'ar' | 'en' | 'fr' | 'tr' | 'ru';
  preferredCurrency?: 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';
}

/**
 * بيانات تحديث المستخدم من API
 */
export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date | null;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  country?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  preferredLanguage?: 'ar' | 'en' | 'fr' | 'tr' | 'ru';
  preferredCurrency?: 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';
  notificationSettings?: Record<string, unknown>;
}

/**
 * استجابة API للمستخدم
 */
export interface UserResponseDTO {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  nationality: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  status: string;
  role: string;
  isVerified: boolean;
  membershipLevel: string;
  loyaltyPoints: number;
  ratingAverage: number | null;
  ratingCount: number;
  preferredLanguage: string;
  preferredCurrency: string;
  isHost: boolean;
  isSuperhost: boolean;
  hostingSince: Date | null;
  totalListings: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للمستخدم (مختصرة)
 */
export interface UserSummaryDTO {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string;
  avatar: string | null;
  rating: number | null;
  isSuperhost: boolean;
}

// ==================== Mapper Class ====================

export class UserMapper {
  
  // ==================== To Domain ====================
  
  /**
   * تحويل Prisma User إلى Domain Entity
   */
  static toDomain(prismaUser: PrismaUser): Result<User, UserError> {
    // إنشاء Email Value Object
    const emailResult = prismaUser.email ? Email.create(prismaUser.email) : null;
    if (emailResult && emailResult.isFailure) {
      return err(new UserError('INVALID_EMAIL', 'Invalid email format'));
    }
    
    // إنشاء Phone Value Object
    const phoneResult = prismaUser.phone ? Phone.create(prismaUser.phone) : null;
    if (phoneResult && phoneResult.isFailure) {
      return err(new UserError('INVALID_PHONE', 'Invalid phone format'));
    }
    
    // إنشاء Address Value Object
    let address: Address | null = null;
    if (prismaUser.address || prismaUser.latitude || prismaUser.longitude) {
      const addressResult = Address.create({
        address: prismaUser.address || undefined,
        city: prismaUser.city || undefined,
        country: prismaUser.country || undefined,
        latitude: prismaUser.latitude || undefined,
        longitude: prismaUser.longitude || undefined,
      });
      if (addressResult.isSuccess) {
        address = addressResult.value;
      }
    }
    
    // إنشاء Rating Value Object
    let rating: Rating | null = null;
    if (prismaUser.ratingAverage !== null) {
      const ratingResult = Rating.create({
        value: prismaUser.ratingAverage,
        count: prismaUser.ratingCount,
      });
      if (ratingResult.isSuccess) {
        rating = ratingResult.value;
      }
    }
    
    // إنشاء Money Value Object
    const totalSpentResult = Money.create({
      amount: prismaUser.totalSpent,
      currency: prismaUser.preferredCurrency as 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR',
    });
    const totalSpent = totalSpentResult.isSuccess ? totalSpentResult.value : Money.zero('SYP');
    
    // إنشاء Bio translation
    let bio: Translation | null = null;
    if (prismaUser.bio) {
      const bioResult = Translation.create({
        translations: { [prismaUser.preferredLanguage]: prismaUser.bio },
      });
      if (bioResult.isSuccess) {
        bio = bioResult.value;
      }
    }
    
    // إنشاء Role
    let role: Role;
    try {
      role = Role.fromName(prismaUser.role as 'guest' | 'user' | 'host' | 'company' | 'admin' | 'super_admin');
    } catch {
      role = Role.user();
    }
    
    // إنشاء Notification Settings
    let notificationSettings = {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      bookingUpdates: true,
      reviewReminders: true,
      promotions: false,
    };
    
    if (prismaUser.notificationSettings) {
      try {
        notificationSettings = typeof prismaUser.notificationSettings === 'string'
          ? JSON.parse(prismaUser.notificationSettings)
          : prismaUser.notificationSettings as typeof notificationSettings;
      } catch {
        // Use defaults
      }
    }
    
    // إنشاء User Props
    const props: UserProps = {
      id: new UniqueEntityId(prismaUser.id),
      email: emailResult?.isSuccess ? emailResult.value : null,
      phone: phoneResult?.isSuccess ? phoneResult.value : null,
      passwordHash: prismaUser.passwordHash,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      displayName: prismaUser.displayName,
      avatar: prismaUser.avatar,
      bio,
      dateOfBirth: prismaUser.dateOfBirth,
      gender: prismaUser.gender as 'male' | 'female' | 'other' | null,
      nationality: prismaUser.nationality,
      address,
      country: prismaUser.country,
      city: prismaUser.city,
      status: prismaUser.status as 'pending' | 'active' | 'suspended' | 'deleted',
      role,
      emailVerified: prismaUser.emailVerifiedAt,
      phoneVerified: prismaUser.phoneVerifiedAt,
      membershipLevel: prismaUser.membershipLevel as 'bronze' | 'silver' | 'gold' | 'platinum',
      loyaltyPoints: prismaUser.loyaltyPoints,
      totalSpent,
      totalBookings: prismaUser.totalBookings,
      hostingSince: prismaUser.hostingSince,
      responseRate: prismaUser.responseRate,
      responseTime: prismaUser.responseTime,
      totalListings: prismaUser.totalListings,
      companyId: prismaUser.companyId,
      rating,
      totalReviews: prismaUser.ratingCount,
      preferredLanguage: prismaUser.preferredLanguage,
      preferredCurrency: prismaUser.preferredCurrency as 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR',
      notificationSettings,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
      deletedBy: prismaUser.deletedBy,
      version: prismaUser.version,
    };
    
    // إعادة بناء الـ Entity
    return ok(User.reconstitute(props));
  }
  
  /**
   * تحويل مجموعة Prisma Users إلى Domain Entities
   */
  static toDomainMany(prismaUsers: PrismaUser[]): Result<User[], UserError> {
    const users: User[] = [];
    
    for (const prismaUser of prismaUsers) {
      const result = this.toDomain(prismaUser);
      if (result.isFailure) {
        return err(result.error);
      }
      users.push(result.value);
    }
    
    return ok(users);
  }
  
  // ==================== To Persistence ====================
  
  /**
   * تحويل Domain Entity إلى بيانات Prisma للإنشاء
   */
  static toPersistence(user: User): Record<string, unknown> {
    return {
      id: user.idValue,
      email: user.email?.value || null,
      phone: user.phone?.value || null,
      passwordHash: user.getProps().passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio?.toString() || null,
      dateOfBirth: user.getProps().dateOfBirth,
      gender: user.getProps().gender,
      nationality: user.getProps().nationality,
      country: user.getProps().country,
      city: user.getProps().city,
      address: user.getProps().address?.address || null,
      latitude: user.getProps().address?.latitude || null,
      longitude: user.getProps().address?.longitude || null,
      status: user.status,
      role: user.role.name,
      emailVerifiedAt: user.getProps().emailVerified,
      phoneVerifiedAt: user.getProps().phoneVerified,
      membershipLevel: user.membershipLevel,
      loyaltyPoints: user.loyaltyPoints,
      totalSpent: user.getProps().totalSpent.amount,
      totalBookings: user.getProps().totalBookings,
      hostingSince: user.getProps().hostingSince,
      responseRate: user.getProps().responseRate,
      responseTime: user.getProps().responseTime,
      totalListings: user.getProps().totalListings,
      isSuperhost: user.getProps().isSuperhost || false,
      companyId: user.companyId,
      ratingAverage: user.rating?.value || null,
      ratingCount: user.getProps().totalReviews,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
      notificationSettings: JSON.stringify(user.getProps().notificationSettings),
      lastLoginAt: user.getProps().lastLoginAt,
      version: user.version,
    };
  }
  
  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  static createDTOToPersistence(dto: UserCreateDTO): Record<string, unknown> {
    return {
      email: dto.email,
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName || `${dto.firstName} ${dto.lastName}`,
      bio: dto.bio,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      nationality: dto.nationality,
      country: dto.country,
      city: dto.city,
      preferredLanguage: dto.preferredLanguage || 'ar',
      preferredCurrency: dto.preferredCurrency || 'SYP',
      status: 'pending',
      role: 'user',
      membershipLevel: 'bronze',
      loyaltyPoints: 0,
      totalSpent: 0,
      totalBookings: 0,
      totalListings: 0,
      ratingCount: 0,
      isSuperhost: false,
    };
  }
  
  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  static updateDTOToPersistence(dto: UserUpdateDTO): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.dateOfBirth !== undefined) data.dateOfBirth = dto.dateOfBirth;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.preferredLanguage !== undefined) data.preferredLanguage = dto.preferredLanguage;
    if (dto.preferredCurrency !== undefined) data.preferredCurrency = dto.preferredCurrency;
    if (dto.notificationSettings !== undefined) {
      data.notificationSettings = JSON.stringify(dto.notificationSettings);
    }
    
    return data;
  }

  /**
   * تحويل Create DTO إلى بيانات Prisma
   */
  static createDTOToPersistence(dto: UserCreateDTO): Record<string, unknown> {
    return {
      email: dto.email,
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName || `${dto.firstName} ${dto.lastName}`,
      bio: dto.bio,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      nationality: dto.nationality,
      country: dto.country,
      city: dto.city,
      preferredLanguage: dto.preferredLanguage || 'ar',
      preferredCurrency: dto.preferredCurrency || 'SYP',
      status: 'pending',
      role: 'user',
      membershipLevel: 'bronze',
      loyaltyPoints: 0,
      totalSpent: 0,
      totalBookings: 0,
      totalListings: 0,
      ratingCount: 0,
      isSuperhost: false,
    };
  }
  
  // ==================== To DTO ====================
  
  /**
   * تحويل Domain Entity إلى Response DTO
   */
  static toDTO(user: User): UserResponseDTO {
    return {
      id: user.idValue,
      email: user.email?.value || null,
      phone: user.phone?.value || null,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio?.toString() || null,
      dateOfBirth: user.getProps().dateOfBirth,
      gender: user.getProps().gender,
      nationality: user.getProps().nationality,
      country: user.getProps().country,
      city: user.getProps().city,
      address: user.getProps().address?.address || null,
      status: user.status,
      role: user.role.name,
      isVerified: user.isVerified,
      membershipLevel: user.membershipLevel,
      loyaltyPoints: user.loyaltyPoints,
      ratingAverage: user.rating?.value || null,
      ratingCount: user.getProps().totalReviews,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
      isHost: user.isHost,
      isSuperhost: user.getProps().isSuperhost || false,
      hostingSince: user.getProps().hostingSince,
      totalListings: user.getProps().totalListings,
      createdAt: user.getProps().createdAt,
      updatedAt: user.getProps().updatedAt,
    };
  }
  
  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  static toSummaryDTO(user: User): UserSummaryDTO {
    return {
      id: user.idValue,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      fullName: user.fullName,
      avatar: user.avatar,
      rating: user.rating?.value || null,
      isSuperhost: user.getProps().isSuperhost || false,
    };
  }
  
  /**
   * تحويل مجموعة Domain Entities إلى Response DTOs
   */
  static toDTOs(users: User[]): UserResponseDTO[] {
    return users.map(user => this.toDTO(user));
  }
  
  /**
   * تحويل Prisma User مباشرة إلى Response DTO
   */
  static prismaToDTO(prismaUser: PrismaUser): UserResponseDTO {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      phone: prismaUser.phone,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      displayName: prismaUser.displayName,
      fullName: `${prismaUser.firstName} ${prismaUser.lastName}`,
      avatar: prismaUser.avatar,
      bio: prismaUser.bio,
      dateOfBirth: prismaUser.dateOfBirth,
      gender: prismaUser.gender,
      nationality: prismaUser.nationality,
      country: prismaUser.country,
      city: prismaUser.city,
      address: prismaUser.address,
      status: prismaUser.status,
      role: prismaUser.role,
      isVerified: !!(prismaUser.emailVerifiedAt || prismaUser.phoneVerifiedAt),
      membershipLevel: prismaUser.membershipLevel,
      loyaltyPoints: prismaUser.loyaltyPoints,
      ratingAverage: prismaUser.ratingAverage,
      ratingCount: prismaUser.ratingCount,
      preferredLanguage: prismaUser.preferredLanguage,
      preferredCurrency: prismaUser.preferredCurrency,
      isHost: ['host', 'company', 'admin', 'super_admin'].includes(prismaUser.role),
      isSuperhost: prismaUser.isSuperhost,
      hostingSince: prismaUser.hostingSince,
      totalListings: prismaUser.totalListings,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}
