/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Repository Implementation
 * 
 * تنفيذ مستودع المدفوعات باستخدام Prisma
 * 
 * @module infrastructure/repositories/payment.repository
 */

import { db } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type {
  IPaymentRepository,
  PaymentWithRelations,
  RefundData,
  CreatePaymentData,
  CreateRefundData,
  PaymentFilter,
  PaymentSearchCriteria,
  PaymentStats,
  RevenueSummary,
} from '@/core/interfaces/repositories/payment.repository';
import type { PaginatedResult, PaginationOptions } from '@/core/interfaces/repositories/base.repository';
import type { Result } from '@/core/types/result';
import { ok, err } from '@/core/types/result';
import type { Payment, Refund } from '@prisma/client';

// ==================== Payment Repository ====================

export class PaymentRepository
  extends BaseRepository<Payment, string>
  implements IPaymentRepository
{
  constructor() {
    super(db.payment as Parameters<typeof BaseRepository<Payment, string>['constructor']>[0], 'id');
  }

  // ==================== Create ====================

  async create(data: CreatePaymentData): Promise<Result<PaymentWithRelations, Error>> {
    try {
      const payment = await db.payment.create({
        data: {
          bookingId: data.bookingId,
          userId: data.userId,
          amount: data.amount,
          currency: data.currency,
          type: data.type,
          method: data.method,
          transactionId: data.transactionId,
          gatewayResponse: data.gatewayResponse as object,
          status: 'pending',
        },
        include: {
          booking: {
            select: {
              id: true,
              guestId: true,
              listingId: true,
              checkIn: true,
              checkOut: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return ok(this.mapToWithRelations(payment));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create payment'));
    }
  }

  async createRefund(data: CreateRefundData): Promise<Result<RefundData, Error>> {
    try {
      const refund = await db.refund.create({
        data: {
          paymentId: data.paymentId,
          amount: data.amount,
          currency: data.currency,
          reason: data.reason,
          status: 'pending',
        },
      });

      return ok(this.mapRefund(refund));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create refund'));
    }
  }

  // ==================== Read ====================

  async findById(id: string): Promise<Result<PaymentWithRelations, Error>> {
    try {
      const payment = await db.payment.findUnique({
        where: { id },
        include: {
          booking: {
            select: {
              id: true,
              guestId: true,
              listingId: true,
              checkIn: true,
              checkOut: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          refunds: true,
        },
      });

      if (!payment) {
        return err(new Error('Payment not found'));
      }

      return ok(this.mapToWithRelations(payment));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to find payment'));
    }
  }

  async findByIdOrNull(id: string): Promise<PaymentWithRelations | null> {
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            guestId: true,
            listingId: true,
            checkIn: true,
            checkOut: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        refunds: true,
      },
    });

    return payment ? this.mapToWithRelations(payment) : null;
  }

  async findByTransactionId(transactionId: string): Promise<PaymentWithRelations | null> {
    const payment = await db.payment.findFirst({
      where: { transactionId },
      include: {
        booking: {
          select: {
            id: true,
            guestId: true,
            listingId: true,
            checkIn: true,
            checkOut: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        refunds: true,
      },
    });

    return payment ? this.mapToWithRelations(payment) : null;
  }

  async findMany(criteria: PaymentSearchCriteria): Promise<PaymentWithRelations[]> {
    const where = this.buildFilter(criteria.where);

    const payments = await db.payment.findMany({
      where,
      orderBy: criteria.orderBy ?? { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            guestId: true,
            listingId: true,
            checkIn: true,
            checkOut: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        refunds: true,
      },
    });

    return payments.map(p => this.mapToWithRelations(p));
  }

  async findPaginated(
    options: PaginationOptions,
    criteria?: PaymentSearchCriteria
  ): Promise<PaginatedResult<PaymentWithRelations>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = criteria?.where ? this.buildFilter(criteria.where) : {};

    const [items, total] = await Promise.all([
      db.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          booking: {
            select: {
              id: true,
              guestId: true,
              listingId: true,
              checkIn: true,
              checkOut: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          refunds: true,
        },
      }),
      db.payment.count({ where }),
    ]);

    return {
      items: items.map(p => this.mapToWithRelations(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByBookingId(bookingId: string): Promise<PaymentWithRelations[]> {
    const payments = await db.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            guestId: true,
            listingId: true,
            checkIn: true,
            checkOut: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        refunds: true,
      },
    });

    return payments.map(p => this.mapToWithRelations(p));
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<PaymentWithRelations>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          booking: {
            select: {
              id: true,
              guestId: true,
              listingId: true,
              checkIn: true,
              checkOut: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          refunds: true,
        },
      }),
      db.payment.count({ where: { userId } }),
    ]);

    return {
      items: items.map(p => this.mapToWithRelations(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findLatestByBookingId(bookingId: string): Promise<PaymentWithRelations | null> {
    const payment = await db.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            guestId: true,
            listingId: true,
            checkIn: true,
            checkOut: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        refunds: true,
      },
    });

    return payment ? this.mapToWithRelations(payment) : null;
  }

  // ==================== Update ====================

  async update(
    id: string,
    data: Partial<CreatePaymentData>
  ): Promise<Result<PaymentWithRelations, Error>> {
    try {
      const payment = await db.payment.update({
        where: { id },
        data: {
          transactionId: data.transactionId,
          gatewayResponse: data.gatewayResponse as object,
        },
        include: {
          booking: {
            select: {
              id: true,
              guestId: true,
              listingId: true,
              checkIn: true,
              checkOut: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          refunds: true,
        },
      });

      return ok(this.mapToWithRelations(payment));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update payment'));
    }
  }

  async updateStatus(
    id: string,
    status: string,
    metadata?: { transactionId?: string; gatewayResponse?: Record<string, unknown> }
  ): Promise<Result<void, Error>> {
    try {
      await db.payment.update({
        where: { id },
        data: {
          status,
          transactionId: metadata?.transactionId,
          gatewayResponse: metadata?.gatewayResponse as object,
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update status'));
    }
  }

  async markAsProcessed(
    id: string,
    transactionId: string,
    gatewayResponse?: Record<string, unknown>
  ): Promise<Result<void, Error>> {
    try {
      await db.payment.update({
        where: { id },
        data: {
          status: 'completed',
          transactionId,
          gatewayResponse: gatewayResponse as object,
          processedAt: new Date(),
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark as processed'));
    }
  }

  async markAsFailed(
    id: string,
    reason?: string,
    gatewayResponse?: Record<string, unknown>
  ): Promise<Result<void, Error>> {
    try {
      await db.payment.update({
        where: { id },
        data: {
          status: 'failed',
          gatewayResponse: gatewayResponse 
            ? { ...(gatewayResponse as object), reason } 
            : { reason },
          failedAt: new Date(),
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark as failed'));
    }
  }

  async markAsRefunded(id: string): Promise<Result<void, Error>> {
    try {
      await db.payment.update({
        where: { id },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to mark as refunded'));
    }
  }

  /**
   * Process refund - update refund status to processed
   */
  async processRefund(refundId: string): Promise<Result<void, Error>> {
    try {
      await db.refund.update({
        where: { id: refundId },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to process refund'));
    }
  }

  // ==================== Refunds ====================

  async getRefunds(paymentId: string): Promise<RefundData[]> {
    const refunds = await db.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });

    return refunds.map(r => this.mapRefund(r));
  }

  async getRefundStats(filter?: { from?: Date; to?: Date }): Promise<{
    total: number;
    totalAmount: number;
    byStatus: Record<string, number>;
  }> {
    const where: Record<string, unknown> = {};
    
    if (filter?.from || filter?.to) {
      where.createdAt = {
        ...(filter.from && { gte: filter.from }),
        ...(filter.to && { lte: filter.to }),
      };
    }

    const [total, aggregates, byStatus] = await Promise.all([
      db.refund.count({ where }),
      db.refund.aggregate({
        where,
        _sum: { amount: true },
      }),
      db.refund.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      total,
      totalAmount: aggregates._sum.amount ?? 0,
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count.id])),
    };
  }

  // ==================== Stats ====================

  async getStats(filter?: { userId?: string; from?: Date; to?: Date }): Promise<PaymentStats> {
    const where: Record<string, unknown> = {};
    
    if (filter?.userId) where.userId = filter.userId;
    if (filter?.from || filter?.to) {
      where.createdAt = {
        ...(filter.from && { gte: filter.from }),
        ...(filter.to && { lte: filter.to }),
      };
    }

    const [total, aggregates, byStatus, byMethod, byCurrency, byType] = await Promise.all([
      db.payment.count({ where }),
      db.payment.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      db.payment.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      db.payment.groupBy({
        by: ['method'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      db.payment.groupBy({
        by: ['currency'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      db.payment.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const completedCount = byStatus.find(s => s.status === 'completed')?._count.id ?? 0;
    const successRate = total > 0 ? (completedCount / total) * 100 : 0;

    const refundStats = await this.getRefundStats(filter);

    return {
      total,
      totalAmount: aggregates._sum.amount ?? 0,
      byStatus: Object.fromEntries(
        byStatus.map(s => [s.status, { count: s._count.id, amount: s._sum.amount ?? 0 }])
      ),
      byMethod: Object.fromEntries(
        byMethod.map(m => [m.method, { count: m._count.id, amount: m._sum.amount ?? 0 }])
      ),
      byCurrency: Object.fromEntries(
        byCurrency.map(c => [c.currency, { count: c._count.id, amount: c._sum.amount ?? 0 }])
      ),
      byType: Object.fromEntries(
        byType.map(t => [t.type, { count: t._count.id, amount: t._sum.amount ?? 0 }])
      ),
      refunds: refundStats,
      averageAmount: aggregates._avg.amount ?? 0,
      successRate,
    };
  }

  async getRevenueSummary(filter?: { from?: Date; to?: Date }): Promise<RevenueSummary> {
    const where: Record<string, unknown> = {
      status: 'completed',
    };
    
    if (filter?.from || filter?.to) {
      where.processedAt = {
        ...(filter.from && { gte: filter.from }),
        ...(filter.to && { lte: filter.to }),
      };
    }

    const payments = await db.payment.findMany({
      where,
      select: {
        amount: true,
        currency: true,
        createdAt: true,
        refunds: true,
      },
    });

    // Calculate totals
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunds = payments.reduce(
      (sum, p) => sum + p.refunds.reduce((rs, r) => rs + r.amount, 0),
      0
    );
    const totalFees = totalRevenue * 0.05; // Assume 5% service fee
    const netRevenue = totalRevenue - totalFees - totalRefunds;

    // Group by currency
    const byCurrency: Record<string, { total: number; fees: number; refunds: number; net: number }> = {};
    for (const p of payments) {
      if (!byCurrency[p.currency]) {
        byCurrency[p.currency] = { total: 0, fees: 0, refunds: 0, net: 0 };
      }
      const fees = p.amount * 0.05;
      const refunds = p.refunds.reduce((sum, r) => sum + r.amount, 0);
      byCurrency[p.currency].total += p.amount;
      byCurrency[p.currency].fees += fees;
      byCurrency[p.currency].refunds += refunds;
      byCurrency[p.currency].net += p.amount - fees - refunds;
    }

    // Group by month
    const byMonthMap = new Map<string, { total: number; fees: number; refunds: number; net: number }>();
    for (const p of payments) {
      const month = p.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!byMonthMap.has(month)) {
        byMonthMap.set(month, { total: 0, fees: 0, refunds: 0, net: 0 });
      }
      const entry = byMonthMap.get(month)!;
      const fees = p.amount * 0.05;
      const refunds = p.refunds.reduce((sum, r) => sum + r.amount, 0);
      entry.total += p.amount;
      entry.fees += fees;
      entry.refunds += refunds;
      entry.net += p.amount - fees - refunds;
    }

    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue,
      totalFees,
      totalRefunds,
      netRevenue,
      byCurrency,
      byMonth,
    };
  }

  async count(criteria?: PaymentSearchCriteria): Promise<number> {
    const where = criteria?.where ? this.buildFilter(criteria.where) : {};
    return db.payment.count({ where });
  }

  async sumAmounts(filter?: PaymentFilter): Promise<number> {
    const where = filter ? this.buildFilter(filter) : {};
    const result = await db.payment.aggregate({
      where,
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await db.payment.count({ where: { id } });
    return count > 0;
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter?: PaymentFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter?.id) where.id = filter.id;
    if (filter?.bookingId) where.bookingId = filter.bookingId;
    if (filter?.userId) where.userId = filter.userId;
    
    if (filter?.status) {
      where.status = Array.isArray(filter.status) 
        ? { in: filter.status } 
        : filter.status;
    }
    if (filter?.type) {
      where.type = Array.isArray(filter.type) 
        ? { in: filter.type } 
        : filter.type;
    }
    if (filter?.method) {
      where.method = Array.isArray(filter.method) 
        ? { in: filter.method } 
        : filter.method;
    }
    if (filter?.currency) {
      where.currency = Array.isArray(filter.currency) 
        ? { in: filter.currency } 
        : filter.currency;
    }

    if (filter?.minAmount || filter?.maxAmount) {
      where.amount = {
        ...(filter.minAmount && { gte: filter.minAmount }),
        ...(filter.maxAmount && { lte: filter.maxAmount }),
      };
    }

    if (filter?.createdAfter || filter?.createdBefore) {
      where.createdAt = {
        ...(filter.createdAfter && { gte: filter.createdAfter }),
        ...(filter.createdBefore && { lte: filter.createdBefore }),
      };
    }

    if (filter?.processedAfter || filter?.processedBefore) {
      where.processedAt = {
        ...(filter.processedAfter && { gte: filter.processedAfter }),
        ...(filter.processedBefore && { lte: filter.processedBefore }),
      };
    }

    return where;
  }

  private mapToWithRelations(payment: Record<string, unknown>): PaymentWithRelations {
    return {
      id: payment.id as string,
      bookingId: payment.bookingId as string,
      userId: payment.userId as string,
      amount: payment.amount as number,
      currency: payment.currency as string,
      type: payment.type as string,
      method: payment.method as string,
      status: payment.status as string,
      transactionId: payment.transactionId as string | null | undefined,
      gatewayResponse: payment.gatewayResponse as Record<string, unknown> | null | undefined,
      processedAt: payment.processedAt as Date | null | undefined,
      failedAt: payment.failedAt as Date | null | undefined,
      refundedAt: payment.refundedAt as Date | null | undefined,
      createdAt: payment.createdAt as Date,
      updatedAt: payment.updatedAt as Date,
      booking: payment.booking as PaymentWithRelations['booking'],
      user: payment.user as PaymentWithRelations['user'],
      refunds: (payment.refunds as Refund[] | undefined)?.map(r => this.mapRefund(r)),
    };
  }

  private mapRefund(refund: Refund | Record<string, unknown>): RefundData {
    return {
      id: refund.id as string,
      paymentId: refund.paymentId as string,
      amount: refund.amount as number,
      currency: refund.currency as string,
      reason: refund.reason as string | null | undefined,
      status: refund.status as string,
      processedAt: refund.processedAt as Date | null | undefined,
      processedBy: refund.processedBy as string | null | undefined,
      createdAt: refund.createdAt as Date,
    };
  }
}

// ==================== Singleton Instance ====================

export const paymentRepository = new PaymentRepository();
