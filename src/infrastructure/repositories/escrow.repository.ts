/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow Repository Implementation
 * 
 * تنفيذ مستودع الضمان باستخدام Prisma
 * 
 * @module infrastructure/repositories/escrow.repository
 */

import { db } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type {
  IEscrowRepository,
  EscrowFilter,
  EscrowCreateData,
  EscrowUpdateData,
  DisputeData,
  EscrowStats,
  EscrowTimelineEntry,
} from '@/core/interfaces/repositories/escrow.repository';
import type { FindOptions, PaginatedResult, OperationResult } from '@/core/interfaces/repositories/base.repository';
import { Escrow, EscrowStatus } from '@/core/domain/entities/Escrow';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import type { Escrow as PrismaEscrow } from '@prisma/client';

// ==================== Escrow Repository ====================

export class EscrowRepository
  extends BaseRepository<PrismaEscrow, string>
  implements IEscrowRepository
{
  constructor() {
    super(db.escrow as Parameters<typeof BaseRepository<PrismaEscrow, string>['constructor']>[0], 'id');
  }

  // ==================== Query Methods ====================

  async findByBookingId(bookingId: string): Promise<Escrow | null> {
    const escrow = await db.escrow.findUnique({
      where: { bookingId },
    });

    return escrow ? this.mapToEntity(escrow) : null;
  }

  /**
   * Create escrow with basic data
   */
  async createEscrow(data: {
    bookingId: string;
    amount: number;
    currency: string;
    status: string;
    heldAt: Date;
  }): Promise<Record<string, unknown>> {
    const escrow = await db.escrow.create({
      data: {
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        heldAt: data.heldAt,
      },
    });

    return escrow as Record<string, unknown>;
  }

  /**
   * Update escrow by booking ID
   */
  async updateByBookingId(
    bookingId: string,
    data: Partial<{
      status: string;
      releasedAt: Date;
      refundedAt: Date;
      releasedTo: string;
      notes: string;
    }>
  ): Promise<OperationResult> {
    try {
      await db.escrow.update({
        where: { bookingId },
        data,
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update escrow' };
    }
  }

  async findByStatus(
    status: EscrowStatus,
    options?: FindOptions
  ): Promise<PaginatedResult<Escrow>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { status };

    const [items, total] = await Promise.all([
      db.escrow.findMany({
        where,
        orderBy: { heldAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.escrow.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findHeld(options?: FindOptions): Promise<PaginatedResult<Escrow>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { status: 'held' };

    const [items, total] = await Promise.all([
      db.escrow.findMany({
        where,
        orderBy: { heldAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.escrow.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findDisputed(options?: FindOptions): Promise<PaginatedResult<Escrow>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { status: 'disputed' };

    const [items, total] = await Promise.all([
      db.escrow.findMany({
        where,
        orderBy: { heldAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.escrow.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findReadyForAutoRelease(hoursAfterHeld: number): Promise<Escrow[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursAfterHeld);

    const escrows = await db.escrow.findMany({
      where: {
        status: 'held',
        heldAt: { lte: cutoffDate },
      },
    });

    return escrows.map(e => this.mapToEntity(e));
  }

  async search(filter: EscrowFilter, options?: FindOptions): Promise<PaginatedResult<Escrow>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = this.buildFilter(filter);

    const [items, total] = await Promise.all([
      db.escrow.findMany({
        where,
        orderBy: { heldAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.escrow.count({ where }),
    ]);

    return {
      items: items.map(e => this.mapToEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  // ==================== Status Operations ====================

  async releaseToHost(
    escrowId: string,
    releasedBy?: string,
    notes?: string
  ): Promise<OperationResult> {
    try {
      await db.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'released',
          releasedAt: new Date(),
          releasedTo: 'host',
          notes: notes,
        },
      });

      // Add timeline entry
      await this.addTimelineEntry(escrowId, {
        action: 'released',
        actor: releasedBy,
        notes: notes ?? 'Released to host',
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to release to host' };
    }
  }

  async releaseToGuest(
    escrowId: string,
    releasedBy?: string,
    notes?: string
  ): Promise<OperationResult> {
    try {
      await db.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          releasedTo: 'guest',
          notes: notes,
        },
      });

      // Add timeline entry
      await this.addTimelineEntry(escrowId, {
        action: 'refunded',
        actor: releasedBy,
        notes: notes ?? 'Refunded to guest',
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to release to guest' };
    }
  }

  async releaseSplit(
    escrowId: string,
    hostAmount: number,
    guestAmount: number,
    releasedBy?: string,
    notes?: string
  ): Promise<OperationResult> {
    try {
      await db.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'released',
          releasedAt: new Date(),
          releasedTo: 'split',
          notes: `Host: ${hostAmount}, Guest: ${guestAmount}. ${notes ?? ''}`,
        },
      });

      // Add timeline entry
      await this.addTimelineEntry(escrowId, {
        action: 'released',
        actor: releasedBy,
        notes: `Split release - Host: ${hostAmount}, Guest: ${guestAmount}`,
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to split release' };
    }
  }

  // ==================== Dispute Operations ====================

  async openDispute(escrowId: string, data: DisputeData): Promise<OperationResult> {
    try {
      await db.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'disputed',
          notes: `Dispute: ${data.reason}. ${data.description ?? ''}`,
        },
      });

      // Add timeline entry
      await this.addTimelineEntry(escrowId, {
        action: 'disputed',
        notes: `Dispute opened by ${data.openedBy}: ${data.reason}`,
        metadata: { evidence: data.evidence },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to open dispute' };
    }
  }

  async resolveDispute(
    escrowId: string,
    resolution: {
      hostAmount: number;
      guestAmount: number;
      resolvedBy: string;
      notes?: string;
    }
  ): Promise<OperationResult> {
    try {
      await db.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'released',
          releasedAt: new Date(),
          notes: `Resolved - Host: ${resolution.hostAmount}, Guest: ${resolution.guestAmount}. ${resolution.notes ?? ''}`,
        },
      });

      // Add timeline entry
      await this.addTimelineEntry(escrowId, {
        action: 'resolved',
        actor: resolution.resolvedBy,
        notes: `Dispute resolved - Host: ${resolution.hostAmount}, Guest: ${resolution.guestAmount}`,
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to resolve dispute' };
    }
  }

  async addDisputeEvidence(escrowId: string, evidence: string[]): Promise<OperationResult> {
    try {
      const current = await db.escrow.findUnique({
        where: { id: escrowId },
        select: { notes: true },
      });

      await db.escrow.update({
        where: { id: escrowId },
        data: {
          notes: `${current?.notes ?? ''}\nEvidence added: ${evidence.join(', ')}`,
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to add evidence' };
    }
  }

  async updateDispute(
    escrowId: string,
    data: Partial<{
      reason: string;
      description: string;
      status: string;
    }>
  ): Promise<OperationResult> {
    try {
      if (data.status) {
        await db.escrow.update({
          where: { id: escrowId },
          data: { status: data.status as EscrowStatus },
        });
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update dispute' };
    }
  }

  // ==================== Timeline ====================

  async getTimeline(escrowId: string): Promise<EscrowTimelineEntry[]> {
    // In a real implementation, this would come from a separate table
    // For now, we'll reconstruct from the escrow record
    const escrow = await db.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) return [];

    const timeline: EscrowTimelineEntry[] = [
      {
        action: 'created',
        timestamp: escrow.createdAt,
        notes: 'Escrow created',
      },
      {
        action: 'held',
        timestamp: escrow.heldAt,
        notes: 'Funds held',
      },
    ];

    if (escrow.releasedAt) {
      timeline.push({
        action: escrow.status === 'refunded' ? 'refunded' : 'released',
        timestamp: escrow.releasedAt,
        notes: escrow.notes ?? undefined,
      });
    }

    if (escrow.refundedAt && escrow.status !== 'refunded') {
      timeline.push({
        action: 'refunded',
        timestamp: escrow.refundedAt,
      });
    }

    return timeline;
  }

  async addTimelineEntry(
    escrowId: string,
    entry: Omit<EscrowTimelineEntry, 'timestamp'>
  ): Promise<OperationResult> {
    try {
      // In a real implementation, this would insert into a timeline table
      // For now, we'll update the notes field
      const current = await db.escrow.findUnique({
        where: { id: escrowId },
        select: { notes: true },
      });

      await db.escrow.update({
        where: { id: escrowId },
        data: {
          notes: `${current?.notes ?? ''}\n[${new Date().toISOString()}] ${entry.action}: ${entry.notes ?? ''}`,
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to add timeline entry' };
    }
  }

  // ==================== Statistics ====================

  async getStats(from?: Date, to?: Date): Promise<EscrowStats> {
    const where: Record<string, unknown> = {};
    
    if (from || to) {
      where.heldAt = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    const [total, byStatus, byCurrency] = await Promise.all([
      db.escrow.count({ where }),
      db.escrow.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      db.escrow.groupBy({
        by: ['currency'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const heldEscrows = await db.escrow.findMany({
      where: { ...where, status: 'held' },
      select: { heldAt: true, releasedAt: true },
    });

    const totalHeld = byStatus.find(s => s.status === 'held')?._count.id ?? 0;
    const totalReleased = byStatus.find(s => s.status === 'released')?._count.id ?? 0;
    const totalRefunded = byStatus.find(s => s.status === 'refunded')?._count.id ?? 0;
    const totalDisputed = byStatus.find(s => s.status === 'disputed')?._count.id ?? 0;

    // Calculate average held duration (in hours)
    let totalDuration = 0;
    for (const e of heldEscrows) {
      if (e.releasedAt && e.heldAt) {
        totalDuration += (e.releasedAt.getTime() - e.heldAt.getTime()) / (1000 * 60 * 60);
      }
    }
    const averageHeldDuration = heldEscrows.length > 0 ? totalDuration / heldEscrows.length : 0;

    return {
      total,
      totalHeld,
      totalReleased,
      totalRefunded,
      totalDisputed,
      averageHeldDuration,
      byStatus: Object.fromEntries(
        byStatus.map(s => [s.status as EscrowStatus, s._count.id])
      ) as Record<EscrowStatus, number>,
      byCurrency: Object.fromEntries(
        byCurrency.map(c => [c.currency, { count: c._count.id, amount: c._sum.amount ?? 0 }])
      ),
    };
  }

  async getTotalHeld(currency?: string): Promise<number> {
    const where: Record<string, unknown> = { status: 'held' };
    if (currency) where.currency = currency;

    const result = await db.escrow.aggregate({
      where,
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  async getTotalReleased(currency?: string, from?: Date, to?: Date): Promise<number> {
    const where: Record<string, unknown> = { status: 'released' };
    if (currency) where.currency = currency;
    if (from || to) {
      where.releasedAt = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    const result = await db.escrow.aggregate({
      where,
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  // ==================== Bulk Operations ====================

  async autoReleaseReady(): Promise<{
    released: number;
    failed: number;
    total: number;
  }> {
    // Default: auto-release after 48 hours
    const escrows = await this.findReadyForAutoRelease(48);

    let released = 0;
    let failed = 0;

    for (const escrow of escrows) {
      const result = await this.releaseToHost(
        (escrow as unknown as { id: string }).id,
        undefined,
        'Auto-released after 48 hours'
      );

      if (result.success) {
        released++;
      } else {
        failed++;
      }
    }

    return {
      released,
      failed,
      total: escrows.length,
    };
  }

  // ==================== Validation ====================

  async existsForBooking(bookingId: string): Promise<boolean> {
    const count = await db.escrow.count({
      where: { bookingId },
    });
    return count > 0;
  }

  async canRelease(escrowId: string): Promise<{
    canRelease: boolean;
    reason?: string;
  }> {
    const escrow = await db.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      return { canRelease: false, reason: 'Escrow not found' };
    }

    if (escrow.status === 'released') {
      return { canRelease: false, reason: 'Already released' };
    }

    if (escrow.status === 'refunded') {
      return { canRelease: false, reason: 'Already refunded' };
    }

    if (escrow.status === 'disputed') {
      return { canRelease: false, reason: 'Under dispute - requires resolution' };
    }

    return { canRelease: true };
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter: EscrowFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter.bookingId) where.bookingId = filter.bookingId;
    
    if (filter.status) {
      where.status = Array.isArray(filter.status)
        ? { in: filter.status }
        : filter.status;
    }

    if (filter.heldFrom || filter.heldTo) {
      where.heldAt = {
        ...(filter.heldFrom && { gte: filter.heldFrom }),
        ...(filter.heldTo && { lte: filter.heldTo }),
      };
    }

    if (filter.releasedFrom || filter.releasedTo) {
      where.releasedAt = {
        ...(filter.releasedFrom && { gte: filter.releasedFrom }),
        ...(filter.releasedTo && { lte: filter.releasedTo }),
      };
    }

    if (filter.amountMin || filter.amountMax) {
      where.amount = {
        ...(filter.amountMin && { gte: filter.amountMin }),
        ...(filter.amountMax && { lte: filter.amountMax }),
      };
    }

    if (filter.currency) where.currency = filter.currency;

    return where;
  }

  private mapToEntity(escrow: PrismaEscrow): Escrow {
    const props = {
      bookingId: escrow.bookingId,
      amount: escrow.amount,
      currency: escrow.currency,
      status: escrow.status as EscrowStatus,
      heldAt: escrow.heldAt,
      releasedAt: escrow.releasedAt ?? undefined,
      refundedAt: escrow.refundedAt ?? undefined,
      releasedTo: escrow.releasedTo as 'host' | 'guest' | undefined,
      notes: escrow.notes ?? undefined,
      createdAt: escrow.createdAt,
      updatedAt: escrow.updatedAt,
    };

    return {
      id: new UniqueEntityId(escrow.id),
      props,
    } as unknown as Escrow;
  }
}

// ==================== Singleton Instance ====================

export const escrowRepository = new EscrowRepository();
