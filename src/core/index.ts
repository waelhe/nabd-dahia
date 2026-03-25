/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core Module - الوحدة الأساسية
 * 
 * نقطة الدخول الرئيسية لطبقة Core.
 * 
 * @module core
 */

// ==================== Types ====================

export * from './types';

// ==================== Domain ====================

// Base Entity
export { Entity, AggregateRoot, createDomainEvent } from './domain/entities/base/Entity';
export type { EntityProps, DomainEvent, EntityValidationResult, EntityValidationError, EntityCreateOptions } from './domain/entities/base/Entity';

// ==================== Entities ====================

// User
export { User, UserError } from './domain/entities/User';
export type { UserProps, UserStats, Gender, UserStatus, MembershipLevel, NotificationSettings } from './domain/entities/User';

// Company
export { Company, CompanyError } from './domain/entities/Company';
export type { 
  CompanyProps, CompanyType, CompanyStatus, CompanySettings, 
  CompanyStats, VerificationLevel, BusinessHours, ContactInfo 
} from './domain/entities/Company';

// Listing
export { Listing, ListingError } from './domain/entities/Listing';
export type { 
  ListingProps, ListingType, ListingCategory, ListingStatus, ListingDetails,
  ListingImage, ListingStats, HouseRules, AccessInfo, SeasonalPricing, CancellationPolicy
} from './domain/entities/Listing';

// Booking
export { Booking, BookingError } from './domain/entities/Booking';
export type { 
  BookingProps, BookingStatus, BookingSource, BookingGuest, 
  BookingStats, PaymentStatus, PaymentInfo, CancellationInfo
} from './domain/entities/Booking';

// Review
export { Review, ReviewError } from './domain/entities/Review';
export type { ReviewProps, ReviewStatus, ReviewCategories, ReviewStats } from './domain/entities/Review';

// Notification
export { Notification, NotificationError } from './domain/entities/Notification';
export type { 
  NotificationProps, NotificationType, NotificationStatus, 
  NotificationChannel, NotificationPriority, NotificationData
} from './domain/entities/Notification';

// Payment
export { Payment, PaymentError } from './domain/entities/Payment';
export type { 
  PaymentProps, PaymentStatus, PaymentMethod, PaymentType, 
  PaymentStats, CardInfo, BankAccountInfo, GatewayResponse
} from './domain/entities/Payment';

// Escrow
export { Escrow, EscrowError } from './domain/entities/Escrow';
export type { 
  EscrowProps, EscrowStatus, EscrowStats, EscrowTimeline, 
  DisputeInfo, ReleaseConditions
} from './domain/entities/Escrow';

// ==================== Value Objects ====================

export { UniqueEntityId } from './domain/value-objects/UniqueEntityId';

// Money
export { Money, MoneyError, SUPPORTED_CURRENCIES, DECIMAL_PLACES, CURRENCY_SYMBOLS } from './domain/value-objects/Money';
export type { MoneyProps, Currency } from './domain/value-objects/Money';

// Email
export { Email, EmailError } from './domain/value-objects/Email';

// Phone
export { Phone, PhoneError } from './domain/value-objects/Phone';

// Address
export { Address, AddressError } from './domain/value-objects/Address';
export type { AddressProps } from './domain/value-objects/Address';

// Rating
export { Rating, RatingError } from './domain/value-objects/Rating';
export type { RatingBreakdown, RatingProps } from './domain/value-objects/Rating';

// Translation
export { Translation, TranslationError, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_NAMES, RTL_LANGUAGES } from './domain/value-objects/Translation';
export type { SupportedLanguage, TranslationMap, TranslationProps } from './domain/value-objects/Translation';

// DateRange
export { DateRange, DateRangeError } from './domain/value-objects/DateRange';
export type { DateRangeProps } from './domain/value-objects/DateRange';

// ==================== Authorization ====================

export { Role, ROLE_LEVELS } from './domain/authorization/Role';
export type { RoleProps, RoleName } from './domain/authorization/Role';
export { Permission, PermissionSet } from './domain/authorization/Permission';
export type { PermissionProps } from './domain/authorization/Permission';
export { Policy, PolicyEngine } from './domain/authorization/Policy';
export type { PolicyProps, PolicyContext, PolicyResult, PolicyEffect, PolicyCondition, PolicyStatement, PolicyEvaluationContext } from './domain/authorization/Policy';
export { PERMISSIONS, getPermission } from './domain/authorization/permissions';
export { ROLES, getRole } from './domain/authorization/roles';

// ==================== Behaviors ====================

export { SoftDeletable } from './domain/behaviors/SoftDeletable';
export { VersionedEntity } from './domain/behaviors/VersionedEntity';
export { Translatable } from './domain/behaviors/Translatable';
export { Lockable } from './domain/behaviors/Lockable';

// ==================== Rules ====================

// Booking Rules
export { 
  validateBooking, 
  calculateTotalPrice, 
  calculateLongStayDiscount, 
  canTransitionStatus,
  MIN_NOTICE_HOURS,
  MAX_ADVANCE_BOOKING_DAYS,
  FREE_CANCELLATION_HOURS,
  MAX_EXTRA_GUESTS,
} from './domain/rules/booking-rules';
export type { BookingRuleContext, BookingValidationResult, BookingValidationError, BookingValidationWarning } from './domain/rules/booking-rules';

// Payment Rules
export { validatePayment, calculateFees, calculateRefund, calculateRefundAmount, canRefund, splitPayment } from './domain/rules/payment-rules';
export type { PaymentRuleContext, PaymentValidationResult, PaymentBreakdown } from './domain/rules/payment-rules';

// Cancellation Rules
export { canCancel, calculateCancellationFee, getCancellationPolicy } from './domain/rules/cancellation-rules';
export type { CancellationContext, CancellationResult, CancellationPolicy } from './domain/rules/cancellation-rules';

// Escrow Rules
export { 
  validateEscrowRelease, 
  canReleaseEscrow, 
  calculateEscrowSplit,
  ESCROW_RELEASE_DELAY_HOURS,
  ESCROW_AUTO_RELEASE_DAYS,
} from './domain/rules/escrow-rules';
export type { EscrowRuleContext, EscrowValidationResult, EscrowSplitResult } from './domain/rules/escrow-rules';

// Dispute Rules
export { 
  canOpenDispute, 
  validateDispute, 
  calculateDisputeResolution,
  DISPUTE_WINDOW_DAYS,
  MAX_DISPUTE_EVIDENCE_FILES,
} from './domain/rules/dispute-rules';
export type { DisputeContext, DisputeValidationResult, DisputeResolution } from './domain/rules/dispute-rules';

// ==================== DTOs ====================

export * from './domain/dtos';

// ==================== Events ====================

export { EventBus, eventBus, Subscribe } from './events/event-bus';
export type { EventHandler, EventFilter, Subscription, EventBusStats } from './events/event-bus';
export { TypedEvent, createTypedEvent } from './events/typed-events';
export type { TypedEventPayloads, TypedEventType } from './events/typed-events';
export { EventTypes, EVENT_CATEGORIES } from './events/event-types';

// ==================== Interfaces ====================

// Repository Interfaces
export type { 
  IRepository, 
  IReadOnlyRepository, 
  ISoftDeletableRepository, 
  IVersionedRepository,
  ITransactionalRepository,
  FindOptions,
  PaginationOptions,
  PaginatedResult,
  SearchCriteria,
  WriteOptions,
  OperationResult,
  RepositoryEvent,
} from './interfaces/repositories/base.repository';

export type { IUserRepository, UserFilter, UserCreateData, UserUpdateData } from './interfaces/repositories/user.repository';
export type { ICompanyRepository, CompanyFilter, CompanyCreateData, CompanyUpdateData, CompanyEmployeeData } from './interfaces/repositories/company.repository';
export type { IListingRepository, ListingFilter, ListingCreateData, ListingUpdateData, ListingSearchOptions, ListingAvailabilityData } from './interfaces/repositories/listing.repository';
export type { IBookingRepository, BookingFilter, BookingCreateData, BookingUpdateData } from './interfaces/repositories/booking.repository';
export type { IReviewRepository, ReviewFilter, ReviewCreateData, ReviewUpdateData, ReviewStats } from './interfaces/repositories/review.repository';
export type { IPaymentRepository, PaymentFilter, PaymentCreateData, PaymentUpdateData } from './interfaces/repositories/payment.repository';
export type { IEscrowRepository, EscrowFilter, EscrowCreateData, EscrowUpdateData, DisputeData, EscrowStats, EscrowTimelineEntry } from './interfaces/repositories/escrow.repository';
export type { INotificationRepository, NotificationFilter, NotificationCreateData } from './interfaces/repositories/notification.repository';
export type { IAuditRepository, AuditLogFilter, AuditLogCreateData } from './interfaces/repositories/audit.repository';

// Provider Interfaces
export type { 
  IPaymentGatewayProvider, 
  PaymentGatewayConfig, 
  PaymentGatewayResponse,
  PaymentGatewayRefundResponse 
} from './interfaces/providers/payment-gateway.provider';

export type { 
  IStorageProvider, 
  StorageConfig, 
  StorageUploadOptions, 
  StorageFile,
  StorageUploadResult 
} from './interfaces/providers/storage.provider';

export type { 
  INotificationProvider, 
  NotificationProviderConfig, 
  EmailOptions,
  SMSOptions,
  PushOptions,
  NotificationResult 
} from './interfaces/providers/notification.provider';

export type { 
  ISearchProvider, 
  SearchConfig, 
  SearchOptions, 
  SearchResult,
  IndexDocument 
} from './interfaces/providers/search.provider';

export type { 
  IAIProvider, 
  AIConfig, 
  AIChatMessage, 
  AIChatResponse,
  AIEmbeddingResponse,
  AIImageAnalysisResponse 
} from './interfaces/providers/ai.provider';

// Service Interfaces
export type { 
  IAuthService, 
  AuthCredentials, 
  AuthResult, 
  AuthSession,
  AuthToken 
} from './interfaces/services/auth.service';

export type { 
  IAuthorizationService, 
  AuthorizationContext, 
  AuthorizationResult,
  ResourceContext 
} from './interfaces/services/authorization.service';

export type { 
  ITransactionService, 
  TransactionOptions, 
  TransactionContext,
  TransactionResult 
} from './interfaces/services/transaction.service';

export type { 
  IConcurrencyService, 
  LockOptions, 
  LockResult,
  ConcurrencyConfig 
} from './interfaces/services/concurrency.service';

export type { 
  IAuditService, 
  AuditOptions, 
  AuditContext,
  AuditQuery 
} from './interfaces/services/audit.service';
