/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking Rules - قواعد الحجز
 * 
 * يحتوي على كل القواعد المتعلقة بالحجوزات.
 * 
 * @module core/domain/rules/booking-rules
 */

import { DateRange } from '../value-objects/DateRange';
import { Money } from '../value-objects/Money';

// ==================== Types ====================

export interface BookingRuleContext {
  userId: string;
  listingId: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  maxGuests: number;
  minNights: number;
  maxNights: number | null;
  basePrice: Money;
  cleaningFee?: Money;
  serviceFeePercent?: number;
  isInstantBook: boolean;
  existingBookings: Array<{ checkIn: Date; checkOut: Date; status: string }>;
}

export interface BookingValidationResult {
  isValid: boolean;
  errors: BookingValidationError[];
  warnings: BookingValidationWarning[];
}

export interface BookingValidationError {
  code: string;
  message: string;
  field: string;
}

export interface BookingValidationWarning {
  code: string;
  message: string;
  field: string;
}

// ==================== Constants ====================

/**
 * الحد الأدنى للإشعار قبل الحجز (ساعات)
 */
export const MIN_NOTICE_HOURS = 6;

/**
 * الحد الأقصى للحجز المسبق (أيام)
 */
export const MAX_ADVANCE_BOOKING_DAYS = 365;

/**
 * مهلة الإلغاء المجاني (ساعات قبل الوصول)
 */
export const FREE_CANCELLATION_HOURS = 48;

/**
 * الحد الأقصى للضيوف الإضافيين
 */
export const MAX_EXTRA_GUESTS = 10;

// ==================== Validation Rules ====================

/**
 * التحقق من صلاحية الحجز
 */
export function validateBooking(context: BookingRuleContext): BookingValidationResult {
  const errors: BookingValidationError[] = [];
  const warnings: BookingValidationWarning[] = [];

  // التحقق من التواريخ
  const dateErrors = validateDates(context);
  errors.push(...dateErrors);

  // التحقق من عدد الضيوف
  const guestErrors = validateGuests(context);
  errors.push(...guestErrors);

  // التحقق من التوفر
  const availabilityErrors = validateAvailability(context);
  errors.push(...availabilityErrors);

  // التحقق من قواعد المضيف
  const hostRulesErrors = validateHostRules(context);
  errors.push(...hostRulesErrors);

  // تحذيرات
  warnings.push(...generateWarnings(context));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * التحقق من التواريخ
 */
function validateDates(context: BookingRuleContext): BookingValidationError[] {
  const errors: BookingValidationError[] = [];
  const now = new Date();
  const checkIn = new Date(context.checkIn);
  const checkOut = new Date(context.checkOut);

  // تاريخ الوصول يجب أن يكون في المستقبل
  const minCheckIn = new Date(now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000);
  if (checkIn < minCheckIn) {
    errors.push({
      code: 'CHECKIN_TOO_SOON',
      message: `يجب أن يكون تاريخ الوصول بعد ${MIN_NOTICE_HOURS} ساعات على الأقل`,
      field: 'checkIn',
    });
  }

  // تاريخ الوصول يجب أن يكون ضمن الحد الأقصى للحجز المسبق
  const maxCheckIn = new Date(now.getTime() + MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000);
  if (checkIn > maxCheckIn) {
    errors.push({
      code: 'CHECKIN_TOO_FAR',
      message: `لا يمكن الحجز لأكثر من ${MAX_ADVANCE_BOOKING_DAYS} يوم مقدماً`,
      field: 'checkIn',
    });
  }

  // تاريخ المغادرة يجب أن يكون بعد الوصول
  if (checkOut <= checkIn) {
    errors.push({
      code: 'INVALID_DATE_RANGE',
      message: 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول',
      field: 'checkOut',
    });
  }

  // التحقق من الحد الأدنى للليالي
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));
  if (nights < context.minNights) {
    errors.push({
      code: 'MIN_NIGHTS_NOT_MET',
      message: `الحد الأدنى للإقامة هو ${context.minNights} ليالي`,
      field: 'checkOut',
    });
  }

  // التحقق من الحد الأقصى للليالي
  if (context.maxNights && nights > context.maxNights) {
    errors.push({
      code: 'MAX_NIGHTS_EXCEEDED',
      message: `الحد الأقصى للإقامة هو ${context.maxNights} ليالي`,
      field: 'checkOut',
    });
  }

  return errors;
}

/**
 * التحقق من عدد الضيوف
 */
function validateGuests(context: BookingRuleContext): BookingValidationError[] {
  const errors: BookingValidationError[] = [];

  if (context.guests < 1) {
    errors.push({
      code: 'INVALID_GUEST_COUNT',
      message: 'يجب أن يكون هناك ضيف واحد على الأقل',
      field: 'guests',
    });
  }

  if (context.guests > context.maxGuests) {
    errors.push({
      code: 'GUESTS_EXCEEDED',
      message: `الحد الأقصى للضيوف هو ${context.maxGuests}`,
      field: 'guests',
    });
  }

  return errors;
}

/**
 * التحقق من التوفر
 */
function validateAvailability(context: BookingRuleContext): BookingValidationError[] {
  const errors: BookingValidationError[] = [];
  const checkIn = new Date(context.checkIn);
  const checkOut = new Date(context.checkOut);

  for (const booking of context.existingBookings) {
    // تخطي الحجوزات الملغاة
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      continue;
    }

    const existingRange = new DateRange(booking.checkIn, booking.checkOut);
    const requestedRange = new DateRange(checkIn, checkOut);

    if (requestedRange.overlaps(existingRange)) {
      errors.push({
        code: 'DATES_NOT_AVAILABLE',
        message: 'التواريخ المطلوبة غير متاحة',
        field: 'checkIn',
      });
      break;
    }
  }

  return errors;
}

/**
 * التحقق من قواعد المضيف
 */
function validateHostRules(context: BookingRuleContext): BookingValidationError[] {
  const errors: BookingValidationError[] = [];

  // لا يمكن للمضيف حجز إقامته الخاصة
  if (context.userId === context.hostId) {
    errors.push({
      code: 'CANNOT_BOOK_OWN_LISTING',
      message: 'لا يمكنك حجز إقامتك الخاصة',
      field: 'userId',
    });
  }

  return errors;
}

/**
 * توليد التحذيرات
 */
function generateWarnings(context: BookingRuleContext): BookingValidationWarning[] {
  const warnings: BookingValidationWarning[] = [];
  const now = new Date();
  const checkIn = new Date(context.checkIn);
  const checkOut = new Date(context.checkOut);

  // تحذير إذا كان الحجز قريباً جداً
  const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (60 * 60 * 1000);
  if (hoursUntilCheckIn < 24) {
    warnings.push({
      code: 'SOON_CHECKIN',
      message: 'الحجز خلال 24 ساعة - قد لا يتسنى للمضيف الرد في الوقت',
      field: 'checkIn',
    });
  }

  // تحذير إذا كان عدد الضيوف قريباً من الحد الأقصى
  if (context.guests >= context.maxGuests - 1 && context.guests < context.maxGuests) {
    warnings.push({
      code: 'NEAR_MAX_GUESTS',
      message: 'عدد الضيوف قريب من الحد الأقصى المسموح',
      field: 'guests',
    });
  }

  return warnings;
}

// ==================== Pricing Rules ====================

/**
 * حساب السعر الإجمالي
 */
export function calculateTotalPrice(context: BookingRuleContext): {
  basePrice: Money;
  nights: number;
  cleaningFee: Money;
  serviceFee: Money;
  taxes: Money;
  total: Money;
} {
  const checkIn = new Date(context.checkIn);
  const checkOut = new Date(context.checkOut);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));

  // السعر الأساسي
  const basePrice = context.basePrice.multiply(nights);

  // رسوم التنظيف
  const cleaningFee = context.cleaningFee || Money.zero(context.basePrice.currency);

  // رسوم الخدمة
  const serviceFeePercent = context.serviceFeePercent ?? 0.12; // 12% افتراضياً
  const serviceFee = basePrice.percentage(serviceFeePercent);

  // الضرائب (مثلاً 5% ضريبة قيمة مضافة)
  const taxes = basePrice.percentage(5);

  // الإجمالي
  const total = basePrice.add(cleaningFee).add(serviceFee).add(taxes);

  return {
    basePrice,
    nights,
    cleaningFee,
    serviceFee,
    taxes,
    total,
  };
}

/**
 * حساب خصم الإقامة الطويلة
 */
export function calculateLongStayDiscount(
  nights: number,
  basePrice: Money
): { discountPercent: number; discountAmount: Money } {
  let discountPercent = 0;

  if (nights >= 30) {
    discountPercent = 20;
  } else if (nights >= 14) {
    discountPercent = 15;
  } else if (nights >= 7) {
    discountPercent = 10;
  }

  const discountAmount = basePrice.percentage(discountPercent);

  return { discountPercent, discountAmount };
}

// ==================== Status Transition Rules ====================

/**
 * التحقق من صلاحية تغيير حالة الحجز
 */
export function canTransitionStatus(
  currentStatus: string,
  newStatus: string,
  context: { isHost: boolean; isAdmin: boolean; hoursUntilCheckIn: number }
): { allowed: boolean; reason?: string } {
  const transitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled', 'rejected'],
    confirmed: ['cancelled', 'completed', 'no_show'],
    cancelled: [], // لا يمكن تغيير الحالة بعد الإلغاء
    completed: [],
    rejected: [],
    no_show: [],
  };

  const allowedTransitions = transitions[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return { allowed: false, reason: `لا يمكن الانتقال من ${currentStatus} إلى ${newStatus}` };
  }

  // قواعد خاصة
  if (newStatus === 'cancelled') {
    // فقط المضيف أو الإدارة يمكنهم الإلغاء بعد التأكيد
    if (currentStatus === 'confirmed' && !context.isHost && !context.isAdmin) {
      return { allowed: false, reason: 'لا يمكنك إلغاء حجز مؤكد' };
    }
  }

  return { allowed: true };
}
