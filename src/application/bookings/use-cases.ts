/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bookings Use Cases
 * 
 * حالات استخدام الحجوزات
 * 
 * @module application/bookings/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { bookingRepository } from '@/infrastructure/repositories/booking.repository';
import { listingRepository } from '@/infrastructure/repositories/listing.repository';

// ==================== Types ====================

export interface CreateBookingInput {
  guestId: string;
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  adults?: number;
  children?: number;
  infants?: number;
  guestNotes?: string;
  specialRequests?: string;
}

export interface UpdateBookingInput {
  guests?: number;
  adults?: number;
  children?: number;
  infants?: number;
  guestNotes?: string;
  specialRequests?: string;
  checkIn?: Date;
  checkOut?: Date;
}

export interface BookingFilter {
  guestId?: string;
  hostId?: string;
  listingId?: string;
  status?: string | string[];
  paymentStatus?: string;
  checkInFrom?: Date;
  checkInTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface BookingOutput {
  id: string;
  guestId: string;
  hostId: string;
  listingId: string;
  companyId?: string;
  checkIn: Date;
  checkOut: Date;
  checkInActual?: Date;
  checkOutActual?: Date;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  basePrice: number;
  cleaningFee?: number;
  serviceFee: number;
  taxes: number;
  discount: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  completedAt?: Date;
  guestNotes?: string;
  hostNotes?: string;
  specialRequests?: string;
  paidAt?: Date;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  listing?: {
    id: string;
    title: string;
    slug: string;
    city?: string;
    country?: string;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface PaginatedBookings {
  items: BookingOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

// ==================== Use Cases ====================

/**
 * إنشاء حجز جديد
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<Result<BookingOutput, Error>> {
  try {
    // Get listing using repository
    const listing = await listingRepository.findByIdForBooking(input.listingId);

    if (!listing) {
      return err(new Error('Listing not found'));
    }

    if (listing.status !== 'active') {
      return err(new Error('Listing is not available'));
    }

    // Calculate nights
    const nights = Math.ceil(
      (input.checkOut.getTime() - input.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < (listing.minNights as number)) {
      return err(new Error(`Minimum nights is ${listing.minNights}`));
    }

    if (listing.maxNights && nights > (listing.maxNights as number)) {
      return err(new Error(`Maximum nights is ${listing.maxNights}`));
    }

    if (input.guests > (listing.capacity as number)) {
      return err(new Error(`Maximum capacity is ${listing.capacity} guests`));
    }

    // Check availability using repository
    const isAvailable = await bookingRepository.isAvailable(
      input.listingId,
      input.checkIn,
      input.checkOut
    );

    if (!isAvailable) {
      return err(new Error('Dates are not available'));
    }

    // Calculate prices
    let basePrice = (listing.basePrice as number) * nights;
    
    // Apply weekend price if applicable
    if (listing.weekendPrice) {
      const weekendDays = countWeekendDays(input.checkIn, input.checkOut);
      const weekdayDays = nights - weekendDays;
      basePrice = ((listing.basePrice as number) * weekdayDays) + ((listing.weekendPrice as number) * weekendDays);
    }

    const cleaningFee = (listing.cleaningFee as number) ?? 0;
    const serviceFee = basePrice * 0.1; // 10% service fee
    const taxes = basePrice * 0.05; // 5% taxes
    const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

    // Create booking using repository
    const booking = await bookingRepository.createWithRelations({
      guestId: input.guestId,
      hostId: listing.hostId as string,
      listingId: input.listingId,
      companyId: listing.companyId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      adults: input.adults ?? input.guests,
      children: input.children ?? 0,
      infants: input.infants ?? 0,
      basePrice,
      cleaningFee,
      serviceFee,
      taxes,
      discount: 0,
      totalPrice,
      currency: listing.currency,
      guestNotes: input.guestNotes,
      specialRequests: input.specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Update listing booking count
    await listingRepository.incrementBookingCount(input.listingId);

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create booking'));
  }
}

/**
 * الحصول على حجز بالمعرف
 */
export async function getBooking(id: string): Promise<Result<BookingOutput, Error>> {
  try {
    const booking = await bookingRepository.findByIdWithDetails(id);

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get booking'));
  }
}

/**
 * تحديث حجز
 */
export async function updateBooking(
  id: string,
  input: UpdateBookingInput
): Promise<Result<BookingOutput, Error>> {
  try {
    const updateData: Record<string, unknown> = {};

    if (input.guests !== undefined) updateData.guests = input.guests;
    if (input.adults !== undefined) updateData.adults = input.adults;
    if (input.children !== undefined) updateData.children = input.children;
    if (input.infants !== undefined) updateData.infants = input.infants;
    if (input.guestNotes !== undefined) updateData.guestNotes = input.guestNotes;
    if (input.specialRequests !== undefined) updateData.specialRequests = input.specialRequests;

    const booking = await bookingRepository.update(id, updateData);

    // Get full booking details
    const fullBooking = await bookingRepository.findByIdWithDetails(id);
    if (!fullBooking) {
      return err(new Error('Booking not found after update'));
    }

    return ok(mapToBookingOutput(fullBooking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to update booking'));
  }
}

/**
 * تأكيد حجز
 */
export async function confirmBooking(
  id: string,
  hostId: string
): Promise<Result<BookingOutput, Error>> {
  try {
    const existing = await bookingRepository.findByIdBasic(id);

    if (!existing) {
      return err(new Error('Booking not found'));
    }

    if (existing.hostId !== hostId) {
      return err(new Error('Unauthorized'));
    }

    if (existing.status !== 'pending') {
      return err(new Error('Booking cannot be confirmed'));
    }

    await bookingRepository.confirm(id);

    const booking = await bookingRepository.findByIdWithDetails(id);
    if (!booking) {
      return err(new Error('Booking not found after confirmation'));
    }

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to confirm booking'));
  }
}

/**
 * رفض حجز
 */
export async function rejectBooking(
  id: string,
  hostId: string,
  reason?: string
): Promise<Result<BookingOutput, Error>> {
  try {
    const existing = await bookingRepository.findByIdBasic(id);

    if (!existing) {
      return err(new Error('Booking not found'));
    }

    if (existing.hostId !== hostId) {
      return err(new Error('Unauthorized'));
    }

    if (existing.status !== 'pending') {
      return err(new Error('Booking cannot be rejected'));
    }

    await bookingRepository.reject(id, hostId, reason ?? 'Rejected by host');

    const booking = await bookingRepository.findByIdWithDetails(id);
    if (!booking) {
      return err(new Error('Booking not found after rejection'));
    }

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to reject booking'));
  }
}

/**
 * إلغاء حجز
 */
export async function cancelBooking(
  id: string,
  userId: string,
  reason?: string
): Promise<Result<BookingOutput, Error>> {
  try {
    const existing = await bookingRepository.findByIdBasic(id);

    if (!existing) {
      return err(new Error('Booking not found'));
    }

    if (existing.guestId !== userId && existing.hostId !== userId) {
      return err(new Error('Unauthorized'));
    }

    if (!['pending', 'confirmed'].includes(existing.status as string)) {
      return err(new Error('Booking cannot be cancelled'));
    }

    // Get listing for cancellation policy
    const listing = await listingRepository.findByIdForBooking(existing.listingId as string);

    // Calculate refund based on cancellation policy
    let refundAmount = 0;
    const now = new Date();
    const daysUntilCheckIn = Math.ceil(
      ((existing.checkIn as Date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const policy = listing?.cancellationPolicy ?? 'moderate';

    if (policy === 'flexible') {
      if (daysUntilCheckIn >= 1) refundAmount = existing.totalPrice as number;
      else refundAmount = (existing.totalPrice as number) * 0.5;
    } else if (policy === 'moderate') {
      if (daysUntilCheckIn >= 5) refundAmount = existing.totalPrice as number;
      else if (daysUntilCheckIn >= 1) refundAmount = (existing.totalPrice as number) * 0.5;
    } else if (policy === 'strict') {
      if (daysUntilCheckIn >= 14) refundAmount = existing.totalPrice as number;
      else if (daysUntilCheckIn >= 7) refundAmount = (existing.totalPrice as number) * 0.5;
    }

    const booking = await bookingRepository.cancelWithRefund(id, userId, refundAmount, reason);

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to cancel booking'));
  }
}

/**
 * تسجيل الوصول
 */
export async function checkIn(
  id: string,
  hostId: string
): Promise<Result<BookingOutput, Error>> {
  try {
    const existing = await bookingRepository.findByIdBasic(id);

    if (!existing) {
      return err(new Error('Booking not found'));
    }

    if (existing.hostId !== hostId) {
      return err(new Error('Unauthorized'));
    }

    if (existing.status !== 'confirmed') {
      return err(new Error('Booking cannot be checked in'));
    }

    await bookingRepository.checkIn(id);

    const booking = await bookingRepository.findByIdWithDetails(id);
    if (!booking) {
      return err(new Error('Booking not found after check-in'));
    }

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to check in'));
  }
}

/**
 * تسجيل المغادرة
 */
export async function checkOut(
  id: string,
  hostId: string
): Promise<Result<BookingOutput, Error>> {
  try {
    const existing = await bookingRepository.findByIdBasic(id);

    if (!existing) {
      return err(new Error('Booking not found'));
    }

    if (existing.hostId !== hostId) {
      return err(new Error('Unauthorized'));
    }

    if (existing.status !== 'in_progress') {
      return err(new Error('Booking cannot be checked out'));
    }

    await bookingRepository.checkOut(id);

    // Update user stats
    await bookingRepository.updateGuestStats(
      existing.guestId as string,
      existing.totalPrice as number
    );

    const booking = await bookingRepository.findByIdWithDetails(id);
    if (!booking) {
      return err(new Error('Booking not found after check-out'));
    }

    return ok(mapToBookingOutput(booking));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to check out'));
  }
}

/**
 * البحث عن حجوزات
 */
export async function searchBookings(
  filter: BookingFilter,
  options?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
): Promise<Result<PaginatedBookings, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build repository filter
    const repoFilter: Record<string, unknown> = {};

    if (filter.guestId) repoFilter.guestId = filter.guestId;
    if (filter.hostId) repoFilter.hostId = filter.hostId;
    if (filter.listingId) repoFilter.listingId = filter.listingId;
    
    if (filter.status) {
      repoFilter.status = filter.status;
    }
    
    if (filter.paymentStatus) repoFilter.paymentStatus = filter.paymentStatus;

    if (filter.checkInFrom || filter.checkInTo) {
      repoFilter.checkInFrom = filter.checkInFrom;
      repoFilter.checkInTo = filter.checkInTo;
    }

    if (filter.createdFrom || filter.createdTo) {
      repoFilter.createdFrom = filter.createdFrom;
      repoFilter.createdTo = filter.createdTo;
    }

    const result = await bookingRepository.search(repoFilter as unknown as Parameters<typeof bookingRepository.search>[0], {
      limit,
      offset,
      sortBy: options?.sortBy ?? 'createdAt',
      sortOrder: options?.sortOrder ?? 'desc',
    });

    return ok({
      items: result.items.map(mapToBookingOutput),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
      hasMore: offset + limit < result.total,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to search bookings'));
  }
}

/**
 * إحصائيات الحجوزات
 */
export async function getBookingStats(userId: string): Promise<Result<BookingStats, Error>> {
  try {
    const stats = await bookingRepository.getStatsForUser(userId);

    return ok({
      total: stats.total,
      pending: stats.pending,
      confirmed: stats.confirmed,
      inProgress: stats.inProgress,
      completed: stats.completed,
      cancelled: stats.cancelled,
      totalRevenue: stats.totalRevenue,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get stats'));
  }
}

// ==================== Helper Functions ====================

function countWeekendDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current < end) {
    const day = current.getDay();
    if (day === 5 || day === 6) count++; // Friday and Saturday (Arab weekend)
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function mapToBookingOutput(booking: Record<string, unknown>): BookingOutput {
  return {
    id: booking.id as string,
    guestId: booking.guestId as string,
    hostId: booking.hostId as string,
    listingId: booking.listingId as string,
    companyId: booking.companyId as string | undefined,
    checkIn: booking.checkIn as Date,
    checkOut: booking.checkOut as Date,
    checkInActual: booking.checkInActual as Date | undefined,
    checkOutActual: booking.checkOutActual as Date | undefined,
    guests: booking.guests as number,
    adults: booking.adults as number,
    children: booking.children as number,
    infants: booking.infants as number,
    basePrice: booking.basePrice as number,
    cleaningFee: booking.cleaningFee as number | undefined,
    serviceFee: booking.serviceFee as number,
    taxes: booking.taxes as number,
    discount: booking.discount as number,
    totalPrice: booking.totalPrice as number,
    currency: booking.currency as string,
    status: booking.status as string,
    paymentStatus: booking.paymentStatus as string,
    confirmedAt: booking.confirmedAt as Date | undefined,
    cancelledAt: booking.cancelledAt as Date | undefined,
    cancelledBy: booking.cancelledBy as string | undefined,
    cancellationReason: booking.cancellationReason as string | undefined,
    completedAt: booking.completedAt as Date | undefined,
    guestNotes: booking.guestNotes as string | undefined,
    hostNotes: booking.hostNotes as string | undefined,
    specialRequests: booking.specialRequests as string | undefined,
    paidAt: booking.paidAt as Date | undefined,
    refundAmount: booking.refundAmount as number | undefined,
    refundedAt: booking.refundedAt as Date | undefined,
    createdAt: booking.createdAt as Date,
    updatedAt: booking.updatedAt as Date,
    listing: booking.listing as BookingOutput['listing'],
    guest: booking.guest as BookingOutput['guest'],
    host: booking.host as BookingOutput['host'],
  };
}
