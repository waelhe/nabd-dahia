/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking Repository Interface - واجهة مستودع الحجوزات
 * 
 * @module core/interfaces/repositories/booking.repository
 */

import type { Result } from '../../types/result';
import type { PaginatedResult, PaginationOptions, SearchCriteria } from './base.repository';

// ==================== Types ====================

/**
 * الحجز مع العلاقات
 */
export interface BookingWithRelations {
  id: string;
  guestId: string;
  hostId: string;
  listingId: string;
  companyId?: string | null;
  
  // التواريخ
  checkIn: Date;
  checkOut: Date;
  checkInActual?: Date | null;
  checkOutActual?: Date | null;
  
  // الضيوف
  guests: number;
  adults: number;
  children: number;
  infants: number;
  
  // الأسعار
  basePrice: number;
  cleaningFee?: number | null;
  serviceFee: number;
  taxes: number;
  discount: number;
  totalPrice: number;
  currency: string;
  
  // الحالة
  status: string;
  paymentStatus: string;
  
  // العلاقات
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  listing?: {
    id: string;
    title: string;
    type: string;
    city?: string | null;
    country?: string | null;
    images: { url: string }[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * بيانات إنشاء الحجز
 */
export interface CreateBookingData {
  guestId: string;
  hostId: string;
  listingId: string;
  companyId?: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  adults?: number;
  children?: number;
  infants?: number;
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  discount?: number;
  totalPrice: number;
  currency?: string;
  guestNotes?: string;
  specialRequests?: string;
}

/**
 * بيانات تحديث الحجز
 */
export interface UpdateBookingData {
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  adults?: number;
  children?: number;
  infants?: number;
  guestNotes?: string;
  hostNotes?: string;
  specialRequests?: string;
}

/**
 * فلاتر الحجز
 */
export interface BookingFilter {
  id?: string;
  guestId?: string;
  hostId?: string;
  listingId?: string;
  companyId?: string;
  status?: string | string[];
  paymentStatus?: string | string[];
  checkInAfter?: Date;
  checkInBefore?: Date;
  checkOutAfter?: Date;
  checkOutBefore?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * معايير البحث للحجز
 */
export interface BookingSearchCriteria extends SearchCriteria<BookingFilter> {
  where?: BookingFilter;
}

/**
 * إحصائيات الحجوزات
 */
export interface BookingStats {
  total: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  totalRevenue: number;
  averageBookingValue: number;
  averageNights: number;
  occupancyRate: number;
  cancellations: number;
  completed: number;
  upcoming: number;
}

/**
 * التحقق من التوفر
 */
export interface AvailabilityCheck {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests?: number;
}

/**
 * نتيجة التحقق من التوفر
 */
export interface AvailabilityResult {
  available: boolean;
  conflictingBookings?: string[];
  pricePerNight?: number;
  totalPrice?: number;
  minNights?: number;
  maxNights?: number;
  reason?: string;
}

// ==================== Repository Interface ====================

/**
 * واجهة مستودع الحجوزات
 */
export interface IBookingRepository {
  // ==================== Create ====================

  /**
   * إنشاء حجز جديد
   */
  create(data: CreateBookingData): Promise<Result<BookingWithRelations, Error>>;

  // ==================== Read ====================

  /**
   * البحث بالمعرف
   */
  findById(id: string): Promise<Result<BookingWithRelations, Error>>;

  /**
   * البحث بالمعرف أو null
   */
  findByIdOrNull(id: string): Promise<BookingWithRelations | null>;

  /**
   * البحث بمعايير
   */
  findMany(criteria: BookingSearchCriteria): Promise<BookingWithRelations[]>;

  /**
   * البحث مع التصفح
   */
  findPaginated(options: PaginationOptions, criteria?: BookingSearchCriteria): Promise<PaginatedResult<BookingWithRelations>>;

  /**
   * حجوزات الضيف
   */
  findByGuestId(guestId: string, options?: PaginationOptions): Promise<PaginatedResult<BookingWithRelations>>;

  /**
   * حجوزات المضيف
   */
  findByHostId(hostId: string, options?: PaginationOptions): Promise<PaginatedResult<BookingWithRelations>>;

  /**
   * حجوزات الإقامة
   */
  findByListingId(listingId: string, options?: PaginationOptions): Promise<PaginatedResult<BookingWithRelations>>;

  /**
   * الحجوزات المتعارضة
   */
  findConflicting(listingId: string, checkIn: Date, checkOut: Date, excludeId?: string): Promise<BookingWithRelations[]>;

  // ==================== Update ====================

  /**
   * تحديث حجز
   */
  update(id: string, data: UpdateBookingData): Promise<Result<BookingWithRelations, Error>>;

  /**
   * تحديث الحالة
   */
  updateStatus(id: string, status: string, metadata?: { cancelledBy?: string; reason?: string }): Promise<Result<void, Error>>;

  /**
   * تأكيد الحجز
   */
  confirm(id: string): Promise<Result<void, Error>>;

  /**
   * إلغاء الحجز
   */
  cancel(id: string, cancelledBy: string, reason?: string): Promise<Result<void, Error>>;

  /**
   * رفض الحجز
   */
  reject(id: string, reason?: string): Promise<Result<void, Error>>;

  /**
   * إكمال الحجز
   */
  complete(id: string): Promise<Result<void, Error>>;

  /**
   * تسجيل الوصول الفعلي
   */
  checkInActual(id: string): Promise<Result<void, Error>>;

  /**
   * تسجيل المغادرة الفعلية
   */
  checkOutActual(id: string): Promise<Result<void, Error>>;

  // ==================== Availability ====================

  /**
   * التحقق من التوفر
   */
  checkAvailability(check: AvailabilityCheck): Promise<AvailabilityResult>;

  /**
   * الأيام المحجوزة
   */
  getBookedDays(listingId: string, from: Date, to: Date): Promise<Date[]>;

  /**
   * الأيام المتاحة
   */
  getAvailableDays(listingId: string, from: Date, to: Date): Promise<Date[]>;

  // ==================== Stats ====================

  /**
   * إحصائيات الحجوزات
   */
  getStats(filter?: { hostId?: string; listingId?: string; from?: Date; to?: Date }): Promise<BookingStats>;

  /**
   * عدد الحجوزات
   */
  count(criteria?: BookingSearchCriteria): Promise<number>;

  /**
   * إجمالي الإيرادات
   */
  getTotalRevenue(filter?: { hostId?: string; listingId?: string; from?: Date; to?: Date }): Promise<number>;

  // ==================== Calendar ====================

  /**
   * تقويم الحجوزات
   */
  getCalendar(listingId: string, month: number, year: number): Promise<{
    date: Date;
    status: 'available' | 'booked' | 'blocked';
    bookingId?: string;
    price?: number;
  }[]>;
}
