/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Gateway Provider Interface - واجهة مزود بوابة الدفع
 * 
 * @module core/interfaces/providers/payment-gateway.provider
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * طريقة الدفع
 */
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'cash';

/**
 * العملة
 */
export type Currency = 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';

/**
 * حالة الدفعة
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

/**
 * طلب إنشاء الدفعة
 */
export interface CreatePaymentRequest {
  amount: number;
  currency: Currency;
  description?: string;
  metadata?: Record<string, unknown>;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  idempotencyKey?: string;
}

/**
 * نتيجة إنشاء الدفعة
 */
export interface CreatePaymentResult {
  paymentId: string;
  externalId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  checkoutUrl?: string;
  clientSecret?: string;
  expiresAt?: Date;
}

/**
 * استعلام الدفعة
 */
export interface PaymentQuery {
  paymentId: string;
  externalId?: string;
}

/**
 * معلومات الدفعة
 */
export interface PaymentInfo {
  paymentId: string;
  externalId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  fee: number;
  feeCurrency: Currency;
  createdAt: Date;
  updatedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * طلب الاسترداد
 */
export interface RefundRequest {
  paymentId: string;
  externalId?: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * نتيجة الاسترداد
 */
export interface RefundResult {
  refundId: string;
  externalId: string;
  paymentId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processed' | 'failed';
  estimatedArrival?: Date;
}

/**
 * معلومات الاسترداد
 */
export interface RefundInfo {
  refundId: string;
  externalId: string;
  paymentId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processed' | 'failed';
  reason?: string;
  processedAt?: Date;
  failedAt?: Date;
}

/**
 * الحساب البنكي
 */
export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  currency: Currency;
  isVerified: boolean;
}

/**
 * طلب التحويل
 */
export interface TransferRequest {
  amount: number;
  currency: Currency;
  destination: string | BankAccount;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * نتيجة التحويل
 */
export interface TransferResult {
  transferId: string;
  externalId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedArrival?: Date;
}

/**
 * رصيد الحساب
 */
export interface AccountBalance {
  currency: Currency;
  available: number;
  pending: number;
  reserved: number;
}

/**
 * حدث الدفع
 */
export interface PaymentEvent {
  type: 'payment.created' | 'payment.completed' | 'payment.failed' | 'refund.created' | 'refund.processed' | 'transfer.completed';
  paymentId?: string;
  refundId?: string;
  transferId?: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
  signature: string;
  timestamp: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * معلومات المنصة
 */
export interface PlatformInfo {
  name: string;
  version: string;
  supportedCurrencies: Currency[];
  supportedMethods: PaymentMethod[];
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  features: {
    refunds: boolean;
    partialRefunds: boolean;
    transfers: boolean;
    recurring: boolean;
    installments: boolean;
  };
}

// ==================== Provider Interface ====================

/**
 * واجهة مزود بوابة الدفع
 */
export interface IPaymentGatewayProvider {
  // ==================== Payment ====================

  /**
   * إنشاء دفعة
   */
  createPayment(request: CreatePaymentRequest): Promise<Result<CreatePaymentResult, Error>>;

  /**
   * استعلام الدفعة
   */
  getPayment(query: PaymentQuery): Promise<Result<PaymentInfo, Error>>;

  /**
   * إلغاء الدفعة
   */
  cancelPayment(paymentId: string, reason?: string): Promise<Result<void, Error>>;

  /**
   * تأكيد الدفعة
   */
  confirmPayment(paymentId: string, confirmationData?: Record<string, unknown>): Promise<Result<PaymentInfo, Error>>;

  // ==================== Refund ====================

  /**
   * استرداد
   */
  refund(request: RefundRequest): Promise<Result<RefundResult, Error>>;

  /**
   * استعلام الاسترداد
   */
  getRefund(refundId: string): Promise<Result<RefundInfo, Error>>;

  // ==================== Transfer ====================

  /**
   * تحويل
   */
  transfer(request: TransferRequest): Promise<Result<TransferResult, Error>>;

  /**
   * استعلام التحويل
   */
  getTransfer(transferId: string): Promise<Result<TransferResult, Error>>;

  // ==================== Account ====================

  /**
   * رصيد الحساب
   */
  getBalance(currency?: Currency): Promise<Result<AccountBalance[], Error>>;

  // ==================== Customer ====================

  /**
   * إنشاء عميل
   */
  createCustomer(data: { email?: string; phone?: string; name?: string; metadata?: Record<string, unknown> }): Promise<Result<string, Error>>;

  /**
   * إضافة طريقة دفع للعميل
   */
  addPaymentMethod(customerId: string, paymentMethodData: Record<string, unknown>): Promise<Result<string, Error>>;

  /**
   * طرق دفع العميل
   */
  getPaymentMethods(customerId: string): Promise<Result<Array<{ id: string; type: string; last4?: string }>, Error>>;

  // ==================== Webhook ====================

  /**
   * معالجة Webhook
   */
  processWebhook(payload: WebhookPayload): Promise<Result<PaymentEvent, Error>>;

  /**
   * التحقق من توقيع Webhook
   */
  verifyWebhookSignature(payload: WebhookPayload): Promise<boolean>;

  // ==================== Platform ====================

  /**
   * معلومات المنصة
   */
  getPlatformInfo(): Promise<PlatformInfo>;

  /**
   * اختبار الاتصال
   */
  testConnection(): Promise<Result<boolean, Error>>;

  // ==================== Fee ====================

  /**
   * حساب الرسوم
   */
  calculateFee(amount: number, currency: Currency): Promise<{
    platformFee: number;
    gatewayFee: number;
    totalFee: number;
  }>;
}
