/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Review Repository Implementation
 * 
 * تنفيذ مستودع التقييمات باستخدام Prisma
 * 
 * @module infrastructure/repositories/review.repository
 */

import { db } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type {
  IReviewRepository,
  ReviewFilter,
  ReviewCreateData,
  ReviewUpdateData,
  ReviewStats,
} from '@/core/interfaces/repositories/review.repository';
import type { FindOptions, PaginatedResult, OperationResult } from '@/core/interfaces/repositories/base.repository';
import { Review, ReviewStatus } from '@/core/domain/entities/Review';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import type { Review as PrismaReview } from '@prisma/client';

// ==================== Review Repository ====================

export class ReviewRepository
  extends BaseRepository<PrismaReview, string>
  implements IReviewRepository
{
  constructor() {
    super(db.review as Parameters<typeof BaseRepository<PrismaReview, string>['constructor']>[0], 'id');
  }

  // ==================== Query Methods ====================

  async findByBookingId(bookingId: string): Promise<Review | null> {
    const review = await db.review.findUnique({
      where: { bookingId },
    });

    return review ? this.mapToEntity(review) : null;
  }

  async findByListingId(
    listingId: string,
    options?: FindOptions
  ): Promise<PaginatedResult<Review>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { listingId, status: 'active' };

    const [items, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return {
      items: items.map(r => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByReviewerId(
    reviewerId: string,
    options?: FindOptions
  ): Promise<PaginatedResult<Review>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { reviewerId, status: { not: 'deleted' } };

    const [items, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return {
      items: items.map(r => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByRevieweeId(
    revieweeId: string,
    options?: FindOptions
  ): Promise<PaginatedResult<Review>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { revieweeId, status: 'active' };

    const [items, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return {
      items: items.map(r => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async search(filter: ReviewFilter, options?: FindOptions): Promise<PaginatedResult<Review>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = this.buildFilter(filter);

    const [items, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return {
      items: items.map(r => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async existsForBooking(bookingId: string): Promise<boolean> {
    const count = await db.review.count({
      where: { bookingId },
    });
    return count > 0;
  }

  // ==================== Statistics ====================

  async getListingStats(listingId: string): Promise<ReviewStats> {
    const reviews = await db.review.findMany({
      where: { listingId, status: 'active' },
      select: {
        ratingOverall: true,
        ratingCleanliness: true,
        ratingCommunication: true,
        ratingLocation: true,
        ratingCheckIn: true,
        ratingValue: true,
      },
    });

    return this.calculateStats(reviews);
  }

  async getUserStats(userId: string): Promise<ReviewStats> {
    const reviews = await db.review.findMany({
      where: { revieweeId: userId, status: 'active' },
      select: {
        ratingOverall: true,
        ratingCleanliness: true,
        ratingCommunication: true,
        ratingLocation: true,
        ratingCheckIn: true,
        ratingValue: true,
      },
    });

    return this.calculateStats(reviews);
  }

  async getCompanyStats(companyId: string): Promise<ReviewStats> {
    // Get all listings for the company
    const listings = await db.listing.findMany({
      where: { companyId: companyId },
      select: { id: true },
    });

    const listingIds = listings.map(l => l.id);

    const reviews = await db.review.findMany({
      where: { listingId: { in: listingIds }, status: 'active' },
      select: {
        ratingOverall: true,
        ratingCleanliness: true,
        ratingCommunication: true,
        ratingLocation: true,
        ratingCheckIn: true,
        ratingValue: true,
      },
    });

    return this.calculateStats(reviews);
  }

  async getRatingDistribution(
    entityId: string,
    type: 'listing' | 'user' | 'company'
  ): Promise<{ 1: number; 2: number; 3: number; 4: number; 5: number }> {
    let where: Record<string, unknown> = { status: 'active' };

    if (type === 'listing') {
      where.listingId = entityId;
    } else if (type === 'user') {
      where.revieweeId = entityId;
    } else {
      // Company - get all listing IDs first
      const listings = await db.listing.findMany({
        where: { companyId: entityId },
        select: { id: true },
      });
      where.listingId = { in: listings.map(l => l.id) };
    }

    const distribution = await db.review.groupBy({
      by: ['ratingOverall'],
      where,
      _count: { id: true },
    });

    return {
      1: distribution.find(d => d.ratingOverall === 1)?._count.id ?? 0,
      2: distribution.find(d => d.ratingOverall === 2)?._count.id ?? 0,
      3: distribution.find(d => d.ratingOverall === 3)?._count.id ?? 0,
      4: distribution.find(d => d.ratingOverall === 4)?._count.id ?? 0,
      5: distribution.find(d => d.ratingOverall === 5)?._count.id ?? 0,
    };
  }

  // ==================== Response ====================

  async addResponse(reviewId: string, response: string): Promise<OperationResult> {
    try {
      await db.review.update({
        where: { id: reviewId },
        data: {
          response,
          respondedAt: new Date(),
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to add response' };
    }
  }

  async updateResponse(reviewId: string, response: string): Promise<OperationResult> {
    try {
      await db.review.update({
        where: { id: reviewId },
        data: {
          response,
          respondedAt: new Date(),
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update response' };
    }
  }

  async removeResponse(reviewId: string): Promise<OperationResult> {
    try {
      await db.review.update({
        where: { id: reviewId },
        data: {
          response: null,
          respondedAt: null,
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to remove response' };
    }
  }

  // ==================== Moderation ====================

  async updateStatus(reviewId: string, status: ReviewStatus): Promise<OperationResult> {
    try {
      await db.review.update({
        where: { id: reviewId },
        data: { status },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update status' };
    }
  }

  async report(reviewId: string, reason: string): Promise<OperationResult> {
    try {
      await db.review.update({
        where: { id: reviewId },
        data: {
          reportedAt: new Date(),
        },
      });

      // Could also create a Report record here
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to report review' };
    }
  }

  async findReported(options?: FindOptions): Promise<PaginatedResult<Review>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { reportedAt: { not: null } };

    const [items, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { reportedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return {
      items: items.map(r => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  // ==================== Bulk Operations ====================

  async updateStatusBatch(reviewIds: string[], status: ReviewStatus): Promise<OperationResult> {
    try {
      await db.review.updateMany({
        where: { id: { in: reviewIds } },
        data: { status },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update status batch' };
    }
  }

  // ==================== Existence Checks ====================

  async canReview(bookingId: string, userId: string): Promise<boolean> {
    // Check if user has a completed booking and hasn't reviewed yet
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        guestId: userId,
        status: 'completed',
      },
    });

    if (!booking) return false;

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { bookingId },
    });

    return !existingReview;
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter: ReviewFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter.listingId) where.listingId = filter.listingId;
    if (filter.reviewerId) where.reviewerId = filter.reviewerId;
    if (filter.revieweeId) where.revieweeId = filter.revieweeId;
    if (filter.bookingId) where.bookingId = filter.bookingId;

    if (filter.status) {
      where.status = Array.isArray(filter.status)
        ? { in: filter.status }
        : filter.status;
    }

    if (filter.minRating || filter.maxRating) {
      where.ratingOverall = {
        ...(filter.minRating && { gte: filter.minRating }),
        ...(filter.maxRating && { lte: filter.maxRating }),
      };
    }

    if (filter.hasResponse !== undefined) {
      where.response = filter.hasResponse ? { not: null } : null;
    }

    if (filter.hasComment !== undefined) {
      where.comment = filter.hasComment ? { not: null } : null;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {
        ...(filter.dateFrom && { gte: filter.dateFrom }),
        ...(filter.dateTo && { lte: filter.dateTo }),
      };
    }

    return where;
  }

  private calculateStats(reviews: Array<{
    ratingOverall: number;
    ratingCleanliness: number | null;
    ratingCommunication: number | null;
    ratingLocation: number | null;
    ratingCheckIn: number | null;
    ratingValue: number | null;
  }>): ReviewStats {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        averageOverall: 0,
        averageCleanliness: 0,
        averageCommunication: 0,
        averageLocation: 0,
        averageCheckIn: 0,
        averageValue: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce(
      (acc, r) => ({
        overall: acc.overall + r.ratingOverall,
        cleanliness: acc.cleanliness + (r.ratingCleanliness ?? 0),
        communication: acc.communication + (r.ratingCommunication ?? 0),
        location: acc.location + (r.ratingLocation ?? 0),
        checkIn: acc.checkIn + (r.ratingCheckIn ?? 0),
        value: acc.value + (r.ratingValue ?? 0),
      }),
      { overall: 0, cleanliness: 0, communication: 0, location: 0, checkIn: 0, value: 0 }
    );

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      distribution[r.ratingOverall as keyof typeof distribution]++;
    }

    return {
      total,
      averageOverall: sum.overall / total,
      averageCleanliness: sum.cleanliness / total,
      averageCommunication: sum.communication / total,
      averageLocation: sum.location / total,
      averageCheckIn: sum.checkIn / total,
      averageValue: sum.value / total,
      distribution,
    };
  }

  private mapToEntity(review: PrismaReview): Review {
    // Create a plain object that matches Review props
    const props = {
      bookingId: review.bookingId,
      listingId: review.listingId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      ratingOverall: review.ratingOverall,
      ratingCleanliness: review.ratingCleanliness ?? undefined,
      ratingCommunication: review.ratingCommunication ?? undefined,
      ratingLocation: review.ratingLocation ?? undefined,
      ratingCheckIn: review.ratingCheckIn ?? undefined,
      ratingValue: review.ratingValue ?? undefined,
      comment: review.comment ?? undefined,
      response: review.response ?? undefined,
      respondedAt: review.respondedAt ?? undefined,
      status: review.status as ReviewStatus,
      reportedAt: review.reportedAt ?? undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    // Return a minimal Review-like object
    return {
      id: new UniqueEntityId(review.id),
      props,
    } as unknown as Review;
  }

  // ==================== Extended Methods for Use Cases ====================

  /**
   * Create review with relations (reviewer, listing)
   */
  async createWithRelations(data: {
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
    status?: string;
  }): Promise<Record<string, unknown>> {
    const review = await db.review.create({
      data: {
        bookingId: data.bookingId,
        listingId: data.listingId,
        reviewerId: data.reviewerId,
        revieweeId: data.revieweeId,
        ratingOverall: data.ratingOverall,
        ratingCleanliness: data.ratingCleanliness,
        ratingCommunication: data.ratingCommunication,
        ratingLocation: data.ratingLocation,
        ratingCheckIn: data.ratingCheckIn,
        ratingValue: data.ratingValue,
        comment: data.comment,
        status: data.status ?? 'active',
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return review as Record<string, unknown>;
  }

  /**
   * Find review by ID with details
   */
  async findByIdWithDetails(id: string): Promise<Record<string, unknown> | null> {
    const review = await db.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return review as Record<string, unknown> | null;
  }

  /**
   * Update review with relations
   */
  async updateWithRelations(
    id: string,
    data: Partial<{
      ratingOverall: number;
      ratingCleanliness: number;
      ratingCommunication: number;
      ratingLocation: number;
      ratingCheckIn: number;
      ratingValue: number;
      comment: string;
    }>
  ): Promise<Record<string, unknown>> {
    const review = await db.review.update({
      where: { id },
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return review as Record<string, unknown>;
  }

  /**
   * Find review basic info by ID
   */
  async findByIdBasic(id: string): Promise<Record<string, unknown> | null> {
    const review = await db.review.findUnique({
      where: { id },
      select: {
        id: true,
        bookingId: true,
        listingId: true,
        reviewerId: true,
        revieweeId: true,
        ratingOverall: true,
        status: true,
        createdAt: true,
      },
    });

    return review as Record<string, unknown> | null;
  }
}

// ==================== Singleton Instance ====================

export const reviewRepository = new ReviewRepository();
