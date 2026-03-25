/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events Module Index
 * 
 * @module core/events
 */

// Event Bus
export { EventBus, eventBus, Subscribe } from './event-bus';
export type { EventHandler, EventFilter, Subscription, EventBusStats } from './event-bus';

// Event Types
export { EVENT_TYPES, EVENT_PATTERNS } from './event-types';
export type { EventType, EventCategory } from './event-types';
export { getEventsByCategory, isValidEventType, getEventCategory } from './event-types';

// Typed Events
export type {
  BaseEvent,
  // User Events
  UserRegisteredEvent,
  UserLoginEvent,
  UserUpdatedEvent,
  UserVerifiedEvent,
  // Company Events
  CompanyRegisteredEvent,
  CompanyVerifiedEvent,
  // Listing Events
  ListingCreatedEvent,
  ListingPublishedEvent,
  // Booking Events
  BookingCreatedEvent,
  BookingConfirmedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  // Payment Events
  PaymentInitiatedEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
  // Escrow Events
  EscrowCreatedEvent,
  EscrowFundedEvent,
  EscrowReleasedEvent,
  EscrowDisputedEvent,
  // Review Events
  ReviewCreatedEvent,
  // Notification Events
  NotificationSentEvent,
  // Dispute Events
  DisputeOpenedEvent,
  DisputeResolvedEvent,
  // Loyalty Events
  LoyaltyPointsEarnedEvent,
  // System Events
  SystemErrorEvent,
  // Union Type
  AppEvent,
} from './typed-events';

export {
  createEvent,
  createUserRegisteredEvent,
  createBookingCreatedEvent,
  createPaymentCompletedEvent,
} from './typed-events';
