/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Entity - كيان الدفعة
 * 
 * يمثل دفعة مالية في النظام.
 * يدعم Result Pattern للعمليات الآمنة.
 * 
 * @module core/domain/entities/Payment
 */

import { AggregateRoot, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Money, Currency } from '../value-objects/Money';
import type { Result, ValidationError, BusinessError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isNumber, isObject } from '../../types/guards';

// ==================== Types ====================

/**
 * حالة الدفعة
 */
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially_refunded';

/**
 * طريقة الدفع
 */
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'cash' | 'check';

/**
 * نوع الدفعة
 */
export type PaymentType = 'booking' | 'deposit' | 'refund' | 'fee' | 'payout' | 'adjustment';

/**
 * معلومات البطاقة
 */
export interface CardInfo {
  last4: string;
  brand: string; // visa, mastercard, etc.
  expiryMonth: number;
  expiryYear: number;
  holderName?: string;
}

/**
 * معلومات الحساب البنكي
 */
export interface BankAccountInfo {
  bankName: string;
  accountLast4: string;
  accountHolder: string;
  routingNumber?: string;
}

/**
 * استجابة البوابة
 */
export interface GatewayResponse {
  transactionId: string;
  status: string;
  message?: string;
  code?: string;
  raw?: Record<string, unknown>;
  processedAt: Date;
}

/**
 * خصائص الدفعة
 */
export interface PaymentProps {
  id: UniqueEntityId | string;
  
  // المراجع
  bookingId: string;
  userId: string;
  
  // المبلغ
  amount: Money;
  currency: Currency;
  type: PaymentType;
  
  // الطريقة
  method: PaymentMethod | null;
  cardInfo: CardInfo | null;
  bankInfo: BankAccountInfo | null;
  
  // الحالة
  status: PaymentStatus;
  
  // البوابة
  gatewayName: string | null;
  gatewayTransactionId: string | null;
  gatewayResponse: GatewayResponse | null;
  
  // الاسترداد
  refundedAmount: Money;
  refundReason: string | null;
  refundedAt: Date | null;
  
  // الفشل
  failureReason: string | null;
  failureCode: string | null;
  failedAt: Date | null;
  
  // البيانات الوصفية
  metadata: Record<string, unknown> | null;
  idempotencyKey: string | null;
  
  // التواريخ
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // الإصدار
  version: number;
}

/**
 * إحصائيات الدفعة
 */
export interface PaymentStats {
  totalAmount: Money;
  refundedAmount: Money;
  netAmount: Money;
  processingFee: Money;
}

// ==================== Payment Errors ====================

export class PaymentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaymentError';
  }

  static invalidAmount(amount: number): PaymentError {
    return new PaymentError('INVALID_AMOUNT', `Invalid payment amount: ${amount}`, { amount });
  }

  static alreadyProcessed(): PaymentError {
    return new PaymentError('ALREADY_PROCESSED', 'Payment has already been processed');
  }

  static alreadyRefunded(): PaymentError {
    return new PaymentError('ALREADY_REFUNDED', 'Payment has already been refunded');
  }

  static cannotRefund(): PaymentError {
    return new PaymentError('CANNOT_REFUND', 'Payment cannot be refunded in current state');
  }

  static refundExceedsAmount(): PaymentError {
    return new PaymentError('REFUND_EXCEEDS', 'Refund amount exceeds payment amount');
  }

  static paymentFailed(reason: string): PaymentError {
    return new PaymentError('PAYMENT_FAILED', `Payment failed: ${reason}`, { reason });
  }
}

// ==================== Payment Entity ====================

export class Payment extends AggregateRoot<PaymentProps> {
  
  // ==================== Getters ====================
  
  get bookingId(): string {
    return this.props.bookingId;
  }
  
  get userId(): string {
    return this.props.userId;
  }
  
  get amount(): Money {
    return this.props.amount;
  }
  
  get currency(): Currency {
    return this.props.currency;
  }
  
  get status(): PaymentStatus {
    return this.props.status;
  }
  
  get method(): PaymentMethod | null {
    return this.props.method;
  }
  
  get isCompleted(): boolean {
    return this.props.status === 'completed';
  }
  
  get isFailed(): boolean {
    return this.props.status === 'failed';
  }
  
  get isRefunded(): boolean {
    return ['refunded', 'partially_refunded'].includes(this.props.status);
  }
  
  get canBeRefunded(): boolean {
    return this.props.status === 'completed' || 
           this.props.status === 'partially_refunded';
  }
  
  get refundedAmount(): Money {
    return this.props.refundedAmount;
  }
  
  // ==================== Business Methods ====================
  
  /**
   * تحديد طريقة الدفع
   */
  setPaymentMethod(method: PaymentMethod, details?: { card?: CardInfo; bank?: BankAccountInfo }): void {
    this.props.method = method;
    if (details?.card) this.props.cardInfo = details.card;
    if (details?.bank) this.props.bankInfo = details.bank;
    this.incrementVersion();
  }
  
  /**
   * بدء المعالجة
   */
  startProcessing(): Result<void, PaymentError> {
    if (this.props.status !== 'pending') {
      return err(PaymentError.alreadyProcessed());
    }
    
    this.props.status = 'processing';
    this.incrementVersion();
    this.raiseEvent('payment.processing_started', { paymentId: this.idValue });
    
    return ok(undefined);
  }
  
  /**
   * إكمال الدفع
   */
  complete(gatewayResponse: GatewayResponse): Result<void, PaymentError> {
    if (this.props.status !== 'processing' && this.props.status !== 'pending') {
      return err(PaymentError.alreadyProcessed());
    }
    
    this.props.status = 'completed';
    this.props.gatewayResponse = gatewayResponse;
    this.props.gatewayTransactionId = gatewayResponse.transactionId;
    this.props.processedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('payment.completed', { 
      paymentId: this.idValue,
      amount: this.props.amount.amount,
      currency: this.props.currency,
    });
    
    return ok(undefined);
  }
  
  /**
   * تسجيل الفشل
   */
  fail(reason: string, code?: string): Result<void, PaymentError> {
    if (this.props.status === 'completed') {
      return err(PaymentError.alreadyProcessed());
    }
    
    this.props.status = 'failed';
    this.props.failureReason = reason;
    this.props.failureCode = code || null;
    this.props.failedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('payment.failed', { paymentId: this.idValue, reason });
    
    return ok(undefined);
  }
  
  /**
   * إلغاء الدفع
   */
  cancel(reason?: string): Result<void, PaymentError> {
    if (!['pending', 'processing'].includes(this.props.status)) {
      return err(new PaymentError('CANNOT_CANCEL', 'Payment cannot be cancelled in current state'));
    }
    
    this.props.status = 'cancelled';
    this.props.failureReason = reason || 'Cancelled by user';
    this.props.failedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('payment.cancelled', { paymentId: this.idValue, reason });
    
    return ok(undefined);
  }
  
  /**
   * استرداد المبلغ (كلي أو جزئي)
   */
  refund(amount?: Money, reason?: string): Result<void, PaymentError | ValidationError> {
    if (!this.canBeRefunded) {
      return err(PaymentError.cannotRefund());
    }
    
    const refundAmount = amount || this.props.amount.subtract(this.props.refundedAmount).value;
    
    // التحقق من أن المبلغ المسترد لا يتجاوز المبلغ المتبقي
    const remaining = this.props.amount.subtract(this.props.refundedAmount);
    if (!remaining.isSuccess) {
      return err(new ValidationError('Unable to calculate remaining amount', 'amount'));
    }
    
    const compare = refundAmount.compare(remaining.value);
    if (compare === 'greater') {
      return err(PaymentError.refundExceedsAmount());
    }
    
    // تحديث المبلغ المسترد
    const newRefunded = this.props.refundedAmount.add(refundAmount);
    if (!newRefunded.isSuccess) {
      return err(new ValidationError('Unable to add refund amount', 'refundedAmount'));
    }
    this.props.refundedAmount = newRefunded.value;
    this.props.refundReason = reason || null;
    
    // تحديث الحالة
    const totalRefunded = this.props.refundedAmount.compare(this.props.amount);
    if (totalRefunded === 'equal') {
      this.props.status = 'refunded';
    } else {
      this.props.status = 'partially_refunded';
    }
    
    this.props.refundedAt = new Date();
    this.incrementVersion();
    this.raiseEvent('payment.refunded', { 
      paymentId: this.idValue,
      refundAmount: refundAmount.amount,
      totalRefunded: this.props.refundedAmount.amount,
    });
    
    return ok(undefined);
  }
  
  /**
   * إعادة المحاولة
   */
  retry(): Result<void, PaymentError> {
    if (this.props.status !== 'failed') {
      return err(new PaymentError('CANNOT_RETRY', 'Only failed payments can be retried'));
    }
    
    this.props.status = 'pending';
    this.props.failureReason = null;
    this.props.failureCode = null;
    this.props.failedAt = null;
    this.incrementVersion();
    
    return ok(undefined);
  }
  
  /**
   * تحديث البيانات الوصفية
   */
  setMetadata(key: string, value: unknown): void {
    if (!this.props.metadata) {
      this.props.metadata = {};
    }
    this.props.metadata[key] = value;
    this.touch();
  }
  
  /**
   * الحصول على إحصائيات الدفعة
   */
  getStats(): PaymentStats {
    const netAmount = this.props.amount.subtract(this.props.refundedAmount);
    
    return {
      totalAmount: this.props.amount,
      refundedAmount: this.props.refundedAmount,
      netAmount: netAmount.isSuccess ? netAmount.value : this.props.amount,
      processingFee: Money.zero(this.props.currency), // يمكن حسابها لاحقاً
    };
  }
  
  /**
   * التحقق من أن الدفعة ناجحة
   */
  isSuccessful(): boolean {
    return this.props.status === 'completed' || 
           this.props.status === 'partially_refunded';
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء دفعة جديدة
   */
  static create(props: Omit<PaymentProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'gatewayTransactionId' | 'gatewayResponse' | 'refundedAmount' | 'refundReason' | 'refundedAt' | 'failureReason' | 'failureCode' | 'failedAt' | 'processedAt'> & { id?: string }): Result<Payment, ValidationError | PaymentError> {
    // التحقق من المبلغ
    if (props.amount.isNegative || props.amount.isZero) {
      return err(PaymentError.invalidAmount(props.amount.amount));
    }
    
    // التحقق من المراجع
    if (!props.bookingId) {
      return err(new ValidationError('Booking ID is required', 'bookingId'));
    }
    if (!props.userId) {
      return err(new ValidationError('User ID is required', 'userId'));
    }
    
    const now = new Date();
    
    const payment = new Payment({
      ...props,
      id: props.id || new UniqueEntityId(),
      gatewayTransactionId: null,
      gatewayResponse: null,
      refundedAmount: Money.zero(props.currency),
      refundReason: null,
      refundedAt: null,
      failureReason: null,
      failureCode: null,
      failedAt: null,
      processedAt: null,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
    
    payment.raiseEvent('payment.created', { 
      paymentId: payment.idValue,
      amount: props.amount.amount,
      currency: props.currency,
    });
    
    return ok(payment);
  }
  
  /**
   * إنشاء دفعة حجز
   */
  static createBookingPayment(
    bookingId: string,
    userId: string,
    amount: Money,
    idempotencyKey?: string
  ): Result<Payment, ValidationError | PaymentError> {
    return Payment.create({
      bookingId,
      userId,
      amount,
      currency: amount.currency,
      type: 'booking',
      method: null,
      cardInfo: null,
      bankInfo: null,
      status: 'pending',
      gatewayName: null,
      metadata: null,
      idempotencyKey: idempotencyKey || null,
    });
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: PaymentProps): Payment {
    return new Payment(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      bookingId: this.props.bookingId,
      userId: this.props.userId,
      amount: this.props.amount.toJSON(),
      currency: this.props.currency,
      type: this.props.type,
      method: this.props.method,
      cardInfo: this.props.cardInfo,
      bankInfo: this.props.bankInfo,
      status: this.props.status,
      gatewayName: this.props.gatewayName,
      gatewayTransactionId: this.props.gatewayTransactionId,
      refundedAmount: this.props.refundedAmount.toJSON(),
      refundReason: this.props.refundReason,
      refundedAt: this.props.refundedAt?.toISOString() || null,
      failureReason: this.props.failureReason,
      failureCode: this.props.failureCode,
      failedAt: this.props.failedAt?.toISOString() || null,
      processedAt: this.props.processedAt?.toISOString() || null,
      metadata: this.props.metadata,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      version: this.version,
    };
  }
}
