/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Listing by ID API Endpoint
 *
 * نقطة نهاية API لإقامة محددة مع تحقق محسن
 *
 * @route GET /api/listings/[id] - الحصول على إقامة
 * @route PUT /api/listings/[id] - تحديث إقامة
 * @route DELETE /api/listings/[id] - حذف إقامة
 * @route PATCH /api/listings/[id] - إجراءات متعددة
 * @updated Fixed formatValidationErrors import
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ListingRepository } from '@/infrastructure/repositories/listing.repository';
import { ListingMapper } from '@/application/mappers';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  noContentResponse,
  createdResponse,
} from '@/lib/api-response';
import {
  updateListingSchema,
  idSchema,
  validate,
  formatValidationErrors,
} from '@/lib/api-validation';

// Initialize repository
const listingRepository = new ListingRepository();

// ==================== GET - Get Listing ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف الإقامة غير صالح', 400);
    }

    // Try to get by ID first, then by slug
    let listing = await listingRepository.findById(id);

    if (!listing) {
      listing = await listingRepository.findBySlug(id);
    }

    if (!listing) {
      return notFoundResponse('الإقامة');
    }

    // Increment view count (async, don't wait)
    listingRepository.incrementViewCount(id).catch(() => {});

    const user = await getCurrentUser();
    const isOwner = user?.id === (listing as any).hostId || (listing as any).companyId === user?.id;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    // Return full data for owner/admin, limited for others
    if (isOwner || isAdmin) {
      return successResponse(ListingMapper.prismaToDTO(listing as any));
    }

    // For non-owners, only return published listings
    if ((listing as any).status !== 'active' && (listing as any).status !== 'published') {
      return notFoundResponse('الإقامة');
    }

    return successResponse(ListingMapper.prismaToDTO(listing as any));

  } catch (error) {
    console.error('Error fetching listing:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الإقامة', 500);
  }
}

// ==================== PUT - Update Listing ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف الإقامة غير صالح', 400);
    }

    // Check if listing exists
    const listing = await listingRepository.findById(id);
    if (!listing) {
      return notFoundResponse('الإقامة');
    }

    // Check ownership
    const isOwner = user.id === (listing as any).hostId || user.id === (listing as any).companyId;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لتعديل هذه الإقامة', 403);
    }

    // Validate input
    const validation = validate(updateListingSchema, body);
    if (!validation.success) {
      return validationErrorResponse(formatValidationErrors(validation.errors));
    }

    // Update listing
    const updateData = ListingMapper.updateDTOToPersistence(validation.data);
    const updatedListing = await listingRepository.update(id, updateData);

    return successResponse(ListingMapper.prismaToDTO(updatedListing as any));

  } catch (error) {
    console.error('Error updating listing:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الإقامة', 500);
  }
}

// ==================== DELETE - Delete Listing ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { id } = await params;

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف الإقامة غير صالح', 400);
    }

    // Check if listing exists
    const listing = await listingRepository.findById(id);
    if (!listing) {
      return notFoundResponse('الإقامة');
    }

    // Check ownership
    const isOwner = user.id === (listing as any).hostId || user.id === (listing as any).companyId;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لحذف هذه الإقامة', 403);
    }

    // Check for active bookings
    const activeBookings = await listingRepository.hasActiveBookings(id);
    if (activeBookings) {
      return errorResponse('CONFLICT', 'لا يمكن حذف إقامة لديها حجوزات نشطة', 409);
    }

    // Soft delete
    await listingRepository.softDelete(id, user.id);

    return noContentResponse();

  } catch (error) {
    console.error('Error deleting listing:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء حذف الإقامة', 500);
  }
}

// ==================== PATCH - Actions ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف الإقامة غير صالح', 400);
    }

    // Check if listing exists
    const listing = await listingRepository.findById(id);
    if (!listing) {
      return notFoundResponse('الإقامة');
    }

    // Check ownership
    const isOwner = user.id === (listing as any).hostId || user.id === (listing as any).companyId;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    const action = body.action;

    switch (action) {
      case 'publish': {
        if (!isOwner && !isAdmin) {
          return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لنشر هذه الإقامة', 403);
        }

        const result = await listingRepository.publish(id);
        return successResponse({
          ...ListingMapper.prismaToDTO(result as any),
          message: 'تم نشر الإقامة بنجاح'
        });
      }

      case 'unpublish': {
        if (!isOwner && !isAdmin) {
          return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لإلغاء نشر هذه الإقامة', 403);
        }

        const result = await listingRepository.update(id, { status: 'inactive' });
        return successResponse({
          ...ListingMapper.prismaToDTO(result as any),
          message: 'تم إلغاء نشر الإقامة'
        });
      }

      case 'feature': {
        if (!isAdmin) {
          return errorResponse('FORBIDDEN', 'فقط المديرون يمكنهم تمييز الإقامات', 403);
        }

        const until = body.until ? new Date(body.until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const result = await listingRepository.feature(id, until);
        return successResponse({
          ...ListingMapper.prismaToDTO(result as any),
          message: 'تم تمييز الإقامة'
        });
      }

      case 'unfeature': {
        if (!isAdmin) {
          return errorResponse('FORBIDDEN', 'فقط المديرون يمكنهم إلغاء تمييز الإقامات', 403);
        }

        const result = await listingRepository.unfeature(id);
        return successResponse({
          ...ListingMapper.prismaToDTO(result as any),
          message: 'تم إلغاء تمييز الإقامة'
        });
      }

      case 'archive': {
        if (!isOwner && !isAdmin) {
          return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لأرشفة هذه الإقامة', 403);
        }

        const result = await listingRepository.update(id, { status: 'archived' });
        return successResponse({
          ...ListingMapper.prismaToDTO(result as any),
          message: 'تم أرشفة الإقامة'
        });
      }

      case 'duplicate': {
        if (!isOwner && !isAdmin) {
          return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لنسخ هذه الإقامة', 403);
        }

        const result = await listingRepository.duplicate(id, user.id);
        return createdResponse({
          ...ListingMapper.prismaToDTO(result as any),
          message: 'تم نسخ الإقامة بنجاح'
        });
      }

      default:
        return errorResponse('INVALID_ACTION', 'إجراء غير معروف', 400);
    }

  } catch (error) {
    console.error('Error in listing action:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تنفيذ الإجراء', 500);
  }
}
