/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow Mapper
 *
 * مسئول عن التحويل بين:
 * - Domain Entity (Escrow) ↔ Persistence Model (Prisma Escrow)
 * - Domain Entity (Escrow) ↔ DTO (API Response)
 *
 * @module application/mappers/escrow.mapper
 */

import { Escrow, EscrowProps, EscrowError, EscrowStatus, EscrowType } from '@/core/domain/entities/Escrow';
import { Money, Currency } from '@/core/domain/value-objects/Money';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';
import { BaseMapper, MapperError, parseJSON, dateToISO, isoToDate } from './base.mapper';

// ==================== Types ====================

/**
 * بيانات إنشاء الضمان من API
 */
export interface EscrowCreateDTO {
  bookingId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: Currency;
  type?: EscrowType;
  conditions?: ReleaseConditionsDTO;
  notes?: string;
}

/**
 * شروط الإفراج DTO
 */
export interface ReleaseConditionsDTO {
  releaseAfterDays: number;
  autoRelease: boolean;
  requireBothParties: boolean;
  allowEarlyRelease: boolean;
}

/**
 * طرف الضمان DTO
 */
export interface EscrowPartyDTO {
  userId: string;
  role: 'payer' | 'payee';
  agreedAt: Date | null;
  releasedAt: Date | null;
}

/**
 * معاملة الضمان DTO
 */
export interface EscrowTransactionDTO {
  id: string;
  type: 'hold' | 'release' | 'refund' | 'partial' | 'dispute_hold';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  description?: string;
}

/**
 * استجابة API للضمان
 */
export interface EscrowResponseDTO {
  id: string;
  bookingId: string;
  payerId: string;
  payeeId: string;
  type: EscrowType;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  currency: Currency;
  status: EscrowStatus;
  parties: EscrowPartyDTO[];
  conditions: ReleaseConditionsDTO;
  holdAt: Date | null;
  releaseAt: Date | null;
  autoReleaseAt: Date | null;
  refundedAt: Date | null;
  disputeId: string | null;
  disputedAt: Date | null;
  transactions: EscrowTransactionDTO[];
  notes: string | null;
  isHeld: boolean;
  isReleased: boolean;
  isRefunded: boolean;
  isInDispute: boolean;
  availableForRelease: number;
  autoReleaseDue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للضمان (مختصرة)
 */
export interface EscrowSummaryDTO {
  id: string;
  bookingId: string;
  totalAmount: number;
  currency: Currency;
  status: EscrowStatus;
  isHeld: boolean;
  createdAt: Date;
}

// ==================== Prisma Types ====================

interface PrismaEscrowWithIncludes {
  id: string;
  bookingId: string;
  payerId: string;
  payeeId: string;
  type: EscrowType;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  currency: Currency;
  status: EscrowStatus;
  parties: string | null;
  conditions: string | null;
  holdAt: Date | null;
  releaseAt: Date | null;
  autoReleaseAt: Date | null;
  refundedAt: Date | null;
  disputeId: string | null;
  disputedAt: Date | null;
  transactions: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// ==================== Mapper Class ====================

export class EscrowMapper extends BaseMapper<Escrow, EscrowResponseDTO, PrismaEscrowWithIncludes, EscrowCreateDTO, never> {

  // ==================== To Domain ====================

  /**
   * تحويل Prisma Escrow إلى Domain Entity
   */
  toDomain(prismaEscrow: PrismaEscrowWithIncludes): Result<Escrow, MapperError> {
    try {
      // إنشاء Money Value Objects
      const totalAmountResult = Money.create({
        amount: prismaEscrow.totalAmount,
        currency: prismaEscrow.currency,
      });

      if (totalAmountResult.isFailure) {
        return err(MapperError.invalidData('totalAmount', prismaEscrow.totalAmount, 'Invalid amount'));
      }

      const heldAmountResult = Money.create({
        amount: prismaEscrow.heldAmount,
        currency: prismaEscrow.currency,
      });

      const releasedAmountResult = Money.create({
        amount: prismaEscrow.releasedAmount,
        currency: prismaEscrow.currency,
      });

      const refundedAmountResult = Money.create({
        amount: prismaEscrow.refundedAmount,
        currency: prismaEscrow.currency,
      });

      // Parse JSON fields
      const defaultConditions: ReleaseConditionsDTO = {
        releaseAfterDays: 1,
        autoRelease: true,
        requireBothParties: false,
        allowEarlyRelease: true,
      };

      const parties = parseJSON<EscrowPartyDTO[]>(prismaEscrow.parties, [
        { userId: prismaEscrow.payerId, role: 'payer', agreedAt: null, releasedAt: null },
        { userId: prismaEscrow.payeeId, role: 'payee', agreedAt: null, releasedAt: null },
      ]);

      const conditions = parseJSON<ReleaseConditionsDTO>(prismaEscrow.conditions, defaultConditions);
      const transactions = parseJSON<EscrowTransactionDTO[]>(prismaEscrow.transactions, []);

      // إنشاء Escrow Props
      const props: EscrowProps = {
        id: new UniqueEntityId(prismaEscrow.id),
        bookingId: prismaEscrow.bookingId,
        payerId: prismaEscrow.payerId,
        payeeId: prismaEscrow.payeeId,
        type: prismaEscrow.type,
        totalAmount: totalAmountResult.value,
        heldAmount: heldAmountResult.isSuccess ? heldAmountResult.value : Money.zero(prismaEscrow.currency),
        releasedAmount: releasedAmountResult.isSuccess ? releasedAmountResult.value : Money.zero(prismaEscrow.currency),
        refundedAmount: refundedAmountResult.isSuccess ? refundedAmountResult.value : Money.zero(prismaEscrow.currency),
        currency: prismaEscrow.currency,
        status: prismaEscrow.status,
        parties: parties.map(p => ({
          userId: p.userId,
          role: p.role,
          agreedAt: p.agreedAt ? new Date(p.agreedAt) : null,
          releasedAt: p.releasedAt ? new Date(p.releasedAt) : null,
        })),
        conditions: {
          releaseAfterDays: conditions.releaseAfterDays ?? 1,
          autoRelease: conditions.autoRelease ?? true,
          requireBothParties: conditions.requireBothParties ?? false,
          allowEarlyRelease: conditions.allowEarlyRelease ?? true,
        },
        holdAt: prismaEscrow.holdAt,
        releaseAt: prismaEscrow.releaseAt,
        autoReleaseAt: prismaEscrow.autoReleaseAt,
        refundedAt: prismaEscrow.refundedAt,
        disputeId: prismaEscrow.disputeId,
        disputedAt: prismaEscrow.disputedAt,
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: Money.create({ amount: t.amount, currency: prismaEscrow.currency }).value!,
          status: t.status,
          createdAt: new Date(t.createdAt),
          description: t.description,
        })),
        notes: prismaEscrow.notes,
        createdAt: prismaEscrow.createdAt,
        updatedAt: prismaEscrow.updatedAt,
        version: prismaEscrow.version,
      };

      // إعادة بناء الـ Entity
      return ok(Escrow.reconstitute(props));
    } catch (error) {
      return err(MapperError.conversionFailed('PrismaEscrow', 'Escrow', String(error)));
    }
  }

  // ==================== To Persistence ====================

  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  toPersistence(escrow: Escrow): Record<string, unknown> {
    return {
      id: escrow.idValue,
      bookingId: escrow.bookingId,
      payerId: escrow.payerId,
      payeeId: escrow.payeeId,
      type: escrow.type,
      totalAmount: escrow.totalAmount.amount,
      heldAmount: escrow.heldAmount.amount,
      releasedAmount: escrow.releasedAmount.amount,
      refundedAmount: escrow.refundedAmount.amount,
      currency: escrow.currency,
      status: escrow.status,
      parties: JSON.stringify(escrow.getProps().parties),
      conditions: JSON.stringify(escrow.getProps().conditions),
      holdAt: escrow.getProps().holdAt,
      releaseAt: escrow.getProps().releaseAt,
      autoReleaseAt: escrow.getProps().autoReleaseAt,
      refundedAt: escrow.getProps().refundedAt,
      disputeId: escrow.getProps().disputeId,
      disputedAt: escrow.getProps().disputedAt,
      transactions: JSON.stringify(escrow.getProps().transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.amount,
        status: t.status,
        createdAt: t.createdAt,
        description: t.description,
      }))),
      notes: escrow.notes,
      version: escrow.version,
    };
  }

  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  createDTOToPersistence(dto: EscrowCreateDTO): Record<string, unknown> {
    const defaultConditions: ReleaseConditionsDTO = {
      releaseAfterDays: 1,
      autoRelease: true,
      requireBothParties: false,
      allowEarlyRelease: true,
    };

    return {
      bookingId: dto.bookingId,
      payerId: dto.payerId,
      payeeId: dto.payeeId,
      type: dto.type || 'booking',
      totalAmount: dto.amount,
      heldAmount: 0,
      releasedAmount: 0,
      refundedAmount: 0,
      currency: dto.currency,
      status: 'pending',
      parties: JSON.stringify([
        { userId: dto.payerId, role: 'payer', agreedAt: null, releasedAt: null },
        { userId: dto.payeeId, role: 'payee', agreedAt: null, releasedAt: null },
      ]),
      conditions: JSON.stringify({ ...defaultConditions, ...dto.conditions }),
      holdAt: null,
      releaseAt: null,
      autoReleaseAt: null,
      refundedAt: null,
      disputeId: null,
      disputedAt: null,
      transactions: JSON.stringify([]),
      notes: dto.notes || null,
    };
  }

  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  updateDTOToPersistence(_dto: never): Record<string, unknown> {
    // Escrow لا يدعم التحديث العادي
    return {};
  }

  // ==================== To DTO ====================

  /**
   * تحويل Domain Entity إلى Response DTO
   */
  toDTO(escrow: Escrow): EscrowResponseDTO {
    return {
      id: escrow.idValue,
      bookingId: escrow.bookingId,
      payerId: escrow.payerId,
      payeeId: escrow.payeeId,
      type: escrow.type,
      totalAmount: escrow.totalAmount.amount,
      heldAmount: escrow.heldAmount.amount,
      releasedAmount: escrow.releasedAmount.amount,
      refundedAmount: escrow.refundedAmount.amount,
      currency: escrow.currency,
      status: escrow.status,
      parties: escrow.getProps().parties.map(p => ({
        userId: p.userId,
        role: p.role,
        agreedAt: p.agreedAt,
        releasedAt: p.releasedAt,
      })),
      conditions: escrow.getProps().conditions as ReleaseConditionsDTO,
      holdAt: escrow.getProps().holdAt,
      releaseAt: escrow.getProps().releaseAt,
      autoReleaseAt: escrow.getProps().autoReleaseAt,
      refundedAt: escrow.getProps().refundedAt,
      disputeId: escrow.getProps().disputeId,
      disputedAt: escrow.getProps().disputedAt,
      transactions: escrow.getProps().transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.amount,
        status: t.status,
        createdAt: t.createdAt,
        description: t.description,
      })),
      notes: escrow.notes,
      isHeld: escrow.isHeld,
      isReleased: escrow.isReleased,
      isRefunded: escrow.isRefunded,
      isInDispute: escrow.isInDispute,
      availableForRelease: escrow.availableForRelease.amount,
      autoReleaseDue: escrow.autoReleaseDue,
      createdAt: escrow.getProps().createdAt,
      updatedAt: escrow.getProps().updatedAt,
    };
  }

  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  toSummaryDTO(escrow: Escrow): EscrowSummaryDTO {
    return {
      id: escrow.idValue,
      bookingId: escrow.bookingId,
      totalAmount: escrow.totalAmount.amount,
      currency: escrow.currency,
      status: escrow.status,
      isHeld: escrow.isHeld,
      createdAt: escrow.getProps().createdAt,
    };
  }

  /**
   * تحويل Prisma Escrow مباشرة إلى Response DTO
   */
  prismaToDTO(prismaEscrow: PrismaEscrowWithIncludes): EscrowResponseDTO {
    const result = this.toDomain(prismaEscrow);
    if (result.isFailure) {
      throw result.error;
    }
    return this.toDTO(result.value);
  }

  /**
   * حساب إحصائيات الضمان
   */
  static calculateStats(escrows: EscrowResponseDTO[]): {
    total: number;
    totalHeld: number;
    totalReleased: number;
    totalRefunded: number;
    pendingRelease: number;
    byStatus: Record<EscrowStatus, number>;
  } {
    const byStatus: Record<EscrowStatus, number> = {} as Record<EscrowStatus, number>;
    let totalHeld = 0;
    let totalReleased = 0;
    let totalRefunded = 0;
    let pendingRelease = 0;

    for (const e of escrows) {
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      totalHeld += e.heldAmount;
      totalReleased += e.releasedAmount;
      totalRefunded += e.refundedAmount;
      pendingRelease += e.availableForRelease;
    }

    return {
      total: escrows.length,
      totalHeld,
      totalReleased,
      totalRefunded,
      pendingRelease,
      byStatus,
    };
  }
}
