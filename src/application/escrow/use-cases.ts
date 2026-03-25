/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow Use Cases
 * 
 * حالات استخدام الضمان
 * 
 * @module application/escrow/use-cases
 */

import { db } from '@/lib/db';
import { ok, err, type Result } from '@/core/types/result';
import { escrowRepository } from '@/infrastructure/repositories/escrow.repository';

// ==================== Types ====================

export interface EscrowOutput {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  heldAt: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  releasedTo?: 'host' | 'guest';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeInput {
  escrowId: string;
  reason: string;
  description?: string;
  evidence?: string[];
  openedBy: 'host' | 'guest';
}

export interface ResolveDisputeInput {
  escrowId: string;
  hostAmount: number;
  guestAmount: number;
  resolvedBy: string;
  notes?: string;
}

export interface EscrowFilter {
  bookingId?: string;
  status?: string | string[];
  heldFrom?: Date;
  heldTo?: Date;
  releasedFrom?: Date;
  releasedTo?: Date;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
}

export interface PaginatedEscrows {
  items: EscrowOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface EscrowStats {
  total: number;
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  totalDisputed: number;
  averageHeldDuration: number;
  byStatus: Record<string, number>;
  byCurrency: Record<string, { count: number; amount: number }>;
}

export interface EscrowTimelineEntry {
  action: 'created' | 'held' | 'released' | 'refunded' | 'disputed' | 'resolved';
  timestamp: Date;
  actor?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// ==================== Use Cases ====================

/**
 * إنشاء ضمان جديد
 */
export async function createEscrow(
  bookingId: string
): Promise<Result<EscrowOutput, Error>> {
  try {
    // Check if escrow already exists
    const existing = await escrowRepository.existsForBooking(bookingId);
    if (existing) {
      return err(new Error('Escrow already exists for this booking'));
    }

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return err(new Error('Booking not found'));
    }

    if (booking.paymentStatus !== 'paid') {
      return err(new Error('Booking is not paid'));
    }

    // Create escrow
    const escrow = await db.escrow.create({
      data: {
        bookingId,
        amount: booking.totalPrice,
        currency: booking.currency,
        status: 'held',
        heldAt: new Date(),
      },
    });

    return ok(mapToEscrowOutput(escrow));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create escrow'));
  }
}

/**
 * الحصول على ضمان بالمعرف
 */
export async function getEscrow(id: string): Promise<Result<EscrowOutput, Error>> {
  try {
    const escrow = await db.escrow.findUnique({
      where: { id },
    });

    if (!escrow) {
      return err(new Error('Escrow not found'));
    }

    return ok(mapToEscrowOutput(escrow));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get escrow'));
  }
}

/**
 * ضمان الحجز
 */
export async function getBookingEscrow(
  bookingId: string
): Promise<Result<EscrowOutput | null, Error>> {
  try {
    const escrow = await escrowRepository.findByBookingId(bookingId);
    return ok(escrow ? mapToEscrowOutput(escrow as Record<string, unknown>) : null);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get escrow'));
  }
}

/**
 * الإفراج للمضيف
 */
export async function releaseToHost(
  escrowId: string,
  releasedBy?: string,
  notes?: string
): Promise<Result<void, Error>> {
  try {
    // Check if can release
    const canRelease = await escrowRepository.canRelease(escrowId);
    if (!canRelease.canRelease) {
      return err(new Error(canRelease.reason ?? 'Cannot release'));
    }

    const result = await escrowRepository.releaseToHost(escrowId, releasedBy, notes);

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to release to host'));
    }

    // Update booking
    const escrow = await db.escrow.findUnique({
      where: { id: escrowId },
    });

    if (escrow) {
      await db.booking.update({
        where: { id: escrow.bookingId },
        data: {
          paymentStatus: 'released',
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Update host balance
      await db.user.update({
        where: { id: (await db.booking.findUnique({ where: { id: escrow.bookingId } }))?.hostId },
        data: {
          totalEarnings: { increment: escrow.amount },
        },
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to release to host'));
  }
}

/**
 * الإفراج للضيف (استرداد)
 */
export async function releaseToGuest(
  escrowId: string,
  releasedBy?: string,
  notes?: string
): Promise<Result<void, Error>> {
  try {
    const result = await escrowRepository.releaseToGuest(escrowId, releasedBy, notes);

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to release to guest'));
    }

    // Update booking
    const escrow = await db.escrow.findUnique({
      where: { id: escrowId },
    });

    if (escrow) {
      await db.booking.update({
        where: { id: escrow.bookingId },
        data: {
          paymentStatus: 'refunded',
          refundAmount: escrow.amount,
          refundedAt: new Date(),
        },
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to release to guest'));
  }
}

/**
 * إفراج مقسم
 */
export async function releaseSplit(
  escrowId: string,
  hostAmount: number,
  guestAmount: number,
  releasedBy?: string,
  notes?: string
): Promise<Result<void, Error>> {
  try {
    const escrow = await db.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      return err(new Error('Escrow not found'));
    }

    if (hostAmount + guestAmount > escrow.amount) {
      return err(new Error('Split amounts exceed escrow amount'));
    }

    const result = await escrowRepository.releaseSplit(
      escrowId,
      hostAmount,
      guestAmount,
      releasedBy,
      notes
    );

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to split release'));
    }

    // Update booking
    await db.booking.update({
      where: { id: escrow.bookingId },
      data: {
        paymentStatus: 'split',
        refundAmount: guestAmount,
        refundedAt: new Date(),
      },
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to split release'));
  }
}

/**
 * فتح نزاع
 */
export async function openDispute(
  input: DisputeInput
): Promise<Result<void, Error>> {
  try {
    const result = await escrowRepository.openDispute(input.escrowId, {
      reason: input.reason,
      description: input.description,
      evidence: input.evidence,
      openedBy: input.openedBy,
    });

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to open dispute'));
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to open dispute'));
  }
}

/**
 * حل نزاع
 */
export async function resolveDispute(
  input: ResolveDisputeInput
): Promise<Result<void, Error>> {
  try {
    const escrow = await db.escrow.findUnique({
      where: { id: input.escrowId },
    });

    if (!escrow) {
      return err(new Error('Escrow not found'));
    }

    if (escrow.status !== 'disputed') {
      return err(new Error('Escrow is not disputed'));
    }

    if (input.hostAmount + input.guestAmount > escrow.amount) {
      return err(new Error('Resolution amounts exceed escrow amount'));
    }

    const result = await escrowRepository.resolveDispute(input.escrowId, {
      hostAmount: input.hostAmount,
      guestAmount: input.guestAmount,
      resolvedBy: input.resolvedBy,
      notes: input.notes,
    });

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to resolve dispute'));
    }

    // Update booking
    await db.booking.update({
      where: { id: escrow.bookingId },
      data: {
        paymentStatus: 'resolved',
        refundAmount: input.guestAmount,
        refundedAt: new Date(),
      },
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to resolve dispute'));
  }
}

/**
 * الجدول الزمني للضمان
 */
export async function getEscrowTimeline(
  escrowId: string
): Promise<Result<EscrowTimelineEntry[], Error>> {
  try {
    const timeline = await escrowRepository.getTimeline(escrowId);
    return ok(timeline);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get timeline'));
  }
}

/**
 * الضمانات المحتجزة
 */
export async function getHeldEscrows(
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedEscrows, Error>> {
  try {
    const result = await escrowRepository.findHeld(options);

    return ok({
      items: result.items.map(e => mapToEscrowOutput(e as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get held escrows'));
  }
}

/**
 * الضمانات المتنازع عليها
 */
export async function getDisputedEscrows(
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedEscrows, Error>> {
  try {
    const result = await escrowRepository.findDisputed(options);

    return ok({
      items: result.items.map(e => mapToEscrowOutput(e as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get disputed escrows'));
  }
}

/**
 * إحصائيات الضمان
 */
export async function getEscrowStats(
  from?: Date,
  to?: Date
): Promise<Result<EscrowStats, Error>> {
  try {
    const stats = await escrowRepository.getStats(from, to);
    return ok(stats);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get escrow stats'));
  }
}

/**
 * إجمالي المبالغ المحتجزة
 */
export async function getTotalHeld(
  currency?: string
): Promise<Result<number, Error>> {
  try {
    const total = await escrowRepository.getTotalHeld(currency);
    return ok(total);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get total held'));
  }
}

/**
 * إفراج تلقائي للضمانات المستحقة
 */
export async function autoReleaseReady(): Promise<Result<{
  released: number;
  failed: number;
  total: number;
}, Error>> {
  try {
    const result = await escrowRepository.autoReleaseReady();
    return ok(result);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to auto release'));
  }
}

// ==================== Helper Functions ====================

function mapToEscrowOutput(escrow: Record<string, unknown>): EscrowOutput {
  return {
    id: escrow.id as string,
    bookingId: escrow.bookingId as string,
    amount: escrow.amount as number,
    currency: escrow.currency as string,
    status: escrow.status as string,
    heldAt: escrow.heldAt as Date,
    releasedAt: escrow.releasedAt as Date | undefined,
    refundedAt: escrow.refundedAt as Date | undefined,
    releasedTo: escrow.releasedTo as 'host' | 'guest' | undefined,
    notes: escrow.notes as string | undefined,
    createdAt: escrow.createdAt as Date,
    updatedAt: escrow.updatedAt as Date,
  };
}
