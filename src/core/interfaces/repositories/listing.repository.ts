/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listing Repository Interface
 * 
 * واجهة مستودع الإقامات والخدمات
 * 
 * @module core/interfaces/repositories/listing.repository
 */

import { IRepository, FindOptions, PaginatedResult, OperationResult, WriteOptions } from './base.repository';
import { Listing, ListingType, ListingStatus, ListingCategory } from '../../domain/entities/Listing';
import { UniqueEntityId } from '../../domain/value-objects/UniqueEntityId';

// ==================== Types ====================

export interface ListingFilter {
  hostId?: string;
  companyId?: string;
  type?: ListingType;
  category?: ListingCategory;
  status?: ListingStatus | ListingStatus[];
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  features?: {
    instantBook?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    partiesAllowed?: boolean;
  };
  dateRange?: {
    checkIn: Date;
    checkOut: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  search?: string;
  featured?: boolean;
}

export interface ListingCreateData {
  hostId: string;
  companyId?: string;
  title: string;
  description?: string;
  type: ListingType;
  category?: ListingCategory;
  address: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  capacity: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  size?: number;
  pricing: {
    basePrice: number;
    currency: string;
    cleaningFee?: number;
    securityDeposit?: number;
    weekendPrice?: number;
    seasonalPricing?: Array<{
      startDate: Date;
      endDate: Date;
      priceModifier: number;
    }>;
  };
  rules?: {
    minNights?: number;
    maxNights?: number;
    checkInTime?: string;
    checkOutTime?: string;
    instantBook?: boolean;
    houseRules?: string[];
    cancellationPolicy?: string;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    partiesAllowed?: boolean;
  };
  amenities?: Array<{
    name: string;
    icon?: string;
    category?: string;
    included?: boolean;
  }>;
  images?: Array<{
    url: string;
    caption?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
}

export interface ListingUpdateData {
  title?: string;
  description?: string;
  category?: ListingCategory;
  address?: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  size?: number;
  pricing?: {
    basePrice?: number;
    currency?: string;
    cleaningFee?: number;
    securityDeposit?: number;
    weekendPrice?: number;
    seasonalPricing?: Array<{
      startDate: Date;
      endDate: Date;
      priceModifier: number;
    }>;
  };
  rules?: {
    minNights?: number;
    maxNights?: number;
    checkInTime?: string;
    checkOutTime?: string;
    instantBook?: boolean;
    houseRules?: string[];
    cancellationPolicy?: string;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    partiesAllowed?: boolean;
  };
  amenities?: Array<{
    name: string;
    icon?: string;
    category?: string;
    included?: boolean;
  }>;
  images?: Array<{
    url: string;
    caption?: string;
    alt?: string;
    isPrimary?: boolean;
    order?: number;
  }>;
  status?: ListingStatus;
  featured?: boolean;
  featuredUntil?: Date;
}

export interface ListingSearchOptions extends FindOptions {
  filter: ListingFilter;
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface ListingAvailabilityData {
  date: Date;
  isAvailable: boolean;
  price?: number;
  minNights?: number;
  maxNights?: number;
  notes?: string;
}

// ==================== Interface ====================

export interface IListingRepository extends IRepository<Listing, UniqueEntityId> {
  // ==================== Query Methods ====================

  /**
   * البحث عن إقامة بالـ slug
   */
  findBySlug(slug: string): Promise<Listing | null>;

  /**
   * البحث عن إقامات المضيف
   */
  findByHostId(hostId: string, options?: FindOptions): Promise<PaginatedResult<Listing>>;

  /**
   * البحث عن إقامات الشركة
   */
  findByCompanyId(companyId: string, options?: FindOptions): Promise<PaginatedResult<Listing>>;

  /**
   * البحث المتقدم
   */
  search(options: ListingSearchOptions): Promise<PaginatedResult<Listing>>;

  /**
   * البحث بالإحداثيات
   */
  findByLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    options?: FindOptions
  ): Promise<PaginatedResult<Listing>>;

  /**
   * البحث عن الإقامات المتاحة
   */
  findAvailable(
    checkIn: Date,
    checkOut: Date,
    guests: number,
    filter?: ListingFilter
  ): Promise<PaginatedResult<Listing>>;

  /**
   * البحث عن الإقامات المميزة
   */
  findFeatured(options?: FindOptions): Promise<PaginatedResult<Listing>>;

  /**
   * البحث بالمرافق
   */
  findByAmenities(amenities: string[], options?: FindOptions): Promise<PaginatedResult<Listing>>;

  // ==================== Availability ====================

  /**
   * التحقق من التوفر
   */
  checkAvailability(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<boolean>;

  /**
   * الحصول على التوفر
   */
  getAvailability(
    listingId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ListingAvailabilityData[]>;

  /**
   * تحديث التوفر
   */
  updateAvailability(
    listingId: string,
    data: ListingAvailabilityData[]
  ): Promise<OperationResult>;

  /**
   * حجز فترة
   */
  blockDates(
    listingId: string,
    checkIn: Date,
    checkOut: Date,
    reason?: string
  ): Promise<OperationResult>;

  /**
   * إلغاء حجز فترة
   */
  unblockDates(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<OperationResult>;

  // ==================== Statistics ====================

  /**
   * تحديث التقييم
   */
  updateRating(
    listingId: string,
    ratingAverage: number,
    ratingCount: number
  ): Promise<OperationResult>;

  /**
   * تحديث عداد الحجوزات
   */
  incrementBookingCount(listingId: string): Promise<OperationResult>;

  /**
   * تحديث عداد المشاهدات
   */
  incrementViewCount(listingId: string): Promise<OperationResult>;

  /**
   * تحديث عداد المفضلة
   */
  updateFavoriteCount(listingId: string, increment: number): Promise<OperationResult>;

  // ==================== Bulk Operations ====================

  /**
   * تحديث حالة متعددة
   */
  updateStatus(
    listingIds: string[],
    status: ListingStatus
  ): Promise<OperationResult>;

  /**
   * تحديث الأسعار الموسمية
   */
  updateSeasonalPricing(
    listingId: string,
    seasonalPricing: Array<{
      startDate: Date;
      endDate: Date;
      priceModifier: number;
    }>
  ): Promise<OperationResult>;

  // ==================== Images ====================

  /**
   * إضافة صورة
   */
  addImage(
    listingId: string,
    image: {
      url: string;
      caption?: string;
      alt?: string;
      isPrimary?: boolean;
    }
  ): Promise<OperationResult>;

  /**
   * حذف صورة
   */
  removeImage(listingId: string, imageId: string): Promise<OperationResult>;

  /**
   * ترتيب الصور
   */
  reorderImages(
    listingId: string,
    imageOrders: Array<{ imageId: string; order: number }>
  ): Promise<OperationResult>;

  // ==================== Amenities ====================

  /**
   * إضافة مرفق
   */
  addAmenity(
    listingId: string,
    amenity: { name: string; icon?: string; category?: string; included?: boolean }
  ): Promise<OperationResult>;

  /**
   * إزالة مرفق
   */
  removeAmenity(listingId: string, amenityName: string): Promise<OperationResult>;

  // ==================== Translations ====================

  /**
   * إضافة ترجمة
   */
  addTranslation(
    listingId: string,
    language: string,
    data: { title?: string; description?: string; houseRules?: string }
  ): Promise<OperationResult>;

  /**
   * حذف ترجمة
   */
  removeTranslation(listingId: string, language: string): Promise<OperationResult>;
}
