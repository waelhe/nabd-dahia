/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listings Use Cases
 * 
 * حالات استخدام الإقامات والخدمات
 * 
 * @module application/listings/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { listingRepository } from '@/infrastructure/repositories/listing.repository';

// ==================== Types ====================

export interface CreateListingInput {
  hostId: string;
  companyId?: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  capacity: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  size?: number;
  basePrice: number;
  currency: string;
  cleaningFee?: number;
  securityDeposit?: number;
  minNights?: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
  instantBook?: boolean;
  cancellationPolicy?: string;
  address: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
  };
  amenities?: string[];
  houseRules?: Record<string, unknown>;
  images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  type?: string;
  category?: string;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  size?: number;
  basePrice?: number;
  currency?: string;
  cleaningFee?: number;
  securityDeposit?: number;
  minNights?: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
  instantBook?: boolean;
  cancellationPolicy?: string;
  address?: Partial<{
    country: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    neighborhood: string;
  }>;
  amenities?: string[];
  houseRules?: Record<string, unknown>;
  status?: string;
}

export interface ListingFilter {
  hostId?: string;
  companyId?: string;
  type?: string | string[];
  status?: string | string[];
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  amenities?: string[];
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  search?: string;
}

export interface ListingOutput {
  id: string;
  hostId: string;
  companyId?: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  category?: string;
  capacity: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  size?: number;
  basePrice: number;
  currency: string;
  cleaningFee?: number;
  securityDeposit?: number;
  minNights: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
  instantBook: boolean;
  cancellationPolicy: string;
  status: string;
  ratingAverage?: number;
  ratingCount: number;
  viewCount: number;
  bookingCount: number;
  favoriteCount: number;
  featured: boolean;
  address: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
  };
  images: Array<{
    id: string;
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  amenities: Array<{
    id: string;
    name: string;
    icon?: string;
    included: boolean;
  }>;
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isSuperhost: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedListings {
  items: ListingOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ==================== Use Cases ====================

/**
 * إنشاء إقامة جديدة
 */
export async function createListing(
  input: CreateListingInput
): Promise<Result<ListingOutput, Error>> {
  try {
    // Generate slug from title
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' + Date.now().toString(36);

    // Create listing using repository
    const listing = await listingRepository.createWithRelations(
      {
        hostId: input.hostId,
        companyId: input.companyId,
        title: input.title,
        slug,
        description: input.description,
        type: input.type,
        category: input.category,
        capacity: input.capacity,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        beds: input.beds,
        size: input.size,
        basePrice: input.basePrice,
        currency: input.currency,
        cleaningFee: input.cleaningFee,
        securityDeposit: input.securityDeposit,
        minNights: input.minNights ?? 1,
        maxNights: input.maxNights,
        checkInTime: input.checkInTime ?? '14:00',
        checkOutTime: input.checkOutTime ?? '12:00',
        instantBook: input.instantBook ?? false,
        cancellationPolicy: input.cancellationPolicy ?? 'moderate',
        country: input.address.country,
        city: input.address.city,
        address: input.address.address,
        latitude: input.address.latitude,
        longitude: input.address.longitude,
        neighborhood: input.address.neighborhood,
        houseRules: input.houseRules as object,
        status: 'draft',
      },
      input.images,
      input.amenities
    );

    return ok(mapToListingOutput(listing));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create listing'));
  }
}

/**
 * الحصول على إقامة بالمعرف
 */
export async function getListing(id: string): Promise<Result<ListingOutput, Error>> {
  try {
    const listing = await listingRepository.findByIdWithDetails(id);

    if (!listing) {
      return err(new Error('Listing not found'));
    }

    // Increment view count
    await listingRepository.incrementViewCount(id);

    return ok(mapToListingOutput(listing));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get listing'));
  }
}

/**
 * الحصول على إقامة بالـ slug
 */
export async function getListingBySlug(slug: string): Promise<Result<ListingOutput, Error>> {
  try {
    const listing = await listingRepository.findBySlugWithDetails(slug);

    if (!listing) {
      return err(new Error('Listing not found'));
    }

    // Increment view count
    await listingRepository.incrementViewCount(listing.id as string);

    return ok(mapToListingOutput(listing));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get listing'));
  }
}

/**
 * تحديث إقامة
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput
): Promise<Result<ListingOutput, Error>> {
  try {
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.bedrooms !== undefined) updateData.bedrooms = input.bedrooms;
    if (input.bathrooms !== undefined) updateData.bathrooms = input.bathrooms;
    if (input.beds !== undefined) updateData.beds = input.beds;
    if (input.size !== undefined) updateData.size = input.size;
    if (input.basePrice !== undefined) updateData.basePrice = input.basePrice;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.cleaningFee !== undefined) updateData.cleaningFee = input.cleaningFee;
    if (input.securityDeposit !== undefined) updateData.securityDeposit = input.securityDeposit;
    if (input.minNights !== undefined) updateData.minNights = input.minNights;
    if (input.maxNights !== undefined) updateData.maxNights = input.maxNights;
    if (input.checkInTime !== undefined) updateData.checkInTime = input.checkInTime;
    if (input.checkOutTime !== undefined) updateData.checkOutTime = input.checkOutTime;
    if (input.instantBook !== undefined) updateData.instantBook = input.instantBook;
    if (input.cancellationPolicy !== undefined) updateData.cancellationPolicy = input.cancellationPolicy;
    if (input.houseRules !== undefined) updateData.houseRules = input.houseRules;
    if (input.status !== undefined) updateData.status = input.status;

    if (input.address) {
      if (input.address.country !== undefined) updateData.country = input.address.country;
      if (input.address.city !== undefined) updateData.city = input.address.city;
      if (input.address.address !== undefined) updateData.address = input.address.address;
      if (input.address.latitude !== undefined) updateData.latitude = input.address.latitude;
      if (input.address.longitude !== undefined) updateData.longitude = input.address.longitude;
      if (input.address.neighborhood !== undefined) updateData.neighborhood = input.address.neighborhood;
    }

    const listing = await listingRepository.update(id, updateData, {
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
    });

    return ok(mapToListingOutput(listing as Record<string, unknown>));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to update listing'));
  }
}

/**
 * حذف إقامة (حذف ناعم)
 */
export async function deleteListing(id: string): Promise<Result<void, Error>> {
  try {
    await listingRepository.update(id, {
      deletedAt: new Date(),
      status: 'deleted',
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete listing'));
  }
}

/**
 * البحث عن إقامات
 */
export async function searchListings(
  filter: ListingFilter,
  options?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
): Promise<Result<PaginatedListings, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build repository filter
    const repoFilter: Record<string, unknown> = {
      deletedAt: null,
      status: 'active',
    };

    if (filter.hostId) repoFilter.hostId = filter.hostId;
    if (filter.companyId) repoFilter.companyId = filter.companyId;
    
    if (filter.type) {
      repoFilter.type = Array.isArray(filter.type) ? { in: filter.type } : filter.type;
    }
    
    if (filter.city) repoFilter.city = filter.city;
    if (filter.country) repoFilter.country = filter.country;

    if (filter.minPrice || filter.maxPrice) {
      repoFilter.minPrice = filter.minPrice;
      repoFilter.maxPrice = filter.maxPrice;
    }

    if (filter.minCapacity) repoFilter.minCapacity = filter.minCapacity;

    if (filter.amenities && filter.amenities.length > 0) {
      repoFilter.amenities = filter.amenities;
    }

    if (filter.search) {
      repoFilter.search = filter.search;
    }

    // Use repository search
    const result = await listingRepository.search({
      filter: repoFilter as unknown as Parameters<typeof listingRepository.search>[0]['filter'],
      limit,
      offset,
      sortBy: options?.sortBy ?? 'createdAt',
      sortOrder: options?.sortOrder ?? 'desc',
    });

    return ok({
      items: result.items.map(mapToListingOutput),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
      hasMore: offset + limit < result.total,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to search listings'));
  }
}

/**
 * نشر إقامة
 */
export async function publishListing(id: string): Promise<Result<ListingOutput, Error>> {
  try {
    const listing = await listingRepository.update(id, {
      status: 'active',
      publishedAt: new Date(),
    }, {
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
    });

    return ok(mapToListingOutput(listing as Record<string, unknown>));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to publish listing'));
  }
}

/**
 * إضافة صور لإقامة
 */
export async function addListingImages(
  listingId: string,
  images: Array<{ url: string; caption?: string; isPrimary?: boolean }>
): Promise<Result<void, Error>> {
  try {
    await listingRepository.addImages(listingId, images);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to add images'));
  }
}

/**
 * إضافة مرافق لإقامة
 */
export async function addListingAmenities(
  listingId: string,
  amenities: Array<{ name: string; icon?: string; included?: boolean }>
): Promise<Result<void, Error>> {
  try {
    await listingRepository.addAmenities(listingId, amenities);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to add amenities'));
  }
}

/**
 * التحقق من التوفر
 */
export async function checkAvailability(
  listingId: string,
  checkIn: Date,
  checkOut: Date
): Promise<Result<{ available: boolean; price: number; nights: number }, Error>> {
  try {
    const listing = await listingRepository.findByIdForBooking(listingId);

    if (!listing) {
      return err(new Error('Listing not found'));
    }

    // Check for overlapping bookings using repository
    const available = await listingRepository.checkAvailability(listingId, checkIn, checkOut);

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const minNights = listing.minNights as number;
    const isNightsValid = nights >= minNights;

    let price = (listing.basePrice as number) * nights;
    if (listing.cleaningFee) price += listing.cleaningFee as number;
    // Add service fee (10%)
    const serviceFee = price * 0.1;
    price += serviceFee;

    return ok({ available: available && isNightsValid, price, nights });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to check availability'));
  }
}

// ==================== Helper Functions ====================

function mapToListingOutput(listing: Record<string, unknown>): ListingOutput {
  return {
    id: listing.id as string,
    hostId: listing.hostId as string,
    companyId: listing.companyId as string | undefined,
    title: listing.title as string,
    slug: listing.slug as string,
    description: listing.description as string | undefined,
    type: listing.type as string,
    category: listing.category as string | undefined,
    capacity: listing.capacity as number,
    bedrooms: listing.bedrooms as number | undefined,
    bathrooms: listing.bathrooms as number | undefined,
    beds: listing.beds as number | undefined,
    size: listing.size as number | undefined,
    basePrice: listing.basePrice as number,
    currency: listing.currency as string,
    cleaningFee: listing.cleaningFee as number | undefined,
    securityDeposit: listing.securityDeposit as number | undefined,
    minNights: listing.minNights as number,
    maxNights: listing.maxNights as number | undefined,
    checkInTime: listing.checkInTime as string | undefined,
    checkOutTime: listing.checkOutTime as string | undefined,
    instantBook: listing.instantBook as boolean,
    cancellationPolicy: listing.cancellationPolicy as string,
    status: listing.status as string,
    ratingAverage: listing.ratingAverage as number | undefined,
    ratingCount: listing.ratingCount as number,
    viewCount: listing.viewCount as number,
    bookingCount: listing.bookingCount as number,
    favoriteCount: listing.favoriteCount as number,
    featured: listing.featured as boolean,
    address: {
      country: listing.country as string | undefined,
      city: listing.city as string | undefined,
      address: listing.address as string | undefined,
      latitude: listing.latitude as number | undefined,
      longitude: listing.longitude as number | undefined,
      neighborhood: listing.neighborhood as string | undefined,
    },
    images: ((listing.images as Array<Record<string, unknown>>) ?? []).map(img => ({
      id: img.id as string,
      url: img.url as string,
      caption: img.caption as string | undefined,
      isPrimary: img.isPrimary as boolean,
    })),
    amenities: ((listing.amenities as Array<Record<string, unknown>>) ?? []).map(a => ({
      id: a.id as string,
      name: a.name as string,
      icon: a.icon as string | undefined,
      included: a.included as boolean,
    })),
    host: listing.host as ListingOutput['host'],
    createdAt: listing.createdAt as Date,
    updatedAt: listing.updatedAt as Date,
  };
}
