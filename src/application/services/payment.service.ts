/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Domain Service
 * 
 * خدمة مجال المدفوعات - تنسق مع بوابات الدفع والضمان
 * 
 * @module application/services/payment.service
 */

import { db } from '@/lib/db';
import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

export interface ProcessPaymentInput {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'card' | 'cash' | 'bank_transfer' | 'wallet';
  paymentMethodId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessPaymentOutput {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  escrowId?: string;
  message?: string;
}

export interface PayoutInput {
  hostId: string;
  amount: number;
  currency: string;
  bookingId: string;
  method: 'bank' | 'wallet';
}

export interface PayoutOutput {
  payoutId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedArrival?: Date;
}

// ==================== Service ====================

/**
 * معالجة الدفع
 */
export async function processPayment(
  input: ProcessPaymentInput
): Promise<Result<ProcessPaymentOutput, Error>> {
  try {
    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: input.bookingId },
      include: { listing: true },
    });

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    if (booking.paymentStatus === 'paid') {
      return err(new Error('Booking is already paid'));
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId: input.bookingId,
        userId: input.userId,
        amount: input.amount,
        currency: input.currency,
        type: 'booking',
        method: input.method,
        status: 'processing',
        gatewayResponse: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });

    // Simulate payment processing
    // In real app, this would call Stripe/PaymentGateway
    const success = await simulatePaymentGateway(input.amount, input.currency);

    if (success) {
      // Update payment as completed
      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      });

      // Update booking
      await db.booking.update({
        where: { id: input.bookingId },
        data: {
          paymentStatus: 'paid',
          paidAt: new Date(),
          status: 'confirmed',
          confirmedAt: new Date(),
        },
      });

      // Create escrow
      const escrow = await db.escrow.create({
        data: {
          bookingId: input.bookingId,
          amount: input.amount,
          currency: input.currency,
          status: 'held',
          heldAt: new Date(),
        },
      });

      return ok({
        paymentId: payment.id,
        status: 'completed',
        transactionId: updatedPayment.transactionId ?? undefined,
        escrowId: escrow.id,
        message: 'Payment processed successfully',
      });
    } else {
      // Mark payment as failed
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          failedAt: new Date(),
        },
      });

      return ok({
        paymentId: payment.id,
        status: 'failed',
        message: 'Payment processing failed',
      });
    }
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to process payment'));
  }
}

/**
 * صرف المبلغ للمضيف
 */
export async function processPayout(
  input: PayoutInput
): Promise<Result<PayoutOutput, Error>> {
  try {
    // Verify host exists
    const host = await db.user.findUnique({
      where: { id: input.hostId },
    });

    if (!host) {
      return err(new Error('Host not found'));
    }

    // Get escrow for booking
    const escrow = await db.escrow.findUnique({
      where: { bookingId: input.bookingId },
    });

    if (!escrow) {
      return err(new Error('Escrow not found'));
    }

    // Update escrow as released
    await db.escrow.update({
      where: { id: escrow.id },
      data: {
        status: 'released',
        releasedAt: new Date(),
        releasedTo: 'host',
      },
    });

    // Calculate estimated arrival (3-5 business days)
    const estimatedArrival = new Date();
    estimatedArrival.setDate(estimatedArrival.getDate() + 5);

    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return ok({
      payoutId,
      status: 'processing',
      estimatedArrival,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to process payout'));
  }
}

/**
 * التحقق من صحة المبلغ
 */
export async function validatePaymentAmount(
  bookingId: string,
  amount: number
): Promise<Result<boolean, Error>> {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    // Allow small difference for currency conversion
    const tolerance = 0.01; // 1% tolerance
    const difference = Math.abs(booking.totalPrice - amount) / booking.totalPrice;

    if (difference > tolerance) {
      return err(new Error(`Amount mismatch: expected ${booking.totalPrice}, got ${amount}`));
    }

    return ok(true);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to validate amount'));
  }
}

/**
 * حساب رسوم الخدمة
 */
export async function calculateServiceFees(
  amount: number,
  _currency: string
): Promise<{
  platformFee: number;
  hostFee: number;
  guestFee: number;
  processingFee: number;
}> {
  // Platform fee: 3% for host, 0% for guest (can be adjusted)
  const hostFee = amount * 0.03;
  const guestFee = 0;
  
  // Processing fee: varies by payment method (average 2.9% + $0.30)
  const processingFee = (amount * 0.029) + 0.30;
  
  // Platform keeps the host fee minus processing costs
  const platformFee = hostFee;

  return {
    platformFee,
    hostFee,
    guestFee,
    processingFee,
  };
}

// ==================== Helper Functions ====================

/**
 * محاكاة بوابة الدفع (للتطوير)
 */
async function simulatePaymentGateway(amount: number, _currency: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate 95% success rate
  return Math.random() > 0.05;
}
