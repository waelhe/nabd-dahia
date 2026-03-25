/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain Errors - أخطاء النطاق
 * 
 * @module core/domain/errors
 */

// ==================== Base Domain Error ====================

/**
 * الخطأ الأساسي للنطاق
 */
export abstract class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * تحويل إلى كائن
   */
  toJSON(): { code: string; message: string; details?: Record<string, unknown> } {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

// ==================== Error Codes ====================

/**
 * أكواد أخطاء النطاق
 */
export enum DomainErrorCode {
  // === Generic ===
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS = 'ENTITY_ALREADY_EXISTS',
  INVALID_STATE = 'INVALID_STATE',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',

  // === User ===
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_NOT_HOST = 'USER_NOT_HOST',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // === Booking ===
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  BOOKING_ALREADY_EXISTS = 'BOOKING_ALREADY_EXISTS',
  BOOKING_NOT_AVAILABLE = 'BOOKING_NOT_AVAILABLE',
  BOOKING_ALREADY_CANCELLED = 'BOOKING_ALREADY_CANCELLED',
  BOOKING_ALREADY_CONFIRMED = 'BOOKING_ALREADY_CONFIRMED',
  BOOKING_ALREADY_COMPLETED = 'BOOKING_ALREADY_COMPLETED',
  BOOKING_CANNOT_CANCEL = 'BOOKING_CANNOT_CANCEL',
  BOOKING_CANNOT_MODIFY = 'BOOKING_CANNOT_MODIFY',
  BOOKING_DATE_CONFLICT = 'BOOKING_DATE_CONFLICT',
  BOOKING_GUEST_LIMIT_EXCEEDED = 'BOOKING_GUEST_LIMIT_EXCEEDED',
  BOOKING_MIN_NIGHTS_NOT_MET = 'BOOKING_MIN_NIGHTS_NOT_MET',
  BOOKING_MAX_NIGHTS_EXCEEDED = 'BOOKING_MAX_NIGHTS_EXCEEDED',

  // === Listing ===
  LISTING_NOT_FOUND = 'LISTING_NOT_FOUND',
  LISTING_NOT_ACTIVE = 'LISTING_NOT_ACTIVE',
  LISTING_NOT_PUBLISHED = 'LISTING_NOT_PUBLISHED',
  LISTING_NOT_AVAILABLE = 'LISTING_NOT_AVAILABLE',
  LISTING_ALREADY_BOOKED = 'LISTING_ALREADY_BOOKED',
  LISTING_CAPACITY_EXCEEDED = 'LISTING_CAPACITY_EXCEEDED',

  // === Payment ===
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_AMOUNT_INVALID = 'PAYMENT_AMOUNT_INVALID',
  PAYMENT_CURRENCY_MISMATCH = 'PAYMENT_CURRENCY_MISMATCH',
  PAYMENT_ALREADY_REFUNDED = 'PAYMENT_ALREADY_REFUNDED',
  PAYMENT_CANNOT_REFUND = 'PAYMENT_CANNOT_REFUND',

  // === Escrow ===
  ESCROW_NOT_FOUND = 'ESCROW_NOT_FOUND',
  ESCROW_ALREADY_RELEASED = 'ESCROW_ALREADY_RELEASED',
  ESCROW_ALREADY_REFUNDED = 'ESCROW_ALREADY_REFUNDED',
  ESCROW_UNDER_DISPUTE = 'ESCROW_UNDER_DISPUTE',
  ESCROW_CANNOT_RELEASE = 'ESCROW_CANNOT_RELEASE',
  ESCROW_CANNOT_REFUND = 'ESCROW_CANNOT_REFUND',
  ESCROW_DISPUTE_EXISTS = 'ESCROW_DISPUTE_EXISTS',

  // === Review ===
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  REVIEW_ALREADY_EXISTS = 'REVIEW_ALREADY_EXISTS',
  REVIEW_NOT_ALLOWED = 'REVIEW_NOT_ALLOWED',
  REVIEW_ALREADY_RESPONDED = 'REVIEW_ALREADY_RESPONDED',
  REVIEW_RATING_INVALID = 'REVIEW_RATING_INVALID',

  // === Company ===
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  COMPANY_NOT_VERIFIED = 'COMPANY_NOT_VERIFIED',
  COMPANY_NOT_ACTIVE = 'COMPANY_NOT_ACTIVE',
  COMPANY_EMPLOYEE_LIMIT = 'COMPANY_EMPLOYEE_LIMIT',

  // === Notification ===
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  NOTIFICATION_ALREADY_SENT = 'NOTIFICATION_ALREADY_SENT',

  // === Validation ===
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
}

// ==================== Entity Errors ====================

/**
 * خطأ عدم وجود الكيان
 */
export class EntityNotFoundError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly entityId?: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.ENTITY_NOT_FOUND,
      `${entityName} not found${entityId ? ` with id: ${entityId}` : ''}`,
      { entityName, entityId, ...details }
    );
  }
}

/**
 * خطأ وجود الكيان مسبقاً
 */
export class EntityAlreadyExistsError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly field: string,
    public readonly value: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.ENTITY_ALREADY_EXISTS,
      `${entityName} with ${field}='${value}' already exists`,
      { entityName, field, value, ...details }
    );
  }
}

/**
 * خطأ حالة غير صالحة
 */
export class InvalidStateError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly currentState: string,
    public readonly expectedStates: string[],
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.INVALID_STATE,
      `${entityName} is in '${currentState}' state, expected: ${expectedStates.join(', ')}`,
      { entityName, currentState, expectedStates, ...details }
    );
  }
}

// ==================== User Errors ====================

/**
 * خطأ المستخدم غير موجود
 */
export class UserNotFoundError extends DomainError {
  constructor(userId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.USER_NOT_FOUND,
      `User not found${userId ? ` with id: ${userId}` : ''}`,
      { userId, ...details }
    );
  }
}

/**
 * خطأ المستخدم موجود مسبقاً
 */
export class UserAlreadyExistsError extends DomainError {
  constructor(field: string, value: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.USER_ALREADY_EXISTS,
      `User with ${field}='${value}' already exists`,
      { field, value, ...details }
    );
  }
}

/**
 * خطأ المستخدم غير موثق
 */
export class UserNotVerifiedError extends DomainError {
  constructor(userId: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.USER_NOT_VERIFIED,
      'User account is not verified',
      { userId, ...details }
    );
  }
}

/**
 * خطأ المستخدم معلق
 */
export class UserSuspendedError extends DomainError {
  constructor(
    userId: string,
    public readonly reason?: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.USER_SUSPENDED,
      `User account is suspended${reason ? `: ${reason}` : ''}`,
      { userId, reason, ...details }
    );
  }
}

/**
 * خطأ المستخدم ليس مضيفاً
 */
export class UserNotHostError extends DomainError {
  constructor(userId: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.USER_NOT_HOST,
      'User is not a host',
      { userId, ...details }
    );
  }
}

/**
 * خطأ صلاحيات غير كافية
 */
export class InsufficientPermissionsError extends DomainError {
  constructor(
    public readonly requiredPermissions: string[],
    public readonly userPermissions: string[],
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.INSUFFICIENT_PERMISSIONS,
      `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      { requiredPermissions, userPermissions, ...details }
    );
  }
}

/**
 * خطأ بيانات الدخول غير صالحة
 */
export class InvalidCredentialsError extends DomainError {
  constructor(details?: Record<string, unknown>) {
    super(
      DomainErrorCode.INVALID_CREDENTIALS,
      'Invalid email/phone or password',
      details
    );
  }
}

// ==================== Booking Errors ====================

/**
 * خطأ الحجز غير موجود
 */
export class BookingNotFoundError extends DomainError {
  constructor(bookingId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.BOOKING_NOT_FOUND,
      `Booking not found${bookingId ? ` with id: ${bookingId}` : ''}`,
      { bookingId, ...details }
    );
  }
}

/**
 * خطأ عدم توفر الحجز
 */
export class BookingNotAvailableError extends DomainError {
  constructor(
    public readonly listingId: string,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BOOKING_NOT_AVAILABLE,
      `Listing is not available from ${checkIn.toISOString()} to ${checkOut.toISOString()}`,
      { listingId, checkIn, checkOut, ...details }
    );
  }
}

/**
 * خطأ الحجز ملغي مسبقاً
 */
export class BookingAlreadyCancelledError extends DomainError {
  constructor(bookingId: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.BOOKING_ALREADY_CANCELLED,
      'Booking is already cancelled',
      { bookingId, ...details }
    );
  }
}

/**
 * خطأ تعارض التواريخ
 */
export class BookingDateConflictError extends DomainError {
  constructor(
    public readonly listingId: string,
    public readonly requestedDates: { checkIn: Date; checkOut: Date },
    public readonly conflictingBookings: Array<{ checkIn: Date; checkOut: Date }>,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BOOKING_DATE_CONFLICT,
      'Requested dates conflict with existing bookings',
      { listingId, requestedDates, conflictingBookings, ...details }
    );
  }
}

/**
 * خطأ تجاوز حد الضيوف
 */
export class BookingGuestLimitExceededError extends DomainError {
  constructor(
    public readonly listingId: string,
    public readonly maxGuests: number,
    public readonly requestedGuests: number,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BOOKING_GUEST_LIMIT_EXCEEDED,
      `Guest limit exceeded. Max: ${maxGuests}, Requested: ${requestedGuests}`,
      { listingId, maxGuests, requestedGuests, ...details }
    );
  }
}

/**
 * خطأ عدم تحقق الحد الأدنى للليالي
 */
export class BookingMinNightsNotMetError extends DomainError {
  constructor(
    public readonly minNights: number,
    public readonly requestedNights: number,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BOOKING_MIN_NIGHTS_NOT_MET,
      `Minimum nights requirement not met. Min: ${minNights}, Requested: ${requestedNights}`,
      { minNights, requestedNights, ...details }
    );
  }
}

/**
 * خطأ تجاوز الحد الأقصى للليالي
 */
export class BookingMaxNightsExceededError extends DomainError {
  constructor(
    public readonly maxNights: number,
    public readonly requestedNights: number,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BOOKING_MAX_NIGHTS_EXCEEDED,
      `Maximum nights limit exceeded. Max: ${maxNights}, Requested: ${requestedNights}`,
      { maxNights, requestedNights, ...details }
    );
  }
}

/**
 * خطأ عدم إمكانية الإلغاء
 */
export class BookingCannotCancelError extends DomainError {
  constructor(
    public readonly bookingId: string,
    public readonly reason: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BOOKING_CANNOT_CANCEL,
      `Cannot cancel booking: ${reason}`,
      { bookingId, reason, ...details }
    );
  }
}

// ==================== Listing Errors ====================

/**
 * خطأ الإعلان غير موجود
 */
export class ListingNotFoundError extends DomainError {
  constructor(listingId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.LISTING_NOT_FOUND,
      `Listing not found${listingId ? ` with id: ${listingId}` : ''}`,
      { listingId, ...details }
    );
  }
}

/**
 * خطأ الإعلان غير نشط
 */
export class ListingNotActiveError extends DomainError {
  constructor(
    listingId: string,
    public readonly status: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.LISTING_NOT_ACTIVE,
      `Listing is not active (status: ${status})`,
      { listingId, status, ...details }
    );
  }
}

// ==================== Payment Errors ====================

/**
 * خطأ الدفع غير موجود
 */
export class PaymentNotFoundError extends DomainError {
  constructor(paymentId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.PAYMENT_NOT_FOUND,
      `Payment not found${paymentId ? ` with id: ${paymentId}` : ''}`,
      { paymentId, ...details }
    );
  }
}

/**
 * خطأ الدفع تمت معالجته مسبقاً
 */
export class PaymentAlreadyProcessedError extends DomainError {
  constructor(
    paymentId: string,
    public readonly status: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.PAYMENT_ALREADY_PROCESSED,
      `Payment already processed (status: ${status})`,
      { paymentId, status, ...details }
    );
  }
}

/**
 * خطأ فشل الدفع
 */
export class PaymentFailedError extends DomainError {
  constructor(
    public readonly reason: string,
    public readonly gatewayResponse?: Record<string, unknown>,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.PAYMENT_FAILED,
      `Payment failed: ${reason}`,
      { reason, gatewayResponse, ...details }
    );
  }
}

/**
 * خطأ مبلغ غير صالح
 */
export class PaymentAmountInvalidError extends DomainError {
  constructor(
    public readonly amount: number,
    public readonly reason: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.PAYMENT_AMOUNT_INVALID,
      `Invalid amount: ${amount}. ${reason}`,
      { amount, reason, ...details }
    );
  }
}

/**
 * خطأ عدم إمكانية الاسترداد
 */
export class PaymentCannotRefundError extends DomainError {
  constructor(
    paymentId: string,
    public readonly reason: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.PAYMENT_CANNOT_REFUND,
      `Cannot refund payment: ${reason}`,
      { paymentId, reason, ...details }
    );
  }
}

// ==================== Escrow Errors ====================

/**
 * خطأ الضمان غير موجود
 */
export class EscrowNotFoundError extends DomainError {
  constructor(escrowId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.ESCROW_NOT_FOUND,
      `Escrow not found${escrowId ? ` with id: ${escrowId}` : ''}`,
      { escrowId, ...details }
    );
  }
}

/**
 * خطأ الضمان تم إصداره مسبقاً
 */
export class EscrowAlreadyReleasedError extends DomainError {
  constructor(
    escrowId: string,
    public readonly releasedTo: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.ESCROW_ALREADY_RELEASED,
      `Escrow already released to ${releasedTo}`,
      { escrowId, releasedTo, ...details }
    );
  }
}

/**
 * خطأ الضمان قيد النزاع
 */
export class EscrowUnderDisputeError extends DomainError {
  constructor(
    escrowId: string,
    public readonly disputeReason?: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.ESCROW_UNDER_DISPUTE,
      'Escrow is under dispute and cannot be released',
      { escrowId, disputeReason, ...details }
    );
  }
}

// ==================== Review Errors ====================

/**
 * خطأ التقييم غير موجود
 */
export class ReviewNotFoundError extends DomainError {
  constructor(reviewId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.REVIEW_NOT_FOUND,
      `Review not found${reviewId ? ` with id: ${reviewId}` : ''}`,
      { reviewId, ...details }
    );
  }
}

/**
 * خطأ التقييم موجود مسبقاً
 */
export class ReviewAlreadyExistsError extends DomainError {
  constructor(
    public readonly bookingId: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.REVIEW_ALREADY_EXISTS,
      'Review already exists for this booking',
      { bookingId, ...details }
    );
  }
}

/**
 * خطأ التقييم غير مسموح
 */
export class ReviewNotAllowedError extends DomainError {
  constructor(
    public readonly reason: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.REVIEW_NOT_ALLOWED,
      `Cannot create review: ${reason}`,
      { reason, ...details }
    );
  }
}

// ==================== Company Errors ====================

/**
 * خطأ الشركة غير موجودة
 */
export class CompanyNotFoundError extends DomainError {
  constructor(companyId?: string, details?: Record<string, unknown>) {
    super(
      DomainErrorCode.COMPANY_NOT_FOUND,
      `Company not found${companyId ? ` with id: ${companyId}` : ''}`,
      { companyId, ...details }
    );
  }
}

/**
 * خطأ الشركة غير موثقة
 */
export class CompanyNotVerifiedError extends DomainError {
  constructor(
    companyId: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.COMPANY_NOT_VERIFIED,
      'Company is not verified',
      { companyId, ...details }
    );
  }
}

// ==================== Business Rule Violation ====================

/**
 * خطأ انتهاك قاعدة العمل
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(
    public readonly ruleName: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.BUSINESS_RULE_VIOLATION,
      `Business rule '${ruleName}' violated: ${message}`,
      { ruleName, ...details }
    );
  }
}

// ==================== Validation Errors ====================

/**
 * خطأ التحقق
 */
export class ValidationError extends DomainError {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    public readonly constraints: string[],
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.VALIDATION_ERROR,
      `Validation failed for '${field}': ${constraints.join(', ')}`,
      { field, value, constraints, ...details }
    );
  }
}

/**
 * خطأ بريد إلكتروني غير صالح
 */
export class InvalidEmailError extends DomainError {
  constructor(
    public readonly email: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.INVALID_EMAIL,
      `Invalid email: ${email}`,
      { email, ...details }
    );
  }
}

/**
 * خطأ رقم هاتف غير صالح
 */
export class InvalidPhoneError extends DomainError {
  constructor(
    public readonly phone: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.INVALID_PHONE,
      `Invalid phone number: ${phone}`,
      { phone, ...details }
    );
  }
}

/**
 * خطأ نطاق تاريخ غير صالح
 */
export class InvalidDateRangeError extends DomainError {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly reason: string,
    details?: Record<string, unknown>
  ) {
    super(
      DomainErrorCode.INVALID_DATE_RANGE,
      `Invalid date range: ${reason}`,
      { startDate, endDate, reason, ...details }
    );
  }
}

// ==================== Error Factory ====================

/**
 * مصنع الأخطاء
 */
export class DomainErrorFactory {
  /**
   * إنشاء خطأ من الكود
   */
  static fromCode(
    code: DomainErrorCode,
    details?: Record<string, unknown>
  ): DomainError {
    const messages: Record<DomainErrorCode, string> = {
      [DomainErrorCode.ENTITY_NOT_FOUND]: 'Entity not found',
      [DomainErrorCode.ENTITY_ALREADY_EXISTS]: 'Entity already exists',
      [DomainErrorCode.INVALID_STATE]: 'Invalid state',
      [DomainErrorCode.BUSINESS_RULE_VIOLATION]: 'Business rule violation',
      [DomainErrorCode.USER_NOT_FOUND]: 'User not found',
      [DomainErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
      [DomainErrorCode.USER_NOT_VERIFIED]: 'User not verified',
      [DomainErrorCode.USER_SUSPENDED]: 'User suspended',
      [DomainErrorCode.USER_NOT_HOST]: 'User not a host',
      [DomainErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
      [DomainErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
      [DomainErrorCode.BOOKING_NOT_FOUND]: 'Booking not found',
      [DomainErrorCode.BOOKING_ALREADY_EXISTS]: 'Booking already exists',
      [DomainErrorCode.BOOKING_NOT_AVAILABLE]: 'Booking not available',
      [DomainErrorCode.BOOKING_ALREADY_CANCELLED]: 'Booking already cancelled',
      [DomainErrorCode.BOOKING_ALREADY_CONFIRMED]: 'Booking already confirmed',
      [DomainErrorCode.BOOKING_ALREADY_COMPLETED]: 'Booking already completed',
      [DomainErrorCode.BOOKING_CANNOT_CANCEL]: 'Cannot cancel booking',
      [DomainErrorCode.BOOKING_CANNOT_MODIFY]: 'Cannot modify booking',
      [DomainErrorCode.BOOKING_DATE_CONFLICT]: 'Booking date conflict',
      [DomainErrorCode.BOOKING_GUEST_LIMIT_EXCEEDED]: 'Guest limit exceeded',
      [DomainErrorCode.BOOKING_MIN_NIGHTS_NOT_MET]: 'Minimum nights not met',
      [DomainErrorCode.BOOKING_MAX_NIGHTS_EXCEEDED]: 'Maximum nights exceeded',
      [DomainErrorCode.LISTING_NOT_FOUND]: 'Listing not found',
      [DomainErrorCode.LISTING_NOT_ACTIVE]: 'Listing not active',
      [DomainErrorCode.LISTING_NOT_PUBLISHED]: 'Listing not published',
      [DomainErrorCode.LISTING_NOT_AVAILABLE]: 'Listing not available',
      [DomainErrorCode.LISTING_ALREADY_BOOKED]: 'Listing already booked',
      [DomainErrorCode.LISTING_CAPACITY_EXCEEDED]: 'Listing capacity exceeded',
      [DomainErrorCode.PAYMENT_NOT_FOUND]: 'Payment not found',
      [DomainErrorCode.PAYMENT_ALREADY_PROCESSED]: 'Payment already processed',
      [DomainErrorCode.PAYMENT_FAILED]: 'Payment failed',
      [DomainErrorCode.PAYMENT_AMOUNT_INVALID]: 'Payment amount invalid',
      [DomainErrorCode.PAYMENT_CURRENCY_MISMATCH]: 'Payment currency mismatch',
      [DomainErrorCode.PAYMENT_ALREADY_REFUNDED]: 'Payment already refunded',
      [DomainErrorCode.PAYMENT_CANNOT_REFUND]: 'Cannot refund payment',
      [DomainErrorCode.ESCROW_NOT_FOUND]: 'Escrow not found',
      [DomainErrorCode.ESCROW_ALREADY_RELEASED]: 'Escrow already released',
      [DomainErrorCode.ESCROW_ALREADY_REFUNDED]: 'Escrow already refunded',
      [DomainErrorCode.ESCROW_UNDER_DISPUTE]: 'Escrow under dispute',
      [DomainErrorCode.ESCROW_CANNOT_RELEASE]: 'Cannot release escrow',
      [DomainErrorCode.ESCROW_CANNOT_REFUND]: 'Cannot refund escrow',
      [DomainErrorCode.ESCROW_DISPUTE_EXISTS]: 'Escrow dispute exists',
      [DomainErrorCode.REVIEW_NOT_FOUND]: 'Review not found',
      [DomainErrorCode.REVIEW_ALREADY_EXISTS]: 'Review already exists',
      [DomainErrorCode.REVIEW_NOT_ALLOWED]: 'Review not allowed',
      [DomainErrorCode.REVIEW_ALREADY_RESPONDED]: 'Review already responded',
      [DomainErrorCode.REVIEW_RATING_INVALID]: 'Review rating invalid',
      [DomainErrorCode.COMPANY_NOT_FOUND]: 'Company not found',
      [DomainErrorCode.COMPANY_NOT_VERIFIED]: 'Company not verified',
      [DomainErrorCode.COMPANY_NOT_ACTIVE]: 'Company not active',
      [DomainErrorCode.COMPANY_EMPLOYEE_LIMIT]: 'Company employee limit',
      [DomainErrorCode.NOTIFICATION_NOT_FOUND]: 'Notification not found',
      [DomainErrorCode.NOTIFICATION_ALREADY_SENT]: 'Notification already sent',
      [DomainErrorCode.VALIDATION_ERROR]: 'Validation error',
      [DomainErrorCode.INVALID_EMAIL]: 'Invalid email',
      [DomainErrorCode.INVALID_PHONE]: 'Invalid phone',
      [DomainErrorCode.INVALID_DATE_RANGE]: 'Invalid date range',
      [DomainErrorCode.INVALID_AMOUNT]: 'Invalid amount',
    };

    return new (class extends DomainError {
      constructor() {
        super(code, messages[code], details);
      }
    })();
  }
}

// ==================== Export All ====================

export const Errors = {
  // Base
  DomainError,
  EntityNotFoundError,
  EntityAlreadyExistsError,
  InvalidStateError,
  BusinessRuleViolationError,
  
  // User
  UserNotFoundError,
  UserAlreadyExistsError,
  UserNotVerifiedError,
  UserSuspendedError,
  UserNotHostError,
  InsufficientPermissionsError,
  InvalidCredentialsError,
  
  // Booking
  BookingNotFoundError,
  BookingNotAvailableError,
  BookingAlreadyCancelledError,
  BookingDateConflictError,
  BookingGuestLimitExceededError,
  BookingMinNightsNotMetError,
  BookingMaxNightsExceededError,
  BookingCannotCancelError,
  
  // Listing
  ListingNotFoundError,
  ListingNotActiveError,
  
  // Payment
  PaymentNotFoundError,
  PaymentAlreadyProcessedError,
  PaymentFailedError,
  PaymentAmountInvalidError,
  PaymentCannotRefundError,
  
  // Escrow
  EscrowNotFoundError,
  EscrowAlreadyReleasedError,
  EscrowUnderDisputeError,
  
  // Review
  ReviewNotFoundError,
  ReviewAlreadyExistsError,
  ReviewNotAllowedError,
  
  // Company
  CompanyNotFoundError,
  CompanyNotVerifiedError,
  
  // Validation
  ValidationError,
  InvalidEmailError,
  InvalidPhoneError,
  InvalidDateRangeError,
};
