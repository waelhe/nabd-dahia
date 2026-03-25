/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain Entities Index
 * 
 * @module core/domain/entities
 */

// ==================== Base ====================

export { Entity, AggregateRoot } from './base/Entity';
export type { 
  EntityProps, 
  DomainEvent,
  EntityCreateOptions,
  EntityValidationResult,
  EntityValidationError
} from './base/Entity';

// ==================== User ====================

export { User, UserError } from './User';
export type { 
  UserProps, 
  UserStats, 
  NotificationSettings,
  Gender,
  UserStatus,
  MembershipLevel
} from './User';

// ==================== Company ====================

export { Company, CompanyError } from './Company';
export type { 
  CompanyProps,
  CompanyType,
  CompanyStatus,
  CompanySettings,
  CompanyStats,
  VerificationLevel,
  BusinessHours,
  ContactInfo
} from './Company';

// ==================== Listing ====================

export { Listing, ListingError } from './Listing';
export type { 
  ListingProps,
  ListingType,
  ListingCategory,
  ListingStatus,
  ListingDetails,
  ListingImage,
  ListingStats,
  HouseRules,
  AccessInfo,
  SeasonalPricing,
  CancellationPolicy
} from './Listing';

// ==================== Booking ====================

export { Booking, BookingError } from './Booking';
export type { 
  BookingProps,
  BookingStatus,
  BookingSource,
  BookingGuest,
  BookingStats,
  PaymentStatus,
  PaymentInfo,
  CancellationInfo
} from './Booking';

// ==================== Review ====================

export { Review, ReviewError } from './Review';
export type { 
  ReviewProps,
  ReviewStatus,
  ReviewCategories,
  ReviewStats
} from './Review';

// ==================== Notification ====================

export { Notification, NotificationError } from './Notification';
export type { 
  NotificationProps,
  NotificationType,
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationData
} from './Notification';

// ==================== Payment ====================

export { Payment, PaymentError } from './Payment';
export type { 
  PaymentProps,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  PaymentStats,
  CardInfo,
  BankAccountInfo,
  GatewayResponse
} from './Payment';

// ==================== Escrow ====================

export { Escrow, EscrowError } from './Escrow';
export type { 
  EscrowProps,
  EscrowStatus,
  EscrowStats,
  EscrowTimeline,
  DisputeInfo,
  ReleaseConditions
} from './Escrow';

// ==================== Value Objects ====================

export * from '../value-objects';
