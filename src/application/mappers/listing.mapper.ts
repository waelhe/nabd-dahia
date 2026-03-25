/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listing Mapper
 * 
 * مسئول عن التحويل بين:
 * - Domain Entity (Listing) ↔ Persistence Model (Prisma Listing)
 * - Domain Entity (Listing) ↔ DTO (API Response)
 * 
 * @module application/mappers/listing.mapper
 */

import { Listing, ListingProps, ListingError, ListingStatus } from '@/core/domain/entities/Listing';
import { Money } from '@/core/domain/value-objects/Money';
import { Address } from '@/core/domain/value-objects/Address';
import { Translation } from '@/core/domain/value-objects/Translation';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

/**
 * بيانات إنشاء الإقامة من API
 */
export interface ListingCreateDTO {
  hostId: string;
  companyId?: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  size?: number;
  basePrice: number;
  currency?: string;
  cleaningFee?: number;
  securityDeposit?: number;
  minNights?: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
  instantBook?: boolean;
  cancellationPolicy?: string;
  address: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
  };
  amenities?: string[];
  houseRules?: Record<string, unknown>;
  images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
}

/**
 * استجابة API للإقامة
 */
export interface ListingResponseDTO {
  id: string;
  hostId: string;
  companyId: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  category: string | null;
  capacity: number;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  size: number | null;
  basePrice: number;
  currency: string;
  cleaningFee: number | null;
  securityDeposit: number | null;
  minNights: number;
  maxNights: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  instantBook: boolean;
  cancellationPolicy: string;
  status: string;
  ratingAverage: number | null;
  ratingCount: number;
  viewCount: number;
  bookingCount: number;
  favoriteCount: number;
  featured: boolean;
  address: {
    country: string | null;
    city: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    neighborhood: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    caption: string | null;
    isPrimary: boolean;
  }>;
  amenities: Array<{
    id: string;
    name: string;
    icon: string | null;
    included: boolean;
  }>;
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    isSuperhost: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للإقامة (مختصرة)
 */
export interface ListingSummaryDTO {
  id: string;
  title: string;
  slug: string;
  type: string;
  city: string | null;
  country: string | null;
  basePrice: number;
  currency: string;
  ratingAverage: number | null;
  ratingCount: number;
  image: string | null;
  isFeatured: boolean;
}

// ==================== Prisma Types ====================

interface PrismaListingWithIncludes {
  id: string;
  hostId: string;
  companyId: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  category: string | null;
  capacity: number;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  size: number | null;
  basePrice: number;
  currency: string;
  cleaningFee: number | null;
  securityDeposit: number | null;
  weekendPrice: number | null;
  seasonalPricing: string | null;
  minNights: number;
  maxNights: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  instantBook: boolean;
  houseRules: string | null;
  cancellationPolicy: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  status: string;
  publishedAt: Date | null;
  featured: boolean;
  featuredUntil: Date | null;
  ratingAverage: number | null;
  ratingCount: number;
  viewCount: number;
  bookingCount: number;
  favoriteCount: number;
  country: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
  version: number;
  images?: Array<{
    id: string;
    url: string;
    caption: string | null;
    isPrimary: boolean;
    order: number;
  }>;
  amenities?: Array<{
    id: string;
    name: string;
    icon: string | null;
    included: boolean;
    category: string | null;
  }>;
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    isSuperhost: boolean;
  };
}

// ==================== Mapper Class ====================

export class ListingMapper {
  
  // ==================== To Domain ====================
  
  /**
   * تحويل Prisma Listing إلى Domain Entity
   */
  static toDomain(prismaListing: PrismaListingWithIncludes): Result<Listing, ListingError> {
    // إنشاء Address Value Object
    let address: Address | null = null;
    if (prismaListing.address || prismaListing.latitude || prismaListing.longitude) {
      const addressResult = Address.create({
        address: prismaListing.address || undefined,
        city: prismaListing.city || undefined,
        country: prismaListing.country || undefined,
        latitude: prismaListing.latitude || undefined,
        longitude: prismaListing.longitude || undefined,
      });
      if (addressResult.isSuccess) {
        address = addressResult.value;
      }
    }
    
    // إنشاء Money Value Objects
    const basePrice = Money.create({
      amount: prismaListing.basePrice,
      currency: prismaListing.currency as 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR',
    });
    
    const cleaningFee = prismaListing.cleaningFee 
      ? Money.create({ amount: prismaListing.cleaningFee, currency: prismaListing.currency as any })
      : null;
    
    const securityDeposit = prismaListing.securityDeposit
      ? Money.create({ amount: prismaListing.securityDeposit, currency: prismaListing.currency as any })
      : null;
    
    // إنشاء Description translation
    let description: Translation | null = null;
    if (prismaListing.description) {
      const descResult = Translation.create({
        translations: { ar: prismaListing.description },
      });
      if (descResult.isSuccess) {
        description = descResult.value;
      }
    }
    
    // إنشاء Title translation
    let title: Translation | null = null;
    const titleResult = Translation.create({
      translations: { ar: prismaListing.title },
    });
    if (titleResult.isSuccess) {
      title = titleResult.value;
    }
    
    // إنشاء House Rules
    let houseRules: Record<string, unknown> = {};
    if (prismaListing.houseRules) {
      try {
        houseRules = typeof prismaListing.houseRules === 'string'
          ? JSON.parse(prismaListing.houseRules)
          : prismaListing.houseRules;
      } catch {
        houseRules = {};
      }
    }
    
    // إنشاء Listing Props
    const props: ListingProps = {
      id: new UniqueEntityId(prismaListing.id),
      hostId: prismaListing.hostId,
      companyId: prismaListing.companyId,
      title,
      slug: prismaListing.slug,
      description,
      type: prismaListing.type as any,
      category: prismaListing.category,
      capacity: prismaListing.capacity,
      bedrooms: prismaListing.bedrooms,
      bathrooms: prismaListing.bathrooms,
      beds: prismaListing.beds,
      size: prismaListing.size,
      address,
      country: prismaListing.country,
      city: prismaListing.city,
      neighborhood: prismaListing.neighborhood,
      basePrice: basePrice.isSuccess ? basePrice.value : Money.zero('SYP'),
      currency: prismaListing.currency as any,
      cleaningFee: cleaningFee?.isSuccess ? cleaningFee.value : null,
      securityDeposit: securityDeposit?.isSuccess ? securityDeposit.value : null,
      minNights: prismaListing.minNights,
      maxNights: prismaListing.maxNights,
      checkInTime: prismaListing.checkInTime,
      checkOutTime: prismaListing.checkOutTime,
      instantBook: prismaListing.instantBook,
      houseRules,
      cancellationPolicy: prismaListing.cancellationPolicy as any,
      status: prismaListing.status as ListingStatus,
      ratingAverage: prismaListing.ratingAverage,
      ratingCount: prismaListing.ratingCount,
      viewCount: prismaListing.viewCount,
      bookingCount: prismaListing.bookingCount,
      favoriteCount: prismaListing.favoriteCount,
      featured: prismaListing.featured,
      publishedAt: prismaListing.publishedAt,
      images: prismaListing.images || [],
      amenities: prismaListing.amenities || [],
      createdAt: prismaListing.createdAt,
      updatedAt: prismaListing.updatedAt,
      deletedAt: prismaListing.deletedAt,
      deletedBy: prismaListing.deletedBy,
      version: prismaListing.version,
    };
    
    // إعادة بناء الـ Entity
    return ok(Listing.reconstitute(props));
  }
  
  /**
   * تحويل مجموعة Prisma Listings إلى Domain Entities
   */
  static toDomainMany(prismaListings: PrismaListingWithIncludes[]): Result<Listing[], ListingError> {
    const listings: Listing[] = [];
    
    for (const prismaListing of prismaListings) {
      const result = this.toDomain(prismaListing);
      if (result.isFailure) {
        return err(result.error);
      }
      listings.push(result.value);
    }
    
    return ok(listings);
  }
  
  // ==================== To Persistence ====================
  
  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  static toPersistence(listing: Listing): Record<string, unknown> {
    return {
      id: listing.idValue,
      hostId: listing.hostId,
      companyId: listing.getProps().companyId,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      capacity: listing.capacity,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      beds: listing.beds,
      size: listing.size,
      country: listing.country,
      city: listing.city,
      address: listing.address?.address || null,
      latitude: listing.address?.latitude || null,
      longitude: listing.address?.longitude || null,
      neighborhood: listing.neighborhood,
      basePrice: listing.basePrice.amount,
      currency: listing.currency,
      cleaningFee: listing.cleaningFee?.amount || null,
      securityDeposit: listing.securityDeposit?.amount || null,
      minNights: listing.minNights,
      maxNights: listing.maxNights,
      checkInTime: listing.checkInTime,
      checkOutTime: listing.checkOutTime,
      instantBook: listing.instantBook,
      houseRules: JSON.stringify(listing.houseRules),
      cancellationPolicy: listing.cancellationPolicy,
      status: listing.status,
      ratingAverage: listing.ratingAverage,
      ratingCount: listing.ratingCount,
      viewCount: listing.viewCount,
      bookingCount: listing.bookingCount,
      favoriteCount: listing.favoriteCount,
      featured: listing.featured,
      publishedAt: listing.publishedAt,
      version: listing.version,
    };
  }
  
  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  static createDTOToPersistence(dto: ListingCreateDTO): Record<string, unknown> {
    const slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' + Date.now().toString(36);
    
    return {
      hostId: dto.hostId,
      companyId: dto.companyId,
      title: dto.title,
      slug,
      description: dto.description,
      type: dto.type,
      category: dto.category,
      capacity: dto.capacity || 1,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      beds: dto.beds,
      size: dto.size,
      country: dto.address.country,
      city: dto.address.city,
      address: dto.address.address,
      latitude: dto.address.latitude,
      longitude: dto.address.longitude,
      neighborhood: dto.address.neighborhood,
      basePrice: dto.basePrice,
      currency: dto.currency || 'SYP',
      cleaningFee: dto.cleaningFee,
      securityDeposit: dto.securityDeposit,
      minNights: dto.minNights || 1,
      maxNights: dto.maxNights,
      checkInTime: dto.checkInTime || '14:00',
      checkOutTime: dto.checkOutTime || '12:00',
      instantBook: dto.instantBook || false,
      cancellationPolicy: dto.cancellationPolicy || 'moderate',
      houseRules: JSON.stringify(dto.houseRules || {}),
      status: 'draft',
    };
  }
  
  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  static updateDTOToPersistence(dto: Partial<ListingCreateDTO>): Record<string, unknown> {
    const updateData: Record<string, unknown> = {};
    
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
    if (dto.bedrooms !== undefined) updateData.bedrooms = dto.bedrooms;
    if (dto.bathrooms !== undefined) updateData.bathrooms = dto.bathrooms;
    if (dto.beds !== undefined) updateData.beds = dto.beds;
    if (dto.size !== undefined) updateData.size = dto.size;
    if (dto.basePrice !== undefined) updateData.basePrice = dto.basePrice;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.cleaningFee !== undefined) updateData.cleaningFee = dto.cleaningFee;
    if (dto.securityDeposit !== undefined) updateData.securityDeposit = dto.securityDeposit;
    if (dto.minNights !== undefined) updateData.minNights = dto.minNights;
    if (dto.maxNights !== undefined) updateData.maxNights = dto.maxNights;
    if (dto.checkInTime !== undefined) updateData.checkInTime = dto.checkInTime;
    if (dto.checkOutTime !== undefined) updateData.checkOutTime = dto.checkOutTime;
    if (dto.instantBook !== undefined) updateData.instantBook = dto.instantBook;
    if (dto.cancellationPolicy !== undefined) updateData.cancellationPolicy = dto.cancellationPolicy;
    if (dto.houseRules !== undefined) updateData.houseRules = JSON.stringify(dto.houseRules);
    
    // Address fields
    if (dto.address) {
      if (dto.address.country !== undefined) updateData.country = dto.address.country;
      if (dto.address.city !== undefined) updateData.city = dto.address.city;
      if (dto.address.address !== undefined) updateData.address = dto.address.address;
      if (dto.address.latitude !== undefined) updateData.latitude = dto.address.latitude;
      if (dto.address.longitude !== undefined) updateData.longitude = dto.address.longitude;
      if (dto.address.neighborhood !== undefined) updateData.neighborhood = dto.address.neighborhood;
    }
    
    return updateData;
  }
  
  // ==================== To DTO ====================
  
  /**
   * تحويل Domain Entity إلى Response DTO
   */
  static toDTO(listing: Listing): ListingResponseDTO {
    return {
      id: listing.idValue,
      hostId: listing.hostId,
      companyId: listing.companyId,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      capacity: listing.capacity,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      beds: listing.beds,
      size: listing.size,
      basePrice: listing.basePrice.amount,
      currency: listing.currency,
      cleaningFee: listing.cleaningFee?.amount || null,
      securityDeposit: listing.securityDeposit?.amount || null,
      minNights: listing.minNights,
      maxNights: listing.maxNights,
      checkInTime: listing.checkInTime,
      checkOutTime: listing.checkOutTime,
      instantBook: listing.instantBook,
      cancellationPolicy: listing.cancellationPolicy,
      status: listing.status,
      ratingAverage: listing.ratingAverage,
      ratingCount: listing.ratingCount,
      viewCount: listing.viewCount,
      bookingCount: listing.bookingCount,
      favoriteCount: listing.favoriteCount,
      featured: listing.featured,
      address: {
        country: listing.country,
        city: listing.city,
        address: listing.address?.address || null,
        latitude: listing.address?.latitude || null,
        longitude: listing.address?.longitude || null,
        neighborhood: listing.neighborhood,
      },
      images: (listing.images || []).map(img => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        isPrimary: img.isPrimary,
      })),
      amenities: (listing.amenities || []).map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        included: a.included,
      })),
      host: listing.host ? {
        id: listing.host.id,
        firstName: listing.host.firstName,
        lastName: listing.host.lastName,
        avatar: listing.host.avatar,
        isSuperhost: listing.host.isSuperhost,
      } : undefined,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
  
  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  static toSummaryDTO(listing: Listing): ListingSummaryDTO {
    const primaryImage = listing.images?.find(img => img.isPrimary) || listing.images?.[0];
    
    return {
      id: listing.idValue,
      title: listing.title,
      slug: listing.slug,
      type: listing.type,
      city: listing.city,
      country: listing.country,
      basePrice: listing.basePrice.amount,
      currency: listing.currency,
      ratingAverage: listing.ratingAverage,
      ratingCount: listing.ratingCount,
      image: primaryImage?.url || null,
      isFeatured: listing.featured,
    };
  }
  
  /**
   * تحويل مجموعة Domain Entities إلى Response DTOs
   */
  static toDTOs(listings: Listing[]): ListingResponseDTO[] {
    return listings.map(listing => this.toDTO(listing));
  }
  
  /**
   * تحويل Prisma Listing مباشرة إلى Response DTO
   */
  static prismaToDTO(prismaListing: PrismaListingWithIncludes): ListingResponseDTO {
    return {
      id: prismaListing.id,
      hostId: prismaListing.hostId,
      companyId: prismaListing.companyId,
      title: prismaListing.title,
      slug: prismaListing.slug,
      description: prismaListing.description,
      type: prismaListing.type,
      category: prismaListing.category,
      capacity: prismaListing.capacity,
      bedrooms: prismaListing.bedrooms,
      bathrooms: prismaListing.bathrooms,
      beds: prismaListing.beds,
      size: prismaListing.size,
      basePrice: prismaListing.basePrice,
      currency: prismaListing.currency,
      cleaningFee: prismaListing.cleaningFee,
      securityDeposit: prismaListing.securityDeposit,
      minNights: prismaListing.minNights,
      maxNights: prismaListing.maxNights,
      checkInTime: prismaListing.checkInTime,
      checkOutTime: prismaListing.checkOutTime,
      instantBook: prismaListing.instantBook,
      cancellationPolicy: prismaListing.cancellationPolicy,
      status: prismaListing.status,
      ratingAverage: prismaListing.ratingAverage,
      ratingCount: prismaListing.ratingCount,
      viewCount: prismaListing.viewCount,
      bookingCount: prismaListing.bookingCount,
      favoriteCount: prismaListing.favoriteCount,
      featured: prismaListing.featured,
      address: {
        country: prismaListing.country,
        city: prismaListing.city,
        address: prismaListing.address,
        latitude: prismaListing.latitude,
        longitude: prismaListing.longitude,
        neighborhood: prismaListing.neighborhood,
      },
      images: (prismaListing.images || []).map(img => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        isPrimary: img.isPrimary,
      })),
      amenities: (prismaListing.amenities || []).map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        included: a.included,
      })),
      host: prismaListing.host ? {
        id: prismaListing.host.id,
        firstName: prismaListing.host.firstName,
        lastName: prismaListing.host.lastName,
        avatar: prismaListing.host.avatar,
        isSuperhost: prismaListing.host.isSuperhost,
      } : undefined,
      createdAt: prismaListing.createdAt,
      updatedAt: prismaListing.updatedAt,
    };
  }
}
