/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Reviews Use Cases
 * 
 * حالات استخدام التقييمات
 * 
 * @module application/reviews/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { reviewRepository } from '@/infrastructure/repositories/review.repository';
import { bookingRepository } from '@/infrastructure/repositories/booking.repository';
import { listingRepository } from '@/infrastructure/repositories/listing.repository';
import { userRepository } from '@/infrastructure/repositories/user.repository';

// ==================== Types ====================

export interface CreateReviewInput {
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: {
    overall: number;
    cleanliness?: number;
    communication?: number;
    location?: number;
    checkIn?: number;
    value?: number;
  };
  comment?: string;
}

export interface UpdateReviewInput {
  ratings?: {
    overall?: number;
    cleanliness?: number;
    communication?: number;
    location?: number;
    checkIn?: number;
    value?: number;
  };
  comment?: string;
}

export interface ReviewFilter {
  listingId?: string;
  reviewerId?: string;
  revieweeId?: string;
  bookingId?: string;
  status?: string | string[];
  minRating?: number;
  maxRating?: number;
  hasResponse?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReviewOutput {
  id: string;
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  ratingOverall: number;
  ratingCleanliness?: number;
  ratingCommunication?: number;
  ratingLocation?: number;
  ratingCheckIn?: number;
  ratingValue?: number;
  comment?: string;
  response?: string;
  respondedAt?: Date;
  status: string;
  reportedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  listing?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface PaginatedReviews {
  items: ReviewOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ReviewStats {
  total: number;
  averageOverall: number;
  averageCleanliness: number;
  averageCommunication: number;
  averageLocation: number;
  averageCheckIn: number;
  averageValue: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ==================== Use Cases ====================

/**
 * إنشاء تقييم جديد
 */
export async function createReview(
  input: CreateReviewInput
): Promise<Result<ReviewOutput, Error>> {
  try {
    // Verify booking exists and is completed using repository
    const booking = await bookingRepository.findByIdBasic(input.bookingId);

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    if ((booking as { status: string }).status !== 'completed') {
      return err(new Error('Cannot review a booking that is not completed'));
    }

    // Verify reviewer is the guest
    if ((booking as { guestId: string }).guestId !== input.reviewerId) {
      return err(new Error('Only the guest can review'));
    }

    // Verify no existing review
    const existingReview = await reviewRepository.findByBookingId(input.bookingId);
    if (existingReview) {
      return err(new Error('Review already exists for this booking'));
    }

    // Validate ratings
    if (input.ratings.overall < 1 || input.ratings.overall > 5) {
      return err(new Error('Overall rating must be between 1 and 5'));
    }

    // Create review using repository
    const review = await reviewRepository.createWithRelations({
      bookingId: input.bookingId,
      listingId: input.listingId,
      reviewerId: input.reviewerId,
      revieweeId: input.revieweeId,
      ratingOverall: input.ratings.overall,
      ratingCleanliness: input.ratings.cleanliness,
      ratingCommunication: input.ratings.communication,
      ratingLocation: input.ratings.location,
      ratingCheckIn: input.ratings.checkIn,
      ratingValue: input.ratings.value,
      comment: input.comment,
      status: 'active',
    });

    // Update listing rating
    await updateListingRating(input.listingId);

    // Update host rating
    await updateUserRating(input.revieweeId);

    return ok(mapToReviewOutput(review));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create review'));
  }
}

/**
 * الحصول على تقييم بالمعرف
 */
export async function getReview(id: string): Promise<Result<ReviewOutput, Error>> {
  try {
    const review = await reviewRepository.findByIdWithDetails(id);

    if (!review) {
      return err(new Error('Review not found'));
    }

    return ok(mapToReviewOutput(review));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get review'));
  }
}

/**
 * تقييم بالحجز
 */
export async function getReviewByBooking(
  bookingId: string
): Promise<Result<ReviewOutput | null, Error>> {
  try {
    const review = await reviewRepository.findByBookingId(bookingId);
    return ok(review ? mapToReviewOutput(review as Record<string, unknown>) : null);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get review'));
  }
}

/**
 * تقييمات الإقامة
 */
export async function getListingReviews(
  listingId: string,
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedReviews, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const result = await reviewRepository.findByListingId(listingId, { page, limit });

    return ok({
      items: result.items.map(r => mapToReviewOutput(r as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get listing reviews'));
  }
}

/**
 * تقييمات المستخدم (كمقيَّم)
 */
export async function getUserReviews(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedReviews, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const result = await reviewRepository.findByRevieweeId(userId, { page, limit });

    return ok({
      items: result.items.map(r => mapToReviewOutput(r as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get user reviews'));
  }
}

/**
 * تحديث تقييم
 */
export async function updateReview(
  id: string,
  input: UpdateReviewInput,
  userId: string
): Promise<Result<ReviewOutput, Error>> {
  try {
    const existingReview = await reviewRepository.findByIdBasic(id);

    if (!existingReview) {
      return err(new Error('Review not found'));
    }

    if ((existingReview as { reviewerId: string }).reviewerId !== userId) {
      return err(new Error('Unauthorized'));
    }

    // Check if within edit window (e.g., 48 hours)
    const hoursSinceCreation =
      (Date.now() - ((existingReview as { createdAt: Date }).createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 48) {
      return err(new Error('Cannot edit review after 48 hours'));
    }

    const updateData: Record<string, unknown> = {};
    if (input.ratings?.overall !== undefined) updateData.ratingOverall = input.ratings.overall;
    if (input.ratings?.cleanliness !== undefined) updateData.ratingCleanliness = input.ratings.cleanliness;
    if (input.ratings?.communication !== undefined) updateData.ratingCommunication = input.ratings.communication;
    if (input.ratings?.location !== undefined) updateData.ratingLocation = input.ratings.location;
    if (input.ratings?.checkIn !== undefined) updateData.ratingCheckIn = input.ratings.checkIn;
    if (input.ratings?.value !== undefined) updateData.ratingValue = input.ratings.value;
    if (input.comment !== undefined) updateData.comment = input.comment;

    const review = await reviewRepository.updateWithRelations(id, updateData);

    // Update listing rating
    await updateListingRating((existingReview as { listingId: string }).listingId);

    // Update host rating
    await updateUserRating((existingReview as { revieweeId: string }).revieweeId);

    return ok(mapToReviewOutput(review));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to update review'));
  }
}

/**
 * حذف تقييم
 */
export async function deleteReview(
  id: string,
  userId: string
): Promise<Result<void, Error>> {
  try {
    const existingReview = await reviewRepository.findByIdBasic(id);

    if (!existingReview) {
      return err(new Error('Review not found'));
    }

    if ((existingReview as { reviewerId: string }).reviewerId !== userId) {
      return err(new Error('Unauthorized'));
    }

    await reviewRepository.updateStatus(id, 'deleted');

    // Update listing rating
    await updateListingRating((existingReview as { listingId: string }).listingId);

    // Update host rating
    await updateUserRating((existingReview as { revieweeId: string }).revieweeId);

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete review'));
  }
}

/**
 * إضافة رد على تقييم
 */
export async function addReviewResponse(
  reviewId: string,
  response: string,
  userId: string
): Promise<Result<void, Error>> {
  try {
    const existingReview = await reviewRepository.findByIdBasic(reviewId);

    if (!existingReview) {
      return err(new Error('Review not found'));
    }

    // Verify user is the host (reviewee)
    if ((existingReview as { revieweeId: string }).revieweeId !== userId) {
      return err(new Error('Unauthorized'));
    }

    // Check if within response window (e.g., 30 days)
    const daysSinceCreation =
      (Date.now() - ((existingReview as { createdAt: Date }).createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      return err(new Error('Cannot respond to review after 30 days'));
    }

    await reviewRepository.addResponse(reviewId, response);

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to add response'));
  }
}

/**
 * إحصائيات التقييمات للإقامة
 */
export async function getListingReviewStats(
  listingId: string
): Promise<Result<ReviewStats, Error>> {
  try {
    const stats = await reviewRepository.getListingStats(listingId);
    return ok(stats);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get review stats'));
  }
}

/**
 * إحصائيات التقييمات للمستخدم
 */
export async function getUserReviewStats(
  userId: string
): Promise<Result<ReviewStats, Error>> {
  try {
    const stats = await reviewRepository.getUserStats(userId);
    return ok(stats);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get review stats'));
  }
}

/**
 * التحقق من إمكانية التقييم
 */
export async function canReview(
  bookingId: string,
  userId: string
): Promise<Result<boolean, Error>> {
  try {
    const canReviewBooking = await reviewRepository.canReview(bookingId, userId);
    return ok(canReviewBooking);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to check review eligibility'));
  }
}

// ==================== Helper Functions ====================

async function updateListingRating(listingId: string): Promise<void> {
  const stats = await reviewRepository.getListingStats(listingId);

  await listingRepository.updateRating(listingId, stats.averageOverall || 0, stats.total);
}

async function updateUserRating(userId: string): Promise<void> {
  const stats = await reviewRepository.getUserStats(userId);

  await userRepository.updateStats(userId, {
    ratingAverage: stats.averageOverall || null,
    ratingCount: stats.total,
  });
}

function mapToReviewOutput(review: Record<string, unknown>): ReviewOutput {
  return {
    id: review.id as string,
    bookingId: review.bookingId as string,
    listingId: review.listingId as string,
    reviewerId: review.reviewerId as string,
    revieweeId: review.revieweeId as string,
    ratingOverall: review.ratingOverall as number,
    ratingCleanliness: review.ratingCleanliness as number | undefined,
    ratingCommunication: review.ratingCommunication as number | undefined,
    ratingLocation: review.ratingLocation as number | undefined,
    ratingCheckIn: review.ratingCheckIn as number | undefined,
    ratingValue: review.ratingValue as number | undefined,
    comment: review.comment as string | undefined,
    response: review.response as string | undefined,
    respondedAt: review.respondedAt as Date | undefined,
    status: review.status as string,
    reportedAt: review.reportedAt as Date | undefined,
    createdAt: review.createdAt as Date,
    updatedAt: review.updatedAt as Date,
    reviewer: review.reviewer as ReviewOutput['reviewer'],
    listing: review.listing as ReviewOutput['listing'],
  };
}
