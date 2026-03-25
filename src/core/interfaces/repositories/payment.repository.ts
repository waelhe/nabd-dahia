/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Repository Interface - واجهة مستودع المدفوعات
 * 
 * @module core/interfaces/repositories/payment.repository
 */

import type { Result } from '../../types/result';
import type { PaginatedResult, PaginationOptions, SearchCriteria } from './base.repository';

// ==================== Types ====================

/**
 * الدفعة مع العلاقات
 */
export interface PaymentWithRelations {
  id: string;
  bookingId: string;
  userId: string;
  
  // المعلومات
  amount: number;
  currency: string;
  type: string;
  method: string;
  
  // الحالة
  status: string;
  transactionId?: string | null;
  gatewayResponse?: Record<string, unknown> | null;
  
  // التواريخ
  processedAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // العلاقات
  booking?: {
    id: string;
    guestId: string;
    listingId: string;
    checkIn: Date;
    checkOut: Date;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
  };
  refunds?: RefundData[];
}

/**
 * بيانات الاسترداد
 */
export interface RefundData {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string | null;
  status: string;
  processedAt?: Date | null;
  processedBy?: string | null;
  createdAt: Date;
}

/**
 * بيانات إنشاء الدفعة
 */
export interface CreatePaymentData {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  type: string;
  method: string;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
}

/**
 * بيانات إنشاء الاسترداد
 */
export interface CreateRefundData {
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
}

/**
 * فلاتر الدفع
 */
export interface PaymentFilter {
  id?: string;
  bookingId?: string;
  userId?: string;
  status?: string | string[];
  type?: string | string[];
  method?: string | string[];
  currency?: string | string[];
  createdAfter?: Date;
  createdBefore?: Date;
  processedAfter?: Date;
  processedBefore?: Date;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * معايير البحث
 */
export interface PaymentSearchCriteria extends SearchCriteria<PaymentFilter> {
  where?: PaymentFilter;
}

/**
 * إحصائيات المدفوعات
 */
export interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: Record<string, { count: number; amount: number }>;
  byMethod: Record<string, { count: number; amount: number }>;
  byCurrency: Record<string, { count: number; amount: number }>;
  byType: Record<string, { count: number; amount: number }>;
  refunds: {
    total: number;
    totalAmount: number;
    byStatus: Record<string, number>;
  };
  averageAmount: number;
  successRate: number;
}

/**
 * ملخص الإيرادات
 */
export interface RevenueSummary {
  totalRevenue: number;
  totalFees: number;
  totalRefunds: number;
  netRevenue: number;
  byCurrency: Record<string, {
    total: number;
    fees: number;
    refunds: number;
    net: number;
  }>;
  byMonth: Array<{
    month: string;
    total: number;
    fees: number;
    refunds: number;
    net: number;
  }>;
}

// ==================== Repository Interface ====================

/**
 * واجهة مستودع المدفوعات
 */
export interface IPaymentRepository {
  // ==================== Create ====================

  /**
   * إنشاء دفعة جديدة
   */
  create(data: CreatePaymentData): Promise<Result<PaymentWithRelations, Error>>;

  /**
   * إنشاء استرداد
   */
  createRefund(data: CreateRefundData): Promise<Result<RefundData, Error>>;

  // ==================== Read ====================

  /**
   * البحث بالمعرف
   */
  findById(id: string): Promise<Result<PaymentWithRelations, Error>>;

  /**
   * البحث بالمعرف أو null
   */
  findByIdOrNull(id: string): Promise<PaymentWithRelations | null>;

  /**
   * البحث بمعرف المعاملة
   */
  findByTransactionId(transactionId: string): Promise<PaymentWithRelations | null>;

  /**
   * البحث بمعايير
   */
  findMany(criteria: PaymentSearchCriteria): Promise<PaymentWithRelations[]>;

  /**
   * البحث مع التصفح
   */
  findPaginated(options: PaginationOptions, criteria?: PaymentSearchCriteria): Promise<PaginatedResult<PaymentWithRelations>>;

  /**
   * دفعات الحجز
   */
  findByBookingId(bookingId: string): Promise<PaymentWithRelations[]>;

  /**
   * دفعات المستخدم
   */
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResult<PaymentWithRelations>>;

  /**
   * آخر دفعة للحجز
   */
  findLatestByBookingId(bookingId: string): Promise<PaymentWithRelations | null>;

  // ==================== Update ====================

  /**
   * تحديث الدفعة
   */
  update(id: string, data: Partial<CreatePaymentData>): Promise<Result<PaymentWithRelations, Error>>;

  /**
   * تحديث الحالة
   */
  updateStatus(id: string, status: string, metadata?: { transactionId?: string; gatewayResponse?: Record<string, unknown> }): Promise<Result<void, Error>>;

  /**
   * معالجة الدفعة
   */
  markAsProcessed(id: string, transactionId: string, gatewayResponse?: Record<string, unknown>): Promise<Result<void, Error>>;

  /**
   * فشل الدفعة
   */
  markAsFailed(id: string, reason?: string, gatewayResponse?: Record<string, unknown>): Promise<Result<void, Error>>;

  /**
   * استرداد الدفعة
   */
  markAsRefunded(id: string): Promise<Result<void, Error>>;

  // ==================== Refunds ====================

  /**
   * استردادات الدفعة
   */
  getRefunds(paymentId: string): Promise<RefundData[]>;

  /**
   * إحصائيات الاستردادات
   */
  getRefundStats(filter?: { from?: Date; to?: Date }): Promise<{
    total: number;
    totalAmount: number;
    byStatus: Record<string, number>;
  }>;

  // ==================== Stats ====================

  /**
   * إحصائيات المدفوعات
   */
  getStats(filter?: { userId?: string; from?: Date; to?: Date }): Promise<PaymentStats>;

  /**
   * ملخص الإيرادات
   */
  getRevenueSummary(filter?: { from?: Date; to?: Date }): Promise<RevenueSummary>;

  /**
   * عدد المدفوعات
   */
  count(criteria?: PaymentSearchCriteria): Promise<number>;

  /**
   * إجمالي المبالغ
   */
  sumAmounts(filter?: PaymentFilter): Promise<number>;

  // ==================== Existence ====================

  /**
   * التحقق من الوجود
   */
  exists(id: string): Promise<boolean>;
}
