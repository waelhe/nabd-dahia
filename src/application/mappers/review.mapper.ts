/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Review Mapper
 *
 * مسئول عن التحويل بين:
 * - Domain Entity (Review) ↔ Persistence Model (Prisma Review)
 * - Domain Entity (Review) ↔ DTO (API Response)
 *
 * @module application/mappers/review.mapper
 */

import { Review, ReviewProps, ReviewError, ReviewStatus, ReviewCategories } from '@/core/domain/entities/Review';
import { Translation } from '@/core/domain/value-objects/Translation';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';
import { BaseMapper, MapperError, parseJSON, dateToISO, isoToDate } from './base.mapper';

// ==================== Types ====================

/**
 * بيانات إنشاء التقييم من API
 */
export interface ReviewCreateDTO {
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: ReviewCategoriesDTO;
  comment?: string;
}

/**
 * بيانات تحديث التقييم من API
 */
export interface ReviewUpdateDTO {
  ratings?: Partial<ReviewCategoriesDTO>;
  comment?: string;
}

/**
 * فئات التقييم DTO
 */
export interface ReviewCategoriesDTO {
  overall: number;
  cleanliness?: number;
  communication?: number;
  location?: number;
  value?: number;
  checkIn?: number;
  accuracy?: number;
}

/**
 * استجابة API للتقييم
 */
export interface ReviewResponseDTO {
  id: string;
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: ReviewCategoriesDTO;
  overallRating: number;
  detailedAverage: number;
  comment: string | null;
  response: string | null;
  respondedAt: Date | null;
  hasResponse: boolean;
  status: ReviewStatus;
  isEdited: boolean;
  editCount: number;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  listing?: {
    id: string;
    title: string;
    city: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للتقييم (مختصرة)
 */
export interface ReviewSummaryDTO {
  id: string;
  overallRating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: Date;
}

// ==================== Prisma Types ====================

interface PrismaReviewWithIncludes {
  id: string;
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  overallRating: number;
  cleanliness: number | null;
  communication: number | null;
  location: number | null;
  value: number | null;
  checkIn: number | null;
  accuracy: number | null;
  comment: string | null;
  response: string | null;
  respondedAt: Date | null;
  status: ReviewStatus;
  isEdited: boolean;
  editCount: number;
  reportCount: number;
  reportedAt: Date | null;
  reportReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  listing?: {
    id: string;
    title: string;
    city: string | null;
  };
}

// ==================== Mapper Class ====================

export class ReviewMapper extends BaseMapper<Review, ReviewResponseDTO, PrismaReviewWithIncludes, ReviewCreateDTO, ReviewUpdateDTO> {

  // ==================== To Domain ====================

  /**
   * تحويل Prisma Review إلى Domain Entity
   */
  toDomain(prismaReview: PrismaReviewWithIncludes): Result<Review, MapperError> {
    try {
      // إنشاء Ratings
      const ratings: ReviewCategories = {
        overall: prismaReview.overallRating,
        cleanliness: prismaReview.cleanliness ?? undefined,
        communication: prismaReview.communication ?? undefined,
        location: prismaReview.location ?? undefined,
        value: prismaReview.value ?? undefined,
        checkIn: prismaReview.checkIn ?? undefined,
        accuracy: prismaReview.accuracy ?? undefined,
      };

      // إنشاء Comment translation
      let comment: Translation | null = null;
      if (prismaReview.comment) {
        const commentResult = Translation.create({
          translations: { ar: prismaReview.comment },
        });
        if (commentResult.isSuccess) {
          comment = commentResult.value;
        }
      }

      // إنشاء Response translation
      let response: Translation | null = null;
      if (prismaReview.response) {
        const responseResult = Translation.create({
          translations: { ar: prismaReview.response },
        });
        if (responseResult.isSuccess) {
          response = responseResult.value;
        }
      }

      // إنشاء Review Props
      const props: ReviewProps = {
        id: new UniqueEntityId(prismaReview.id),
        bookingId: prismaReview.bookingId,
        listingId: prismaReview.listingId,
        reviewerId: prismaReview.reviewerId,
        revieweeId: prismaReview.revieweeId,
        ratings,
        comment,
        response,
        respondedAt: prismaReview.respondedAt,
        status: prismaReview.status,
        isEdited: prismaReview.isEdited,
        editCount: prismaReview.editCount,
        reportCount: prismaReview.reportCount,
        reportedAt: prismaReview.reportedAt,
        reportReason: prismaReview.reportReason,
        createdAt: prismaReview.createdAt,
        updatedAt: prismaReview.updatedAt,
      };

      // إعادة بناء الـ Entity
      return ok(Review.reconstitute(props));
    } catch (error) {
      return err(MapperError.conversionFailed('PrismaReview', 'Review', String(error)));
    }
  }

  // ==================== To Persistence ====================

  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  toPersistence(review: Review): Record<string, unknown> {
    return {
      id: review.idValue,
      bookingId: review.bookingId,
      listingId: review.listingId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      overallRating: review.overallRating,
      cleanliness: review.getProps().ratings.cleanliness ?? null,
      communication: review.getProps().ratings.communication ?? null,
      location: review.getProps().ratings.location ?? null,
      value: review.getProps().ratings.value ?? null,
      checkIn: review.getProps().ratings.checkIn ?? null,
      accuracy: review.getProps().ratings.accuracy ?? null,
      comment: review.comment?.toString() || null,
      response: review.getProps().response?.toString() || null,
      respondedAt: review.getProps().respondedAt,
      status: review.status,
      isEdited: review.getProps().isEdited,
      editCount: review.getProps().editCount,
      reportCount: review.getProps().reportCount,
      reportedAt: review.getProps().reportedAt,
      reportReason: review.getProps().reportReason,
    };
  }

  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  createDTOToPersistence(dto: ReviewCreateDTO): Record<string, unknown> {
    return {
      bookingId: dto.bookingId,
      listingId: dto.listingId,
      reviewerId: dto.reviewerId,
      revieweeId: dto.revieweeId,
      overallRating: dto.ratings.overall,
      cleanliness: dto.ratings.cleanliness ?? null,
      communication: dto.ratings.communication ?? null,
      location: dto.ratings.location ?? null,
      value: dto.ratings.value ?? null,
      checkIn: dto.ratings.checkIn ?? null,
      accuracy: dto.ratings.accuracy ?? null,
      comment: dto.comment || null,
      response: null,
      respondedAt: null,
      status: 'active',
      isEdited: false,
      editCount: 0,
      reportCount: 0,
      reportedAt: null,
      reportReason: null,
    };
  }

  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  updateDTOToPersistence(dto: ReviewUpdateDTO): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (dto.ratings !== undefined) {
      if (dto.ratings.overall !== undefined) data.overallRating = dto.ratings.overall;
      if (dto.ratings.cleanliness !== undefined) data.cleanliness = dto.ratings.cleanliness;
      if (dto.ratings.communication !== undefined) data.communication = dto.ratings.communication;
      if (dto.ratings.location !== undefined) data.location = dto.ratings.location;
      if (dto.ratings.value !== undefined) data.value = dto.ratings.value;
      if (dto.ratings.checkIn !== undefined) data.checkIn = dto.ratings.checkIn;
      if (dto.ratings.accuracy !== undefined) data.accuracy = dto.ratings.accuracy;
    }
    if (dto.comment !== undefined) data.comment = dto.comment;

    return data;
  }

  // ==================== To DTO ====================

  /**
   * تحويل Domain Entity إلى Response DTO
   */
  toDTO(review: Review): ReviewResponseDTO {
    return {
      id: review.idValue,
      bookingId: review.bookingId,
      listingId: review.listingId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      ratings: {
        overall: review.overallRating,
        cleanliness: review.getProps().ratings.cleanliness,
        communication: review.getProps().ratings.communication,
        location: review.getProps().ratings.location,
        value: review.getProps().ratings.value,
        checkIn: review.getProps().ratings.checkIn,
        accuracy: review.getProps().ratings.accuracy,
      },
      overallRating: review.overallRating,
      detailedAverage: review.calculateDetailedAverage(),
      comment: review.comment?.toString() || null,
      response: review.getProps().response?.toString() || null,
      respondedAt: review.getProps().respondedAt,
      hasResponse: review.hasResponse,
      status: review.status,
      isEdited: review.getProps().isEdited,
      editCount: review.getProps().editCount,
      createdAt: review.getProps().createdAt,
      updatedAt: review.getProps().updatedAt,
    };
  }

  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  toSummaryDTO(review: Review): ReviewSummaryDTO {
    return {
      id: review.idValue,
      overallRating: review.overallRating,
      comment: review.comment?.toString() || null,
      reviewerName: '', // يجب ملؤها من البيانات المرتبطة
      createdAt: review.getProps().createdAt,
    };
  }

  /**
   * تحويل Prisma Review مباشرة إلى Response DTO
   */
  prismaToDTO(prismaReview: PrismaReviewWithIncludes): ReviewResponseDTO {
    const result = this.toDomain(prismaReview);
    if (result.isFailure) {
      throw result.error;
    }

    const dto = this.toDTO(result.value);

    // إضافة البيانات المرتبطة
    return {
      ...dto,
      reviewer: prismaReview.reviewer ? {
        id: prismaReview.reviewer.id,
        firstName: prismaReview.reviewer.firstName,
        lastName: prismaReview.reviewer.lastName,
        avatar: prismaReview.reviewer.avatar,
      } : undefined,
      listing: prismaReview.listing ? {
        id: prismaReview.listing.id,
        title: prismaReview.listing.title,
        city: prismaReview.listing.city,
      } : undefined,
    };
  }

  /**
   * حساب متوسط التقييمات من قائمة
   */
  static calculateAverage(reviews: ReviewResponseDTO[]): {
    overall: number;
    categories: Record<string, number>;
  } {
    if (reviews.length === 0) {
      return { overall: 0, categories: {} };
    }

    const categories: Record<string, number[]> = {
      cleanliness: [],
      communication: [],
      location: [],
      value: [],
      checkIn: [],
      accuracy: [],
    };

    let overallSum = 0;

    for (const review of reviews) {
      overallSum += review.overallRating;

      if (review.ratings.cleanliness) categories.cleanliness.push(review.ratings.cleanliness);
      if (review.ratings.communication) categories.communication.push(review.ratings.communication);
      if (review.ratings.location) categories.location.push(review.ratings.location);
      if (review.ratings.value) categories.value.push(review.ratings.value);
      if (review.ratings.checkIn) categories.checkIn.push(review.ratings.checkIn);
      if (review.ratings.accuracy) categories.accuracy.push(review.ratings.accuracy);
    }

    const categoryAverages: Record<string, number> = {};
    for (const [key, values] of Object.entries(categories)) {
      if (values.length > 0) {
        categoryAverages[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      }
    }

    return {
      overall: Math.round((overallSum / reviews.length) * 10) / 10,
      categories: categoryAverages,
    };
  }
}
