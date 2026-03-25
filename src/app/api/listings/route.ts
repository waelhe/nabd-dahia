/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listings API Endpoint
 *
 * نقطة نهاية API للإقامات والخدمات مع تحقق محسن
 *
 * @route GET /api/listings - قائمة الإقامات
 * @route POST /api/listings - إنشاء إقامة جديدة
 * @updated Fixed formatValidationErrors import
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ListingRepository } from '@/infrastructure/repositories/listing.repository';
import { ListingMapper } from '@/application/mappers';
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
  createListingSchema,
  validate,
  formatValidationErrors,
} from '@/lib/api-validation';

// Initialize repository
const listingRepository = new ListingRepository();

// ==================== GET - List Listings ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check for featured listings
    if (searchParams.get('featured') === 'true') {
      return handleGetFeatured(searchParams);
    }

    // Check for stats request
    if (searchParams.get('stats') === 'true') {
      return handleGetStats(searchParams);
    }

    // Check for search request
    const searchQuery = searchParams.get('search') || searchParams.get('q');
    if (searchQuery) {
      return handleSearch(searchQuery, searchParams);
    }

    // List listings with filters
    return handleList(searchParams);

  } catch (error) {
    console.error('Error fetching listings:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الإقامات', 500);
  }
}

// ==================== POST - Create Listing ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول لإنشاء إقامة', 401);
    }

    // Only hosts and companies can create listings
    if (!['host', 'company', 'admin'].includes(user.role)) {
      return errorResponse('FORBIDDEN', 'يجب أن تكون مضيفاً لإنشاء إقامة', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = validate(createListingSchema, body);
    if (!validation.success) {
      return validationErrorResponse(formatValidationErrors(validation.errors));
    }

    const data = validation.data;

    // Set hostId to current user if not specified
    const hostId = data.hostId || user.id;
    const companyId = data.companyId || (user.role === 'company' ? user.id : undefined);

    // Create listing
    const createData = {
      ...ListingMapper.createDTOToPersistence({
        ...data,
        hostId,
        companyId,
      }),
      status: 'draft',
    };

    const listing = await listingRepository.create(createData);

    return createdResponse(ListingMapper.prismaToDTO(listing as any));

  } catch (error) {
    console.error('Error creating listing:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء الإقامة', 500);
  }
}

// ==================== Helper Functions ====================

async function handleGetFeatured(searchParams: URLSearchParams) {
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '10', 10));

  const result = await listingRepository.findFeatured({ limit });

  return successResponse({
    items: result.items.map(l => ListingMapper.prismaToDTO(l as any)),
    total: result.total,
  });
}

async function handleGetStats(searchParams: URLSearchParams) {
  const hostId = searchParams.get('hostId');

  if (!hostId) {
    return errorResponse('INVALID_INPUT', 'معرف المضيف مطلوب للإحصائيات', 400);
  }

  const stats = await listingRepository.getHostStats(hostId);

  return successResponse(stats);
}

async function handleSearch(query: string, searchParams: URLSearchParams) {
  const { page, limit, skip } = getPaginationParams(searchParams);
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  const result = await listingRepository.search({
    filter: {
      search: query,
      category: category || undefined,
      type: type || undefined,
      city: city || undefined,
      country: country || undefined,
      status: ['active'],
    },
    limit,
    offset: skip,
  });

  return paginatedResponse(
    result.items.map(l => ListingMapper.prismaToDTO(l as any)),
    {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      hasMore: page * limit < result.total,
    }
  );
}

async function handleList(searchParams: URLSearchParams) {
  const { page, limit, skip } = getPaginationParams(searchParams);
  const { sortBy, sortOrder } = getSortParams(searchParams);

  // Build filter
  const filter = {
    hostId: searchParams.get('hostId') || undefined,
    companyId: searchParams.get('companyId') || undefined,
    type: searchParams.get('type')?.split(',')?.[0] || undefined,
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status')?.split(',') || ['active'],
    city: searchParams.get('city') || undefined,
    country: searchParams.get('country') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    minCapacity: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
    amenities: searchParams.get('amenities')?.split(',') || undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
  };

  // Get listings
  const result = await listingRepository.search({
    filter,
    limit,
    offset: skip,
    sortBy,
    sortOrder,
  });

  return paginatedResponse(
    result.items.map(l => ListingMapper.prismaToDTO(l as any)),
    {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      hasMore: page * limit < result.total,
    }
  );
}
