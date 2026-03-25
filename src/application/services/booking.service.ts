/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking Domain Service
 * 
 * خدمة مجال الحجوزات - تنسق بين المستودعات المختلفة
 * 
 * @module application/services/booking.service
 */

import { db } from '@/lib/db';
import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

export interface BookingCalculationInput {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  couponCode?: string;
}

export interface BookingCalculationOutput {
  nights: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  discount: number;
  totalPrice: number;
  currency: string;
  breakdown: {
    nightlyRate: number;
    weekendNights: number;
    weekendRate: number;
    weekdayNights: number;
    weekdayRate: number;
  };
}

export interface CancellationCalculationInput {
  bookingId: string;
  cancelledBy: 'guest' | 'host';
  reason?: string;
}

export interface CancellationCalculationOutput {
  refundAmount: number;
  hostPayout: number;
  platformFee: number;
  refundPercentage: number;
  policy: string;
  deadline: Date;
}

// ==================== Service ====================

/**
 * حساب أسعار الحجز
 */
export async function calculateBookingPrice(
  input: BookingCalculationInput
): Promise<Result<BookingCalculationOutput, Error>> {
  try {
    // Get listing
    const listing = await db.listing.findUnique({
      where: { id: input.listingId },
    });

    if (!listing) {
      return err(new Error('Listing not found'));
    }

    // Calculate nights
    const nights = Math.ceil(
      (input.checkOut.getTime() - input.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < listing.minNights) {
      return err(new Error(`Minimum nights is ${listing.minNights}`));
    }

    if (listing.maxNights && nights > listing.maxNights) {
      return err(new Error(`Maximum nights is ${listing.maxNights}`));
    }

    if (input.guests > listing.capacity) {
      return err(new Error(`Maximum capacity is ${listing.capacity} guests`));
    }

    // Calculate base price
    let basePrice = 0;
    const weekendDays = countWeekendDays(input.checkIn, input.checkOut);
    const weekdayDays = nights - weekendDays;

    const weekdayRate = listing.basePrice;
    const weekendRate = listing.weekendPrice ?? listing.basePrice;

    basePrice = (weekdayDays * weekdayRate) + (weekendDays * weekendRate);

    // Calculate fees
    const cleaningFee = listing.cleaningFee ?? 0;
    const serviceFee = basePrice * 0.1; // 10% service fee
    const taxes = basePrice * 0.05; // 5% taxes

    // Apply coupon if provided
    let discount = 0;
    if (input.couponCode) {
      const coupon = await db.coupon.findFirst({
        where: {
          code: input.couponCode,
          active: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discount = basePrice * (coupon.discountValue / 100);
        } else {
          discount = coupon.discountValue;
        }
      }
    }

    const totalPrice = basePrice + cleaningFee + serviceFee + taxes - discount;

    return ok({
      nights,
      basePrice,
      cleaningFee,
      serviceFee,
      taxes,
      discount,
      totalPrice,
      currency: listing.currency,
      breakdown: {
        nightlyRate: listing.basePrice,
        weekendNights: weekendDays,
        weekendRate,
        weekdayNights: weekdayDays,
        weekdayRate,
      },
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to calculate booking price'));
  }
}

/**
 * حساب الاسترداد للإلغاء
 */
export async function calculateCancellationRefund(
  input: CancellationCalculationInput
): Promise<Result<CancellationCalculationOutput, Error>> {
  try {
    const booking = await db.booking.findUnique({
      where: { id: input.bookingId },
      include: { listing: true },
    });

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    const now = new Date();
    const daysUntilCheckIn = Math.ceil(
      (booking.checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const policy = booking.listing?.cancellationPolicy ?? 'moderate';
    let refundPercentage = 0;
    let deadline = new Date();

    // Calculate based on policy
    if (policy === 'flexible') {
      deadline = new Date(booking.checkIn);
      deadline.setDate(deadline.getDate() - 1);
      if (daysUntilCheckIn >= 1) {
        refundPercentage = 100;
      } else {
        refundPercentage = 50;
      }
    } else if (policy === 'moderate') {
      deadline = new Date(booking.checkIn);
      deadline.setDate(deadline.getDate() - 5);
      if (daysUntilCheckIn >= 5) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 1) {
        refundPercentage = 50;
      }
    } else if (policy === 'strict') {
      deadline = new Date(booking.checkIn);
      deadline.setDate(deadline.getDate() - 14);
      if (daysUntilCheckIn >= 14) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 7) {
        refundPercentage = 50;
      }
    } else if (policy === 'super_strict') {
      deadline = new Date(booking.checkIn);
      deadline.setDate(deadline.getDate() - 30);
      if (daysUntilCheckIn >= 30) {
        refundPercentage = 50;
      }
    }

    // If cancelled by host, full refund
    if (input.cancelledBy === 'host') {
      refundPercentage = 100;
    }

    const refundAmount = booking.totalPrice * (refundPercentage / 100);
    const hostPayout = booking.totalPrice - refundAmount;
    const platformFee = booking.serviceFee * (1 - refundPercentage / 100);

    return ok({
      refundAmount,
      hostPayout,
      platformFee,
      refundPercentage,
      policy,
      deadline,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to calculate refund'));
  }
}

// ==================== Helper Functions ====================

function countWeekendDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current < end) {
    const day = current.getDay();
    // Friday (5) and Saturday (6) are weekend in Arab countries
    if (day === 5 || day === 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
