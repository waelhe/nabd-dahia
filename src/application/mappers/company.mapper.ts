/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Company Mapper
 *
 * مسئول عن التحويل بين:
 * - Domain Entity (Company) ↔ Persistence Model (Prisma Company)
 * - Domain Entity (Company) ↔ DTO (API Response)
 *
 * @module application/mappers/company.mapper
 */

import { Company, CompanyProps, CompanyError, CompanyType, CompanyStatus, VerificationLevel } from '@/core/domain/entities/Company';
import { Email } from '@/core/domain/value-objects/Email';
import { Phone } from '@/core/domain/value-objects/Phone';
import { Address } from '@/core/domain/value-objects/Address';
import { Rating } from '@/core/domain/value-objects/Rating';
import { Money } from '@/core/domain/value-objects/Money';
import { Translation } from '@/core/domain/value-objects/Translation';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';
import { BaseMapper, MapperError, parseJSON, dateToISO, isoToDate, createSlug } from './base.mapper';

// ==================== Types ====================

/**
 * بيانات إنشاء الشركة من API
 */
export interface CompanyCreateDTO {
  name: string;
  slug?: string;
  description?: string;
  type: CompanyType;
  logo?: string;
  coverImage?: string;
  registrationNumber?: string;
  taxId?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  ownerIds: string[];
  settings?: Partial<CompanySettingsDTO>;
}

/**
 * بيانات تحديث الشركة من API
 */
export interface CompanyUpdateDTO {
  name?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  registrationNumber?: string;
  taxId?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  settings?: Partial<CompanySettingsDTO>;
  businessHours?: BusinessHoursDTO[];
}

/**
 * إعدادات الشركة DTO
 */
export interface CompanySettingsDTO {
  autoAcceptBookings: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  instantBooking: boolean;
  requireGuestVerification: boolean;
  minNoticeHours: number;
  maxAdvanceBookingDays: number;
  responseTimeTarget: number;
}

/**
 * ساعات العمل DTO
 */
export interface BusinessHoursDTO {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

/**
 * استجابة API للشركة
 */
export interface CompanyResponseDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CompanyType;
  logo: string | null;
  coverImage: string | null;
  gallery: string[];
  registrationNumber: string | null;
  taxId: string | null;
  legalName: string | null;
  contact: {
    email: string | null;
    phone: string | null;
    website: string | null;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  address: {
    country: string | null;
    city: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  status: CompanyStatus;
  verificationLevel: VerificationLevel;
  isVerified: boolean;
  rating: number | null;
  totalReviews: number;
  totalListings: number;
  totalBookings: number;
  ownerIds: string[];
  employeeCount: number;
  settings: CompanySettingsDTO;
  businessHours: BusinessHoursDTO[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للشركة (مختصرة)
 */
export interface CompanySummaryDTO {
  id: string;
  name: string;
  slug: string;
  type: CompanyType;
  logo: string | null;
  city: string | null;
  country: string | null;
  rating: number | null;
  totalReviews: number;
  isVerified: boolean;
}

// ==================== Prisma Types ====================

interface PrismaCompanyWithIncludes {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CompanyType;
  logo: string | null;
  coverImage: string | null;
  gallery: string | null;
  registrationNumber: string | null;
  taxId: string | null;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  socialMedia: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: CompanyStatus;
  verificationLevel: VerificationLevel;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  currency: string;
  ownerIds: string | null;
  employeeCount: number;
  settings: string | null;
  businessHours: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
  version: number;
}

// ==================== Mapper Class ====================

export class CompanyMapper extends BaseMapper<Company, CompanyResponseDTO, PrismaCompanyWithIncludes, CompanyCreateDTO, CompanyUpdateDTO> {

  // ==================== To Domain ====================

  /**
   * تحويل Prisma Company إلى Domain Entity
   */
  toDomain(prismaCompany: PrismaCompanyWithIncludes): Result<Company, MapperError> {
    try {
      // إنشاء Email Value Object
      let email: Email | null = null;
      if (prismaCompany.email) {
        const emailResult = Email.create(prismaCompany.email);
        if (emailResult.isSuccess) {
          email = emailResult.value;
        }
      }

      // إنشاء Phone Value Object
      let phone: Phone | null = null;
      if (prismaCompany.phone) {
        const phoneResult = Phone.create(prismaCompany.phone);
        if (phoneResult.isSuccess) {
          phone = phoneResult.value;
        }
      }

      // إنشاء Address Value Object
      let address: Address | null = null;
      if (prismaCompany.address || prismaCompany.latitude || prismaCompany.longitude) {
        const addressResult = Address.create({
          address: prismaCompany.address || undefined,
          city: prismaCompany.city || undefined,
          country: prismaCompany.country || undefined,
          latitude: prismaCompany.latitude || undefined,
          longitude: prismaCompany.longitude || undefined,
        });
        if (addressResult.isSuccess) {
          address = addressResult.value;
        }
      }

      // إنشاء Rating Value Object
      let rating: Rating | null = null;
      if (prismaCompany.ratingAverage !== null) {
        const ratingResult = Rating.create({
          value: prismaCompany.ratingAverage,
          count: prismaCompany.ratingCount,
        });
        if (ratingResult.isSuccess) {
          rating = ratingResult.value;
        }
      }

      // إنشاء Money Value Object
      const totalRevenueResult = Money.create({
        amount: prismaCompany.totalRevenue,
        currency: prismaCompany.currency as 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR',
      });
      const totalRevenue = totalRevenueResult.isSuccess ? totalRevenueResult.value : Money.zero('SYP');

      // إنشاء Description translation
      let description: Translation | null = null;
      if (prismaCompany.description) {
        const descResult = Translation.create({
          translations: { ar: prismaCompany.description },
        });
        if (descResult.isSuccess) {
          description = descResult.value;
        }
      }

      // Parse JSON fields
      const defaultSettings: CompanySettingsDTO = {
        autoAcceptBookings: false,
        requireDeposit: true,
        depositPercentage: 20,
        cancellationPolicy: 'moderate',
        instantBooking: false,
        requireGuestVerification: false,
        minNoticeHours: 24,
        maxAdvanceBookingDays: 365,
        responseTimeTarget: 24,
      };

      const settings = parseJSON<CompanySettingsDTO>(prismaCompany.settings, defaultSettings);
      const businessHours = parseJSON<BusinessHoursDTO[]>(prismaCompany.businessHours, []);
      const ownerIds = parseJSON<string[]>(prismaCompany.ownerIds, []);
      const gallery = parseJSON<string[]>(prismaCompany.gallery, []);
      const socialMedia = parseJSON<Record<string, string>>(prismaCompany.socialMedia, {});

      // إنشاء Company Props
      const props: CompanyProps = {
        id: new UniqueEntityId(prismaCompany.id),
        name: prismaCompany.name,
        slug: prismaCompany.slug,
        description,
        type: prismaCompany.type,
        logo: prismaCompany.logo,
        coverImage: prismaCompany.coverImage,
        gallery,
        registrationNumber: prismaCompany.registrationNumber,
        taxId: prismaCompany.taxId,
        legalName: prismaCompany.legalName,
        contact: {
          email,
          phone,
          website: prismaCompany.website,
          socialMedia,
        },
        address,
        country: prismaCompany.country,
        city: prismaCompany.city,
        coordinates: prismaCompany.latitude && prismaCompany.longitude
          ? { lat: prismaCompany.latitude, lng: prismaCompany.longitude }
          : null,
        status: prismaCompany.status,
        verificationLevel: prismaCompany.verificationLevel,
        verifiedAt: prismaCompany.verifiedAt,
        verifiedBy: prismaCompany.verifiedBy,
        rating,
        totalReviews: prismaCompany.ratingCount,
        totalListings: prismaCompany.totalListings,
        totalBookings: prismaCompany.totalBookings,
        totalRevenue,
        ownerIds,
        employeeCount: prismaCompany.employeeCount,
        settings: {
          autoAcceptBookings: settings.autoAcceptBookings ?? false,
          requireDeposit: settings.requireDeposit ?? true,
          depositPercentage: settings.depositPercentage ?? 20,
          cancellationPolicy: settings.cancellationPolicy ?? 'moderate',
          instantBooking: settings.instantBooking ?? false,
          requireGuestVerification: settings.requireGuestVerification ?? false,
          minNoticeHours: settings.minNoticeHours ?? 24,
          maxAdvanceBookingDays: settings.maxAdvanceBookingDays ?? 365,
          responseTimeTarget: settings.responseTimeTarget ?? 24,
        },
        businessHours: businessHours.map(h => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isOpen: h.isOpen,
        })),
        createdAt: prismaCompany.createdAt,
        updatedAt: prismaCompany.updatedAt,
        deletedAt: prismaCompany.deletedAt,
        deletedBy: prismaCompany.deletedBy,
        version: prismaCompany.version,
      };

      // إعادة بناء الـ Entity
      return ok(Company.reconstitute(props));
    } catch (error) {
      return err(MapperError.conversionFailed('PrismaCompany', 'Company', String(error)));
    }
  }

  // ==================== To Persistence ====================

  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  toPersistence(company: Company): Record<string, unknown> {
    return {
      id: company.idValue,
      name: company.name,
      slug: company.slug,
      description: company.getProps().description?.toString() || null,
      type: company.type,
      logo: company.getProps().logo,
      coverImage: company.getProps().coverImage,
      gallery: JSON.stringify(company.getProps().gallery),
      registrationNumber: company.getProps().registrationNumber,
      taxId: company.getProps().taxId,
      legalName: company.getProps().legalName,
      email: company.getProps().contact.email?.value || null,
      phone: company.getProps().contact.phone?.value || null,
      website: company.getProps().contact.website,
      socialMedia: JSON.stringify(company.getProps().contact.socialMedia || {}),
      country: company.getProps().country,
      city: company.getProps().city,
      address: company.getProps().address?.address || null,
      latitude: company.getProps().coordinates?.lat || null,
      longitude: company.getProps().coordinates?.lng || null,
      status: company.status,
      verificationLevel: company.verificationLevel,
      verifiedAt: company.getProps().verifiedAt,
      verifiedBy: company.getProps().verifiedBy,
      ratingAverage: company.rating?.value || null,
      ratingCount: company.getProps().totalReviews,
      totalListings: company.getProps().totalListings,
      totalBookings: company.getProps().totalBookings,
      totalRevenue: company.getProps().totalRevenue.amount,
      currency: company.getProps().totalRevenue.currency,
      ownerIds: JSON.stringify(company.ownerIds),
      employeeCount: company.getProps().employeeCount,
      settings: JSON.stringify(company.settings),
      businessHours: JSON.stringify(company.getProps().businessHours),
      version: company.version,
    };
  }

  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  createDTOToPersistence(dto: CompanyCreateDTO): Record<string, unknown> {
    const slug = dto.slug || createSlug(dto.name);

    const defaultSettings: CompanySettingsDTO = {
      autoAcceptBookings: false,
      requireDeposit: true,
      depositPercentage: 20,
      cancellationPolicy: 'moderate',
      instantBooking: false,
      requireGuestVerification: false,
      minNoticeHours: 24,
      maxAdvanceBookingDays: 365,
      responseTimeTarget: 24,
      ...dto.settings,
    };

    return {
      name: dto.name,
      slug,
      description: dto.description,
      type: dto.type,
      logo: dto.logo || null,
      coverImage: dto.coverImage || null,
      gallery: JSON.stringify([]),
      registrationNumber: dto.registrationNumber || null,
      taxId: dto.taxId || null,
      legalName: dto.legalName || null,
      email: dto.email || null,
      phone: dto.phone || null,
      website: null,
      socialMedia: JSON.stringify({}),
      country: dto.country || null,
      city: dto.city || null,
      address: dto.address || null,
      latitude: dto.latitude || null,
      longitude: dto.longitude || null,
      status: 'pending',
      verificationLevel: 'unverified',
      ratingAverage: null,
      ratingCount: 0,
      totalListings: 0,
      totalBookings: 0,
      totalRevenue: 0,
      currency: 'SYP',
      ownerIds: JSON.stringify(dto.ownerIds),
      employeeCount: 0,
      settings: JSON.stringify(defaultSettings),
      businessHours: JSON.stringify([]),
    };
  }

  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  updateDTOToPersistence(dto: CompanyUpdateDTO): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.logo !== undefined) data.logo = dto.logo;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.gallery !== undefined) data.gallery = JSON.stringify(dto.gallery);
    if (dto.registrationNumber !== undefined) data.registrationNumber = dto.registrationNumber;
    if (dto.taxId !== undefined) data.taxId = dto.taxId;
    if (dto.legalName !== undefined) data.legalName = dto.legalName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.settings !== undefined) data.settings = JSON.stringify(dto.settings);
    if (dto.businessHours !== undefined) data.businessHours = JSON.stringify(dto.businessHours);

    return data;
  }

  // ==================== To DTO ====================

  /**
   * تحويل Domain Entity إلى Response DTO
   */
  toDTO(company: Company): CompanyResponseDTO {
    return {
      id: company.idValue,
      name: company.name,
      slug: company.slug,
      description: company.getProps().description?.toString() || null,
      type: company.type,
      logo: company.getProps().logo,
      coverImage: company.getProps().coverImage,
      gallery: company.getProps().gallery,
      registrationNumber: company.getProps().registrationNumber,
      taxId: company.getProps().taxId,
      legalName: company.getProps().legalName,
      contact: {
        email: company.getProps().contact.email?.value || null,
        phone: company.getProps().contact.phone?.value || null,
        website: company.getProps().contact.website,
        socialMedia: company.getProps().contact.socialMedia,
      },
      address: company.getProps().address ? {
        country: company.getProps().country,
        city: company.getProps().city,
        address: company.getProps().address.address || null,
        latitude: company.getProps().address.latitude || null,
        longitude: company.getProps().address.longitude || null,
      } : null,
      status: company.status,
      verificationLevel: company.verificationLevel,
      isVerified: company.isVerified,
      rating: company.rating?.value || null,
      totalReviews: company.getProps().totalReviews,
      totalListings: company.getProps().totalListings,
      totalBookings: company.getProps().totalBookings,
      ownerIds: company.ownerIds,
      employeeCount: company.getProps().employeeCount,
      settings: company.settings as CompanySettingsDTO,
      businessHours: company.getProps().businessHours as BusinessHoursDTO[],
      createdAt: company.getProps().createdAt,
      updatedAt: company.getProps().updatedAt,
    };
  }

  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  toSummaryDTO(company: Company): CompanySummaryDTO {
    return {
      id: company.idValue,
      name: company.name,
      slug: company.slug,
      type: company.type,
      logo: company.getProps().logo,
      city: company.getProps().city,
      country: company.getProps().country,
      rating: company.rating?.value || null,
      totalReviews: company.getProps().totalReviews,
      isVerified: company.isVerified,
    };
  }

  /**
   * تحويل Prisma Company مباشرة إلى Response DTO
   */
  prismaToDTO(prismaCompany: PrismaCompanyWithIncludes): CompanyResponseDTO {
    const result = this.toDomain(prismaCompany);
    if (result.isFailure) {
      throw result.error;
    }
    return this.toDTO(result.value);
  }
}
