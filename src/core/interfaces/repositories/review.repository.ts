/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Review Repository Interface
 * 
 * واجهة مستودع التقييمات
 * 
 * @module core/interfaces/repositories/review.repository
 */

import { IRepository, FindOptions, PaginatedResult, OperationResult, WriteOptions } from './base.repository';
import { Review, ReviewStatus } from '../../domain/entities/Review';
import { UniqueEntityId } from '../../domain/value-objects/UniqueEntityId';

// ==================== Types ====================

export interface ReviewFilter {
  listingId?: string;
  reviewerId?: string;
  revieweeId?: string;
  bookingId?: string;
  status?: ReviewStatus | ReviewStatus[];
  minRating?: number;
  maxRating?: number;
  hasResponse?: boolean;
  hasComment?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReviewCreateData {
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

export interface ReviewUpdateData {
  ratings?: {
    overall?: number;
    cleanliness?: number;
    communication?: number;
    location?: number;
    checkIn?: number;
    value?: number;
  };
  comment?: string;
  status?: ReviewStatus;
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

// ==================== Interface ====================

export interface IReviewRepository extends IRepository<Review, UniqueEntityId> {
  // ==================== Query Methods ====================

  /**
   * البحث بالحجز
   */
  findByBookingId(bookingId: string): Promise<Review | null>;

  /**
   * البحث بالإقامة
   */
  findByListingId(
    listingId: string,
    options?: FindOptions
  ): Promise<PaginatedResult<Review>>;

  /**
   * البحث بالمقيّم
   */
  findByReviewerId(
    reviewerId: string,
    options?: FindOptions
  ): Promise<PaginatedResult<Review>>;

  /**
   * البحث بالمقيَّم
   */
  findByRevieweeId(
    revieweeId: string,
    options?: FindOptions
  ): Promise<PaginatedResult<Review>>;

  /**
   * البحث المتقدم
   */
  search(filter: ReviewFilter, options?: FindOptions): Promise<PaginatedResult<Review>>;

  /**
   * التحقق من وجود تقييم للحجز
   */
  existsForBooking(bookingId: string): Promise<boolean>;

  // ==================== Statistics ====================

  /**
   * إحصائيات الإقامة
   */
  getListingStats(listingId: string): Promise<ReviewStats>;

  /**
   * إحصائيات المستخدم (كمضيف)
   */
  getUserStats(userId: string): Promise<ReviewStats>;

  /**
   * إحصائيات الشركة
   */
  getCompanyStats(companyId: string): Promise<ReviewStats>;

  /**
   * عدد التقييمات لكل تقييم
   */
  getRatingDistribution(entityId: string, type: 'listing' | 'user' | 'company'): Promise<{
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }>;

  // ==================== Response ====================

  /**
   * إضافة رد
   */
  addResponse(
    reviewId: string,
    response: string
  ): Promise<OperationResult>;

  /**
   * تحديث رد
   */
  updateResponse(
    reviewId: string,
    response: string
  ): Promise<OperationResult>;

  /**
   * حذف رد
   */
  removeResponse(reviewId: string): Promise<OperationResult>;

  // ==================== Moderation ====================

  /**
   * تحديث الحالة
   */
  updateStatus(
    reviewId: string,
    status: ReviewStatus
  ): Promise<OperationResult>;

  /**
   * الإبلاغ عن تقييم
   */
  report(
    reviewId: string,
    reason: string
  ): Promise<OperationResult>;

  /**
   * الحصول على التقييمات المبلغ عنها
   */
  findReported(options?: FindOptions): Promise<PaginatedResult<Review>>;

  // ==================== Bulk Operations ====================

  /**
   * تحديث حالة متعددة
   */
  updateStatusBatch(
    reviewIds: string[],
    status: ReviewStatus
  ): Promise<OperationResult>;

  // ==================== Existence Checks ====================

  /**
   * التحقق من إمكانية التقييم
   * (المستخدم حجز وأكمل الإقامة ولم يقم بالتقييم بعد)
   */
  canReview(bookingId: string, userId: string): Promise<boolean>;
}
