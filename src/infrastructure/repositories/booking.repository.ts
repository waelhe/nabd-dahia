/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking Repository Implementation
 * 
 * تنفيذ مستودع الحجوزات باستخدام Prisma
 * 
 * @module infrastructure/repositories/booking.repository
 */

import { db } from '@/lib/db';
import { VersionedRepository } from './base.repository';
import type { IBookingRepository, BookingFilter } from '@/core/interfaces/repositories/booking.repository';
import type { Booking } from '@prisma/client';

// ==================== Booking Repository ====================

export class BookingRepository
  extends VersionedRepository<Booking, string>
  implements IBookingRepository
{
  constructor() {
    super(db.booking as Parameters<typeof VersionedRepository<Booking, string>['constructor']>[0], 'id');
  }

  // ==================== Query Methods ====================

  async findByGuestId(
    guestId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<{ items: Booking[]; total: number }> {
    const where: Record<string, unknown> = { guestId };
    if (options?.status) where.status = options.status;

    const [items, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              city: true,
              country: true,
              images: { take: 1, orderBy: { isPrimary: 'desc' } },
            },
          },
          host: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      db.booking.count({ where }),
    ]);

    return { items: items as Booking[], total };
  }

  async findByHostId(
    hostId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<{ items: Booking[]; total: number }> {
    const where: Record<string, unknown> = { hostId };
    if (options?.status) where.status = options.status;

    const [items, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              city: true,
              country: true,
              images: { take: 1, orderBy: { isPrimary: 'desc' } },
            },
          },
          guest: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      db.booking.count({ where }),
    ]);

    return { items: items as Booking[], total };
  }

  async findByListingId(
    listingId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<{ items: Booking[]; total: number }> {
    const where: Record<string, unknown> = { listingId };
    if (options?.status) where.status = options.status;

    const [items, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.booking.count({ where }),
    ]);

    return { items: items as Booking[], total };
  }

  async findByStatus(
    status: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ items: Booking[]; total: number }> {
    const where = { status };

    const [items, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.booking.count({ where }),
    ]);

    return { items: items as Booking[], total };
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    listingId?: string
  ): Promise<Booking[]> {
    const where: Record<string, unknown> = {
      OR: [
        { checkIn: { lt: endDate }, checkOut: { gt: startDate } },
      ],
      status: { in: ['confirmed', 'pending'] },
    };
    
    if (listingId) where.listingId = listingId;

    return db.booking.findMany({ where }) as Promise<Booking[]>;
  }

  async findUpcoming(
    userId: string,
    role: 'guest' | 'host',
    limit: number = 5
  ): Promise<Booking[]> {
    const where: Record<string, unknown> = {
      checkIn: { gt: new Date() },
      status: 'confirmed',
    };
    
    if (role === 'guest') {
      where.guestId = userId;
    } else {
      where.hostId = userId;
    }

    return db.booking.findMany({
      where,
      orderBy: { checkIn: 'asc' },
      take: limit,
      include: {
        listing: {
          select: { id: true, title: true, images: { take: 1 } },
        },
      },
    }) as Promise<Booking[]>;
  }

  async findPending(hostId: string, limit: number = 10): Promise<Booking[]> {
    return db.booking.findMany({
      where: { hostId, status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        listing: { select: { id: true, title: true } },
        guest: { select: { id: true, firstName: true, lastName: true } },
      },
    }) as Promise<Booking[]>;
  }

  async search(
    filter: BookingFilter,
    options?: { limit?: number; offset?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<{ items: Booking[]; total: number }> {
    const where = this.buildFilter(filter);
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'desc';

    const [items, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
        include: {
          listing: { select: { id: true, title: true, images: { take: 1 } } },
          guest: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          host: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      }),
      db.booking.count({ where }),
    ]);

    return { items: items as Booking[], total };
  }

  // ==================== Status Management ====================

  async confirm(bookingId: string): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    }) as Promise<Booking>;
  }

  async cancel(
    bookingId: string,
    cancelledBy: string,
    reason?: string
  ): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy,
        cancellationReason: reason,
      },
    }) as Promise<Booking>;
  }

  async reject(
    bookingId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'rejected',
        cancelledAt: new Date(),
        cancelledBy: rejectedBy,
        cancellationReason: reason,
      },
    }) as Promise<Booking>;
  }

  async complete(bookingId: string): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    }) as Promise<Booking>;
  }

  async checkIn(bookingId: string): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        checkInActual: new Date(),
        status: 'in_progress',
      },
    }) as Promise<Booking>;
  }

  async checkOut(bookingId: string): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        checkOutActual: new Date(),
        status: 'completed',
        completedAt: new Date(),
      },
    }) as Promise<Booking>;
  }

  async markAsNoShow(bookingId: string): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: { status: 'no_show' },
    }) as Promise<Booking>;
  }

  // ==================== Payment Status ====================

  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: string,
    paidAt?: Date
  ): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        paidAt: paidAt ?? (paymentStatus === 'paid' ? new Date() : undefined),
      },
    }) as Promise<Booking>;
  }

  async updateRefund(
    bookingId: string,
    refundAmount: number
  ): Promise<Booking> {
    return db.booking.update({
      where: { id: bookingId },
      data: {
        refundAmount,
        refundedAt: new Date(),
        paymentStatus: 'refunded',
      },
    }) as Promise<Booking>;
  }

  // ==================== Availability Check ====================

  async isAvailable(
    listingId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const where: Record<string, unknown> = {
      listingId,
      status: { in: ['confirmed', 'pending'] },
      OR: [
        { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
      ],
    };
    
    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const count = await db.booking.count({ where });
    return count === 0;
  }

  // ==================== Statistics ====================

  async getHostStats(hostId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const [total, pending, confirmed, completed, cancelled, revenue] = await Promise.all([
      db.booking.count({ where: { hostId } }),
      db.booking.count({ where: { hostId, status: 'pending' } }),
      db.booking.count({ where: { hostId, status: 'confirmed' } }),
      db.booking.count({ where: { hostId, status: 'completed' } }),
      db.booking.count({ where: { hostId, status: 'cancelled' } }),
      db.booking.aggregate({
        where: { hostId, status: 'completed' },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue: revenue._sum.totalPrice ?? 0,
    };
  }

  async getGuestStats(guestId: string): Promise<{
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    totalSpent: number;
  }> {
    const [total, upcoming, completed, cancelled, spent] = await Promise.all([
      db.booking.count({ where: { guestId } }),
      db.booking.count({
        where: { guestId, status: 'confirmed', checkIn: { gt: new Date() } },
      }),
      db.booking.count({ where: { guestId, status: 'completed' } }),
      db.booking.count({ where: { guestId, status: 'cancelled' } }),
      db.booking.aggregate({
        where: { guestId, status: 'completed' },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      upcoming,
      completed,
      cancelled,
      totalSpent: spent._sum.totalPrice ?? 0,
    };
  }

  // ==================== Guests Management ====================

  async addGuests(
    bookingId: string,
    guests: Array<{
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      isPrimary?: boolean;
      idType?: string;
      idNumber?: string;
      dateOfBirth?: Date;
      nationality?: string;
    }>
  ): Promise<void> {
    await db.bookingGuest.createMany({
      data: guests.map(g => ({
        bookingId,
        ...g,
        dateOfBirth: g.dateOfBirth,
      })),
    });
  }

  async getGuests(bookingId: string): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    isPrimary: boolean;
  }>> {
    return db.bookingGuest.findMany({
      where: { bookingId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  // ==================== Extended Methods for Use Cases ====================

  /**
   * Check availability for a listing
   */
  async checkAvailability(listingId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    return this.isAvailable(listingId, checkIn, checkOut);
  }

  /**
   * Get booking stats
   */
  async getStats(options: { hostId?: string; guestId?: string; listingId?: string }): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const where: Record<string, unknown> = {};
    if (options.hostId) where.hostId = options.hostId;
    if (options.guestId) where.guestId = options.guestId;
    if (options.listingId) where.listingId = options.listingId;

    const [total, pending, confirmed, inProgress, completed, cancelled, revenue] = await Promise.all([
      db.booking.count({ where }),
      db.booking.count({ where: { ...where, status: 'pending' } }),
      db.booking.count({ where: { ...where, status: 'confirmed' } }),
      db.booking.count({ where: { ...where, status: 'in_progress' } }),
      db.booking.count({ where: { ...where, status: 'completed' } }),
      db.booking.count({ where: { ...where, status: 'cancelled' } }),
      db.booking.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      totalRevenue: revenue._sum.totalPrice ?? 0,
    };
  }

  /**
   * Get calendar bookings for a listing
   */
  async getCalendarBookings(listingId: string, startDate: Date, endDate: Date): Promise<Booking[]> {
    return db.booking.findMany({
      where: {
        listingId,
        status: { in: ['confirmed', 'pending', 'checked_in', 'in_progress'] },
        OR: [
          { checkIn: { lt: endDate }, checkOut: { gt: startDate } },
        ],
      },
      orderBy: { checkIn: 'asc' },
      include: {
        guest: {
          select: { firstName: true, lastName: true },
        },
      },
    }) as Promise<Booking[]>;
  }

  /**
   * Find booking by ID with all details (listing, guest, host)
   */
  async findByIdWithDetails(id: string): Promise<Record<string, unknown> | null> {
    return db.booking.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            country: true,
            cancellationPolicy: true,
            images: { take: 1, orderBy: { isPrimary: 'desc' } },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            phone: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    }) as Promise<Record<string, unknown> | null>;
  }

  /**
   * Create booking with all details
   */
  async createWithRelations(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const booking = await db.booking.create({
      data,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            country: true,
            images: { take: 1, orderBy: { isPrimary: 'desc' } },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            phone: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return booking as Record<string, unknown>;
  }

  /**
   * Cancel booking with refund calculation
   */
  async cancelWithRefund(
    bookingId: string,
    cancelledBy: string,
    refundAmount: number,
    reason?: string
  ): Promise<Record<string, unknown>> {
    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy,
        cancellationReason: reason,
        refundAmount,
        paymentStatus: refundAmount > 0 ? 'refunded' : undefined,
        refundedAt: refundAmount > 0 ? new Date() : undefined,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            country: true,
            images: { take: 1, orderBy: { isPrimary: 'desc' } },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            phone: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return booking as Record<string, unknown>;
  }

  /**
   * Update guest stats after checkout
   */
  async updateGuestStats(guestId: string, totalPrice: number): Promise<void> {
    await db.user.update({
      where: { id: guestId },
      data: {
        totalBookings: { increment: 1 },
        totalSpent: { increment: totalPrice },
      },
    });
  }

  /**
   * Get user role for determining stats type
   */
  async getUserRole(userId: string): Promise<string | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role ?? null;
  }

  /**
   * Check if booking exists and get basic info
   */
  async findByIdBasic(id: string): Promise<Record<string, unknown> | null> {
    return db.booking.findUnique({
      where: { id },
      select: {
        id: true,
        guestId: true,
        hostId: true,
        listingId: true,
        status: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        cancellationReason: true,
      },
    }) as Promise<Record<string, unknown> | null>;
  }

  /**
   * Get booking stats for user (host or guest)
   */
  async getStatsForUser(userId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isHost = user?.role === 'host' || user?.role === 'company' || user?.role === 'admin';
    const where = isHost ? { hostId: userId } : { guestId: userId };

    const [total, pending, confirmed, inProgress, completed, cancelled, revenue] = await Promise.all([
      db.booking.count({ where }),
      db.booking.count({ where: { ...where, status: 'pending' } }),
      db.booking.count({ where: { ...where, status: 'confirmed' } }),
      db.booking.count({ where: { ...where, status: 'in_progress' } }),
      db.booking.count({ where: { ...where, status: 'completed' } }),
      db.booking.count({ where: { ...where, status: 'cancelled' } }),
      db.booking.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      totalRevenue: revenue._sum.totalPrice ?? 0,
    };
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter: BookingFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter.guestId) where.guestId = filter.guestId;
    if (filter.hostId) where.hostId = filter.hostId;
    if (filter.listingId) where.listingId = filter.listingId;
    if (filter.status) where.status = filter.status;
    if (filter.paymentStatus) where.paymentStatus = filter.paymentStatus;
    if (filter.companyId) where.companyId = filter.companyId;

    if (filter.checkInFrom || filter.checkInTo) {
      where.checkIn = {
        ...(filter.checkInFrom && { gte: filter.checkInFrom }),
        ...(filter.checkInTo && { lte: filter.checkInTo }),
      };
    }

    if (filter.createdFrom || filter.createdTo) {
      where.createdAt = {
        ...(filter.createdFrom && { gte: filter.createdFrom }),
        ...(filter.createdTo && { lte: filter.createdTo }),
      };
    }

    return where;
  }
}

// ==================== Singleton Instance ====================

export const bookingRepository = new BookingRepository();
