/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking Mapper
 * 
 * مسئول عن التحويل بين:
 * - Domain Entity (Booking) ↔ Persistence Model (Prisma Booking)
 * - Domain Entity (Booking) ↔ DTO (API Response)
 * 
 * @module application/mappers/booking.mapper
 */

import { Booking, BookingProps, BookingError, BookingStatus, PaymentStatus, BookingSource } from '@/core/domain/entities/Booking';
import { Money } from '@/core/domain/value-objects/Money';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

/**
 * بيانات إنشاء الحجز من API
 */
export interface BookingCreateDTO {
  guestId: string;
  listingId: string;
  hostId: string;
  companyId?: string;
  checkIn: Date;
  checkOut: Date;
  guests?: number;
  adults?: number;
  children?: number;
  infants?: number;
  guestNotes?: string;
  specialRequests?: string;
}

/**
 * بيانات تحديث الحجز من API
 */
export interface BookingUpdateDTO {
  guestNotes?: string;
  hostNotes?: string;
  specialRequests?: string;
  status?: string;
}

/**
 * استجابة API للحجز
 */
export interface BookingResponseDTO {
  id: string;
  guestId: string;
  hostId: string;
  listingId: string;
  companyId: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  basePrice: number;
  cleaningFee: number | null;
  serviceFee: number;
  taxes: number;
  discount: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  canBeCancelled: boolean;
  canBeConfirmed: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  isOngoing: boolean;
  guestNotes: string | null;
  hostNotes: string | null;
  specialRequests: string | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للحجز (مختصرة)
 */
export interface BookingSummaryDTO {
  id: string;
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
}

// ==================== Prisma Types ====================

interface PrismaBookingWithIncludes {
  id: string;
  guestId: string;
  hostId: string;
  listingId: string;
  companyId: string | null;
  checkIn: Date;
  checkOut: Date;
  checkInActual: Date | null;
  checkOutActual: Date | null;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  basePrice: number;
  cleaningFee: number | null;
  serviceFee: number;
  taxes: number;
  discount: number;
  totalPrice: number;
  currency: string;
  status: string;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  completedAt: Date | null;
  guestNotes: string | null;
  hostNotes: string | null;
  specialRequests: string | null;
  paymentStatus: string;
  paidAt: Date | null;
  refundAmount: number | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  listing?: {
    id: string;
    title: string;
    slug: string;
    city: string | null;
    country: string | null;
    images?: Array<{
      id: string;
      url: string;
      isPrimary: boolean;
    }>;
  };
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

// ==================== Mapper Class ====================

export class BookingMapper {
  
  // ==================== To Domain ====================
  
  /**
   * تحويل Prisma Booking إلى Domain Entity
   */
  static toDomain(prismaBooking: PrismaBookingWithIncludes): Result<Booking, BookingError> {
    // إنشاء Money Value Objects
    const basePriceResult = Money.create({
      amount: prismaBooking.basePrice,
      currency: prismaBooking.currency as 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR',
    });
    
    if (basePriceResult.isFailure) {
      return err(new BookingError('INVALID_PRICE', 'Invalid base price'));
    }
    
    const cleaningFee = prismaBooking.cleaningFee 
      ? Money.create({ amount: prismaBooking.cleaningFee, currency: prismaBooking.currency as any })
      : Money.zero(prismaBooking.currency as any);
    
    const serviceFee = Money.create({
      amount: prismaBooking.serviceFee,
      currency: prismaBooking.currency as any,
    });
    
    const taxes = Money.create({
      amount: prismaBooking.taxes,
      currency: prismaBooking.currency as any,
    });
    
    const discount = Money.create({
      amount: prismaBooking.discount,
      currency: prismaBooking.currency as any,
    });
    
    const totalPriceResult = Money.create({
      amount: prismaBooking.totalPrice,
      currency: prismaBooking.currency as any,
    });
    
    if (totalPriceResult.isFailure) {
      return err(new BookingError('INVALID_PRICE', 'Invalid total price'));
    }
    
    const paymentAmount = Money.create({
      amount: prismaBooking.totalPrice,
      currency: prismaBooking.currency as any,
    });
    
    const refundAmount = prismaBooking.refundAmount
      ? Money.create({ amount: prismaBooking.refundAmount, currency: prismaBooking.currency as any })
      : null;
    
    // إنشاء Booking Props
    const props: BookingProps = {
      id: new UniqueEntityId(prismaBooking.id),
      guestId: prismaBooking.guestId,
      hostId: prismaBooking.hostId,
      listingId: prismaBooking.listingId,
      companyId: prismaBooking.companyId,
      checkIn: prismaBooking.checkIn,
      checkOut: prismaBooking.checkOut,
      checkInActual: prismaBooking.checkInActual,
      checkOutActual: prismaBooking.checkOutActual,
      guests: prismaBooking.guests,
      adults: prismaBooking.adults,
      children: prismaBooking.children,
      infants: prismaBooking.infants,
      guestDetails: [],
      basePrice: basePriceResult.value,
      cleaningFee: cleaningFee.isSuccess ? cleaningFee.value : Money.zero(prismaBooking.currency as any),
      serviceFee: serviceFee.isSuccess ? serviceFee.value : Money.zero(prismaBooking.currency as any),
      taxes: taxes.isSuccess ? taxes.value : Money.zero(prismaBooking.currency as any),
      discount: discount.isSuccess ? discount.value : Money.zero(prismaBooking.currency as any),
      totalPrice: totalPriceResult.value,
      currency: prismaBooking.currency as 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR',
      payment: {
        amount: paymentAmount.isSuccess ? paymentAmount.value : totalPriceResult.value,
        status: prismaBooking.paymentStatus as PaymentStatus,
        paidAt: prismaBooking.paidAt,
        paymentMethod: null,
        transactionId: null,
      },
      status: prismaBooking.status as BookingStatus,
      source: 'website' as BookingSource,
      cancellation: {
        cancelledAt: prismaBooking.cancelledAt,
        cancelledBy: prismaBooking.cancelledBy,
        reason: prismaBooking.cancellationReason,
        refundAmount: refundAmount?.isSuccess ? refundAmount.value : null,
        refundPercentage: prismaBooking.refundAmount && prismaBooking.totalPrice
          ? Math.round((prismaBooking.refundAmount / prismaBooking.totalPrice) * 100)
          : 0,
      },
      guestNotes: prismaBooking.guestNotes,
      hostNotes: prismaBooking.hostNotes,
      specialRequests: prismaBooking.specialRequests,
      confirmedAt: prismaBooking.confirmedAt,
      completedAt: prismaBooking.completedAt,
      createdAt: prismaBooking.createdAt,
      updatedAt: prismaBooking.updatedAt,
      version: prismaBooking.version,
    };
    
    // إعادة بناء الـ Entity
    return ok(Booking.reconstitute(props));
  }
  
  /**
   * تحويل مجموعة Prisma Bookings إلى Domain Entities
   */
  static toDomainMany(prismaBookings: PrismaBookingWithIncludes[]): Result<Booking[], BookingError> {
    const bookings: Booking[] = [];
    
    for (const prismaBooking of prismaBookings) {
      const result = this.toDomain(prismaBooking);
      if (result.isFailure) {
        return err(result.error);
      }
      bookings.push(result.value);
    }
    
    return ok(bookings);
  }
  
  // ==================== To Persistence ====================
  
  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  static toPersistence(booking: Booking): Record<string, unknown> {
    return {
      id: booking.idValue,
      guestId: booking.guestId,
      hostId: booking.hostId,
      listingId: booking.listingId,
      companyId: booking.getProps().companyId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      checkInActual: booking.getProps().checkInActual,
      checkOutActual: booking.getProps().checkOutActual,
      guests: booking.getProps().guests,
      adults: booking.getProps().adults,
      children: booking.getProps().children,
      infants: booking.getProps().infants,
      basePrice: booking.getProps().basePrice.amount,
      cleaningFee: booking.getProps().cleaningFee.amount,
      serviceFee: booking.getProps().serviceFee.amount,
      taxes: booking.getProps().taxes.amount,
      discount: booking.getProps().discount.amount,
      totalPrice: booking.totalPrice.amount,
      currency: booking.getProps().currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      confirmedAt: booking.getProps().confirmedAt,
      completedAt: booking.getProps().completedAt,
      cancelledAt: booking.getProps().cancellation.cancelledAt,
      cancelledBy: booking.getProps().cancellation.cancelledBy,
      cancellationReason: booking.getProps().cancellation.reason,
      refundAmount: booking.getProps().cancellation.refundAmount?.amount,
      refundedAt: booking.getProps().cancellation.cancelledAt,
      guestNotes: booking.getProps().guestNotes,
      hostNotes: booking.getProps().hostNotes,
      specialRequests: booking.getProps().specialRequests,
      version: booking.version,
    };
  }
  
  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  static createDTOToPersistence(dto: BookingCreateDTO, priceDetails: {
    basePrice: number;
    cleaningFee?: number;
    serviceFee: number;
    taxes: number;
    totalPrice: number;
    currency: string;
  }): Record<string, unknown> {
    return {
      guestId: dto.guestId,
      hostId: dto.hostId,
      listingId: dto.listingId,
      companyId: dto.companyId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      guests: dto.guests || 1,
      adults: dto.adults || 1,
      children: dto.children || 0,
      infants: dto.infants || 0,
      basePrice: priceDetails.basePrice,
      cleaningFee: priceDetails.cleaningFee || null,
      serviceFee: priceDetails.serviceFee,
      taxes: priceDetails.taxes,
      totalPrice: priceDetails.totalPrice,
      currency: priceDetails.currency,
      status: 'pending',
      paymentStatus: 'pending',
      guestNotes: dto.guestNotes,
      specialRequests: dto.specialRequests,
    };
  }
  
  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  static updateDTOToPersistence(dto: BookingUpdateDTO): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    if (dto.guestNotes !== undefined) data.guestNotes = dto.guestNotes;
    if (dto.hostNotes !== undefined) data.hostNotes = dto.hostNotes;
    if (dto.specialRequests !== undefined) data.specialRequests = dto.specialRequests;
    if (dto.status !== undefined) data.status = dto.status;
    
    return data;
  }
  
  // ==================== To DTO ====================
  
  /**
   * تحويل Domain Entity إلى Response DTO
   */
  static toDTO(booking: Booking): BookingResponseDTO {
    return {
      id: booking.idValue,
      guestId: booking.guestId,
      hostId: booking.hostId,
      listingId: booking.listingId,
      companyId: booking.getProps().companyId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.getProps().guests,
      adults: booking.getProps().adults,
      children: booking.getProps().children,
      infants: booking.getProps().infants,
      basePrice: booking.getProps().basePrice.amount,
      cleaningFee: booking.getProps().cleaningFee.amount,
      serviceFee: booking.getProps().serviceFee.amount,
      taxes: booking.getProps().taxes.amount,
      discount: booking.getProps().discount.amount,
      totalPrice: booking.totalPrice.amount,
      currency: booking.getProps().currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      canBeCancelled: booking.canBeCancelled,
      canBeConfirmed: booking.canBeConfirmed,
      isPast: booking.isPast,
      isUpcoming: booking.isUpcoming,
      isOngoing: booking.isOngoing,
      guestNotes: booking.getProps().guestNotes,
      hostNotes: booking.getProps().hostNotes,
      specialRequests: booking.getProps().specialRequests,
      confirmedAt: booking.getProps().confirmedAt,
      completedAt: booking.getProps().completedAt,
      cancelledAt: booking.getProps().cancellation.cancelledAt,
      cancellationReason: booking.getProps().cancellation.reason,
      createdAt: booking.getProps().createdAt,
      updatedAt: booking.getProps().updatedAt,
    };
  }
  
  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  static toSummaryDTO(booking: Booking): BookingSummaryDTO {
    return {
      id: booking.idValue,
      listingId: booking.listingId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.getProps().guests,
      totalPrice: booking.totalPrice.amount,
      currency: booking.getProps().currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    };
  }
  
  /**
   * تحويل مجموعة Domain Entities إلى Response DTOs
   */
  static toDTOs(bookings: Booking[]): BookingResponseDTO[] {
    return bookings.map(booking => this.toDTO(booking));
  }
  
  /**
   * تحويل Prisma Booking مباشرة إلى Response DTO
   */
  static prismaToDTO(prismaBooking: PrismaBookingWithIncludes): BookingResponseDTO {
    const nights = Math.ceil(
      (prismaBooking.checkOut.getTime() - prismaBooking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const now = new Date();
    const isPast = prismaBooking.checkOut < now;
    const isUpcoming = prismaBooking.checkIn > now;
    const isOngoing = prismaBooking.checkIn <= now && prismaBooking.checkOut > now;
    
    const canBeCancelled = ['pending', 'confirmed'].includes(prismaBooking.status) && 
      prismaBooking.checkIn > now;
    
    const canBeConfirmed = prismaBooking.status === 'pending' && 
      ['paid', 'partially_paid'].includes(prismaBooking.paymentStatus);
    
    return {
      id: prismaBooking.id,
      guestId: prismaBooking.guestId,
      hostId: prismaBooking.hostId,
      listingId: prismaBooking.listingId,
      companyId: prismaBooking.companyId,
      checkIn: prismaBooking.checkIn,
      checkOut: prismaBooking.checkOut,
      nights,
      guests: prismaBooking.guests,
      adults: prismaBooking.adults,
      children: prismaBooking.children,
      infants: prismaBooking.infants,
      basePrice: prismaBooking.basePrice,
      cleaningFee: prismaBooking.cleaningFee,
      serviceFee: prismaBooking.serviceFee,
      taxes: prismaBooking.taxes,
      discount: prismaBooking.discount,
      totalPrice: prismaBooking.totalPrice,
      currency: prismaBooking.currency,
      status: prismaBooking.status,
      paymentStatus: prismaBooking.paymentStatus,
      canBeCancelled,
      canBeConfirmed,
      isPast,
      isUpcoming,
      isOngoing,
      guestNotes: prismaBooking.guestNotes,
      hostNotes: prismaBooking.hostNotes,
      specialRequests: prismaBooking.specialRequests,
      confirmedAt: prismaBooking.confirmedAt,
      completedAt: prismaBooking.completedAt,
      cancelledAt: prismaBooking.cancelledAt,
      cancellationReason: prismaBooking.cancellationReason,
      createdAt: prismaBooking.createdAt,
      updatedAt: prismaBooking.updatedAt,
    };
  }
  
  /**
   * تحويل مجموعة Prisma Bookings مباشرة إلى Response DTOs
   */
  static prismaToDTOs(prismaBookings: PrismaBookingWithIncludes[]): BookingResponseDTO[] {
    return prismaBookings.map(booking => this.prismaToDTO(booking));
  }
}
