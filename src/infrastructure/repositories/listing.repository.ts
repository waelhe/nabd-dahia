/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listing Repository Implementation
 * 
 * تنفيذ مستودع الإقامات والخدمات باستخدام Prisma
 * 
 * @module infrastructure/repositories/listing.repository
 */

import { db } from '@/lib/db';
import { SoftDeletableRepository, VersionedRepository } from './base.repository';
import type { IListingRepository, ListingFilter, ListingAvailabilityData } from '@/core/interfaces/repositories/listing.repository';
import type { Listing, ListingImage, ListingAmenity } from '@prisma/client';

// ==================== Listing Repository ====================

export class ListingRepository
  extends VersionedRepository<Listing, string>
  implements IListingRepository
{
  constructor() {
    super(db.listing as Parameters<typeof VersionedRepository<Listing, string>['constructor']>[0], 'id');
  }

  // ==================== Query Methods ====================

  async findBySlug(slug: string): Promise<Listing | null> {
    return this.findOne({ where: { slug } as unknown as Record<string, unknown> });
  }

  async findByHostId(hostId: string, options?: { limit?: number; offset?: number }): Promise<{ items: Listing[]; total: number }> {
    const where = { hostId, deletedAt: null };
    
    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  async findByCompanyId(companyId: string, options?: { limit?: number; offset?: number }): Promise<{ items: Listing[]; total: number }> {
    const where = { companyId, deletedAt: null };
    
    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  async search(options: { filter: ListingFilter; limit?: number; offset?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{ items: Listing[]; total: number }> {
    const { filter, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const where = this.buildFilter(filter);
    
    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
        include: {
          images: { take: 1, orderBy: { isPrimary: 'desc' } },
          host: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  async findByLocation(latitude: number, longitude: number, radiusKm: number, options?: { limit?: number; offset?: number }): Promise<{ items: Listing[]; total: number }> {
    // Simple bounding box for SQLite (for production, use PostGIS or similar)
    const latDelta = radiusKm / 111; // ~111km per degree
    const lonDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
    
    const where = {
      latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
      longitude: { gte: longitude - lonDelta, lte: longitude + lonDelta },
      deletedAt: null,
      status: 'active',
    };
    
    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  async findAvailable(checkIn: Date, checkOut: Date, guests: number, filter?: ListingFilter): Promise<{ items: Listing[]; total: number }> {
    // Find listings that are not booked during the period
    const bookedListingIds = await db.booking.findMany({
      where: {
        status: { in: ['confirmed', 'pending'] },
        OR: [
          { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ],
      },
      select: { listingId: true },
      distinct: ['listingId'],
    });

    const excludeIds = bookedListingIds.map(b => b.listingId);
    
    const where = {
      ...this.buildFilter(filter || {}),
      id: { notIn: excludeIds },
      capacity: { gte: guests },
      status: 'active',
    };

    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { ratingAverage: 'desc' },
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  async findFeatured(options?: { limit?: number; offset?: number }): Promise<{ items: Listing[]; total: number }> {
    const where = {
      featured: true,
      featuredUntil: { gte: new Date() },
      status: 'active',
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  async findByAmenities(amenities: string[], options?: { limit?: number; offset?: number }): Promise<{ items: Listing[]; total: number }> {
    const where = {
      amenities: { some: { name: { in: amenities } } },
      status: 'active',
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.offset,
        take: options?.limit,
      }),
      db.listing.count({ where }),
    ]);

    return { items: items as Listing[], total };
  }

  // ==================== Availability ====================

  async checkAvailability(listingId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const conflicts = await db.booking.count({
      where: {
        listingId,
        status: { in: ['confirmed', 'pending'] },
        OR: [
          { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ],
      },
    });

    return conflicts === 0;
  }

  async getAvailability(listingId: string, startDate: Date, endDate: Date): Promise<ListingAvailabilityData[]> {
    const availabilities = await db.listingAvailability.findMany({
      where: {
        listingId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return availabilities.map(a => ({
      date: a.date,
      isAvailable: a.isAvailable,
      price: a.price ?? undefined,
      minNights: a.minNights ?? undefined,
      maxNights: a.maxNights ?? undefined,
      notes: a.notes ?? undefined,
    }));
  }

  async updateAvailability(listingId: string, data: ListingAvailabilityData[]): Promise<{ success: boolean }> {
    await db.$transaction(
      data.map(d => db.listingAvailability.upsert({
        where: { listingId_date: { listingId, date: d.date } },
        update: {
          isAvailable: d.isAvailable,
          price: d.price,
          minNights: d.minNights,
          maxNights: d.maxNights,
          notes: d.notes,
        },
        create: {
          listingId,
          date: d.date,
          isAvailable: d.isAvailable,
          price: d.price,
          minNights: d.minNights,
          maxNights: d.maxNights,
          notes: d.notes,
        },
      }))
    );

    return { success: true };
  }

  async blockDates(listingId: string, checkIn: Date, checkOut: Date, reason?: string): Promise<{ success: boolean }> {
    const dates: Date[] = [];
    const current = new Date(checkIn);
    while (current <= checkOut) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    await db.$transaction(
      dates.map(date => db.listingAvailability.upsert({
        where: { listingId_date: { listingId, date } },
        update: { isAvailable: false, notes: reason },
        create: { listingId, date, isAvailable: false, notes: reason },
      }))
    );

    return { success: true };
  }

  async unblockDates(listingId: string, checkIn: Date, checkOut: Date): Promise<{ success: boolean }> {
    await db.listingAvailability.updateMany({
      where: {
        listingId,
        date: { gte: checkIn, lte: checkOut },
      },
      data: { isAvailable: true, notes: null },
    });

    return { success: true };
  }

  // ==================== Statistics ====================

  async updateRating(listingId: string, ratingAverage: number, ratingCount: number): Promise<{ success: boolean }> {
    await db.listing.update({
      where: { id: listingId },
      data: { ratingAverage, ratingCount },
    });

    return { success: true };
  }

  async incrementBookingCount(listingId: string): Promise<{ success: boolean }> {
    await db.listing.update({
      where: { id: listingId },
      data: { bookingCount: { increment: 1 } },
    });

    return { success: true };
  }

  async incrementViewCount(listingId: string): Promise<{ success: boolean }> {
    await db.listing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } },
    });

    return { success: true };
  }

  async updateFavoriteCount(listingId: string, increment: number): Promise<{ success: boolean }> {
    await db.listing.update({
      where: { id: listingId },
      data: { favoriteCount: { increment } },
    });

    return { success: true };
  }

  // ==================== Bulk Operations ====================

  async updateStatus(listingIds: string[], status: string): Promise<{ success: boolean }> {
    await db.listing.updateMany({
      where: { id: { in: listingIds } },
      data: { status },
    });

    return { success: true };
  }

  async updateSeasonalPricing(listingId: string, seasonalPricing: Array<{ startDate: Date; endDate: Date; priceModifier: number }>): Promise<{ success: boolean }> {
    await db.listing.update({
      where: { id: listingId },
      data: { seasonalPricing: JSON.stringify(seasonalPricing) },
    });

    return { success: true };
  }

  // ==================== Images ====================

  async addImage(listingId: string, image: { url: string; caption?: string; alt?: string; isPrimary?: boolean }): Promise<{ success: boolean }> {
    // If this is primary, unset other primaries
    if (image.isPrimary) {
      await db.listingImage.updateMany({
        where: { listingId },
        data: { isPrimary: false },
      });
    }

    await db.listingImage.create({
      data: {
        listingId,
        url: image.url,
        caption: image.caption,
        alt: image.alt,
        isPrimary: image.isPrimary ?? false,
      },
    });

    return { success: true };
  }

  async removeImage(listingId: string, imageId: string): Promise<{ success: boolean }> {
    await db.listingImage.delete({
      where: { id: imageId, listingId },
    });

    return { success: true };
  }

  async reorderImages(listingId: string, imageOrders: Array<{ imageId: string; order: number }>): Promise<{ success: boolean }> {
    await db.$transaction(
      imageOrders.map(({ imageId, order }) =>
        db.listingImage.update({
          where: { id: imageId, listingId },
          data: { order },
        })
      )
    );

    return { success: true };
  }

  // ==================== Amenities ====================

  async addAmenity(listingId: string, amenity: { name: string; icon?: string; category?: string; included?: boolean }): Promise<{ success: boolean }> {
    await db.listingAmenity.create({
      data: {
        listingId,
        name: amenity.name,
        icon: amenity.icon,
        category: amenity.category,
        included: amenity.included ?? true,
      },
    });

    return { success: true };
  }

  async removeAmenity(listingId: string, amenityName: string): Promise<{ success: boolean }> {
    await db.listingAmenity.delete({
      where: { listingId_name: { listingId, name: amenityName } },
    });

    return { success: true };
  }

  // ==================== Translations ====================

  async addTranslation(listingId: string, language: string, data: { title?: string; description?: string; houseRules?: string }): Promise<{ success: boolean }> {
    await db.listingTranslation.upsert({
      where: { listingId_language: { listingId, language } },
      update: data,
      create: { listingId, language, ...data },
    });

    return { success: true };
  }

  async removeTranslation(listingId: string, language: string): Promise<{ success: boolean }> {
    await db.listingTranslation.delete({
      where: { listingId_language: { listingId, language } },
    });

    return { success: true };
  }

  // ==================== Extended Methods for Use Cases ====================

  /**
   * Find listing by ID with all details (images, amenities, host)
   */
  async findByIdWithDetails(id: string): Promise<Record<string, unknown> | null> {
    return db.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        amenities: true,
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isSuperhost: true,
          },
        },
      },
    }) as Promise<Record<string, unknown> | null>;
  }

  /**
   * Find listing by slug with all details
   */
  async findBySlugWithDetails(slug: string): Promise<Record<string, unknown> | null> {
    return db.listing.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        amenities: true,
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isSuperhost: true,
          },
        },
      },
    }) as Promise<Record<string, unknown> | null>;
  }

  /**
   * Create listing with images and amenities
   */
  async createWithRelations(
    data: Record<string, unknown>,
    images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>,
    amenities?: string[]
  ): Promise<Record<string, unknown>> {
    const listing = await db.listing.create({
      data: {
        ...data,
        images: images ? {
          create: images.map((img, index) => ({
            url: img.url,
            caption: img.caption,
            isPrimary: img.isPrimary ?? index === 0,
            order: index,
          })),
        } : undefined,
        amenities: amenities ? {
          createMany: {
            data: amenities.map(name => ({
              name,
              included: true,
            })),
          },
        } : undefined,
      },
      include: {
        images: true,
        amenities: true,
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isSuperhost: true,
          },
        },
      },
    });

    return listing as Record<string, unknown>;
  }

  /**
   * Add multiple images at once
   */
  async addImages(
    listingId: string,
    images: Array<{ url: string; caption?: string; isPrimary?: boolean }>
  ): Promise<{ success: boolean }> {
    const existingCount = await db.listingImage.count({ where: { listingId } });

    await db.listingImage.createMany({
      data: images.map((img, index) => ({
        listingId,
        url: img.url,
        caption: img.caption,
        isPrimary: img.isPrimary ?? false,
        order: existingCount + index,
      })),
    });

    return { success: true };
  }

  /**
   * Add multiple amenities at once
   */
  async addAmenities(
    listingId: string,
    amenities: Array<{ name: string; icon?: string; included?: boolean }>
  ): Promise<{ success: boolean }> {
    await db.listingAmenity.createMany({
      data: amenities.map(a => ({
        listingId,
        name: a.name,
        icon: a.icon,
        included: a.included ?? true,
      })),
    });

    return { success: true };
  }

  /**
   * Get listing for booking price calculation
   */
  async findByIdForBooking(id: string): Promise<Record<string, unknown> | null> {
    return db.listing.findUnique({
      where: { id },
      select: {
        id: true,
        hostId: true,
        companyId: true,
        basePrice: true,
        weekendPrice: true,
        cleaningFee: true,
        currency: true,
        minNights: true,
        maxNights: true,
        capacity: true,
        status: true,
        cancellationPolicy: true,
      },
    }) as Promise<Record<string, unknown> | null>;
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter: ListingFilter): Record<string, unknown> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filter.hostId) where.hostId = filter.hostId;
    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.type) where.type = filter.type;
    if (filter.category) where.category = filter.category;
    if (filter.city) where.city = filter.city;
    if (filter.country) where.country = filter.country;
    // Handle status - can be a string or array of strings
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        where.status = { in: filter.status };
      } else {
        where.status = filter.status;
      }
    }
    if (filter.featured !== undefined) where.featured = filter.featured;

    if (filter.minPrice || filter.maxPrice) {
      where.basePrice = {
        ...(filter.minPrice && { gte: filter.minPrice }),
        ...(filter.maxPrice && { lte: filter.maxPrice }),
      };
    }

    if (filter.minCapacity) where.capacity = { gte: filter.minCapacity };
    if (filter.bedrooms) where.bedrooms = { gte: filter.bedrooms };
    if (filter.bathrooms) where.bathrooms = { gte: filter.bathrooms };

    if (filter.amenities && filter.amenities.length > 0) {
      where.amenities = { some: { name: { in: filter.amenities } } };
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search } },
        { description: { contains: filter.search } },
        { city: { contains: filter.search } },
      ];
    }

    return where;
  }

  // ==================== Extended Actions ====================

  /**
   * Check if listing has active bookings
   */
  async hasActiveBookings(listingId: string): Promise<boolean> {
    const count = await db.booking.count({
      where: {
        listingId,
        status: { in: ['pending', 'confirmed', 'checked_in'] },
      },
    });
    return count > 0;
  }

  /**
   * Publish a listing
   */
  async publish(listingId: string): Promise<Listing> {
    return db.listing.update({
      where: { id: listingId },
      data: {
        status: 'active',
        publishedAt: new Date(),
      },
    }) as Promise<Listing>;
  }

  /**
   * Feature a listing
   */
  async feature(listingId: string, until: Date): Promise<Listing> {
    return db.listing.update({
      where: { id: listingId },
      data: {
        featured: true,
        featuredUntil: until,
      },
    }) as Promise<Listing>;
  }

  /**
   * Unfeature a listing
   */
  async unfeature(listingId: string): Promise<Listing> {
    return db.listing.update({
      where: { id: listingId },
      data: {
        featured: false,
        featuredUntil: null,
      },
    }) as Promise<Listing>;
  }

  /**
   * Duplicate a listing
   */
  async duplicate(listingId: string, userId: string): Promise<Listing> {
    const original = await db.listing.findUnique({
      where: { id: listingId },
      include: {
        images: true,
        amenities: true,
      },
    });

    if (!original) {
      throw new Error('Listing not found');
    }

    const newSlug = original.slug + '-copy-' + Date.now().toString(36);

    const duplicate = await db.listing.create({
      data: {
        hostId: userId,
        companyId: original.companyId,
        title: original.title + ' (نسخة)',
        slug: newSlug,
        description: original.description,
        type: original.type,
        category: original.category,
        capacity: original.capacity,
        bedrooms: original.bedrooms,
        bathrooms: original.bathrooms,
        beds: original.beds,
        size: original.size,
        country: original.country,
        city: original.city,
        address: original.address,
        latitude: original.latitude,
        longitude: original.longitude,
        neighborhood: original.neighborhood,
        basePrice: original.basePrice,
        currency: original.currency,
        cleaningFee: original.cleaningFee,
        securityDeposit: original.securityDeposit,
        weekendPrice: original.weekendPrice,
        minNights: original.minNights,
        maxNights: original.maxNights,
        checkInTime: original.checkInTime,
        checkOutTime: original.checkOutTime,
        instantBook: original.instantBook,
        houseRules: original.houseRules,
        cancellationPolicy: original.cancellationPolicy,
        smokingAllowed: original.smokingAllowed,
        petsAllowed: original.petsAllowed,
        partiesAllowed: original.partiesAllowed,
        status: 'draft',
        images: {
          create: original.images.map(img => ({
            url: img.url,
            caption: img.caption,
            alt: img.alt,
            isPrimary: img.isPrimary,
            order: img.order,
          })),
        },
        amenities: {
          create: original.amenities.map(a => ({
            name: a.name,
            icon: a.icon,
            category: a.category,
            included: a.included,
          })),
        },
      },
    });

    return duplicate as Listing;
  }

  /**
   * Soft delete a listing
   */
  async softDelete(listingId: string, deletedBy: string): Promise<Listing> {
    return db.listing.update({
      where: { id: listingId },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'deleted',
      },
    }) as Promise<Listing>;
  }

  /**
   * Get host statistics
   */
  async getHostStats(hostId: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  }> {
    const listings = await db.listing.findMany({
      where: { hostId, deletedAt: null },
      select: {
        id: true,
        status: true,
        ratingAverage: true,
        bookingCount: true,
      },
    });

    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === 'active').length;
    const totalBookings = listings.reduce((sum, l) => sum + (l.bookingCount || 0), 0);
    const ratingsSum = listings.reduce((sum, l) => sum + (l.ratingAverage || 0), 0);
    const averageRating = totalListings > 0 ? ratingsSum / totalListings : 0;

    // Get revenue from bookings
    const bookings = await db.booking.findMany({
      where: {
        hostId,
        status: 'completed',
      },
      select: { totalAmount: true },
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      totalListings,
      activeListings,
      totalBookings,
      totalRevenue,
      averageRating,
    };
  }
}

// ==================== Singleton Instance ====================

export const listingRepository = new ListingRepository();
