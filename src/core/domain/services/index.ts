/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain Services - خدمات النطاق
 * 
 * خدمات للمنطق المعقد المشترك بين كيانات متعددة
 * 
 * @module core/domain/services
 */

// ==================== Booking Domain Service ====================

import { Money } from '../value-objects/Money';
import { DateRange } from '../value-objects/DateRange';
import { 
  BookingNotFoundError,
  BookingNotAvailableError,
  BookingDateConflictError,
  BookingGuestLimitExceededError,
  BookingMinNightsNotMetError,
  BookingMaxNightsExceededError,
  BookingCannotCancelError,
  InvalidStateError,
  DomainErrorCode,
} from '../errors';

/**
 * نتيجة حساب السعر
 */
export interface PriceCalculationResult {
  basePrice: Money;
  nights: number;
  weekendNights: number;
  weekdayNights: number;
  weekendSurcharge: Money;
  cleaningFee: Money;
  serviceFee: Money;
  taxes: Money;
  discounts: Money;
  totalPrice: Money;
  breakdown: PriceBreakdownItem[];
}

/**
 * عنصر تفصيل السعر
 */
export interface PriceBreakdownItem {
  label: string;
  labelAr: string;
  amount: Money;
  type: 'charge' | 'discount' | 'fee';
}

/**
 * نتيجة التحقق من التوفر
 */
export interface AvailabilityResult {
  isAvailable: boolean;
  conflictingDates?: Date[];
  suggestedAlternatives?: Array<{
    checkIn: Date;
    checkOut: Date;
  }>;
}

/**
 * خدمة النطاق للحجوزات
 */
export class BookingDomainService {
  /**
   * حساب السعر الإجمالي للحجز
   */
  calculatePrice(params: {
    basePrice: Money;
    weekendPrice?: Money;
    checkIn: Date;
    checkOut: Date;
    cleaningFee?: Money;
    serviceFeePercent?: number;
    taxPercent?: number;
    weeklyDiscountPercent?: number;
    monthlyDiscountPercent?: number;
    seasonalPricing?: Array<{
      startDate: Date;
      endDate: Date;
      priceModifier: number;
    }>;
  }): PriceCalculationResult {
    const {
      basePrice,
      weekendPrice,
      checkIn,
      checkOut,
      cleaningFee,
      serviceFeePercent = 10,
      taxPercent = 0,
      weeklyDiscountPercent = 0,
      monthlyDiscountPercent = 0,
      seasonalPricing = [],
    } = params;

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Count weekend nights (Friday and Saturday in Arab world)
    let weekendNights = 0;
    let weekdayNights = 0;
    const current = new Date(checkIn);
    while (current < checkOut) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday = 5, Saturday = 6
        weekendNights++;
      } else {
        weekdayNights++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Calculate base price
    const weekdayAmount = basePrice.amount * weekdayNights;
    const weekendAmount = (weekendPrice?.amount ?? basePrice.amount) * weekendNights;
    const baseTotal = basePrice.currency === (weekendPrice?.currency ?? basePrice.currency)
      ? weekdayAmount + weekendAmount
      : weekdayAmount;

    const weekendSurcharge = weekendPrice
      ? { amount: (weekendPrice.amount - basePrice.amount) * weekendNights, currency: basePrice.currency }
      : { amount: 0, currency: basePrice.currency };

    // Apply seasonal pricing
    let seasonalModifier = 1;
    for (const season of seasonalPricing) {
      if (checkIn >= season.startDate && checkOut <= season.endDate) {
        seasonalModifier = season.priceModifier;
        break;
      }
    }

    const adjustedBasePrice = baseTotal * seasonalModifier;

    // Calculate discounts
    let discountPercent = 0;
    if (nights >= 28) {
      discountPercent = monthlyDiscountPercent;
    } else if (nights >= 7) {
      discountPercent = weeklyDiscountPercent;
    }
    
    const discounts = adjustedBasePrice * (discountPercent / 100);
    const afterDiscount = adjustedBasePrice - discounts;

    // Calculate fees
    const serviceFee = afterDiscount * (serviceFeePercent / 100);
    const cleaningFeeAmount = cleaningFee?.amount ?? 0;
    const subtotal = afterDiscount + serviceFee + cleaningFeeAmount;
    const taxes = subtotal * (taxPercent / 100);
    const totalPrice = subtotal + taxes;

    // Build breakdown
    const breakdown: PriceBreakdownItem[] = [
      {
        label: `${basePrice.currency} ${basePrice.amount} x ${nights} nights`,
        labelAr: `${basePrice.currency} ${basePrice.amount} × ${nights} ليالي`,
        amount: { amount: adjustedBasePrice, currency: basePrice.currency },
        type: 'charge',
      },
    ];

    if (weekendSurcharge.amount > 0) {
      breakdown.push({
        label: `Weekend surcharge (${weekendNights} nights)`,
        labelAr: `رسوم عطلة نهاية الأسبوع (${weekendNights} ليالي)`,
        amount: weekendSurcharge,
        type: 'charge',
      });
    }

    if (discounts > 0) {
      breakdown.push({
        label: `${nights >= 28 ? 'Monthly' : 'Weekly'} discount (${discountPercent}%)`,
        labelAr: `خصم ${nights >= 28 ? 'شهري' : 'أسبوعي'} (${discountPercent}%)`,
        amount: { amount: discounts, currency: basePrice.currency },
        type: 'discount',
      });
    }

    if (cleaningFeeAmount > 0) {
      breakdown.push({
        label: 'Cleaning fee',
        labelAr: 'رسوم التنظيف',
        amount: { amount: cleaningFeeAmount, currency: cleaningFee?.currency ?? basePrice.currency },
        type: 'fee',
      });
    }

    if (serviceFee > 0) {
      breakdown.push({
        label: 'Service fee',
        labelAr: 'رسوم الخدمة',
        amount: { amount: serviceFee, currency: basePrice.currency },
        type: 'fee',
      });
    }

    if (taxes > 0) {
      breakdown.push({
        label: 'Taxes',
        labelAr: 'الضرائب',
        amount: { amount: taxes, currency: basePrice.currency },
        type: 'fee',
      });
    }

    return {
      basePrice: { amount: adjustedBasePrice, currency: basePrice.currency },
      nights,
      weekendNights,
      weekdayNights,
      weekendSurcharge,
      cleaningFee: { amount: cleaningFeeAmount, currency: cleaningFee?.currency ?? basePrice.currency },
      serviceFee: { amount: serviceFee, currency: basePrice.currency },
      taxes: { amount: taxes, currency: basePrice.currency },
      discounts: { amount: discounts, currency: basePrice.currency },
      totalPrice: { amount: totalPrice, currency: basePrice.currency },
      breakdown,
    };
  }

  /**
   * التحقق من توفر الإعلان
   */
  checkAvailability(params: {
    listingId: string;
    checkIn: Date;
    checkOut: Date;
    existingBookings: Array<{
      id: string;
      checkIn: Date;
      checkOut: Date;
      status: string;
    }>;
    blockedDates?: Array<{
      date: Date;
      reason?: string;
    }>;
  }): AvailabilityResult {
    const { listingId, checkIn, checkOut, existingBookings, blockedDates = [] } = params;

    // Check blocked dates
    const conflictingBlockedDates: Date[] = [];
    const current = new Date(checkIn);
    while (current < checkOut) {
      const isBlocked = blockedDates.some(b => 
        b.date.toDateString() === current.toDateString()
      );
      if (isBlocked) {
        conflictingBlockedDates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    if (conflictingBlockedDates.length > 0) {
      return {
        isAvailable: false,
        conflictingDates: conflictingBlockedDates,
      };
    }

    // Check existing bookings
    const conflictingBookings = existingBookings.filter(booking => {
      if (!['pending', 'confirmed', 'in_progress'].includes(booking.status)) {
        return false;
      }
      return checkIn < booking.checkOut && checkOut > booking.checkIn;
    });

    if (conflictingBookings.length > 0) {
      return {
        isAvailable: false,
        conflictingDates: conflictingBookings.map(b => b.checkIn),
      };
    }

    return { isAvailable: true };
  }

  /**
   * التحقق من صلاحية الإلغاء
   */
  canCancel(params: {
    bookingId: string;
    status: string;
    checkIn: Date;
    cancelledAt?: Date;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super_strict';
    createdAt: Date;
  }): {
    canCancel: boolean;
    reason?: string;
    refundPercentage: number;
    refundDeadline?: Date;
  } {
    const { status, checkIn, cancellationPolicy, createdAt } = params;
    const now = new Date();

    // Check if already cancelled
    if (status === 'cancelled') {
      return {
        canCancel: false,
        reason: 'Booking is already cancelled',
        refundPercentage: 0,
      };
    }

    // Check if already completed
    if (status === 'completed') {
      return {
        canCancel: false,
        reason: 'Booking is already completed',
        refundPercentage: 0,
      };
    }

    // Check if in progress
    if (status === 'in_progress') {
      return {
        canCancel: false,
        reason: 'Booking is in progress',
        refundPercentage: 0,
      };
    }

    // Calculate days until check-in
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Apply cancellation policy
    switch (cancellationPolicy) {
      case 'flexible':
        // Full refund if cancelled 24+ hours before check-in
        if (daysUntilCheckIn >= 1) {
          return {
            canCancel: true,
            refundPercentage: 100,
            refundDeadline: new Date(checkIn.getTime() - 24 * 60 * 60 * 1000),
          };
        }
        return {
          canCancel: true,
          refundPercentage: 50,
        };

      case 'moderate':
        // Full refund if cancelled 5+ days before check-in
        if (daysUntilCheckIn >= 5) {
          return {
            canCancel: true,
            refundPercentage: 100,
            refundDeadline: new Date(checkIn.getTime() - 5 * 24 * 60 * 60 * 1000),
          };
        }
        if (daysUntilCheckIn >= 1) {
          return {
            canCancel: true,
            refundPercentage: 50,
          };
        }
        return {
          canCancel: true,
          refundPercentage: 0,
        };

      case 'strict':
        // Full refund if cancelled 14+ days before check-in
        if (daysUntilCheckIn >= 14) {
          return {
            canCancel: true,
            refundPercentage: 100,
            refundDeadline: new Date(checkIn.getTime() - 14 * 24 * 60 * 60 * 1000),
          };
        }
        if (daysUntilCheckIn >= 7) {
          return {
            canCancel: true,
            refundPercentage: 50,
          };
        }
        return {
          canCancel: true,
          refundPercentage: 0,
        };

      case 'super_strict':
        // Full refund if cancelled 30+ days before check-in
        if (daysUntilCheckIn >= 30) {
          return {
            canCancel: true,
            refundPercentage: 100,
            refundDeadline: new Date(checkIn.getTime() - 30 * 24 * 60 * 60 * 1000),
          };
        }
        if (daysUntilCheckIn >= 14) {
          return {
            canCancel: true,
            refundPercentage: 25,
          };
        }
        return {
          canCancel: true,
          refundPercentage: 0,
        };

      default:
        return {
          canCancel: true,
          refundPercentage: 0,
        };
    }
  }

  /**
   * حساب رسوم الإلغاء
   */
  calculateCancellationFee(params: {
    totalPrice: Money;
    refundPercentage: number;
    platformCancellationFeePercent?: number;
  }): {
    refundAmount: Money;
    cancellationFee: Money;
    platformFee: Money;
    hostAmount: Money;
  } {
    const { totalPrice, refundPercentage, platformCancellationFeePercent = 0 } = params;

    const refundAmount = totalPrice.amount * (refundPercentage / 100);
    const nonRefundedAmount = totalPrice.amount - refundAmount;
    const platformFee = nonRefundedAmount * (platformCancellationFeePercent / 100);
    const hostAmount = nonRefundedAmount - platformFee;
    const cancellationFee = totalPrice.amount - refundAmount;

    return {
      refundAmount: { amount: refundAmount, currency: totalPrice.currency },
      cancellationFee: { amount: cancellationFee, currency: totalPrice.currency },
      platformFee: { amount: platformFee, currency: totalPrice.currency },
      hostAmount: { amount: hostAmount, currency: totalPrice.currency },
    };
  }

  /**
   * التحقق من صلاحية التعديل
   */
  canModify(params: {
    bookingId: string;
    status: string;
    checkIn: Date;
    modificationDeadlineHours?: number;
  }): {
    canModify: boolean;
    reason?: string;
    deadline?: Date;
  } {
    const { status, checkIn, modificationDeadlineHours = 48 } = params;
    const now = new Date();

    // Check if booking can be modified
    if (!['pending', 'confirmed'].includes(status)) {
      return {
        canModify: false,
        reason: `Cannot modify booking in '${status}' status`,
      };
    }

    // Check if within modification deadline
    const deadline = new Date(checkIn.getTime() - modificationDeadlineHours * 60 * 60 * 1000);
    if (now > deadline) {
      return {
        canModify: false,
        reason: `Modification deadline has passed (within ${modificationDeadlineHours} hours of check-in)`,
      };
    }

    return {
      canModify: true,
      deadline,
    };
  }

  /**
   * التحقق من صحة تواريخ الحجز
   */
  validateBookingDates(params: {
    checkIn: Date;
    checkOut: Date;
    minNights?: number;
    maxNights?: number;
    maxAdvanceDays?: number;
  }): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const { checkIn, checkOut, minNights = 1, maxNights = 365, maxAdvanceDays = 365 } = params;
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();

    // Check if check-in is in the past
    if (checkIn < now) {
      errors.push('Check-in date cannot be in the past');
    }

    // Check if check-out is before check-in
    if (checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date');
    }

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Check minimum nights
    if (nights < minNights) {
      errors.push(`Minimum stay is ${minNights} nights`);
    }

    // Check maximum nights
    if (nights > maxNights) {
      errors.push(`Maximum stay is ${maxNights} nights`);
    }

    // Check advance booking limit
    const advanceDays = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (advanceDays > maxAdvanceDays) {
      warnings.push(`Booking is more than ${maxAdvanceDays} days in advance`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ==================== Payment Domain Service ====================

/**
 * خدمة النطاق للدفعات
 */
export class PaymentDomainService {
  /**
   * حساب الرسوم
   */
  calculateFees(params: {
    amount: Money;
    platformFeePercent: number;
    processingFeePercent?: number;
    taxPercent?: number;
  }): {
    platformFee: Money;
    processingFee: Money;
    tax: Money;
    totalFees: Money;
    netAmount: Money;
  } {
    const { amount, platformFeePercent, processingFeePercent = 0, taxPercent = 0 } = params;

    const platformFee = amount.amount * (platformFeePercent / 100);
    const processingFee = amount.amount * (processingFeePercent / 100);
    const subtotalFees = platformFee + processingFee;
    const tax = subtotalFees * (taxPercent / 100);
    const totalFees = subtotalFees + tax;
    const netAmount = amount.amount - totalFees;

    return {
      platformFee: { amount: platformFee, currency: amount.currency },
      processingFee: { amount: processingFee, currency: amount.currency },
      tax: { amount: tax, currency: amount.currency },
      totalFees: { amount: totalFees, currency: amount.currency },
      netAmount: { amount: netAmount, currency: amount.currency },
    };
  }

  /**
   * التحقق من صلاحية الاسترداد
   */
  canRefund(params: {
    paymentId: string;
    status: string;
    amount: Money;
    refundedAmount: Money;
    refundWindowDays?: number;
    processedAt?: Date;
  }): {
    canRefund: boolean;
    reason?: string;
    maxRefundable: Money;
  } {
    const { status, amount, refundedAmount, refundWindowDays = 90, processedAt } = params;
    const now = new Date();

    // Check if payment can be refunded
    if (!['completed', 'processed'].includes(status)) {
      return {
        canRefund: false,
        reason: `Cannot refund payment in '${status}' status`,
        maxRefundable: { amount: 0, currency: amount.currency },
      };
    }

    // Check if already fully refunded
    const alreadyRefunded = refundedAmount.amount;
    if (alreadyRefunded >= amount.amount) {
      return {
        canRefund: false,
        reason: 'Payment has already been fully refunded',
        maxRefundable: { amount: 0, currency: amount.currency },
      };
    }

    // Check refund window
    if (processedAt && refundWindowDays) {
      const refundDeadline = new Date(processedAt.getTime() + refundWindowDays * 24 * 60 * 60 * 1000);
      if (now > refundDeadline) {
        return {
          canRefund: false,
          reason: `Refund window has expired (${refundWindowDays} days)`,
          maxRefundable: { amount: 0, currency: amount.currency },
        };
      }
    }

    const maxRefundable = amount.amount - alreadyRefunded;
    return {
      canRefund: true,
      maxRefundable: { amount: maxRefundable, currency: amount.currency },
    };
  }

  /**
   * حساب مبلغ الاسترداد
   */
  calculateRefundAmount(params: {
    originalAmount: Money;
    refundPercentage: number;
    previouslyRefunded?: Money;
    deductFees?: boolean;
    platformFeePercent?: number;
  }): {
    grossRefund: Money;
    feeDeduction: Money;
    netRefund: Money;
    totalRefunded: Money;
  } {
    const { 
      originalAmount, 
      refundPercentage, 
      previouslyRefunded = { amount: 0, currency: originalAmount.currency },
      deductFees = false,
      platformFeePercent = 0,
    } = params;

    const grossRefund = originalAmount.amount * (refundPercentage / 100);
    const feeDeduction = deductFees ? grossRefund * (platformFeePercent / 100) : 0;
    const netRefund = grossRefund - feeDeduction;
    const totalRefunded = previouslyRefunded.amount + netRefund;

    return {
      grossRefund: { amount: grossRefund, currency: originalAmount.currency },
      feeDeduction: { amount: feeDeduction, currency: originalAmount.currency },
      netRefund: { amount: netRefund, currency: originalAmount.currency },
      totalRefunded: { amount: totalRefunded, currency: originalAmount.currency },
    };
  }
}

// ==================== Escrow Domain Service ====================

/**
 * خدمة النطاق للضمانات
 */
export class EscrowDomainService {
  /**
   * التحقق من صلاحية الإصدار
   */
  canRelease(params: {
    escrowId: string;
    status: string;
    bookingStatus: string;
    hasDispute: boolean;
    holdPeriodHours?: number;
    heldAt: Date;
  }): {
    canRelease: boolean;
    reason?: string;
    releaseTo: 'host' | 'guest' | 'split' | null;
  } {
    const { status, bookingStatus, hasDispute, holdPeriodHours = 48, heldAt } = params;
    const now = new Date();

    // Check if already released
    if (['released', 'refunded'].includes(status)) {
      return {
        canRelease: false,
        reason: `Escrow is already ${status}`,
        releaseTo: null,
      };
    }

    // Check if under dispute
    if (hasDispute || status === 'disputed') {
      return {
        canRelease: false,
        reason: 'Escrow is under dispute',
        releaseTo: null,
      };
    }

    // Check booking status
    if (bookingStatus === 'cancelled') {
      return {
        canRelease: false,
        reason: 'Booking was cancelled - refund to guest',
        releaseTo: 'guest',
      };
    }

    if (bookingStatus === 'completed') {
      // Check if hold period has passed
      const releaseTime = new Date(heldAt.getTime() + holdPeriodHours * 60 * 60 * 1000);
      if (now >= releaseTime) {
        return {
          canRelease: true,
          releaseTo: 'host',
        };
      }
      return {
        canRelease: false,
        reason: `Hold period has not passed (${holdPeriodHours} hours)`,
        releaseTo: null,
      };
    }

    return {
      canRelease: false,
      reason: `Cannot release for booking in '${bookingStatus}' status`,
      releaseTo: null,
    };
  }

  /**
   * حساب مبالغ الإصدار
   */
  calculateReleaseAmounts(params: {
    totalAmount: Money;
    releaseType: 'host' | 'guest' | 'split';
    hostPercentage?: number;
    platformFeePercent?: number;
  }): {
    hostAmount: Money;
    guestAmount: Money;
    platformFee: Money;
  } {
    const { totalAmount, releaseType, hostPercentage = 100, platformFeePercent = 0 } = params;

    const platformFee = totalAmount.amount * (platformFeePercent / 100);
    const afterFee = totalAmount.amount - platformFee;

    switch (releaseType) {
      case 'host':
        return {
          hostAmount: { amount: afterFee, currency: totalAmount.currency },
          guestAmount: { amount: 0, currency: totalAmount.currency },
          platformFee: { amount: platformFee, currency: totalAmount.currency },
        };
      case 'guest':
        return {
          hostAmount: { amount: 0, currency: totalAmount.currency },
          guestAmount: { amount: afterFee, currency: totalAmount.currency },
          platformFee: { amount: platformFee, currency: totalAmount.currency },
        };
      case 'split':
        const hostAmount = afterFee * (hostPercentage / 100);
        const guestAmount = afterFee - hostAmount;
        return {
          hostAmount: { amount: hostAmount, currency: totalAmount.currency },
          guestAmount: { amount: guestAmount, currency: totalAmount.currency },
          platformFee: { amount: platformFee, currency: totalAmount.currency },
        };
    }
  }

  /**
   * التحقق من صلاحية فتح النزاع
   */
  canOpenDispute(params: {
    escrowId: string;
    status: string;
    bookingStatus: string;
    disputeWindowDays?: number;
    heldAt: Date;
    openerId: string;
    hostId: string;
    guestId: string;
  }): {
    canOpen: boolean;
    reason?: string;
  } {
    const { status, bookingStatus, disputeWindowDays = 14, heldAt, openerId, hostId, guestId } = params;
    const now = new Date();

    // Check if already resolved
    if (['released', 'refunded'].includes(status)) {
      return {
        canOpen: false,
        reason: 'Escrow has already been resolved',
      };
    }

    // Check if already disputed
    if (status === 'disputed') {
      return {
        canOpen: false,
        reason: 'Dispute is already open',
      };
    }

    // Check if opener is authorized
    if (openerId !== hostId && openerId !== guestId) {
      return {
        canOpen: false,
        reason: 'Only host or guest can open a dispute',
      };
    }

    // Check dispute window
    const disputeDeadline = new Date(heldAt.getTime() + disputeWindowDays * 24 * 60 * 60 * 1000);
    if (now > disputeDeadline) {
      return {
        canOpen: false,
        reason: `Dispute window has expired (${disputeWindowDays} days)`,
      };
    }

    return { canOpen: true };
  }

  /**
   * حل النزاع
   */
  resolveDispute(params: {
    escrowId: string;
    totalAmount: Money;
    hostPercentage: number;
    resolvedBy: 'admin' | 'mediator' | 'system';
    notes?: string;
    platformFeePercent?: number;
  }): {
    hostAmount: Money;
    guestAmount: Money;
    platformFee: Money;
    resolution: string;
  } {
    return {
      ...this.calculateReleaseAmounts({
        totalAmount: params.totalAmount,
        releaseType: 'split',
        hostPercentage: params.hostPercentage,
        platformFeePercent: params.platformFeePercent,
      }),
      resolution: `Dispute resolved by ${params.resolvedBy}. Host: ${params.hostPercentage}%, Guest: ${100 - params.hostPercentage}%`,
    };
  }
}

// ==================== Review Domain Service ====================

/**
 * خدمة النطاق للتقييمات
 */
export class ReviewDomainService {
  /**
   * التحقق من صلاحية التقييم
   */
  canReview(params: {
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    bookingStatus: string;
    guestId: string;
    hostId: string;
    checkOut: Date;
    existingReviewId?: string;
    reviewWindowDays?: number;
  }): {
    canReview: boolean;
    reason?: string;
  } {
    const { 
      reviewerId, 
      revieweeId, 
      bookingStatus, 
      guestId, 
      hostId, 
      checkOut, 
      existingReviewId,
      reviewWindowDays = 14,
    } = params;
    const now = new Date();

    // Check if review already exists
    if (existingReviewId) {
      return {
        canReview: false,
        reason: 'Review already exists for this booking',
      };
    }

    // Check if booking is completed
    if (bookingStatus !== 'completed') {
      return {
        canReview: false,
        reason: 'Can only review completed bookings',
      };
    }

    // Check if reviewer is part of the booking
    if (reviewerId !== guestId && reviewerId !== hostId) {
      return {
        canReview: false,
        reason: 'Only guest or host can leave a review',
      };
    }

    // Check if reviewee is valid
    if (revieweeId !== guestId && revieweeId !== hostId) {
      return {
        canReview: false,
        reason: 'Can only review the guest or host of this booking',
      };
    }

    // Check if reviewing themselves
    if (reviewerId === revieweeId) {
      return {
        canReview: false,
        reason: 'Cannot review yourself',
      };
    }

    // Check review window
    const reviewDeadline = new Date(checkOut.getTime() + reviewWindowDays * 24 * 60 * 60 * 1000);
    if (now > reviewDeadline) {
      return {
        canReview: false,
        reason: `Review window has expired (${reviewWindowDays} days after checkout)`,
      };
    }

    return { canReview: true };
  }

  /**
   * حساب متوسط التقييم
   */
  calculateAverageRating(reviews: Array<{
    ratingOverall: number;
    ratingCleanliness?: number;
    ratingCommunication?: number;
    ratingLocation?: number;
    ratingCheckIn?: number;
    ratingValue?: number;
  }>): {
    overall: number;
    cleanliness: number;
    communication: number;
    location: number;
    checkIn: number;
    value: number;
    count: number;
  } {
    if (reviews.length === 0) {
      return {
        overall: 0,
        cleanliness: 0,
        communication: 0,
        location: 0,
        checkIn: 0,
        value: 0,
        count: 0,
      };
    }

    const sum = reviews.reduce(
      (acc, r) => ({
        overall: acc.overall + r.ratingOverall,
        cleanliness: acc.cleanliness + (r.ratingCleanliness ?? 0),
        communication: acc.communication + (r.ratingCommunication ?? 0),
        location: acc.location + (r.ratingLocation ?? 0),
        checkIn: acc.checkIn + (r.ratingCheckIn ?? 0),
        value: acc.value + (r.ratingValue ?? 0),
      }),
      { overall: 0, cleanliness: 0, communication: 0, location: 0, checkIn: 0, value: 0 }
    );

    const count = reviews.length;
    const categoriesCount = reviews.filter(r => r.ratingCleanliness !== undefined).length || 1;

    return {
      overall: Number((sum.overall / count).toFixed(2)),
      cleanliness: Number((sum.cleanliness / categoriesCount).toFixed(2)),
      communication: Number((sum.communication / categoriesCount).toFixed(2)),
      location: Number((sum.location / categoriesCount).toFixed(2)),
      checkIn: Number((sum.checkIn / categoriesCount).toFixed(2)),
      value: Number((sum.value / categoriesCount).toFixed(2)),
      count,
    };
  }

  /**
   * التحقق من صلاحية الرد على التقييم
   */
  canRespond(params: {
    reviewId: string;
    responderId: string;
    revieweeId: string;
    existingResponse?: string;
    responseWindowDays?: number;
    reviewCreatedAt: Date;
  }): {
    canRespond: boolean;
    reason?: string;
  } {
    const { responderId, revieweeId, existingResponse, responseWindowDays = 14, reviewCreatedAt } = params;
    const now = new Date();

    // Check if already responded
    if (existingResponse) {
      return {
        canRespond: false,
        reason: 'Response already exists',
      };
    }

    // Check if responder is the reviewee
    if (responderId !== revieweeId) {
      return {
        canRespond: false,
        reason: 'Only the reviewed person can respond',
      };
    }

    // Check response window
    const responseDeadline = new Date(reviewCreatedAt.getTime() + responseWindowDays * 24 * 60 * 60 * 1000);
    if (now > responseDeadline) {
      return {
        canRespond: false,
        reason: `Response window has expired (${responseWindowDays} days)`,
      };
    }

    return { canRespond: true };
  }
}

// ==================== Listing Domain Service ====================

/**
 * خدمة النطاق للإعلانات
 */
export class ListingDomainService {
  /**
   * التحقق من صلاحية النشر
   */
  canPublish(params: {
    listingId: string;
    status: string;
    hasImages: boolean;
    hasTitle: boolean;
    hasDescription: boolean;
    hasPrice: boolean;
    hasLocation: boolean;
    minImages?: number;
  }): {
    canPublish: boolean;
    reasons: string[];
  } {
    const { status, hasImages, hasTitle, hasDescription, hasPrice, hasLocation, minImages = 1 } = params;
    const reasons: string[] = [];

    // Check if already published
    if (status === 'active') {
      reasons.push('Listing is already published');
    }

    // Check required fields
    if (!hasTitle) {
      reasons.push('Title is required');
    }
    if (!hasDescription) {
      reasons.push('Description is required');
    }
    if (!hasPrice) {
      reasons.push('Price is required');
    }
    if (!hasLocation) {
      reasons.push('Location is required');
    }
    if (!hasImages) {
      reasons.push('At least one image is required');
    }

    return {
      canPublish: reasons.length === 0,
      reasons,
    };
  }

  /**
   * حساب السعر الموسمي
   */
  calculateSeasonalPrice(params: {
    basePrice: Money;
    date: Date;
    seasonalPricing: Array<{
      startDate: Date;
      endDate: Date;
      priceModifier: number;
      type: 'multiplier' | 'fixed';
    }>;
    weekendPrice?: Money;
    weekendDays?: number[];
  }): Money {
    const { basePrice, date, seasonalPricing, weekendPrice, weekendDays = [5, 6] } = params;

    // Check for seasonal pricing
    for (const season of seasonalPricing) {
      if (date >= season.startDate && date <= season.endDate) {
        if (season.type === 'multiplier') {
          return {
            amount: basePrice.amount * season.priceModifier,
            currency: basePrice.currency,
          };
        } else {
          return {
            amount: season.priceModifier,
            currency: basePrice.currency,
          };
        }
      }
    }

    // Check for weekend pricing
    const dayOfWeek = date.getDay();
    if (weekendPrice && weekendDays.includes(dayOfWeek)) {
      return weekendPrice;
    }

    return basePrice;
  }

  /**
   * التحقق من التوفر
   */
  checkAvailability(params: {
    listingId: string;
    availability: Array<{
      date: Date;
      isAvailable: boolean;
      price?: Money;
      minNights?: number;
      maxNights?: number;
    }>;
    checkIn: Date;
    checkOut: Date;
  }): {
    isAvailable: boolean;
    unavailableDates: Date[];
    pricePerNight: Money[];
    minNights: number;
    maxNights: number;
  } {
    const { availability, checkIn, checkOut } = params;
    const unavailableDates: Date[] = [];
    const pricePerNight: Money[] = [];
    let minNights = 1;
    let maxNights = 365;

    const current = new Date(checkIn);
    while (current < checkOut) {
      const dayAvailability = availability.find(
        a => a.date.toDateString() === current.toDateString()
      );

      if (!dayAvailability || !dayAvailability.isAvailable) {
        unavailableDates.push(new Date(current));
      } else {
        if (dayAvailability.price) {
          pricePerNight.push(dayAvailability.price);
        }
        if (dayAvailability.minNights) {
          minNights = Math.max(minNights, dayAvailability.minNights);
        }
        if (dayAvailability.maxNights) {
          maxNights = Math.min(maxNights, dayAvailability.maxNights);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      isAvailable: unavailableDates.length === 0,
      unavailableDates,
      pricePerNight,
      minNights,
      maxNights,
    };
  }

  /**
   * حساب خصم المضيف
   */
  calculateHostDiscount(params: {
    hostId: string;
    isSuperhost: boolean;
    totalBookings: number;
    ratingAverage: number;
    bookingAmount: Money;
  }): {
    discountPercent: number;
    discountAmount: Money;
    reason: string;
  } {
    const { isSuperhost, totalBookings, ratingAverage, bookingAmount } = params;
    let discountPercent = 0;
    let reason = '';

    // Superhost discount
    if (isSuperhost) {
      discountPercent += 5;
      reason = 'Superhost discount';
    }

    // Volume discount
    if (totalBookings >= 100) {
      discountPercent += 10;
      reason += reason ? ', ' : '';
      reason += 'Loyalty discount (100+ bookings)';
    } else if (totalBookings >= 50) {
      discountPercent += 5;
      reason += reason ? ', ' : '';
      reason += 'Loyalty discount (50+ bookings)';
    }

    // Rating bonus
    if (ratingAverage >= 4.8) {
      discountPercent += 3;
      reason += reason ? ', ' : '';
      reason += 'High rating bonus';
    }

    const discountAmount = bookingAmount.amount * (discountPercent / 100);

    return {
      discountPercent,
      discountAmount: { amount: discountAmount, currency: bookingAmount.currency },
      reason,
    };
  }
}

// ==================== User Domain Service ====================

/**
 * خدمة النطاق للمستخدمين
 */
export class UserDomainService {
  /**
   * التحقق من صلاحية أن يكون مضيف
   */
  canBecomeHost(params: {
    userId: string;
    isVerified: boolean;
    status: string;
    hasCompletedProfile: boolean;
    hasPaymentMethod: boolean;
    minVerificationLevel?: string;
  }): {
    canBecomeHost: boolean;
    reasons: string[];
  } {
    const { isVerified, status, hasCompletedProfile, hasPaymentMethod } = params;
    const reasons: string[] = [];

    if (!isVerified) {
      reasons.push('Account must be verified');
    }
    if (status !== 'active') {
      reasons.push('Account must be active');
    }
    if (!hasCompletedProfile) {
      reasons.push('Profile must be completed');
    }
    if (!hasPaymentMethod) {
      reasons.push('Payment method is required for receiving payouts');
    }

    return {
      canBecomeHost: reasons.length === 0,
      reasons,
    };
  }

  /**
   * التحقق من صلاحية إنشاء شركة
   */
  canCreateCompany(params: {
    userId: string;
    role: string;
    existingCompaniesCount: number;
    maxCompaniesPerUser?: number;
  }): {
    canCreate: boolean;
    reason?: string;
  } {
    const { role, existingCompaniesCount, maxCompaniesPerUser = 1 } = params;

    if (role === 'user') {
      return {
        canCreate: false,
        reason: 'User role cannot create companies',
      };
    }

    if (existingCompaniesCount >= maxCompaniesPerUser) {
      return {
        canCreate: false,
        reason: `Maximum of ${maxCompaniesPerUser} companies per user`,
      };
    }

    return { canCreate: true };
  }

  /**
   * حساب مستوى العضوية
   */
  calculateMembershipLevel(params: {
    totalSpent: number;
    totalBookings: number;
    loyaltyPoints: number;
  }): {
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    progress: number;
    nextLevel: string | null;
    benefits: string[];
  } {
    const { totalSpent, totalBookings, loyaltyPoints } = params;

    // Calculate score (weighted combination)
    const score = (totalSpent / 100) + (totalBookings * 10) + (loyaltyPoints / 10);

    if (score >= 1000) {
      return {
        level: 'platinum',
        progress: 100,
        nextLevel: null,
        benefits: [
          'Priority support',
          'Exclusive discounts',
          'Free cancellations',
          'Early access to new listings',
          'Personal travel advisor',
        ],
      };
    }

    if (score >= 500) {
      return {
        level: 'gold',
        progress: ((score - 500) / 500) * 100,
        nextLevel: 'platinum',
        benefits: [
          'Priority support',
          'Exclusive discounts',
          'Free cancellations',
          'Early access to new listings',
        ],
      };
    }

    if (score >= 100) {
      return {
        level: 'silver',
        progress: ((score - 100) / 400) * 100,
        nextLevel: 'gold',
        benefits: [
          'Priority support',
          'Exclusive discounts',
          'Free cancellations',
        ],
      };
    }

    return {
      level: 'bronze',
      progress: (score / 100) * 100,
      nextLevel: 'silver',
      benefits: [
        'Basic support',
        'Member-only prices',
      ],
    };
  }

  /**
   * التحقق من صلاحية الترقية
   */
  canUpgrade(params: {
    currentLevel: string;
    targetLevel: string;
    meetsRequirements: boolean;
  }): {
    canUpgrade: boolean;
    reason?: string;
  } {
    const { currentLevel, targetLevel, meetsRequirements } = params;

    const levels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = levels.indexOf(currentLevel);
    const targetIndex = levels.indexOf(targetLevel);

    if (targetIndex <= currentIndex) {
      return {
        canUpgrade: false,
        reason: 'Cannot downgrade or stay at same level',
      };
    }

    if (targetIndex > currentIndex + 1) {
      return {
        canUpgrade: false,
        reason: 'Can only upgrade one level at a time',
      };
    }

    if (!meetsRequirements) {
      return {
        canUpgrade: false,
        reason: 'Requirements not met for this level',
      };
    }

    return { canUpgrade: true };
  }
}

// ==================== Export All ====================

export const DomainServices = {
  Booking: BookingDomainService,
  Payment: PaymentDomainService,
  Escrow: EscrowDomainService,
  Review: ReviewDomainService,
  Listing: ListingDomainService,
  User: UserDomainService,
};

// Singleton instances
export const bookingDomainService = new BookingDomainService();
export const paymentDomainService = new PaymentDomainService();
export const escrowDomainService = new EscrowDomainService();
export const reviewDomainService = new ReviewDomainService();
export const listingDomainService = new ListingDomainService();
export const userDomainService = new UserDomainService();
