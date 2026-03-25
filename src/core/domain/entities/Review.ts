/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Review Entity - كيان التقييم
 * 
 * يمثل تقييم الإقامة أو الخدمة من قبل المستخدم.
 * يدعم Result Pattern للعمليات الآمنة.
 * 
 * @module core/domain/entities/Review
 */

import { Entity, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Rating } from '../value-objects/Rating';
import { Translation } from '../value-objects/Translation';
import type { Result, ValidationError, BusinessError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isNumber } from '../../types/guards';

// ==================== Types ====================

/**
 * حالة التقييم
 */
export type ReviewStatus = 'active' | 'hidden' | 'deleted' | 'pending_moderation';

/**
 * فئات التقييم
 */
export interface ReviewCategories {
  overall: number; // 1-5
  cleanliness?: number;
  communication?: number;
  location?: number;
  value?: number;
  checkIn?: number;
  accuracy?: number;
}

/**
 * خصائص التقييم
 */
export interface ReviewProps {
  id: UniqueEntityId | string;
  
  // المراجع
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string; // المضيف
  
  // التقييمات
  ratings: ReviewCategories;
  
  // المحتوى
  comment: Translation | null;
  response: Translation | null;
  respondedAt: Date | null;
  
  // الحالة
  status: ReviewStatus;
  isEdited: boolean;
  editCount: number;
  
  // البلاغات
  reportCount: number;
  reportedAt: Date | null;
  reportReason: string | null;
  
  // التواريخ
  createdAt: Date;
  updatedAt: Date;
}

/**
 * إحصائيات التقييم
 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  categoryAverages: Record<string, number>;
}

// ==================== Review Errors ====================

export class ReviewError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ReviewError';
  }

  static invalidRating(rating: number): ReviewError {
    return new ReviewError('INVALID_RATING', `Rating must be between 1 and 5, got ${rating}`, { rating });
  }

  static alreadyExists(bookingId: string): ReviewError {
    return new ReviewError('ALREADY_EXISTS', `Review already exists for booking ${bookingId}`, { bookingId });
  }

  static cannotEdit(): ReviewError {
    return new ReviewError('CANNOT_EDIT', 'Review cannot be edited after 48 hours');
  }

  static notFound(id: string): ReviewError {
    return new ReviewError('NOT_FOUND', `Review not found: ${id}`, { id });
  }
}

// ==================== Review Entity ====================

export class Review extends Entity<ReviewProps> {
  
  // ==================== Getters ====================
  
  get bookingId(): string {
    return this.props.bookingId;
  }
  
  get listingId(): string {
    return this.props.listingId;
  }
  
  get reviewerId(): string {
    return this.props.reviewerId;
  }
  
  get revieweeId(): string {
    return this.props.revieweeId;
  }
  
  get ratings(): ReviewCategories {
    return { ...this.props.ratings };
  }
  
  get overallRating(): number {
    return this.props.ratings.overall;
  }
  
  get comment(): Translation | null {
    return this.props.comment;
  }
  
  get status(): ReviewStatus {
    return this.props.status;
  }
  
  get isActive(): boolean {
    return this.props.status === 'active';
  }
  
  get hasResponse(): boolean {
    return this.props.response !== null;
  }
  
  // ==================== Business Methods ====================
  
  /**
   * حساب متوسط التقييم التفصيلي
   */
  calculateDetailedAverage(): number {
    const ratingValues = Object.values(this.props.ratings).filter(r => r !== undefined) as number[];
    if (ratingValues.length === 0) return this.props.ratings.overall;
    
    const sum = ratingValues.reduce((acc, r) => acc + r, 0);
    return Math.round((sum / ratingValues.length) * 10) / 10;
  }
  
  /**
   * تحديث التقييم
   */
  update(data: {
    ratings?: Partial<ReviewCategories>;
    comment?: Translation;
  }): Result<void, ValidationError | ReviewError> {
    // التحقق من إمكانية التعديل (خلال 48 ساعة)
    const hoursSinceCreation = (Date.now() - this.props.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 48) {
      return err(ReviewError.cannotEdit());
    }
    
    // التحقق من التقييمات
    if (data.ratings) {
      for (const [key, value] of Object.entries(data.ratings)) {
        if (value !== undefined && (value < 1 || value > 5)) {
          return err(ReviewError.invalidRating(value));
        }
      }
      this.props.ratings = { ...this.props.ratings, ...data.ratings };
    }
    
    if (data.comment !== undefined) {
      this.props.comment = data.comment;
    }
    
    this.props.isEdited = true;
    this.props.editCount += 1;
    this.touch();
    
    return ok(undefined);
  }
  
  /**
   * إضافة رد من المضيف
   */
  addResponse(response: Translation): Result<void, ReviewError> {
    if (this.props.response !== null) {
      return err(new ReviewError('ALREADY_RESPONDED', 'Review already has a response'));
    }
    
    // يجب أن يكون خلال 30 يوم
    const daysSinceCreation = (Date.now() - this.props.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      return err(new ReviewError('RESPONSE_WINDOW_CLOSED', 'Response window has closed'));
    }
    
    this.props.response = response;
    this.props.respondedAt = new Date();
    this.touch();
    
    return ok(undefined);
  }
  
  /**
   * تحديث الرد
   */
  updateResponse(response: Translation): void {
    this.props.response = response;
    this.touch();
  }
  
  /**
   * إخفاء التقييم
   */
  hide(reason?: string): void {
    this.props.status = 'hidden';
    this.touch();
  }
  
  /**
   * إظهار التقييم
   */
  show(): void {
    this.props.status = 'active';
    this.touch();
  }
  
  /**
   * حذف التقييم
   */
  delete(): void {
    this.props.status = 'deleted';
    this.touch();
  }
  
  /**
   * وضع التقييم في انتظار المراجعة
   */
  flagForModeration(reason: string): void {
    this.props.status = 'pending_moderation';
    this.props.reportCount += 1;
    this.props.reportedAt = new Date();
    this.props.reportReason = reason;
    this.touch();
  }
  
  /**
   * الحصول على إحصائيات التقييم
   */
  getStats(): { detailedAverage: number; hasAllCategories: boolean } {
    const categories = ['cleanliness', 'communication', 'location', 'value', 'checkIn', 'accuracy'] as const;
    const filledCategories = categories.filter(c => this.props.ratings[c] !== undefined);
    
    return {
      detailedAverage: this.calculateDetailedAverage(),
      hasAllCategories: filledCategories.length === categories.length,
    };
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء تقييم جديد
   */
  static create(props: Omit<ReviewProps, 'id' | 'createdAt' | 'updatedAt' | 'response' | 'respondedAt' | 'status' | 'isEdited' | 'editCount' | 'reportCount' | 'reportedAt' | 'reportReason'> & { id?: string }): Result<Review, ValidationError | ReviewError> {
    // التحقق من التقييم العام
    if (!props.ratings.overall || props.ratings.overall < 1 || props.ratings.overall > 5) {
      return err(ReviewError.invalidRating(props.ratings.overall));
    }
    
    // التحقق من التقييمات التفصيلية
    for (const [key, value] of Object.entries(props.ratings)) {
      if (value !== undefined && (value < 1 || value > 5)) {
        return err(ReviewError.invalidRating(value));
      }
    }
    
    const now = new Date();
    
    const review = new Review({
      ...props,
      id: props.id || new UniqueEntityId(),
      response: null,
      respondedAt: null,
      status: 'active' as ReviewStatus,
      isEdited: false,
      editCount: 0,
      reportCount: 0,
      reportedAt: null,
      reportReason: null,
      createdAt: now,
      updatedAt: now,
    });
    
    return ok(review);
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: ReviewProps): Review {
    return new Review(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      bookingId: this.props.bookingId,
      listingId: this.props.listingId,
      reviewerId: this.props.reviewerId,
      revieweeId: this.props.revieweeId,
      ratings: this.props.ratings,
      overallRating: this.props.ratings.overall,
      detailedAverage: this.calculateDetailedAverage(),
      comment: this.props.comment?.toJSON() || null,
      response: this.props.response?.toJSON() || null,
      respondedAt: this.props.respondedAt?.toISOString() || null,
      hasResponse: this.hasResponse,
      status: this.props.status,
      isEdited: this.props.isEdited,
      editCount: this.props.editCount,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
