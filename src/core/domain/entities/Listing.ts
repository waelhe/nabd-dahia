/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listing Entity - كيان الإقامة/الخدمة
 * 
 * يمثل الإقامة أو الخدمة السياحية في النظام.
 * يدعم أنواع متعددة: شقق، فنادق، جولات، خدمات طبية، إلخ.
 * 
 * @module core/domain/entities/Listing
 */

import { AggregateRoot, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Address } from '../value-objects/Address';
import { Money, Currency } from '../value-objects/Money';
import { Rating } from '../value-objects/Rating';
import { Translation } from '../value-objects/Translation';
import { DateRange } from '../value-objects/DateRange';
import type { Result, ValidationError, BusinessError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isNumber, isArray } from '../../types/guards';

// ==================== Types ====================

/**
 * نوع الإقامة
 */
export type ListingType = 
  | 'apartment' 
  | 'house' 
  | 'villa' 
  | 'hotel' 
  | 'hostel' 
  | 'resort'
  | 'chalet'
  | 'camping'
  | 'tour'
  | 'experience'
  | 'medical'
  | 'education'
  | 'business';

/**
 * فئة الإقامة
 */
export type ListingCategory = 'tourism' | 'medical' | 'education' | 'business' | 'other';

/**
 * حالة الإقامة
 */
export type ListingStatus = 'draft' | 'pending' | 'active' | 'suspended' | 'deleted';

/**
 * سياسة الإلغاء
 */
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'super_strict';

/**
 * قواعد المنزل
 */
export interface HouseRules {
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  childrenAllowed: boolean;
  quietHours?: { start: string; end: string };
  additionalRules: string[];
}

/**
 * تفاصيل الإقامة
 */
export interface ListingDetails {
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  size?: number; // بالمتر المربع
  floor?: number;
  hasElevator: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasKitchen: boolean;
  hasWasher: boolean;
  hasTv: boolean;
  hasPool: boolean;
  hasGym: boolean;
}

/**
 * معلومات الوصول
 */
export interface AccessInfo {
  checkInTime: string; // HH:mm
  checkOutTime: string; // HH:mm
  selfCheckIn: boolean;
  lockboxCode?: string;
  keyPickupInstructions?: string;
  directions?: string;
}

/**
 * التسعير الموسمي
 */
export interface SeasonalPricing {
  name: string;
  dateRange: DateRange;
  priceMultiplier: number;
  minNights?: number;
  maxNights?: number;
}

/**
 * خصائص الإقامة
 */
export interface ListingProps {
  id: UniqueEntityId | string;
  
  // المالك والشركة
  hostId: string;
  companyId: string | null;
  
  // المعلومات الأساسية
  title: string;
  slug: string;
  description: Translation | null;
  type: ListingType;
  category: ListingCategory | null;
  
  // الموقع
  address: Address | null;
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  coordinates: { lat: number; lng: number } | null;
  
  // التفاصيل
  details: ListingDetails;
  
  // الصور
  images: ListingImage[];
  
  // المرافق
  amenities: string[];
  
  // الأسعار
  basePrice: Money;
  cleaningFee: Money | null;
  securityDeposit: Money | null;
  weekendPriceMultiplier: number;
  seasonalPricing: SeasonalPricing[];
  
  // الشروط
  minNights: number;
  maxNights: number | null;
  instantBook: boolean;
  accessInfo: AccessInfo;
  
  // القواعد
  houseRules: HouseRules;
  cancellationPolicy: CancellationPolicy;
  
  // الحالة
  status: ListingStatus;
  publishedAt: Date | null;
  
  // الترويج
  featured: boolean;
  featuredUntil: Date | null;
  
  // التقييمات
  rating: Rating | null;
  totalReviews: number;
  
  // الإحصائيات
  viewCount: number;
  bookingCount: number;
  favoriteCount: number;
  
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
 * صورة الإقامة
 */
export interface ListingImage {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  order: number;
  isPrimary: boolean;
}

/**
 * إحصائيات الإقامة
 */
export interface ListingStats {
  totalViews: number;
  totalBookings: number;
  totalRevenue: Money;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  occupancyRate: number;
}

// ==================== Listing Errors ====================

export class ListingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ListingError';
  }

  static invalidTitle(title: string): ListingError {
    return new ListingError('INVALID_TITLE', `Invalid title: ${title}`, { title });
  }

  static invalidSlug(slug: string): ListingError {
    return new ListingError('INVALID_SLUG', `Invalid slug: ${slug}`, { slug });
  }

  static invalidPrice(price: number): ListingError {
    return new ListingError('INVALID_PRICE', `Invalid price: ${price}`, { price });
  }

  static cannotPublish(): ListingError {
    return new ListingError('CANNOT_PUBLISH', 'Listing must have at least one image and complete details');
  }

  static notAvailable(): ListingError {
    return new ListingError('NOT_AVAILABLE', 'Listing is not available for the selected dates');
  }

  static alreadyPublished(): ListingError {
    return new ListingError('ALREADY_PUBLISHED', 'Listing is already published');
  }

  static notFound(id: string): ListingError {
    return new ListingError('NOT_FOUND', `Listing not found: ${id}`, { id });
  }
}

// ==================== Listing Entity ====================

export class Listing extends AggregateRoot<ListingProps> {
  
  // ==================== Getters ====================
  
  get title(): string {
    return this.props.title;
  }
  
  get slug(): string {
    return this.props.slug;
  }
  
  get type(): ListingType {
    return this.props.type;
  }
  
  get status(): ListingStatus {
    return this.props.status;
  }
  
  get hostId(): string {
    return this.props.hostId;
  }
  
  get basePrice(): Money {
    return this.props.basePrice;
  }
  
  get rating(): Rating | null {
    return this.props.rating;
  }
  
  get isActive(): boolean {
    return this.props.status === 'active';
  }
  
  get isPublished(): boolean {
    return this.props.publishedAt !== null;
  }
  
  get isFeatured(): boolean {
    return this.props.featured && 
      (this.props.featuredUntil === null || this.props.featuredUntil > new Date());
  }
  
  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }
  
  get primaryImage(): ListingImage | null {
    return this.props.images.find(img => img.isPrimary) || this.props.images[0] || null;
  }
  
  get details(): ListingDetails {
    return { ...this.props.details };
  }
  
  get amenities(): string[] {
    return [...this.props.amenities];
  }
  
  // ==================== Business Methods ====================
  
  /**
   * تحديث المعلومات الأساسية
   */
  updateBasicInfo(data: {
    title?: string;
    description?: Translation;
    category?: ListingCategory;
  }): Result<void, ValidationError> {
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length < 5) {
        return err(new ValidationError('Title must be at least 5 characters', 'title'));
      }
      if (data.title.length > 100) {
        return err(new ValidationError('Title must be at most 100 characters', 'title'));
      }
      this.props.title = data.title;
    }
    
    if (data.description !== undefined) this.props.description = data.description;
    if (data.category !== undefined) this.props.category = data.category;
    
    this.incrementVersion();
    this.raiseEvent('listing.updated', { fields: Object.keys(data) });
    
    return ok(undefined);
  }
  
  /**
   * تحديث الموقع
   */
  updateLocation(data: {
    address?: Address;
    country?: string;
    city?: string;
    neighborhood?: string;
    coordinates?: { lat: number; lng: number } | null;
  }): void {
    if (data.address !== undefined) this.props.address = data.address;
    if (data.country !== undefined) this.props.country = data.country;
    if (data.city !== undefined) this.props.city = data.city;
    if (data.neighborhood !== undefined) this.props.neighborhood = data.neighborhood;
    if (data.coordinates !== undefined) this.props.coordinates = data.coordinates;
    
    this.incrementVersion();
    this.raiseEvent('listing.location_updated', {});
  }
  
  /**
   * تحديث التفاصيل
   */
  updateDetails(details: Partial<ListingDetails>): Result<void, ValidationError> {
    // التحقق من السعة
    if (details.capacity !== undefined && details.capacity < 1) {
      return err(new ValidationError('Capacity must be at least 1', 'capacity'));
    }
    
    // التحقق من غرف النوم
    if (details.bedrooms !== undefined && details.bedrooms < 0) {
      return err(new ValidationError('Bedrooms cannot be negative', 'bedrooms'));
    }
    
    this.props.details = {
      ...this.props.details,
      ...details,
    };
    
    this.incrementVersion();
    this.raiseEvent('listing.details_updated', {});
    
    return ok(undefined);
  }
  
  /**
   * تحديث الأسعار
   */
  updatePricing(data: {
    basePrice?: Money;
    cleaningFee?: Money | null;
    securityDeposit?: Money | null;
    weekendPriceMultiplier?: number;
  }): Result<void, ValidationError> {
    if (data.basePrice !== undefined) {
      if (data.basePrice.isNegative) {
        return err(new ValidationError('Base price cannot be negative', 'basePrice'));
      }
      this.props.basePrice = data.basePrice;
    }
    
    if (data.cleaningFee !== undefined) {
      if (data.cleaningFee && data.cleaningFee.isNegative) {
        return err(new ValidationError('Cleaning fee cannot be negative', 'cleaningFee'));
      }
      this.props.cleaningFee = data.cleaningFee;
    }
    
    if (data.securityDeposit !== undefined) {
      if (data.securityDeposit && data.securityDeposit.isNegative) {
        return err(new ValidationError('Security deposit cannot be negative', 'securityDeposit'));
      }
      this.props.securityDeposit = data.securityDeposit;
    }
    
    if (data.weekendPriceMultiplier !== undefined) {
      if (data.weekendPriceMultiplier < 0.5 || data.weekendPriceMultiplier > 3) {
        return err(new ValidationError('Weekend multiplier must be between 0.5 and 3', 'weekendPriceMultiplier'));
      }
      this.props.weekendPriceMultiplier = data.weekendPriceMultiplier;
    }
    
    this.incrementVersion();
    this.raiseEvent('listing.pricing_updated', {});
    
    return ok(undefined);
  }
  
  /**
   * إضافة صورة
   */
  addImage(image: Omit<ListingImage, 'id' | 'order'>): void {
    const newImage: ListingImage = {
      ...image,
      id: crypto.randomUUID(),
      order: this.props.images.length,
    };
    
    // إذا كانت الصورة رئيسية، أزل العلامة عن الصور الأخرى
    if (newImage.isPrimary) {
      this.props.images.forEach(img => img.isPrimary = false);
    }
    
    this.props.images.push(newImage);
    this.incrementVersion();
    this.raiseEvent('listing.image_added', { imageId: newImage.id });
  }
  
  /**
   * إزالة صورة
   */
  removeImage(imageId: string): Result<void, ListingError> {
    const index = this.props.images.findIndex(img => img.id === imageId);
    if (index === -1) {
      return err(new ListingError('IMAGE_NOT_FOUND', `Image not found: ${imageId}`));
    }
    
    const wasPrimary = this.props.images[index].isPrimary;
    this.props.images.splice(index, 1);
    
    // إذا كانت الصورة المحذوفة رئيسية، اجعل الأولى رئيسية
    if (wasPrimary && this.props.images.length > 0) {
      this.props.images[0].isPrimary = true;
    }
    
    // إعادة ترقيم الصور
    this.props.images.forEach((img, i) => img.order = i);
    
    this.incrementVersion();
    this.raiseEvent('listing.image_removed', { imageId });
    
    return ok(undefined);
  }
  
  /**
   * تحديد الصورة الرئيسية
   */
  setPrimaryImage(imageId: string): Result<void, ListingError> {
    const image = this.props.images.find(img => img.id === imageId);
    if (!image) {
      return err(new ListingError('IMAGE_NOT_FOUND', `Image not found: ${imageId}`));
    }
    
    this.props.images.forEach(img => img.isPrimary = false);
    image.isPrimary = true;
    
    this.incrementVersion();
    return ok(undefined);
  }
  
  /**
   * تحديث المرافق
   */
  updateAmenities(amenities: string[]): void {
    this.props.amenities = [...amenities];
    this.incrementVersion();
    this.raiseEvent('listing.amenities_updated', { count: amenities.length });
  }
  
  /**
   * تحديث قواعد المنزل
   */
  updateHouseRules(rules: Partial<HouseRules>): void {
    this.props.houseRules = {
      ...this.props.houseRules,
      ...rules,
    };
    this.incrementVersion();
    this.raiseEvent('listing.house_rules_updated', {});
  }
  
  /**
   * تحديث معلومات الوصول
   */
  updateAccessInfo(info: Partial<AccessInfo>): void {
    this.props.accessInfo = {
      ...this.props.accessInfo,
      ...info,
    };
    this.incrementVersion();
    this.raiseEvent('listing.access_info_updated', {});
  }
  
  /**
   * تحديث الشروط
   */
  updateTerms(data: {
    minNights?: number;
    maxNights?: number | null;
    instantBook?: boolean;
    cancellationPolicy?: CancellationPolicy;
  }): Result<void, ValidationError> {
    if (data.minNights !== undefined && data.minNights < 1) {
      return err(new ValidationError('Minimum nights must be at least 1', 'minNights'));
    }
    
    if (data.maxNights !== undefined && data.maxNights !== null && data.maxNights < 1) {
      return err(new ValidationError('Maximum nights must be at least 1', 'maxNights'));
    }
    
    if (data.minNights !== undefined) this.props.minNights = data.minNights;
    if (data.maxNights !== undefined) this.props.maxNights = data.maxNights;
    if (data.instantBook !== undefined) this.props.instantBook = data.instantBook;
    if (data.cancellationPolicy !== undefined) this.props.cancellationPolicy = data.cancellationPolicy;
    
    this.incrementVersion();
    this.raiseEvent('listing.terms_updated', {});
    
    return ok(undefined);
  }
  
  /**
   * نشر الإقامة
   */
  publish(): Result<void, ListingError> {
    // التحقق من الشروط
    if (this.props.status === 'active') {
      return err(ListingError.alreadyPublished());
    }
    
    if (this.props.images.length === 0) {
      return err(ListingError.cannotPublish());
    }
    
    if (!this.props.address || !this.props.city) {
      return err(ListingError.cannotPublish());
    }
    
    this.props.status = 'active';
    this.props.publishedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('listing.published', { title: this.props.title });
    
    return ok(undefined);
  }
  
  /**
   * إلغاء النشر
   */
  unpublish(): void {
    if (this.props.status === 'active') {
      this.props.status = 'suspended';
      this.incrementVersion();
      this.raiseEvent('listing.unpublished', {});
    }
  }
  
  /**
   * تعيين كمميز
   */
  feature(until: Date | null = null): void {
    this.props.featured = true;
    this.props.featuredUntil = until;
    this.incrementVersion();
    this.raiseEvent('listing.featured', { until });
  }
  
  /**
   * إزالة التمييز
   */
  unfeature(): void {
    this.props.featured = false;
    this.props.featuredUntil = null;
    this.incrementVersion();
    this.raiseEvent('listing.unfeatured', {});
  }
  
  /**
   * تحديث التقييم
   */
  updateRating(newRating: Rating): void {
    this.props.rating = newRating;
    this.props.totalReviews += 1;
    this.incrementVersion();
    this.raiseEvent('listing.rating_updated', { rating: newRating.value });
  }
  
  /**
   * زيادة عدد المشاهدات
   */
  incrementViews(): void {
    this.props.viewCount += 1;
  }
  
  /**
   * زيادة عدد الحجوزات
   */
  incrementBookings(): void {
    this.props.bookingCount += 1;
    this.incrementVersion();
  }
  
  /**
   * زيادة عدد المفضلة
   */
  incrementFavorites(): void {
    this.props.favoriteCount += 1;
  }
  
  /**
   * تقليل عدد المفضلة
   */
  decrementFavorites(): void {
    if (this.props.favoriteCount > 0) {
      this.props.favoriteCount -= 1;
    }
  }
  
  /**
   * التحقق من التوفر
   */
  isAvailableFor(checkIn: Date, checkOut: Date, guests: number): boolean {
    // التحقق من الحالة
    if (!this.isActive) return false;
    
    // التحقق من السعة
    if (guests > this.props.details.capacity) return false;
    
    // التحقق من عدد الليالي
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < this.props.minNights) return false;
    if (this.props.maxNights && nights > this.props.maxNights) return false;
    
    return true;
  }
  
  /**
   * حساب السعر للفترة
   */
  calculatePrice(checkIn: Date, checkOut: Date): Money {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    let total = this.props.basePrice;
    
    // تطبيق مضاعف نهاية الأسبوع إذا لزم الأمر
    const dayOfWeek = checkIn.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // الجمعة والسبت
      const multipliedResult = total.multiply(this.props.weekendPriceMultiplier);
      if (multipliedResult.isSuccess) {
        total = multipliedResult.value;
      }
    }
    
    // ضرب في عدد الليالي
    const nightsResult = total.multiply(nights);
    if (nightsResult.isSuccess) {
      total = nightsResult.value;
    }
    
    // إضافة رسوم التنظيف
    if (this.props.cleaningFee) {
      const addResult = total.add(this.props.cleaningFee);
      if (addResult.isSuccess) {
        total = addResult.value;
      }
    }
    
    return total;
  }
  
  /**
   * الحذف الناعم
   */
  softDelete(deletedBy: string): Result<void, ListingError> {
    if (this.props.deletedAt !== null) {
      return err(new ListingError('ALREADY_DELETED', 'Listing is already deleted'));
    }
    
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.status = 'deleted';
    this.incrementVersion();
    this.raiseEvent('listing.deleted', { deletedBy });
    
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
    this.raiseEvent('listing.restored', { restoredBy });
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء إقامة جديدة
   */
  static create(props: Omit<ListingProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deletedAt' | 'deletedBy' | 'publishedAt' | 'rating' | 'totalReviews' | 'viewCount' | 'bookingCount' | 'favoriteCount' | 'featured' | 'featuredUntil' | 'seasonalPricing'> & { id?: string }): Result<Listing, ValidationError | ListingError> {
    // التحقق من العنوان
    if (!props.title || props.title.trim().length < 5) {
      return err(new ValidationError('Title must be at least 5 characters', 'title'));
    }
    
    // التحقق من الـ slug
    if (!props.slug || !/^[a-z0-9-]+$/.test(props.slug)) {
      return err(new ValidationError('Slug must contain only lowercase letters, numbers, and hyphens', 'slug'));
    }
    
    // التحقق من السعر
    if (props.basePrice.isNegative) {
      return err(new ValidationError('Base price cannot be negative', 'basePrice'));
    }
    
    // التحقق من المضيف
    if (!props.hostId) {
      return err(new ValidationError('Host ID is required', 'hostId'));
    }
    
    const now = new Date();
    
    const listing = new Listing({
      ...props,
      id: props.id || new UniqueEntityId(),
      publishedAt: null,
      rating: null,
      totalReviews: 0,
      viewCount: 0,
      bookingCount: 0,
      favoriteCount: 0,
      featured: false,
      featuredUntil: null,
      seasonalPricing: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
      deletedBy: null,
    });
    
    listing.raiseEvent('listing.created', { title: props.title, hostId: props.hostId });
    
    return ok(listing);
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: ListingProps): Listing {
    return new Listing(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      hostId: this.props.hostId,
      companyId: this.props.companyId,
      title: this.props.title,
      slug: this.props.slug,
      description: this.props.description?.toJSON() || null,
      type: this.props.type,
      category: this.props.category,
      address: this.props.address?.toJSON() || null,
      country: this.props.country,
      city: this.props.city,
      neighborhood: this.props.neighborhood,
      coordinates: this.props.coordinates,
      details: this.props.details,
      images: this.props.images,
      amenities: this.props.amenities,
      basePrice: this.props.basePrice.toJSON(),
      cleaningFee: this.props.cleaningFee?.toJSON() || null,
      securityDeposit: this.props.securityDeposit?.toJSON() || null,
      minNights: this.props.minNights,
      maxNights: this.props.maxNights,
      instantBook: this.props.instantBook,
      accessInfo: this.props.accessInfo,
      houseRules: this.props.houseRules,
      cancellationPolicy: this.props.cancellationPolicy,
      status: this.props.status,
      publishedAt: this.props.publishedAt?.toISOString() || null,
      isPublished: this.isPublished,
      featured: this.props.featured,
      featuredUntil: this.props.featuredUntil?.toISOString() || null,
      rating: this.props.rating?.value || null,
      totalReviews: this.props.totalReviews,
      viewCount: this.props.viewCount,
      bookingCount: this.props.bookingCount,
      favoriteCount: this.props.favoriteCount,
      primaryImage: this.primaryImage,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      deletedAt: this.props.deletedAt?.toISOString() || null,
      version: this.version,
    };
  }
}
