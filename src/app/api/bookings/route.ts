/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bookings API Endpoint
 *
 * نقطة نهاية API للحجوزات مع تحقق محسن
 *
 * @route GET /api/bookings - قائمة الحجوزات
 * @route POST /api/bookings - إنشاء حجز جديد
 * @updated Fixed formatValidationErrors import
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { BookingRepository } from '@/infrastructure/repositories/booking.repository';
import { ListingRepository } from '@/infrastructure/repositories/listing.repository';
import { BookingMapper } from '@/application/mappers';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  getPaginationParams,
  getSortParams,
} from '@/lib/api-response';
import {
  createBookingSchema,
  validate,
  formatValidationErrors,
} from '@/lib/api-validation';

// Initialize repositories
const bookingRepository = new BookingRepository();
const listingRepository = new ListingRepository();

// ==================== GET - List Bookings ====================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { searchParams } = new URL(request.url);

    // Check for stats request
    if (searchParams.get('stats') === 'true') {
      return handleGetStats(user.id, searchParams);
    }

    // Check for calendar request
    if (searchParams.get('calendar') === 'true') {
      return handleGetCalendar(user.id, searchParams);
    }

    const { page, limit, skip } = getPaginationParams(searchParams);
    const { sortBy, sortOrder } = getSortParams(searchParams);

    // Build filter based on user role
    const role = searchParams.get('role') || (user.role === 'host' ? 'host' : 'guest');
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    const filter = {
      guestId: role === 'guest' ? user.id : (isAdmin ? searchParams.get('guestId') || undefined : undefined),
      hostId: role === 'host' ? user.id : (isAdmin ? searchParams.get('hostId') || undefined : undefined),
      listingId: searchParams.get('listingId') || undefined,
      status: searchParams.get('status')?.split(',') || undefined,
      paymentStatus: searchParams.get('paymentStatus')?.split(',') || undefined,
      checkInFrom: searchParams.get('checkInAfter') ? new Date(searchParams.get('checkInAfter')!) : undefined,
      checkInTo: searchParams.get('checkInBefore') ? new Date(searchParams.get('checkInBefore')!) : undefined,
    };

    // Get bookings
    const result = await bookingRepository.search(filter, {
      limit,
      offset: skip,
      sortBy,
      sortOrder,
    });

    return paginatedResponse(
      result.items.map(b => BookingMapper.prismaToDTO(b as any)),
      {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: page * limit < result.total,
      }
    );

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الحجوزات', 500);
  }
}

// ==================== POST - Create Booking ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول للحجز', 401);
    }

    const body = await request.json();

    // Validate input
    const validation = validate(createBookingSchema, body);
    if (!validation.success) {
      return validationErrorResponse(formatValidationErrors(validation.errors));
    }

    const data = validation.data;

    // Get listing
    const listing = await listingRepository.findById(data.listingId);

    if (!listing) {
      return errorResponse('NOT_FOUND', 'الإقامة غير موجودة', 404);
    }

    if ((listing as any).status !== 'active' && (listing as any).status !== 'published') {
      return errorResponse('NOT_AVAILABLE', 'الإقامة غير متاحة للحجز', 400);
    }

    // Check capacity
    const totalGuests = (data.adults || data.guests) + (data.children || 0);
    if (totalGuests > (listing as any).capacity) {
      return errorResponse('OVER_CAPACITY', 'عدد الضيوف يتجاوز سعة الإقامة', 400);
    }

    // Check minimum nights
    const nights = Math.ceil(
      (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < (listing as any).minNights) {
      return errorResponse('MIN_NIGHTS', `الحد الأدنى للحجز ${(listing as any).minNights} ليالي`, 400);
    }

    if ((listing as any).maxNights && nights > (listing as any).maxNights) {
      return errorResponse('MAX_NIGHTS', `الحد الأقصى للحجز ${(listing as any).maxNights} ليالي`, 400);
    }

    // Check availability
    const isAvailable = await bookingRepository.checkAvailability(
      data.listingId,
      data.checkIn,
      data.checkOut
    );

    if (!isAvailable) {
      return errorResponse('NOT_AVAILABLE', 'الإقامة غير متاحة في هذه الفترة', 409);
    }

    // Calculate prices
    const basePrice = (listing as any).basePrice * nights;
    const cleaningFee = (listing as any).cleaningFee || 0;
    const serviceFee = Math.round(basePrice * 0.12); // 12% service fee
    const taxes = Math.round((basePrice + cleaningFee) * 0.05); // 5% taxes
    const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

    // Create booking
    const bookingData = {
      guestId: user.id,
      hostId: (listing as any).hostId,
      listingId: data.listingId,
      companyId: (listing as any).companyId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights,
      guests: data.guests,
      adults: data.adults || data.guests,
      children: data.children || 0,
      infants: data.infants || 0,
      basePrice,
      cleaningFee,
      serviceFee,
      taxes,
      totalPrice,
      currency: (listing as any).currency || 'SYP',
      guestNotes: data.guestNotes,
      specialRequests: data.specialRequests,
      status: (listing as any).instantBook ? 'confirmed' : 'pending',
      paymentStatus: 'pending',
      source: 'website',
    };

    const booking = await bookingRepository.create(bookingData);

    // Update listing booking count
    await listingRepository.incrementBookingCount(data.listingId);

    return createdResponse({
      ...BookingMapper.prismaToDTO(booking as any),
      message: (listing as any).instantBook
        ? 'تم تأكيد الحجز بنجاح'
        : 'تم إرسال طلب الحجز، في انتظار موافقة المضيف',
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء الحجز', 500);
  }
}

// ==================== Helper Functions ====================

async function handleGetStats(userId: string, searchParams: URLSearchParams) {
  const listingId = searchParams.get('listingId');
  const role = searchParams.get('role') || 'host';

  const stats = await bookingRepository.getStats({
    hostId: role === 'host' ? userId : undefined,
    guestId: role === 'guest' ? userId : undefined,
    listingId: listingId || undefined,
  });

  return successResponse(stats);
}

async function handleGetCalendar(userId: string, searchParams: URLSearchParams) {
  const listingId = searchParams.get('listingId');
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date();
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

  if (!listingId) {
    return errorResponse('INVALID_INPUT', 'معرف الإقامة مطلوب', 400);
  }

  // Verify ownership
  const listing = await listingRepository.findById(listingId);
  if (!listing || (listing as any).hostId !== userId) {
    return errorResponse('FORBIDDEN', 'ليس لديك صلاحية للوصول لهذا التقويم', 403);
  }

  const bookings = await bookingRepository.getCalendarBookings(
    listingId,
    startDate,
    endDate
  );

  // Get blocked dates (could be from a separate blocked dates table)
  const blockedDates: Date[] = [];

  return successResponse({
    bookings: bookings.map(b => ({
      id: b.id,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status,
      guestName: `${(b as any).guest?.firstName || ''} ${(b as any).guest?.lastName || ''}`,
    })),
    blockedDates,
    startDate,
    endDate,
  });
}
