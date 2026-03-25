/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Event Types - أنواع الأحداث
 * 
 * كل أنواع الأحداث في النظام منظمة حسب الوحدات.
 * 
 * @module core/events/event-types
 */

// ==================== Base Event Type ====================

export const EVENT_TYPES = {
  // ==================== User Events ====================
  USER: {
    REGISTERED: 'user.registered',
    LOGIN: 'user.login',
    LOGOUT: 'user.logout',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
    VERIFIED: 'user.verified',
    SUSPENDED: 'user.suspended',
    REACTIVATED: 'user.reactivated',
    PASSWORD_CHANGED: 'user.password_changed',
    PROFILE_COMPLETED: 'user.profile_completed',
    ROLE_CHANGED: 'user.role_changed',
  },

  // ==================== Company Events ====================
  COMPANY: {
    REGISTERED: 'company.registered',
    UPDATED: 'company.updated',
    VERIFIED: 'company.verified',
    SUSPENDED: 'company.suspended',
    DELETED: 'company.deleted',
    EMPLOYEE_ADDED: 'company.employee_added',
    EMPLOYEE_REMOVED: 'company.employee_removed',
  },

  // ==================== Listing Events ====================
  LISTING: {
    CREATED: 'listing.created',
    UPDATED: 'listing.updated',
    PUBLISHED: 'listing.published',
    UNPUBLISHED: 'listing.unpublished',
    DELETED: 'listing.deleted',
    VERIFIED: 'listing.verified',
    FEATURED: 'listing.featured',
    VIEWED: 'listing.viewed',
  },

  // ==================== Booking Events ====================
  BOOKING: {
    CREATED: 'booking.created',
    CONFIRMED: 'booking.confirmed',
    CANCELLED: 'booking.cancelled',
    COMPLETED: 'booking.completed',
    NO_SHOW: 'booking.no_show',
    MODIFIED: 'booking.modified',
    PAYMENT_REQUIRED: 'booking.payment_required',
    CHECKIN_TODAY: 'booking.checkin_today',
    CHECKOUT_TODAY: 'booking.checkout_today',
    REVIEW_REMINDER: 'booking.review_reminder',
  },

  // ==================== Payment Events ====================
  PAYMENT: {
    INITIATED: 'payment.initiated',
    PROCESSING: 'payment.processing',
    COMPLETED: 'payment.completed',
    FAILED: 'payment.failed',
    REFUNDED: 'payment.refunded',
    PARTIALLY_REFUNDED: 'payment.partially_refunded',
    REFUND_REQUESTED: 'payment.refund_requested',
  },

  // ==================== Escrow Events ====================
  ESCROW: {
    CREATED: 'escrow.created',
    FUNDED: 'escrow.funded',
    RELEASED: 'escrow.released',
    PARTIALLY_RELEASED: 'escrow.partially_released',
    DISPUTED: 'escrow.disputed',
    REFUNDED: 'escrow.refunded',
    EXPIRED: 'escrow.expired',
  },

  // ==================== Review Events ====================
  REVIEW: {
    CREATED: 'review.created',
    UPDATED: 'review.updated',
    REPLIED: 'review.replied',
    DELETED: 'review.deleted',
    FLAGGED: 'review.flagged',
    HELPFUL: 'review.helpful',
  },

  // ==================== Loyalty Events ====================
  LOYALTY: {
    POINTS_EARNED: 'loyalty.points_earned',
    POINTS_REDEEMED: 'loyalty.points_redeemed',
    LEVEL_UPGRADED: 'loyalty.level_upgraded',
    TIER_CHANGED: 'loyalty.tier_changed',
    BONUS_AWARDED: 'loyalty.bonus_awarded',
  },

  // ==================== Notification Events ====================
  NOTIFICATION: {
    SENT: 'notification.sent',
    READ: 'notification.read',
    DISMISSED: 'notification.dismissed',
    BULK_SENT: 'notification.bulk_sent',
    REMINDER_SCHEDULED: 'notification.reminder_scheduled',
  },

  // ==================== Message Events ====================
  MESSAGE: {
    SENT: 'message.sent',
    READ: 'message.read',
    TYPING: 'message.typing',
    DELIVERED: 'message.delivered',
  },

  // ==================== Dispute Events ====================
  DISPUTE: {
    OPENED: 'dispute.opened',
    ESCALATED: 'dispute.escalated',
    RESPONSE_ADDED: 'dispute.response_added',
    EVIDENCE_ADDED: 'dispute.evidence_added',
    RESOLVED: 'dispute.resolved',
    CLOSED: 'dispute.closed',
  },

  // ==================== Moderation Events ====================
  MODERATION: {
    REPORT_CREATED: 'moderation.report_created',
    REPORT_REVIEWED: 'moderation.report_reviewed',
    ACTION_TAKEN: 'moderation.action_taken',
    CONTENT_REMOVED: 'moderation.content_removed',
    USER_WARNED: 'moderation.user_warned',
    USER_BANNED: 'moderation.user_banned',
  },

  // ==================== Community Events ====================
  COMMUNITY: {
    POST_CREATED: 'community.post_created',
    POST_UPDATED: 'community.post_updated',
    POST_DELETED: 'community.post_deleted',
    COMMENT_ADDED: 'community.comment_added',
    LIKE_ADDED: 'community.like_added',
    FOLLOW_USER: 'community.follow_user',
  },

  // ==================== Marketplace Events ====================
  MARKETPLACE: {
    PRODUCT_CREATED: 'marketplace.product_created',
    PRODUCT_UPDATED: 'marketplace.product_updated',
    PRODUCT_DELETED: 'marketplace.product_deleted',
    ORDER_PLACED: 'marketplace.order_placed',
    ORDER_CANCELLED: 'marketplace.order_cancelled',
    ORDER_DELIVERED: 'marketplace.order_delivered',
  },

  // ==================== AI Events ====================
  AI: {
    QUERY_RECEIVED: 'ai.query_received',
    RESPONSE_GENERATED: 'ai.response_generated',
    FEEDBACK_RECEIVED: 'ai.feedback_received',
    MODEL_UPDATED: 'ai.model_updated',
  },

  // ==================== System Events ====================
  SYSTEM: {
    STARTUP: 'system.startup',
    SHUTDOWN: 'system.shutdown',
    ERROR: 'system.error',
    WARNING: 'system.warning',
    HEALTH_CHECK: 'system.health_check',
    CACHE_CLEARED: 'system.cache_cleared',
    SETTINGS_UPDATED: 'system.settings_updated',
  },

  // ==================== Audit Events ====================
  AUDIT: {
    LOG_CREATED: 'audit.log_created',
    ACTION_RECORDED: 'audit.action_recorded',
    ACCESS_DENIED: 'audit.access_denied',
    SENSITIVE_ACCESS: 'audit.sensitive_access',
  },
} as const;

// ==================== Event Type Type ====================

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES][keyof typeof EVENT_TYPES];

// =================--- Event Categories ====================

export type EventCategory = keyof typeof EVENT_TYPES;

/**
 * الحصول على أحداث فئة معينة
 */
export function getEventsByCategory(category: EventCategory): readonly string[] {
  return Object.values(EVENT_TYPES[category]);
}

/**
 * التحقق من وجود نوع الحدث
 */
export function isValidEventType(eventType: string): boolean {
  for (const category of Object.values(EVENT_TYPES)) {
    if (Object.values(category).includes(eventType as never)) {
      return true;
    }
  }
  return false;
}

/**
 * الحصول على فئة الحدث
 */
export function getEventCategory(eventType: string): EventCategory | null {
  for (const [category, events] of Object.entries(EVENT_TYPES)) {
    if (Object.values(events).includes(eventType as never)) {
      return category as EventCategory;
    }
  }
  return null;
}

// ==================== Event Patterns ====================

export const EVENT_PATTERNS = {
  ALL_USER_EVENTS: 'user.*',
  ALL_BOOKING_EVENTS: 'booking.*',
  ALL_PAYMENT_EVENTS: 'payment.*',
  ALL_ESCROW_EVENTS: 'escrow.*',
  ALL_NOTIFICATION_EVENTS: 'notification.*',
  ALL_MODERATION_EVENTS: 'moderation.*',
  ALL_SYSTEM_EVENTS: 'system.*',
} as const;
