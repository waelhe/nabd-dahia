/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payments Use Cases
 * 
 * حالات استخدام المدفوعات
 * 
 * @module application/payments/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { paymentRepository } from '@/infrastructure/repositories/payment.repository';
import { bookingRepository } from '@/infrastructure/repositories/booking.repository';
import { escrowRepository } from '@/infrastructure/repositories/escrow.repository';

// ==================== Types ====================

export interface CreatePaymentInput {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  type: string;
  method: string;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
}

export interface CreateRefundInput {
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
}

export interface PaymentFilter {
  bookingId?: string;
  userId?: string;
  status?: string | string[];
  type?: string | string[];
  method?: string | string[];
  createdAfter?: Date;
  createdBefore?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentOutput {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  type: string;
  method: string;
  status: string;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
    email?: string;
  };
  refunds?: RefundOutput[];
}

export interface RefundOutput {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  processedAt?: Date;
  processedBy?: string;
  createdAt: Date;
}

export interface PaginatedPayments {
  items: PaymentOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: Record<string, { count: number; amount: number }>;
  byMethod: Record<string, { count: number; amount: number }>;
  averageAmount: number;
  successRate: number;
}

// ==================== Use Cases ====================

/**
 * إنشاء دفعة جديدة
 */
export async function createPayment(
  input: CreatePaymentInput
): Promise<Result<PaymentOutput, Error>> {
  try {
    // Verify booking exists using repository
    const booking = await bookingRepository.findByIdBasic(input.bookingId);

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    // Create payment
    const result = await paymentRepository.create({
      bookingId: input.bookingId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      type: input.type,
      method: input.method,
      transactionId: input.transactionId,
      gatewayResponse: input.gatewayResponse,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(mapToPaymentOutput(result.value));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create payment'));
  }
}

/**
 * الحصول على دفعة بالمعرف
 */
export async function getPayment(id: string): Promise<Result<PaymentOutput, Error>> {
  try {
    const result = await paymentRepository.findById(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(mapToPaymentOutput(result.value));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get payment'));
  }
}

/**
 * البحث عن دفعة بمعرف المعاملة
 */
export async function getPaymentByTransactionId(
  transactionId: string
): Promise<Result<PaymentOutput | null, Error>> {
  try {
    const payment = await paymentRepository.findByTransactionId(transactionId);
    return ok(payment ? mapToPaymentOutput(payment) : null);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get payment'));
  }
}

/**
 * مدفوعات الحجز
 */
export async function getBookingPayments(
  bookingId: string
): Promise<Result<PaymentOutput[], Error>> {
  try {
    const payments = await paymentRepository.findByBookingId(bookingId);
    return ok(payments.map(mapToPaymentOutput));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get booking payments'));
  }
}

/**
 * مدفوعات المستخدم
 */
export async function getUserPayments(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedPayments, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const result = await paymentRepository.findByUserId(userId, { page, limit });

    return ok({
      items: result.items.map(mapToPaymentOutput),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get user payments'));
  }
}

/**
 * تحديث حالة الدفعة
 */
export async function updatePaymentStatus(
  id: string,
  status: string,
  metadata?: { transactionId?: string; gatewayResponse?: Record<string, unknown> }
): Promise<Result<void, Error>> {
  try {
    const result = await paymentRepository.updateStatus(id, status, metadata);

    if (result.isErr()) {
      return err(result.error);
    }

    // Update booking payment status using repository
    const payment = await paymentRepository.findByIdOrNull(id);
    if (payment) {
      await bookingRepository.updatePaymentStatus(payment.bookingId, status);
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to update payment status'));
  }
}

/**
 * تعليم الدفعة كمعالجة
 */
export async function markPaymentProcessed(
  id: string,
  transactionId: string,
  gatewayResponse?: Record<string, unknown>
): Promise<Result<void, Error>> {
  try {
    const result = await paymentRepository.markAsProcessed(id, transactionId, gatewayResponse);

    if (result.isErr()) {
      return err(result.error);
    }

    // Update booking using repository
    const payment = await paymentRepository.findByIdOrNull(id);
    if (payment) {
      await bookingRepository.update(payment.bookingId, {
        paymentStatus: 'paid',
        paidAt: new Date(),
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      // Create escrow using repository
      const existingEscrow = await escrowRepository.findByBookingId(payment.bookingId);

      if (!existingEscrow) {
        await escrowRepository.createEscrow({
          bookingId: payment.bookingId,
          amount: payment.amount,
          currency: payment.currency,
          status: 'held',
          heldAt: new Date(),
        });
      }
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to mark payment as processed'));
  }
}

/**
 * تعليم الدفعة كفاشلة
 */
export async function markPaymentFailed(
  id: string,
  reason?: string,
  gatewayResponse?: Record<string, unknown>
): Promise<Result<void, Error>> {
  try {
    const result = await paymentRepository.markAsFailed(id, reason, gatewayResponse);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to mark payment as failed'));
  }
}

/**
 * إنشاء استرداد
 */
export async function createRefund(
  input: CreateRefundInput
): Promise<Result<RefundOutput, Error>> {
  try {
    const result = await paymentRepository.createRefund({
      paymentId: input.paymentId,
      amount: input.amount,
      currency: input.currency,
      reason: input.reason,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    // Process refund immediately using repository
    await paymentRepository.processRefund(result.value.id);

    // Update payment status
    await paymentRepository.markAsRefunded(input.paymentId);

    // Update booking using repository
    const payment = await paymentRepository.findByIdOrNull(input.paymentId);
    if (payment) {
      await bookingRepository.updateRefund(payment.bookingId, input.amount);

      // Update escrow using repository
      await escrowRepository.updateByBookingId(payment.bookingId, {
        status: 'refunded',
        refundedAt: new Date(),
      });
    }

    return ok(result.value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create refund'));
  }
}

/**
 * استردادات الدفعة
 */
export async function getPaymentRefunds(
  paymentId: string
): Promise<Result<RefundOutput[], Error>> {
  try {
    const refunds = await paymentRepository.getRefunds(paymentId);
    return ok(refunds);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get refunds'));
  }
}

/**
 * إحصائيات المدفوعات
 */
export async function getPaymentStats(
  filter?: { userId?: string; from?: Date; to?: Date }
): Promise<Result<PaymentStats, Error>> {
  try {
    const stats = await paymentRepository.getStats(filter);
    return ok(stats);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get payment stats'));
  }
}

// ==================== Helper Functions ====================

function mapToPaymentOutput(payment: Record<string, unknown>): PaymentOutput {
  return {
    id: payment.id as string,
    bookingId: payment.bookingId as string,
    userId: payment.userId as string,
    amount: payment.amount as number,
    currency: payment.currency as string,
    type: payment.type as string,
    method: payment.method as string,
    status: payment.status as string,
    transactionId: payment.transactionId as string | undefined,
    gatewayResponse: payment.gatewayResponse as Record<string, unknown> | undefined,
    processedAt: payment.processedAt as Date | undefined,
    failedAt: payment.failedAt as Date | undefined,
    refundedAt: payment.refundedAt as Date | undefined,
    createdAt: payment.createdAt as Date,
    updatedAt: payment.updatedAt as Date,
    booking: payment.booking as PaymentOutput['booking'],
    user: payment.user as PaymentOutput['user'],
    refunds: payment.refunds as RefundOutput[] | undefined,
  };
}
