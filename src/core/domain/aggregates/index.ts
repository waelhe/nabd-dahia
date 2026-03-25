/**
 * @license
 * * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Aggregates - التجميعات
 * 
 * تجميعات الجذور هي المسؤولة عن الحفاظ على اتساق الكيانات المرتبطة
 * 
 * @module core/domain/aggregates
 */

import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { DomainError, DomainErrorCode } from '../errors';
import type { DomainEvent } from '../events/typed-events';

// ==================== Aggregate Root Interface ====================

/**
 * واجهة جذر التجميع
 */
export interface IAggregateRoot<T> {
  /**
   * المعرف الفريد
   */
  readonly id: UniqueEntityId;

  /**
   * الإصدار الحالي
   */
  readonly version: number;

  /**
   * الأحداث غير الملتزمة
   */
  readonly uncommittedEvents: DomainEvent[];

  /**
   * إضافة حدث
   */
  addEvent(event: DomainEvent): void;

  /**
   * مسح الأحداث بعد الالتزام
   */
  clearEvents(): void;

  /**
   * التحقق من الصحة
   */
  validate(): boolean;

  /**
   * التحقق من سلامة البيانات
   */
  checkInvariants(): boolean;

  /**
   * تحويل إلى كائن عادي
   */
  toObject(): T;
}

// ==================== Base Aggregate Root ====================

/**
 * جذر التجميع الأساسي
 */
export abstract class AggregateRoot<T> implements IAggregateRoot<T> {
  protected _events: DomainEvent[] = [];
  protected _version: number = 1;

  constructor(protected readonly _id: UniqueEntityId) {}

  get id(): UniqueEntityId {
    return this._id;
  }

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): DomainEvent[] {
    return [...this._events];
  }

  addEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  clearEvents(): void {
    this._events = [];
  }

  protected incrementVersion(): void {
    this._version++;
  }

  abstract validate(): boolean;
  abstract checkInvariants(): boolean;
  abstract toObject(): T;
}

// ==================== Booking Aggregate ====================

/**
 * بيانات الضيف للحجز
 */
export interface BookingGuestData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

/**
 * عنصر التجميع للحجز
 */
export interface BookingAggregateProps {
  listingId: UniqueEntityId;
  guestId: UniqueEntityId;
  hostId: UniqueEntityId;
  companyId?: UniqueEntityId;
  
  checkIn: Date;
  checkOut: Date;
  
  adultsCount: number;
  childrenCount?: number;
  infantsCount?: number;
  
  basePrice: number;
  cleaningFee?: number;
  serviceFee: number;
  taxes?: number;
  discounts?: number;
  totalPrice: number;
  currency: string;
  
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  completedAt?: Date;
  
  guests: BookingGuestData[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * حالة الحجز
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

/**
 * حالة الدفع
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * تجميع الحجز
 */
export class BookingAggregate extends AggregateRoot<BookingAggregateProps> {
  private _props: BookingAggregateProps;

  constructor(id: UniqueEntityId, props: Partial<BookingAggregateProps>) {
    super(id);
    this._props = {
      listingId: props.listingId!,
      guestId: props.guestId!,
      hostId: props.hostId!,
      companyId: props.companyId,
      checkIn: props.checkIn!,
      checkOut: props.checkOut!,
      adultsCount: props.adultsCount ?? 1,
      childrenCount: props.childrenCount,
      infantsCount: props.infantsCount,
      basePrice: props.basePrice ?? 0,
      cleaningFee: props.cleaningFee,
      serviceFee: props.serviceFee ?? 0,
      taxes: props.taxes,
      discounts: props.discounts,
      totalPrice: props.totalPrice ?? 0,
      currency: props.currency ?? 'SYP',
      status: props.status ?? BookingStatus.PENDING,
      paymentStatus: props.paymentStatus ?? PaymentStatus.PENDING,
      confirmedAt: props.confirmedAt,
      cancelledAt: props.cancelledAt,
      cancelledBy: props.cancelledBy,
      cancellationReason: props.cancellationReason,
      completedAt: props.completedAt,
      guests: props.guests ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  // ==================== Getters ====================

  get listingId(): UniqueEntityId {
    return this._props.listingId;
  }

  get guestId(): UniqueEntityId {
    return this._props.guestId;
  }

  get hostId(): UniqueEntityId {
    return this._props.hostId;
  }

  get status(): BookingStatus {
    return this._props.status;
  }

  get totalPrice(): number {
    return this._props.totalPrice;
  }

  get checkIn(): Date {
    return this._props.checkIn;
  }

  get checkOut(): Date {
    return this._props.checkOut;
  }

  // ==================== Business Methods ====================

  /**
   * تأكيد الحجز
   */
  confirm(): void {
    if (this._props.status !== BookingStatus.PENDING) {
      throw new DomainError(
        DomainErrorCode.INVALID_STATE,
        `Cannot confirm booking in '${this._props.status}' state`,
        { currentStatus: this._props.status }
      );
    }

    this._props.status = BookingStatus.CONFIRMED;
    this._props.confirmedAt = new Date();
    this.incrementVersion();
    
    this.addEvent({
      type: 'booking.confirmed',
      aggregateId: this._id.toString(),
      payload: {
        bookingId: this._id.toString(),
        listingId: this._props.listingId.toString(),
        guestId: this._props.guestId.toString(),
        hostId: this._props.hostId.toString(),
        checkIn: this._props.checkIn,
        checkOut: this._props.checkOut,
        totalPrice: this._props.totalPrice,
        currency: this._props.currency,
      },
      timestamp: new Date(),
    });
  }

  /**
   * إلغاء الحجز
   */
  cancel(cancelledBy: string, reason?: string): void {
    if (!this.canCancel()) {
      throw new DomainError(
        DomainErrorCode.BOOKING_CANNOT_CANCEL,
        `Cannot cancel booking in '${this._props.status}' state`,
        { currentStatus: this._props.status }
      );
    }

    this._props.status = BookingStatus.CANCELLED;
    this._props.cancelledAt = new Date();
    this._props.cancelledBy = cancelledBy;
    this._props.cancellationReason = reason;
    this.incrementVersion();
    
    this.addEvent({
      type: 'booking.cancelled',
      aggregateId: this._id.toString(),
      payload: {
        bookingId: this._id.toString(),
        listingId: this._props.listingId.toString(),
        guestId: this._props.guestId.toString(),
        hostId: this._props.hostId.toString(),
        cancelledBy,
        reason,
      },
      timestamp: new Date(),
    });
  }

  /**
   * تسجيل الوصول
   */
  checkInGuest(): void {
    if (this._props.status !== BookingStatus.CONFIRMED) {
      throw new DomainError(
        DomainErrorCode.INVALID_STATE,
        `Cannot check in booking in '${this._props.status}' state`,
        { currentStatus: this._props.status }
      );
    }

    this._props.status = BookingStatus.IN_PROGRESS;
    this.incrementVersion();
  }

  /**
   * تسجيل المغادرة
   */
  checkOutGuest(): void {
    if (this._props.status !== BookingStatus.IN_PROGRESS) {
      throw new DomainError(
        DomainErrorCode.INVALID_STATE,
        `Cannot check out booking in '${this._props.status}' state`,
        { currentStatus: this._props.status }
      );
    }

    this._props.status = BookingStatus.COMPLETED;
    this._props.completedAt = new Date();
    this.incrementVersion();
    
    this.addEvent({
      type: 'booking.completed',
      aggregateId: this._id.toString(),
      payload: {
        bookingId: this._id.toString(),
        listingId: this._props.listingId.toString(),
        guestId: this._props.guestId.toString(),
        hostId: this._props.hostId.toString(),
        totalPrice: this._props.totalPrice,
      },
      timestamp: new Date(),
    });
  }

  /**
   * التحقق من إمكانية الإلغاء
   */
  canCancel(): boolean {
    return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(this._props.status);
  }

  /**
   * تحديث حالة الدفع
   */
  updatePaymentStatus(status: PaymentStatus): void {
    this._props.paymentStatus = status;
    this.incrementVersion();
  }

  /**
   * إضافة ضيف
   */
  addGuest(guest: BookingGuestData): void {
    if (this._props.status !== BookingStatus.PENDING) {
      throw new DomainError(
        DomainErrorCode.INVALID_STATE,
        'Cannot add guests to a non-pending booking',
        { status: this._props.status }
      );
    }

    this._props.guests.push(guest);
    this.incrementVersion();
  }

  // ==================== Validation ====================

  validate(): boolean {
    const errors: string[] = [];

    if (!this._props.listingId) errors.push('Listing ID is required');
    if (!this._props.guestId) errors.push('Guest ID is required');
    if (!this._props.hostId) errors.push('Host ID is required');
    if (!this._props.checkIn) errors.push('Check-in date is required');
    if (!this._props.checkOut) errors.push('Check-out date is required');
    
    if (this._props.checkIn && this._props.checkOut && this._props.checkIn >= this._props.checkOut) {
      errors.push('Check-out must be after check-in');
    }

    if (this._props.totalPrice < 0) {
      errors.push('Total price must be non-negative');
    }

    return errors.length === 0;
  }

  checkInvariants(): boolean {
    // Invariant: Confirmed bookings must have payment
    if (this._props.status === BookingStatus.CONFIRMED) {
      if (this._props.paymentStatus === PaymentStatus.PENDING) {
        return false;
      }
    }

    // Invariant: Completed bookings must have been confirmed first
    if (this._props.status === BookingStatus.COMPLETED) {
      if (!this._props.confirmedAt) {
        return false;
      }
    }

    // Invariant: Cancelled bookings must have cancellation info
    if (this._props.status === BookingStatus.CANCELLED) {
      if (!this._props.cancelledAt || !this._props.cancelledBy) {
        return false;
      }
    }

    return true;
  }

  toObject(): BookingAggregateProps {
    return { ...this._props };
  }
}

// ==================== Payment Aggregate ====================

/**
 * بيانات الاسترداد
 */
export interface RefundData {
  id: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: Date;
}

/**
 * عنصر التجميع للدفع
 */
export interface PaymentAggregateProps {
  bookingId: UniqueEntityId;
  userId: UniqueEntityId;
  
  amount: number;
  currency: string;
  type: PaymentType;
  method: string;
  
  status: PaymentStatusType;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  refunds: RefundData[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * نوع الدفع
 */
export enum PaymentType {
  BOOKING_PAYMENT = 'booking_payment',
  DEPOSIT = 'deposit',
  SERVICE_FEE = 'service_fee',
  REFUND = 'refund',
}

/**
 * حالة نوع الدفع
 */
export enum PaymentStatusType {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * تجميع الدفع
 */
export class PaymentAggregate extends AggregateRoot<PaymentAggregateProps> {
  private _props: PaymentAggregateProps;

  constructor(id: UniqueEntityId, props: Partial<PaymentAggregateProps>) {
    super(id);
    this._props = {
      bookingId: props.bookingId!,
      userId: props.userId!,
      amount: props.amount ?? 0,
      currency: props.currency ?? 'SYP',
      type: props.type ?? PaymentType.BOOKING_PAYMENT,
      method: props.method ?? 'unknown',
      status: props.status ?? PaymentStatusType.PENDING,
      transactionId: props.transactionId,
      gatewayResponse: props.gatewayResponse,
      processedAt: props.processedAt,
      failedAt: props.failedAt,
      refundedAt: props.refundedAt,
      refunds: props.refunds ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  // ==================== Business Methods ====================

  /**
   * معالجة الدفع
   */
  process(transactionId: string, gatewayResponse?: Record<string, unknown>): void {
    if (this._props.status !== PaymentStatusType.PENDING) {
      throw new DomainError(
        DomainErrorCode.PAYMENT_ALREADY_PROCESSED,
        `Payment already processed (status: ${this._props.status})`,
        { status: this._props.status }
      );
    }

    this._props.status = PaymentStatusType.COMPLETED;
    this._props.transactionId = transactionId;
    this._props.gatewayResponse = gatewayResponse;
    this._props.processedAt = new Date();
    this.incrementVersion();
    
    this.addEvent({
      type: 'payment.success',
      aggregateId: this._id.toString(),
      payload: {
        paymentId: this._id.toString(),
        bookingId: this._props.bookingId.toString(),
        userId: this._props.userId.toString(),
        amount: this._props.amount,
        currency: this._props.currency,
        transactionId,
        paymentMethod: this._props.method,
      },
      timestamp: new Date(),
    });
  }

  /**
   * فشل الدفع
   */
  fail(reason: string): void {
    if (this._props.status === PaymentStatusType.COMPLETED) {
      throw new DomainError(
        DomainErrorCode.INVALID_STATE,
        'Cannot fail a completed payment',
        { status: this._props.status }
      );
    }

    this._props.status = PaymentStatusType.FAILED;
    this._props.failedAt = new Date();
    this._props.gatewayResponse = { reason };
    this.incrementVersion();
    
    this.addEvent({
      type: 'payment.failed',
      aggregateId: this._id.toString(),
      payload: {
        paymentId: this._id.toString(),
        bookingId: this._props.bookingId.toString(),
        userId: this._props.userId.toString(),
        amount: this._props.amount,
        currency: this._props.currency,
        reason,
        retryCount: 0,
      },
      timestamp: new Date(),
    });
  }

  /**
   * استرداد المبلغ
   */
  refund(amount: number, reason?: string): RefundData {
    if (this._props.status !== PaymentStatusType.COMPLETED) {
      throw new DomainError(
        DomainErrorCode.PAYMENT_CANNOT_REFUND,
        `Cannot refund payment in '${this._props.status}' status`,
        { status: this._props.status }
      );
    }

    const totalRefunded = this._props.refunds
      .filter(r => r.status === 'processed')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + amount > this._props.amount) {
      throw new DomainError(
        DomainErrorCode.PAYMENT_AMOUNT_INVALID,
        'Refund amount exceeds available amount',
        { requested: amount, available: this._props.amount - totalRefunded }
      );
    }

    const refund: RefundData = {
      id: UniqueEntityId.generate().toString(),
      amount,
      reason,
      status: 'pending',
    };

    this._props.refunds.push(refund);
    this.incrementVersion();

    return refund;
  }

  /**
   * معالجة الاسترداد
   */
  processRefund(refundId: string): void {
    const refund = this._props.refunds.find(r => r.id === refundId);
    if (!refund) {
      throw new DomainError(
        DomainErrorCode.NOT_FOUND,
        `Refund ${refundId} not found`,
        { refundId }
      );
    }

    refund.status = 'processed';
    refund.processedAt = new Date();

    const totalRefunded = this._props.refunds
      .filter(r => r.status === 'processed')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded >= this._props.amount) {
      this._props.status = PaymentStatusType.REFUNDED;
      this._props.refundedAt = new Date();
    }

    this.incrementVersion();
    
    this.addEvent({
      type: 'refund.processed',
      aggregateId: this._id.toString(),
      payload: {
        refundId,
        paymentId: this._id.toString(),
        bookingId: this._props.bookingId.toString(),
        userId: this._props.userId.toString(),
        amount: refund.amount,
        currency: this._props.currency,
        reason: refund.reason,
      },
      timestamp: new Date(),
    });
  }

  // ==================== Validation ====================

  validate(): boolean {
    const errors: string[] = [];

    if (!this._props.bookingId) errors.push('Booking ID is required');
    if (!this._props.userId) errors.push('User ID is required');
    if (this._props.amount < 0) errors.push('Amount must be non-negative');

    return errors.length === 0;
  }

  checkInvariants(): boolean {
    // Invariant: Refunded amount cannot exceed payment amount
    const totalRefunded = this._props.refunds
      .filter(r => r.status === 'processed')
      .reduce((sum, r) => sum + r.amount, 0);
    
    if (totalRefunded > this._props.amount) {
      return false;
    }

    return true;
  }

  toObject(): PaymentAggregateProps {
    return { ...this._props };
  }
}

// ==================== Listing Aggregate ====================

/**
 * بيانات الصورة
 */
export interface ListingImageData {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

/**
 * بيانات المرفق
 */
export interface ListingAmenityData {
  name: string;
  icon?: string;
  category?: string;
  included: boolean;
  price?: number;
}

/**
 * عنصر التجميع للإعلان
 */
export interface ListingAggregateProps {
  hostId: UniqueEntityId;
  companyId?: UniqueEntityId;
  
  title: string;
  slug: string;
  description?: string;
  
  type: ListingType;
  category?: string;
  
  country: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  basePrice: number;
  weekendPrice?: number;
  currency: string;
  cleaningFee?: number;
  
  capacity: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  
  minNights: number;
  maxNights: number;
  
  status: ListingStatus;
  featured: boolean;
  featuredUntil?: Date;
  
  ratingAverage?: number;
  ratingCount: number;
  bookingCount: number;
  viewCount: number;
  favoriteCount: number;
  
  images: ListingImageData[];
  amenities: ListingAmenityData[];
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * نوع الإعلان
 */
export enum ListingType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  HOTEL = 'hotel',
  RESORT = 'resort',
  CHALET = 'chalet',
  CAMP = 'camp',
  OTHER = 'other',
}

/**
 * حالة الإعلان
 */
export enum ListingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  SUSPENDED = 'suspended',
}

/**
 * تجميع الإعلان
 */
export class ListingAggregate extends AggregateRoot<ListingAggregateProps> {
  private _props: ListingAggregateProps;

  constructor(id: UniqueEntityId, props: Partial<ListingAggregateProps>) {
    super(id);
    this._props = {
      hostId: props.hostId!,
      companyId: props.companyId,
      title: props.title ?? '',
      slug: props.slug ?? '',
      description: props.description,
      type: props.type ?? ListingType.APARTMENT,
      category: props.category,
      country: props.country ?? '',
      city: props.city ?? '',
      address: props.address,
      latitude: props.latitude,
      longitude: props.longitude,
      basePrice: props.basePrice ?? 0,
      weekendPrice: props.weekendPrice,
      currency: props.currency ?? 'SYP',
      cleaningFee: props.cleaningFee,
      capacity: props.capacity ?? 1,
      bedrooms: props.bedrooms,
      beds: props.beds,
      bathrooms: props.bathrooms,
      minNights: props.minNights ?? 1,
      maxNights: props.maxNights ?? 365,
      status: props.status ?? ListingStatus.DRAFT,
      featured: props.featured ?? false,
      featuredUntil: props.featuredUntil,
      ratingAverage: props.ratingAverage,
      ratingCount: props.ratingCount ?? 0,
      bookingCount: props.bookingCount ?? 0,
      viewCount: props.viewCount ?? 0,
      favoriteCount: props.favoriteCount ?? 0,
      images: props.images ?? [],
      amenities: props.amenities ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt,
    };
  }

  // ==================== Business Methods ====================

  /**
   * نشر الإعلان
   */
  publish(): void {
    if (!this.canPublish()) {
      throw new DomainError(
        DomainErrorCode.LISTING_NOT_ACTIVE,
        'Cannot publish listing: missing required fields',
        { status: this._props.status }
      );
    }

    this._props.status = ListingStatus.ACTIVE;
    this.incrementVersion();
    
    this.addEvent({
      type: 'listing.published',
      aggregateId: this._id.toString(),
      payload: {
        listingId: this._id.toString(),
        hostId: this._props.hostId.toString(),
        title: this._props.title,
        city: this._props.city,
        country: this._props.country,
        price: this._props.basePrice,
        currency: this._props.currency,
      },
      timestamp: new Date(),
    });
  }

  /**
   * أرشفة الإعلان
   */
  archive(reason?: string): void {
    this._props.status = ListingStatus.ARCHIVED;
    this.incrementVersion();
    
    this.addEvent({
      type: 'listing.archived',
      aggregateId: this._id.toString(),
      payload: {
        listingId: this._id.toString(),
        hostId: this._props.hostId.toString(),
        reason,
        activeBookingsCount: 0,
      },
      timestamp: new Date(),
    });
  }

  /**
   * تعليق الإعلان
   */
  suspend(reason?: string): void {
    this._props.status = ListingStatus.SUSPENDED;
    this.incrementVersion();
  }

  /**
   * التحقق من إمكانية النشر
   */
  canPublish(): boolean {
    return (
      !!this._props.title &&
      !!this._props.description &&
      this._props.basePrice > 0 &&
      !!this._props.city &&
      this._props.images.length > 0
    );
  }

  /**
   * إضافة صورة
   */
  addImage(image: ListingImageData): void {
    if (image.isPrimary) {
      this._props.images.forEach(img => img.isPrimary = false);
    }
    this._props.images.push(image);
    this.incrementVersion();
  }

  /**
   * إضافة مرفق
   */
  addAmenity(amenity: ListingAmenityData): void {
    this._props.amenities.push(amenity);
    this.incrementVersion();
  }

  /**
   * تحديث التقييم
   */
  updateRating(average: number, count: number): void {
    this._props.ratingAverage = average;
    this._props.ratingCount = count;
    this.incrementVersion();
  }

  /**
   * زيادة عدد المشاهدات
   */
  incrementViewCount(): void {
    this._props.viewCount++;
    this.incrementVersion();
  }

  /**
   * زيادة عدد الحجوزات
   */
  incrementBookingCount(): void {
    this._props.bookingCount++;
    this.incrementVersion();
  }

  // ==================== Validation ====================

  validate(): boolean {
    const errors: string[] = [];

    if (!this._props.hostId) errors.push('Host ID is required');
    if (!this._props.title) errors.push('Title is required');
    if (this._props.basePrice < 0) errors.push('Base price must be non-negative');

    return errors.length === 0;
  }

  checkInvariants(): boolean {
    // Invariant: Active listings must have images
    if (this._props.status === ListingStatus.ACTIVE && this._props.images.length === 0) {
      return false;
    }

    return true;
  }

  toObject(): ListingAggregateProps {
    return { ...this._props };
  }
}

// ==================== Export All ====================

export const Aggregates = {
  BookingAggregate,
  PaymentAggregate,
  ListingAggregate,
};
