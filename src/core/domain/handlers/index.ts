/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain Event Handlers - معالجات أحداث النطاق
 * 
 * @module core/domain/handlers
 */

import type { DomainEvent, DomainEventHandler } from '../events/typed-events';

// ==================== Booking Event Handlers ====================

/**
 * حدث تأكيد الحجز
 */
export interface BookingConfirmedEvent extends DomainEvent {
  type: 'booking.confirmed';
  payload: {
    bookingId: string;
    listingId: string;
    guestId: string;
    hostId: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    currency: string;
  };
}

/**
 * حدث إلغاء الحجز
 */
export interface BookingCancelledEvent extends DomainEvent {
  type: 'booking.cancelled';
  payload: {
    bookingId: string;
    listingId: string;
    guestId: string;
    hostId: string;
    cancelledBy: string;
    reason?: string;
    refundAmount?: number;
    refundPercentage?: number;
  };
}

/**
 * حدث اكتمال الحجز
 */
export interface BookingCompletedEvent extends DomainEvent {
  type: 'booking.completed';
  payload: {
    bookingId: string;
    listingId: string;
    guestId: string;
    hostId: string;
    actualCheckIn?: Date;
    actualCheckOut?: Date;
    totalPrice: number;
  };
}

/**
 * معالج حدث تأكيد الحجز
 */
export class BookingConfirmedEventHandler implements DomainEventHandler<BookingConfirmedEvent> {
  async handle(event: BookingConfirmedEvent): Promise<void> {
    const { bookingId, listingId, guestId, hostId, totalPrice, currency } = event.payload;

    // 1. إنشاء سجل Escrow
    console.log(`[BookingConfirmedHandler] Creating escrow for booking ${bookingId}`);
    
    // 2. إرسال إشعارات
    console.log(`[BookingConfirmedHandler] Sending notifications to guest ${guestId} and host ${hostId}`);
    
    // 3. تحديث إحصائيات
    console.log(`[BookingConfirmedHandler] Updating booking stats for listing ${listingId}`);
    
    // 4. حجز التواريخ
    console.log(`[BookingConfirmedHandler] Blocking dates for listing ${listingId}`);
  }
}

/**
 * معالج حدث إلغاء الحجز
 */
export class BookingCancelledEventHandler implements DomainEventHandler<BookingCancelledEvent> {
  async handle(event: BookingCancelledEvent): Promise<void> {
    const { bookingId, listingId, guestId, hostId, cancelledBy, refundAmount } = event.payload;

    // 1. تحديث حالة Escrow
    console.log(`[BookingCancelledHandler] Updating escrow status for booking ${bookingId}`);
    
    // 2. معالجة الاسترداد
    if (refundAmount && refundAmount > 0) {
      console.log(`[BookingCancelledHandler] Processing refund of ${refundAmount}`);
    }
    
    // 3. تحرير التواريخ
    console.log(`[BookingCancelledHandler] Releasing dates for listing ${listingId}`);
    
    // 4. إرسال إشعارات
    console.log(`[BookingCancelledHandler] Sending cancellation notifications`);
  }
}

/**
 * معالج حدث اكتمال الحجز
 */
export class BookingCompletedEventHandler implements DomainEventHandler<BookingCompletedEvent> {
  async handle(event: BookingCompletedEvent): Promise<void> {
    const { bookingId, listingId, guestId, hostId, totalPrice } = event.payload;

    // 1. إصدار Escrow للمضيف
    console.log(`[BookingCompletedHandler] Releasing escrow to host ${hostId}`);
    
    // 2. تحديث إحصائيات المضيف
    console.log(`[BookingCompletedHandler] Updating host stats`);
    
    // 3. تحديث إحصائيات الضيف
    console.log(`[BookingCompletedHandler] Updating guest stats`);
    
    // 4. إرسال طلب التقييم
    console.log(`[BookingCompletedHandler] Sending review request to guest ${guestId}`);
  }
}

// ==================== Payment Event Handlers ====================

/**
 * حدث نجاح الدفع
 */
export interface PaymentSuccessEvent extends DomainEvent {
  type: 'payment.success';
  payload: {
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    transactionId: string;
    paymentMethod: string;
  };
}

/**
 * حدث فشل الدفع
 */
export interface PaymentFailedEvent extends DomainEvent {
  type: 'payment.failed';
  payload: {
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    reason: string;
    retryCount: number;
  };
}

/**
 * حدث معالجة الاسترداد
 */
export interface RefundProcessedEvent extends DomainEvent {
  type: 'refund.processed';
  payload: {
    refundId: string;
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    reason?: string;
  };
}

/**
 * معالج حدث نجاح الدفع
 */
export class PaymentSuccessEventHandler implements DomainEventHandler<PaymentSuccessEvent> {
  async handle(event: PaymentSuccessEvent): Promise<void> {
    const { paymentId, bookingId, userId, amount, currency } = event.payload;

    // 1. تحديث حالة الحجز
    console.log(`[PaymentSuccessHandler] Updating booking ${bookingId} payment status`);
    
    // 2. إنشاء Escrow
    console.log(`[PaymentSuccessHandler] Creating escrow for payment ${paymentId}`);
    
    // 3. إرسال إشعار للمستخدم
    console.log(`[PaymentSuccessHandler] Sending payment confirmation to user ${userId}`);
    
    // 4. إرسال إشعار للمضيف
    console.log(`[PaymentSuccessHandler] Notifying host about payment`);
  }
}

/**
 * معالج حدث فشل الدفع
 */
export class PaymentFailedEventHandler implements DomainEventHandler<PaymentFailedEvent> {
  async handle(event: PaymentFailedEvent): Promise<void> {
    const { paymentId, bookingId, userId, reason, retryCount } = event.payload;

    // 1. تحديث حالة الدفع
    console.log(`[PaymentFailedHandler] Marking payment ${paymentId} as failed`);
    
    // 2. إرسال إشعار للمستخدم
    console.log(`[PaymentFailedHandler] Notifying user ${userId} about failed payment`);
    
    // 3. إذا تجاوز عدد المحاولات الحد، إلغاء الحجز
    if (retryCount >= 3) {
      console.log(`[PaymentFailedHandler] Max retries reached, cancelling booking ${bookingId}`);
    }
  }
}

/**
 * معالج حدث الاسترداد
 */
export class RefundProcessedEventHandler implements DomainEventHandler<RefundProcessedEvent> {
  async handle(event: RefundProcessedEvent): Promise<void> {
    const { refundId, paymentId, bookingId, userId, amount, currency } = event.payload;

    // 1. تحديث حالة الدفع
    console.log(`[RefundProcessedHandler] Updating payment ${paymentId} refund status`);
    
    // 2. تحديث حالة Escrow
    console.log(`[RefundProcessedHandler] Updating escrow for booking ${bookingId}`);
    
    // 3. إرسال إشعار للمستخدم
    console.log(`[RefundProcessedHandler] Sending refund confirmation to user ${userId}`);
  }
}

// ==================== Review Event Handlers ====================

/**
 * حدث إنشاء التقييم
 */
export interface ReviewCreatedEvent extends DomainEvent {
  type: 'review.created';
  payload: {
    reviewId: string;
    bookingId: string;
    listingId: string;
    reviewerId: string;
    revieweeId: string;
    ratingOverall: number;
    hasComment: boolean;
  };
}

/**
 * حدث الرد على التقييم
 */
export interface ReviewRespondedEvent extends DomainEvent {
  type: 'review.responded';
  payload: {
    reviewId: string;
    listingId: string;
    responderId: string;
    revieweeId: string;
    responseLength: number;
  };
}

/**
 * معالج حدث إنشاء التقييم
 */
export class ReviewCreatedEventHandler implements DomainEventHandler<ReviewCreatedEvent> {
  async handle(event: ReviewCreatedEvent): Promise<void> {
    const { reviewId, listingId, reviewerId, revieweeId, ratingOverall } = event.payload;

    // 1. تحديث متوسط تقييم الإعلان
    console.log(`[ReviewCreatedHandler] Updating listing ${listingId} rating average`);
    
    // 2. تحديث متوسط تقييم المضيف
    console.log(`[ReviewCreatedHandler] Updating host ${revieweeId} rating average`);
    
    // 3. إرسال إشعار للمقيم
    console.log(`[ReviewCreatedHandler] Notifying ${revieweeId} about new review`);
    
    // 4. إذا كان التقييم منخفض، تنبيه المضيف
    if (ratingOverall < 3) {
      console.log(`[ReviewCreatedHandler] Low rating alert for listing ${listingId}`);
    }
  }
}

/**
 * معالج حدث الرد على التقييم
 */
export class ReviewRespondedEventHandler implements DomainEventHandler<ReviewRespondedEvent> {
  async handle(event: ReviewRespondedEvent): Promise<void> {
    const { reviewId, listingId, responderId, revieweeId } = event.payload;

    // 1. إرسال إشعار للمقيم الأصلي
    console.log(`[ReviewRespondedHandler] Notifying reviewer about response`);
    
    // 2. تحديث حالة التقييم
    console.log(`[ReviewRespondedHandler] Updating review ${reviewId} response status`);
  }
}

// ==================== User Event Handlers ====================

/**
 * حدث تسجيل مستخدم جديد
 */
export interface UserRegisteredEvent extends DomainEvent {
  type: 'user.registered';
  payload: {
    userId: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: string;
    referralCode?: string;
  };
}

/**
 * حدث تحقق المستخدم
 */
export interface UserVerifiedEvent extends DomainEvent {
  type: 'user.verified';
  payload: {
    userId: string;
    verificationType: 'email' | 'phone';
    verifiedAt: Date;
  };
}

/**
 * حدث ترقية المستخدم لمضيف
 */
export interface UserBecameHostEvent extends DomainEvent {
  type: 'user.became_host';
  payload: {
    userId: string;
    previousRole: string;
    becameHostAt: Date;
  };
}

/**
 * معالج حدث تسجيل مستخدم جديد
 */
export class UserRegisteredEventHandler implements DomainEventHandler<UserRegisteredEvent> {
  async handle(event: UserRegisteredEvent): Promise<void> {
    const { userId, email, phone, firstName, lastName, referralCode } = event.payload;

    // 1. إرسال بريد ترحيب
    if (email) {
      console.log(`[UserRegisteredHandler] Sending welcome email to ${email}`);
    }
    
    // 2. إرسال رسالة تحقق
    if (phone) {
      console.log(`[UserRegisteredHandler] Sending verification SMS to ${phone}`);
    }
    
    // 3. معالجة كود الإحالة
    if (referralCode) {
      console.log(`[UserRegisteredHandler] Processing referral code ${referralCode}`);
    }
    
    // 4. تسجيل النشاط
    console.log(`[UserRegisteredHandler] Logging user registration for ${userId}`);
  }
}

/**
 * معالج حدث تحقق المستخدم
 */
export class UserVerifiedEventHandler implements DomainEventHandler<UserVerifiedEvent> {
  async handle(event: UserVerifiedEvent): Promise<void> {
    const { userId, verificationType } = event.payload;

    // 1. تحديث حالة المستخدم
    console.log(`[UserVerifiedHandler] Updating user ${userId} verification status`);
    
    // 2. إضافة نقاط ولاء
    console.log(`[UserVerifiedHandler] Adding loyalty points for verification`);
    
    // 3. إرسال إشعار
    console.log(`[UserVerifiedHandler] Sending verification confirmation`);
  }
}

/**
 * معالج حدث ترقية المستخدم لمضيف
 */
export class UserBecameHostEventHandler implements DomainEventHandler<UserBecameHostEvent> {
  async handle(event: UserBecameHostEvent): Promise<void> {
    const { userId, previousRole } = event.payload;

    // 1. إرسال دليل المضيف
    console.log(`[UserBecameHostHandler] Sending host guide to user ${userId}`);
    
    // 2. إعداد الإحصائيات
    console.log(`[UserBecameHostHandler] Initializing host stats for ${userId}`);
    
    // 3. إشعار فريق الدعم
    console.log(`[UserBecameHostHandler] Notifying support team about new host`);
  }
}

// ==================== Listing Event Handlers ====================

/**
 * حدث نشر الإعلان
 */
export interface ListingPublishedEvent extends DomainEvent {
  type: 'listing.published';
  payload: {
    listingId: string;
    hostId: string;
    title: string;
    city: string;
    country: string;
    price: number;
    currency: string;
  };
}

/**
 * حدث تعليق الإعلان
 */
export interface ListingArchivedEvent extends DomainEvent {
  type: 'listing.archived';
  payload: {
    listingId: string;
    hostId: string;
    reason?: string;
    activeBookingsCount: number;
  };
}

/**
 * معالج حدث نشر الإعلان
 */
export class ListingPublishedEventHandler implements DomainEventHandler<ListingPublishedEvent> {
  async handle(event: ListingPublishedEvent): Promise<void> {
    const { listingId, hostId, title, city, country } = event.payload;

    // 1. إضافة للفهرس البحثي
    console.log(`[ListingPublishedHandler] Indexing listing ${listingId} for search`);
    
    // 2. إرسال إشعار للمضيف
    console.log(`[ListingPublishedHandler] Sending confirmation to host ${hostId}`);
    
    // 3. الترويج (إذا كان جديداً)
    console.log(`[ListingPublishedHandler] Promoting new listing in ${city}, ${country}`);
    
    // 4. تحديث إحصائيات المضيف
    console.log(`[ListingPublishedHandler] Updating host listing count`);
  }
}

/**
 * معالج حدث تعليق الإعلان
 */
export class ListingArchivedEventHandler implements DomainEventHandler<ListingArchivedEvent> {
  async handle(event: ListingArchivedEvent): Promise<void> {
    const { listingId, hostId, activeBookingsCount } = event.payload;

    // 1. إزالة من الفهرس البحثي
    console.log(`[ListingArchivedHandler] Removing listing ${listingId} from search index`);
    
    // 2. التعامل مع الحجوزات النشطة
    if (activeBookingsCount > 0) {
      console.log(`[ListingArchivedHandler] Handling ${activeBookingsCount} active bookings`);
    }
    
    // 3. إرسال إشعار للمضيف
    console.log(`[ListingArchivedHandler] Notifying host ${hostId} about archival`);
  }
}

// ==================== Escrow Event Handlers ====================

/**
 * حدث إصدار الضمان
 */
export interface EscrowReleasedEvent extends DomainEvent {
  type: 'escrow.released';
  payload: {
    escrowId: string;
    bookingId: string;
    hostId: string;
    amount: number;
    currency: string;
    releasedTo: 'host' | 'guest' | 'split';
  };
}

/**
 * حدث فتح نزاع
 */
export interface DisputeOpenedEvent extends DomainEvent {
  type: 'dispute.opened';
  payload: {
    disputeId: string;
    escrowId: string;
    bookingId: string;
    openedBy: string;
    reason: string;
    amount: number;
    currency: string;
  };
}

/**
 * معالج حدث إصدار الضمان
 */
export class EscrowReleasedEventHandler implements DomainEventHandler<EscrowReleasedEvent> {
  async handle(event: EscrowReleasedEvent): Promise<void> {
    const { escrowId, bookingId, hostId, amount, currency, releasedTo } = event.payload;

    // 1. إنشاء معاملة payout
    console.log(`[EscrowReleasedHandler] Creating payout for ${releasedTo}`);
    
    // 2. إرسال إشعار
    console.log(`[EscrowReleasedHandler] Sending payout notification for ${amount} ${currency}`);
    
    // 3. تحديث الإحصائيات المالية
    console.log(`[EscrowReleasedHandler] Updating financial stats for booking ${bookingId}`);
  }
}

/**
 * معالج حدث فتح نزاع
 */
export class DisputeOpenedEventHandler implements DomainEventHandler<DisputeOpenedEvent> {
  async handle(event: DisputeOpenedEvent): Promise<void> {
    const { disputeId, escrowId, bookingId, openedBy, reason } = event.payload;

    // 1. إشعار فريق الدعم
    console.log(`[DisputeOpenedHandler] Alerting support team about dispute ${disputeId}`);
    
    // 2. تجميد الضمان
    console.log(`[DisputeOpenedHandler] Freezing escrow ${escrowId}`);
    
    // 3. إشعار الطرفين
    console.log(`[DisputeOpenedHandler] Notifying both parties about dispute`);
    
    // 4. إنشاء تذكرة دعم
    console.log(`[DisputeOpenedHandler] Creating support ticket for dispute`);
  }
}

// ==================== Notification Event Handlers ====================

/**
 * حدث إرسال إشعار
 */
export interface NotificationSentEvent extends DomainEvent {
  type: 'notification.sent';
  payload: {
    notificationId: string;
    userId: string;
    type: string;
    channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
    success: boolean;
    error?: string;
  };
}

/**
 * معالج حدث إرسال إشعار
 */
export class NotificationSentEventHandler implements DomainEventHandler<NotificationSentEvent> {
  async handle(event: NotificationSentEvent): Promise<void> {
    const { notificationId, userId, channel, success, error } = event.payload;

    // 1. تحديث حالة الإشعار
    console.log(`[NotificationSentHandler] Updating notification ${notificationId} status`);
    
    // 2. إذا فشل، إعادة المحاولة أو تسجيل الخطأ
    if (!success) {
      console.log(`[NotificationSentHandler] Notification failed via ${channel}: ${error}`);
    }
    
    // 3. تحديث إحصائيات القناة
    console.log(`[NotificationSentHandler] Updating ${channel} channel stats`);
  }
}

// ==================== Event Handler Registry ====================

/**
 * سجل معالجات الأحداث
 */
export class EventHandlerRegistry {
  private handlers: Map<string, DomainEventHandler<DomainEvent>[]> = new Map();

  /**
   * تسجيل معالج
   */
  register<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>
  ): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler as DomainEventHandler<DomainEvent>);
    this.handlers.set(eventType, existing);
  }

  /**
   * الحصول على المعالجات
   */
  getHandlers(eventType: string): DomainEventHandler<DomainEvent>[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * تنفيذ المعالجات
   */
  async dispatch<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.getHandlers(event.type);
    await Promise.all(handlers.map(handler => handler.handle(event)));
  }
}

// ==================== Initialize Registry ====================

/**
 * السجل الافتراضي
 */
export const eventHandlerRegistry = new EventHandlerRegistry();

// تسجيل جميع المعالجات
eventHandlerRegistry.register('booking.confirmed', new BookingConfirmedEventHandler());
eventHandlerRegistry.register('booking.cancelled', new BookingCancelledEventHandler());
eventHandlerRegistry.register('booking.completed', new BookingCompletedEventHandler());
eventHandlerRegistry.register('payment.success', new PaymentSuccessEventHandler());
eventHandlerRegistry.register('payment.failed', new PaymentFailedEventHandler());
eventHandlerRegistry.register('refund.processed', new RefundProcessedEventHandler());
eventHandlerRegistry.register('review.created', new ReviewCreatedEventHandler());
eventHandlerRegistry.register('review.responded', new ReviewRespondedEventHandler());
eventHandlerRegistry.register('user.registered', new UserRegisteredEventHandler());
eventHandlerRegistry.register('user.verified', new UserVerifiedEventHandler());
eventHandlerRegistry.register('user.became_host', new UserBecameHostEventHandler());
eventHandlerRegistry.register('listing.published', new ListingPublishedEventHandler());
eventHandlerRegistry.register('listing.archived', new ListingArchivedEventHandler());
eventHandlerRegistry.register('escrow.released', new EscrowReleasedEventHandler());
eventHandlerRegistry.register('dispute.opened', new DisputeOpenedEventHandler());
eventHandlerRegistry.register('notification.sent', new NotificationSentEventHandler());

// ==================== Export All ====================

export const EventHandlers = {
  // Booking
  BookingConfirmedEventHandler,
  BookingCancelledEventHandler,
  BookingCompletedEventHandler,
  
  // Payment
  PaymentSuccessEventHandler,
  PaymentFailedEventHandler,
  RefundProcessedEventHandler,
  
  // Review
  ReviewCreatedEventHandler,
  ReviewRespondedEventHandler,
  
  // User
  UserRegisteredEventHandler,
  UserVerifiedEventHandler,
  UserBecameHostEventHandler,
  
  // Listing
  ListingPublishedEventHandler,
  ListingArchivedEventHandler,
  
  // Escrow
  EscrowReleasedEventHandler,
  DisputeOpenedEventHandler,
  
  // Notification
  NotificationSentEventHandler,
};
