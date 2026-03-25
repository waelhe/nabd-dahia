/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Typed Events - أحداث موثقة الأنواع
 * 
 * تعريفات الأحداث مع أنواع TypeScript.
 * 
 * @module core/events/typed-events
 */

import { EVENT_TYPES } from './event-types';

// ==================== Base Event Interface ====================

export interface BaseEvent {
  eventId: string;
  eventType: string;
  occurredAt: Date;
  version: number;
}

// ==================== User Events ====================

export interface UserRegisteredEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.USER.REGISTERED;
  payload: {
    userId: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface UserLoginEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.USER.LOGIN;
  payload: {
    userId: string;
    loginMethod: 'email' | 'phone' | 'oauth';
    ipAddress: string;
    userAgent: string;
  };
}

export interface UserUpdatedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.USER.UPDATED;
  payload: {
    userId: string;
    changes: Record<string, { old: unknown; new: unknown }>;
    updatedBy: string;
  };
}

export interface UserVerifiedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.USER.VERIFIED;
  payload: {
    userId: string;
    verificationType: 'email' | 'phone' | 'identity';
  };
}

// ==================== Company Events ====================

export interface CompanyRegisteredEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.COMPANY.REGISTERED;
  payload: {
    companyId: string;
    userId: string;
    name: string;
    type: string;
    email: string;
  };
}

export interface CompanyVerifiedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.COMPANY.VERIFIED;
  payload: {
    companyId: string;
    verifiedBy: string;
    verifiedAt: Date;
  };
}

// ==================== Listing Events ====================

export interface ListingCreatedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.LISTING.CREATED;
  payload: {
    listingId: string;
    hostId: string;
    title: string;
    type: string;
    city: string;
    pricePerNight: number;
    currency: string;
  };
}

export interface ListingPublishedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.LISTING.PUBLISHED;
  payload: {
    listingId: string;
    hostId: string;
    publishedAt: Date;
  };
}

// ==================== Booking Events ====================

export interface BookingCreatedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.BOOKING.CREATED;
  payload: {
    bookingId: string;
    bookingNumber: string;
    guestId: string;
    hostId: string;
    listingId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalAmount: number;
    currency: string;
    isInstantBook: boolean;
  };
}

export interface BookingConfirmedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.BOOKING.CONFIRMED;
  payload: {
    bookingId: string;
    guestId: string;
    hostId: string;
    confirmedBy: 'host' | 'system';
    confirmedAt: Date;
  };
}

export interface BookingCancelledEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.BOOKING.CANCELLED;
  payload: {
    bookingId: string;
    guestId: string;
    hostId: string;
    cancelledBy: 'guest' | 'host' | 'admin' | 'system';
    reason: string;
    refundAmount: number;
    refundPercent: number;
  };
}

export interface BookingCompletedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.BOOKING.COMPLETED;
  payload: {
    bookingId: string;
    guestId: string;
    hostId: string;
    listingId: string;
    completedAt: Date;
    totalAmount: number;
    reviewEligible: boolean;
  };
}

// ==================== Payment Events ====================

export interface PaymentInitiatedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.PAYMENT.INITIATED;
  payload: {
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
  };
}

export interface PaymentCompletedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.PAYMENT.COMPLETED;
  payload: {
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    transactionId: string;
    escrowId?: string;
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.PAYMENT.FAILED;
  payload: {
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    errorCode: string;
    errorMessage: string;
  };
}

export interface PaymentRefundedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.PAYMENT.REFUNDED;
  payload: {
    paymentId: string;
    bookingId: string;
    userId: string;
    refundAmount: number;
    refundPercent: number;
    reason: string;
    refundedBy: string;
  };
}

// ==================== Escrow Events ====================

export interface EscrowCreatedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.ESCROW.CREATED;
  payload: {
    escrowId: string;
    bookingId: string;
    guestId: string;
    hostId: string;
    amount: number;
    currency: string;
  };
}

export interface EscrowFundedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.ESCROW.FUNDED;
  payload: {
    escrowId: string;
    bookingId: string;
    amount: number;
    fundedAt: Date;
  };
}

export interface EscrowReleasedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.ESCROW.RELEASED;
  payload: {
    escrowId: string;
    bookingId: string;
    hostId: string;
    amount: number;
    releasedBy: 'system' | 'admin' | 'guest';
    releasedAt: Date;
  };
}

export interface EscrowDisputedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.ESCROW.DISPUTED;
  payload: {
    escrowId: string;
    bookingId: string;
    disputeId: string;
    openedBy: string;
    reason: string;
  };
}

// ==================== Review Events ====================

export interface ReviewCreatedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.REVIEW.CREATED;
  payload: {
    reviewId: string;
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    listingId?: string;
    rating: number;
    hasText: boolean;
  };
}

// ==================== Notification Events ====================

export interface NotificationSentEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.NOTIFICATION.SENT;
  payload: {
    notificationId: string;
    userId: string;
    type: string;
    title: string;
    channels: ('in_app' | 'email' | 'sms' | 'push')[];
  };
}

// ==================== Dispute Events ====================

export interface DisputeOpenedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.DISPUTE.OPENED;
  payload: {
    disputeId: string;
    bookingId: string;
    escrowId: string;
    openedBy: string;
    againstUser: string;
    type: string;
    reason: string;
  };
}

export interface DisputeResolvedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.DISPUTE.RESOLVED;
  payload: {
    disputeId: string;
    bookingId: string;
    resolvedBy: string;
    resolution: 'favor_guest' | 'favor_host' | 'split';
    refundAmount: number;
    reason: string;
  };
}

// ==================== Loyalty Events ====================

export interface LoyaltyPointsEarnedEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.LOYALTY.POINTS_EARNED;
  payload: {
    userId: string;
    points: number;
    reason: string;
    sourceType: 'booking' | 'review' | 'referral' | 'bonus';
    sourceId?: string;
    newBalance: number;
    newLevel: string;
  };
}

// ==================== System Events ====================

export interface SystemErrorEvent extends BaseEvent {
  eventType: typeof EVENT_TYPES.SYSTEM.ERROR;
  payload: {
    errorId: string;
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
    userId?: string;
  };
}

// ==================== Event Union Type ====================

export type AppEvent =
  | UserRegisteredEvent
  | UserLoginEvent
  | UserUpdatedEvent
  | UserVerifiedEvent
  | CompanyRegisteredEvent
  | CompanyVerifiedEvent
  | ListingCreatedEvent
  | ListingPublishedEvent
  | BookingCreatedEvent
  | BookingConfirmedEvent
  | BookingCancelledEvent
  | BookingCompletedEvent
  | PaymentInitiatedEvent
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | PaymentRefundedEvent
  | EscrowCreatedEvent
  | EscrowFundedEvent
  | EscrowReleasedEvent
  | EscrowDisputedEvent
  | ReviewCreatedEvent
  | NotificationSentEvent
  | DisputeOpenedEvent
  | DisputeResolvedEvent
  | LoyaltyPointsEarnedEvent
  | SystemErrorEvent;

// ==================== Event Factory ====================

/**
 * إنشاء حدث جديد
 */
export function createEvent<T extends AppEvent>(
  eventType: T['eventType'],
  payload: T['payload']
): T {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    occurredAt: new Date(),
    version: 1,
    payload,
  } as T;
}

/**
 * إنشاء حدث مستخدم مسجل
 */
export function createUserRegisteredEvent(
  payload: UserRegisteredEvent['payload']
): UserRegisteredEvent {
  return createEvent(EVENT_TYPES.USER.REGISTERED, payload);
}

/**
 * إنشاء حدث حجز جديد
 */
export function createBookingCreatedEvent(
  payload: BookingCreatedEvent['payload']
): BookingCreatedEvent {
  return createEvent(EVENT_TYPES.BOOKING.CREATED, payload);
}

/**
 * إنشاء حدث دفع مكتمل
 */
export function createPaymentCompletedEvent(
  payload: PaymentCompletedEvent['payload']
): PaymentCompletedEvent {
  return createEvent(EVENT_TYPES.PAYMENT.COMPLETED, payload);
}
