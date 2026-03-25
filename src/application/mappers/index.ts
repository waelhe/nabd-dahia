/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mappers Index
 *
 * نقطة تصدير جميع الـ Mappers
 *
 * @module application/mappers
 */

// ==================== Base Mapper ====================

export {
  BaseMapper,
  MapperError,
  type MapperOptions,
  type MapperResult,
  // Helper Functions
  dateToISO,
  isoToDate,
  toNumber,
  toBoolean,
  parseJSON,
  toJSON,
  createSlug,
  truncate,
  hasField,
  safeValue,
  mapArray,
  filterUndefined,
  mapperRegistry,
} from './base.mapper';

// ==================== User Mapper ====================

export {
  UserMapper,
  type UserCreateDTO,
  type UserUpdateDTO,
  type UserResponseDTO,
  type UserSummaryDTO,
} from './user.mapper';

// ==================== Company Mapper ====================

export {
  CompanyMapper,
  type CompanyCreateDTO,
  type CompanyUpdateDTO,
  type CompanyResponseDTO,
  type CompanySummaryDTO,
  type CompanySettingsDTO,
  type BusinessHoursDTO,
} from './company.mapper';

// ==================== Listing Mapper ====================

export {
  ListingMapper,
  type ListingCreateDTO,
  type ListingResponseDTO,
  type ListingSummaryDTO,
} from './listing.mapper';

// ==================== Booking Mapper ====================

export {
  BookingMapper,
  type BookingCreateDTO,
  type BookingUpdateDTO,
  type BookingResponseDTO,
  type BookingSummaryDTO,
} from './booking.mapper';

// ==================== Review Mapper ====================

export {
  ReviewMapper,
  type ReviewCreateDTO,
  type ReviewUpdateDTO,
  type ReviewResponseDTO,
  type ReviewSummaryDTO,
  type ReviewCategoriesDTO,
} from './review.mapper';

// ==================== Payment Mapper ====================

export {
  PaymentMapper,
  type PaymentCreateDTO,
  type PaymentUpdateDTO,
  type PaymentResponseDTO,
  type PaymentSummaryDTO,
  type CardInfoDTO,
  type BankAccountInfoDTO,
} from './payment.mapper';

// ==================== Notification Mapper ====================

export {
  NotificationMapper,
  type NotificationCreateDTO,
  type NotificationUpdateDTO,
  type NotificationResponseDTO,
  type NotificationSummaryDTO,
} from './notification.mapper';

// ==================== Escrow Mapper ====================

export {
  EscrowMapper,
  type EscrowCreateDTO,
  type EscrowResponseDTO,
  type EscrowSummaryDTO,
  type ReleaseConditionsDTO,
  type EscrowPartyDTO,
  type EscrowTransactionDTO,
} from './escrow.mapper';
