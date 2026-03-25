/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking Entity - كيان الحجز
 * 
 * يمثل حجز إقامة أو خدمة في النظام.
 * يدعم Result Pattern للعمليات الآمنة.
 * 
 * @module core/domain/entities/Booking
 */

import { AggregateRoot, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Money, Currency } from '../value-objects/Money';
import type { Result, ValidationError, BusinessError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isNumber } from '../../types/guards';

// ==================== Types ====================

/**
 * حالة الحجز
 */
export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'rejected' 
  | 'in_progress' 
  | 'completed' 
  | 'no_show';

/**
 * حالة الدفع
 */
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'paid' 
  | 'partially_paid' 
  | 'refunded' 
  | 'failed';

/**
 * مصدر الحجز
 */
export type BookingSource = 'website' | 'mobile_app' | 'api' | 'admin' | 'agent';

/**
 * ضيف الحجز
 */
export interface BookingGuest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  idType?: 'passport' | 'national_id' | 'driver_license';
  idNumber?: string;
  dateOfBirth?: Date;
  nationality?: string;
}

/**
 * معلومات الدفع
 */
export interface PaymentInfo {
  amount: Money;
  status: PaymentStatus;
  paidAt: Date | null;
  paymentMethod: string | null;
  transactionId: string | null;
}

/**
 * معلومات الإلغاء
 */
export interface CancellationInfo {
  cancelledAt: Date | null;
  cancelledBy: string | null;
  reason: string | null;
  refundAmount: Money | null;
  refundPercentage: number;
}

/**
 * خصائص الحجز
 */
export interface BookingProps {
  id: UniqueEntityId | string;
  
  // الأطراف
  guestId: string;
  hostId: string;
  listingId: string;
  companyId: string | null;
  
  // التواريخ
  checkIn: Date;
  checkOut: Date;
  checkInActual: Date | null;
  checkOutActual: Date | null;
  
  // الضيوف
  guests: number;
  adults: number;
  children: number;
  infants: number;
  guestDetails: BookingGuest[];
  
  // الأسعار
  basePrice: Money;
  cleaningFee: Money;
  serviceFee: Money;
  taxes: Money;
  discount: Money;
  totalPrice: Money;
  currency: Currency;
  
  // الدفع
  payment: PaymentInfo;
  
  // الحالة
  status: BookingStatus;
  source: BookingSource;
  
  // الإلغاء
  cancellation: CancellationInfo;
  
  // الملاحظات
  guestNotes: string | null;
  hostNotes: string | null;
  specialRequests: string | null;
  
  // التواريخ
  confirmedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // الإصدار
  version: number;
}

/**
 * إحصائيات الحجز
 */
export interface BookingStats {
  totalNights: number;
  pricePerNight: Money;
  totalGuests: number;
  hasChildren: boolean;
  hasInfants: boolean;
}

// ==================== Booking Errors ====================

export class BookingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BookingError';
  }

  static invalidDates(checkIn: Date, checkOut: Date): BookingError {
    return new BookingError('INVALID_DATES', 'Check-out must be after check-in', { checkIn, checkOut });
  }

  static tooManyGuests(capacity: number, requested: number): BookingError {
    return new BookingError('TOO_MANY_GUESTS', `Maximum capacity is ${capacity}, requested ${requested}`, { capacity, requested });
  }

  static alreadyConfirmed(): BookingError {
    return new BookingError('ALREADY_CONFIRMED', 'Booking is already confirmed');
  }

  static alreadyCancelled(): BookingError {
    return new BookingError('ALREADY_CANCELLED', 'Booking is already cancelled');
  }

  static cannotCancel(): BookingError {
    return new BookingError('CANNOT_CANCEL', 'Booking cannot be cancelled at this stage');
  }

  static notConfirmed(): BookingError {
    return new BookingError('NOT_CONFIRMED', 'Booking must be confirmed first');
  }

  static paymentRequired(): BookingError {
    return new BookingError('PAYMENT_REQUIRED', 'Payment is required before confirmation');
  }

  static pastBooking(): BookingError {
    return new BookingError('PAST_BOOKING', 'Cannot modify past bookings');
  }
}

// ==================== Booking Entity ====================

export class Booking extends AggregateRoot<BookingProps> {
  
  // ==================== Getters ====================
  
  get guestId(): string {
    return this.props.guestId;
  }
  
  get hostId(): string {
    return this.props.hostId;
  }
  
  get listingId(): string {
    return this.props.listingId;
  }
  
  get checkIn(): Date {
    return this.props.checkIn;
  }
  
  get checkOut(): Date {
    return this.props.checkOut;
  }
  
  get status(): BookingStatus {
    return this.props.status;
  }
  
  get paymentStatus(): PaymentStatus {
    return this.props.payment.status;
  }
  
  get totalPrice(): Money {
    return this.props.totalPrice;
  }
  
  get nights(): number {
    return Math.ceil((this.props.checkOut.getTime() - this.props.checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  get isActive(): boolean {
    return ['pending', 'confirmed', 'in_progress'].includes(this.props.status);
  }
  
  get isPast(): boolean {
    return this.props.checkOut < new Date();
  }
  
  get isUpcoming(): boolean {
    return this.props.checkIn > new Date();
  }
  
  get isOngoing(): boolean {
    const now = new Date();
    return this.props.checkIn <= now && this.props.checkOut > now;
  }
  
  get canBeCancelled(): boolean {
    // يمكن الإلغاء إذا كان الحجز مؤكد أو معلق ولم يبدأ بعد
    return ['pending', 'confirmed'].includes(this.props.status) && 
           this.props.checkIn > new Date();
  }
  
  get canBeConfirmed(): boolean {
    return this.props.status === 'pending' && 
           (this.props.payment.status === 'paid' || this.props.payment.status === 'partially_paid');
  }
  
  get canBeRejected(): boolean {
    return this.props.status === 'pending';
  }
  
  // ==================== Business Methods ====================
  
  /**
   * حساب عدد الليالي
   */
  calculateNights(): number {
    return this.nights;
  }
  
  /**
   * تحديث الضيوف
   */
  updateGuests(data: {
    guests?: number;
    adults?: number;
    children?: number;
    infants?: number;
  }): Result<void, ValidationError> {
    const totalGuests = (data.adults ?? this.props.adults) + 
                        (data.children ?? this.props.children);
    
    if (totalGuests < 1) {
      return err(new ValidationError('At least one guest is required', 'guests'));
    }
    
    if (data.guests !== undefined) this.props.guests = data.guests;
    if (data.adults !== undefined) this.props.adults = data.adults;
    if (data.children !== undefined) this.props.children = data.children;
    if (data.infants !== undefined) this.props.infants = data.infants;
    
    this.incrementVersion();
    this.raiseEvent('booking.guests_updated', data);
    
    return ok(undefined);
  }
  
  /**
   * إضافة ضيف
   */
  addGuest(guest: Omit<BookingGuest, 'id'>): void {
    this.props.guestDetails.push({
      ...guest,
      id: crypto.randomUUID(),
    });
    this.incrementVersion();
    this.raiseEvent('booking.guest_added', { guestId: guest.email || guest.phone });
  }
  
  /**
   * تحديث ضيف
   */
  updateGuest(guestId: string, data: Partial<BookingGuest>): Result<void, BookingError> {
    const guest = this.props.guestDetails.find(g => g.id === guestId);
    if (!guest) {
      return err(new BookingError('GUEST_NOT_FOUND', `Guest not found: ${guestId}`));
    }
    
    Object.assign(guest, data);
    this.incrementVersion();
    this.raiseEvent('booking.guest_updated', { guestId });
    
    return ok(undefined);
  }
  
  /**
   * تحديث الملاحظات
   */
  updateNotes(data: {
    guestNotes?: string;
    hostNotes?: string;
    specialRequests?: string;
  }): void {
    if (data.guestNotes !== undefined) this.props.guestNotes = data.guestNotes;
    if (data.hostNotes !== undefined) this.props.hostNotes = data.hostNotes;
    if (data.specialRequests !== undefined) this.props.specialRequests = data.specialRequests;
    
    this.incrementVersion();
  }
  
  /**
   * تأكيد الحجز
   */
  confirm(): Result<void, BookingError> {
    if (this.props.status === 'confirmed') {
      return err(BookingError.alreadyConfirmed());
    }
    
    if (this.props.status !== 'pending') {
      return err(new BookingError('INVALID_STATUS', 'Only pending bookings can be confirmed'));
    }
    
    if (this.props.payment.status !== 'paid' && this.props.payment.status !== 'partially_paid') {
      return err(BookingError.paymentRequired());
    }
    
    this.props.status = 'confirmed';
    this.props.confirmedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('booking.confirmed', { 
      guestId: this.props.guestId,
      listingId: this.props.listingId,
    });
    
    return ok(undefined);
  }
  
  /**
   * رفض الحجز
   */
  reject(reason?: string): Result<void, BookingError> {
    if (!this.canBeRejected) {
      return err(new BookingError('CANNOT_REJECT', 'Booking cannot be rejected at this stage'));
    }
    
    this.props.status = 'rejected';
    this.props.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: this.props.hostId,
      reason: reason || 'Rejected by host',
      refundAmount: this.props.payment.amount,
      refundPercentage: 100,
    };
    
    this.incrementVersion();
    this.raiseEvent('booking.rejected', { reason });
    
    return ok(undefined);
  }
  
  /**
   * إلغاء الحجز من قبل الضيف
   */
  cancelByGuest(reason?: string): Result<void, BookingError> {
    if (!this.canBeCancelled) {
      return err(BookingError.cannotCancel());
    }
    
    const refundPercentage = this.calculateRefundPercentage();
    const refundResult = this.props.payment.amount.multiply(refundPercentage / 100);
    const refundAmount = refundResult.isSuccess ? refundResult.value : Money.zero(this.props.currency);
    
    this.props.status = 'cancelled';
    this.props.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: this.props.guestId,
      reason: reason || 'Cancelled by guest',
      refundAmount,
      refundPercentage,
    };
    
    this.incrementVersion();
    this.raiseEvent('booking.cancelled', { 
      cancelledBy: 'guest',
      reason,
      refundPercentage,
    });
    
    return ok(undefined);
  }
  
  /**
   * إلغاء الحجز من قبل المضيف
   */
  cancelByHost(reason?: string): Result<void, BookingError> {
    if (!this.canBeCancelled) {
      return err(BookingError.cannotCancel());
    }
    
    this.props.status = 'cancelled';
    this.props.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: this.props.hostId,
      reason: reason || 'Cancelled by host',
      refundAmount: this.props.payment.amount,
      refundPercentage: 100,
    };
    
    this.incrementVersion();
    this.raiseEvent('booking.cancelled', { 
      cancelledBy: 'host',
      reason,
      refundPercentage: 100,
    });
    
    return ok(undefined);
  }
  
  /**
   * حساب نسبة الاسترداد
   */
  private calculateRefundPercentage(): number {
    const now = new Date();
    const hoursUntilCheckIn = (this.props.checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // أكثر من 7 أيام: استرداد كامل
    if (hoursUntilCheckIn > 24 * 7) return 100;
    // 3-7 أيام: 75%
    if (hoursUntilCheckIn > 24 * 3) return 75;
    // 1-3 أيام: 50%
    if (hoursUntilCheckIn > 24) return 50;
    // أقل من 24 ساعة: لا استرداد
    return 0;
  }
  
  /**
   * تسجيل الوصول
   */
  checkInGuest(): Result<void, BookingError> {
    if (this.props.status !== 'confirmed') {
      return err(BookingError.notConfirmed());
    }
    
    const now = new Date();
    if (now < this.props.checkIn) {
      return err(new BookingError('TOO_EARLY', 'Check-in time has not arrived yet'));
    }
    
    this.props.status = 'in_progress';
    this.props.checkInActual = now;
    this.incrementVersion();
    this.raiseEvent('booking.checked_in', { 
      guestId: this.props.guestId,
      listingId: this.props.listingId,
    });
    
    return ok(undefined);
  }
  
  /**
   * تسجيل المغادرة
   */
  checkOutGuest(): Result<void, BookingError> {
    if (this.props.status !== 'in_progress') {
      return err(new BookingError('NOT_CHECKED_IN', 'Guest must be checked in first'));
    }
    
    this.props.status = 'completed';
    this.props.checkOutActual = new Date();
    this.props.completedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('booking.completed', { 
      guestId: this.props.guestId,
      listingId: this.props.listingId,
    });
    
    return ok(undefined);
  }
  
  /**
   * تسجيل عدم الحضور
   */
  markNoShow(): Result<void, BookingError> {
    if (this.props.status !== 'confirmed') {
      return err(BookingError.notConfirmed());
    }
    
    const now = new Date();
    const hoursAfterCheckIn = (now.getTime() - this.props.checkIn.getTime()) / (1000 * 60 * 60);
    
    if (hoursAfterCheckIn < 24) {
      return err(new BookingError('TOO_EARLY', 'Must wait 24 hours after check-in time'));
    }
    
    this.props.status = 'no_show';
    this.incrementVersion();
    this.raiseEvent('booking.no_show', { 
      guestId: this.props.guestId,
      listingId: this.props.listingId,
    });
    
    return ok(undefined);
  }
  
  /**
   * تحديث حالة الدفع
   */
  updatePaymentStatus(
    status: PaymentStatus, 
    transactionId?: string,
    paymentMethod?: string
  ): void {
    this.props.payment = {
      ...this.props.payment,
      status,
      transactionId: transactionId ?? this.props.payment.transactionId,
      paymentMethod: paymentMethod ?? this.props.payment.paymentMethod,
      paidAt: status === 'paid' ? new Date() : this.props.payment.paidAt,
    };
    
    this.incrementVersion();
    this.raiseEvent('booking.payment_updated', { status, transactionId });
  }
  
  /**
   * تطبيق خصم
   */
  applyDiscount(discount: Money): Result<void, ValidationError> {
    if (discount.isNegative) {
      return err(new ValidationError('Discount cannot be negative', 'discount'));
    }
    
    const compareResult = discount.compare(this.props.totalPrice);
    if (compareResult === 'greater') {
      return err(new ValidationError('Discount cannot exceed total price', 'discount'));
    }
    
    this.props.discount = discount;
    const subtractResult = this.props.totalPrice.subtract(discount);
    if (subtractResult.isSuccess) {
      this.props.totalPrice = subtractResult.value;
    }
    
    this.incrementVersion();
    this.raiseEvent('booking.discount_applied', { discount: discount.amount });
    
    return ok(undefined);
  }
  
  /**
   * الحصول على إحصائيات الحجز
   */
  getStats(): BookingStats {
    return {
      totalNights: this.nights,
      pricePerNight: this.props.basePrice,
      totalGuests: this.props.guests,
      hasChildren: this.props.children > 0,
      hasInfants: this.props.infants > 0,
    };
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء حجز جديد
   */
  static create(props: Omit<BookingProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'confirmedAt' | 'completedAt' | 'checkInActual' | 'checkOutActual' | 'cancellation'> & { id?: string }): Result<Booking, ValidationError | BookingError> {
    // التحقق من التواريخ
    if (props.checkOut <= props.checkIn) {
      return err(BookingError.invalidDates(props.checkIn, props.checkOut));
    }
    
    // التحقق من الضيوف
    if (props.guests < 1) {
      return err(new ValidationError('At least one guest is required', 'guests'));
    }
    
    // التحقق من الأطراف
    if (!props.guestId) {
      return err(new ValidationError('Guest ID is required', 'guestId'));
    }
    if (!props.hostId) {
      return err(new ValidationError('Host ID is required', 'hostId'));
    }
    if (!props.listingId) {
      return err(new ValidationError('Listing ID is required', 'listingId'));
    }
    
    const now = new Date();
    
    const booking = new Booking({
      ...props,
      id: props.id || new UniqueEntityId(),
      confirmedAt: null,
      completedAt: null,
      checkInActual: null,
      checkOutActual: null,
      cancellation: {
        cancelledAt: null,
        cancelledBy: null,
        reason: null,
        refundAmount: null,
        refundPercentage: 0,
      },
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
    
    booking.raiseEvent('booking.created', { 
      guestId: props.guestId,
      listingId: props.listingId,
      checkIn: props.checkIn,
      checkOut: props.checkOut,
    });
    
    return ok(booking);
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: BookingProps): Booking {
    return new Booking(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      guestId: this.props.guestId,
      hostId: this.props.hostId,
      listingId: this.props.listingId,
      companyId: this.props.companyId,
      checkIn: this.props.checkIn.toISOString(),
      checkOut: this.props.checkOut.toISOString(),
      checkInActual: this.props.checkInActual?.toISOString() || null,
      checkOutActual: this.props.checkOutActual?.toISOString() || null,
      nights: this.nights,
      guests: this.props.guests,
      adults: this.props.adults,
      children: this.props.children,
      infants: this.props.infants,
      guestDetails: this.props.guestDetails,
      basePrice: this.props.basePrice.toJSON(),
      cleaningFee: this.props.cleaningFee.toJSON(),
      serviceFee: this.props.serviceFee.toJSON(),
      taxes: this.props.taxes.toJSON(),
      discount: this.props.discount.toJSON(),
      totalPrice: this.props.totalPrice.toJSON(),
      currency: this.props.currency,
      payment: {
        amount: this.props.payment.amount.toJSON(),
        status: this.props.payment.status,
        paidAt: this.props.payment.paidAt?.toISOString() || null,
        paymentMethod: this.props.payment.paymentMethod,
        transactionId: this.props.payment.transactionId,
      },
      status: this.props.status,
      source: this.props.source,
      cancellation: {
        cancelledAt: this.props.cancellation.cancelledAt?.toISOString() || null,
        cancelledBy: this.props.cancellation.cancelledBy,
        reason: this.props.cancellation.reason,
        refundAmount: this.props.cancellation.refundAmount?.toJSON() || null,
        refundPercentage: this.props.cancellation.refundPercentage,
      },
      guestNotes: this.props.guestNotes,
      hostNotes: this.props.hostNotes,
      specialRequests: this.props.specialRequests,
      confirmedAt: this.props.confirmedAt?.toISOString() || null,
      completedAt: this.props.completedAt?.toISOString() || null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      version: this.version,
    };
  }
}
