/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Mapper
 *
 * مسئول عن التحويل بين:
 * - Domain Entity (Payment) ↔ Persistence Model (Prisma Payment)
 * - Domain Entity (Payment) ↔ DTO (API Response)
 *
 * @module application/mappers/payment.mapper
 */

import { Payment, PaymentProps, PaymentError, PaymentStatus, PaymentMethod, PaymentType } from '@/core/domain/entities/Payment';
import { Money, Currency } from '@/core/domain/value-objects/Money';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import { ok, err, type Result } from '@/core/types/result';
import { BaseMapper, MapperError, parseJSON, dateToISO, isoToDate } from './base.mapper';

// ==================== Types ====================

/**
 * بيانات إنشاء الدفعة من API
 */
export interface PaymentCreateDTO {
  bookingId: string;
  userId: string;
  amount: number;
  currency: Currency;
  type: PaymentType;
  method?: PaymentMethod;
  idempotencyKey?: string;
}

/**
 * بيانات تحديث الدفعة من API
 */
export interface PaymentUpdateDTO {
  method?: PaymentMethod;
  cardInfo?: CardInfoDTO;
  bankInfo?: BankAccountInfoDTO;
  metadata?: Record<string, unknown>;
}

/**
 * معلومات البطاقة DTO
 */
export interface CardInfoDTO {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName?: string;
}

/**
 * معلومات الحساب البنكي DTO
 */
export interface BankAccountInfoDTO {
  bankName: string;
  accountLast4: string;
  accountHolder: string;
  routingNumber?: string;
}

/**
 * استجابة API للدفعة
 */
export interface PaymentResponseDTO {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: Currency;
  type: PaymentType;
  method: PaymentMethod | null;
  cardInfo: CardInfoDTO | null;
  bankInfo: BankAccountInfoDTO | null;
  status: PaymentStatus;
  gatewayName: string | null;
  gatewayTransactionId: string | null;
  refundedAmount: number;
  refundReason: string | null;
  refundedAt: Date | null;
  failureReason: string | null;
  failureCode: string | null;
  failedAt: Date | null;
  processedAt: Date | null;
  isCompleted: boolean;
  isFailed: boolean;
  isRefunded: boolean;
  canBeRefunded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * استجابة API للدفعة (مختصرة)
 */
export interface PaymentSummaryDTO {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  type: PaymentType;
  createdAt: Date;
}

// ==================== Prisma Types ====================

interface PrismaPaymentWithIncludes {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: Currency;
  type: PaymentType;
  method: PaymentMethod | null;
  cardInfo: string | null;
  bankInfo: string | null;
  status: PaymentStatus;
  gatewayName: string | null;
  gatewayTransactionId: string | null;
  gatewayResponse: string | null;
  refundedAmount: number;
  refundReason: string | null;
  refundedAt: Date | null;
  failureReason: string | null;
  failureCode: string | null;
  failedAt: Date | null;
  metadata: string | null;
  idempotencyKey: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// ==================== Mapper Class ====================

export class PaymentMapper extends BaseMapper<Payment, PaymentResponseDTO, PrismaPaymentWithIncludes, PaymentCreateDTO, PaymentUpdateDTO> {

  // ==================== To Domain ====================

  /**
   * تحويل Prisma Payment إلى Domain Entity
   */
  toDomain(prismaPayment: PrismaPaymentWithIncludes): Result<Payment, MapperError> {
    try {
      // إنشاء Money Value Objects
      const amountResult = Money.create({
        amount: prismaPayment.amount,
        currency: prismaPayment.currency,
      });

      if (amountResult.isFailure) {
        return err(MapperError.invalidData('amount', prismaPayment.amount, 'Invalid amount'));
      }

      const refundedAmountResult = Money.create({
        amount: prismaPayment.refundedAmount,
        currency: prismaPayment.currency,
      });

      const refundedAmount = refundedAmountResult.isSuccess
        ? refundedAmountResult.value
        : Money.zero(prismaPayment.currency);

      // Parse JSON fields
      const cardInfo = parseJSON<CardInfoDTO>(prismaPayment.cardInfo, null as unknown as CardInfoDTO);
      const bankInfo = parseJSON<BankAccountInfoDTO>(prismaPayment.bankInfo, null as unknown as BankAccountInfoDTO);
      const gatewayResponse = parseJSON<Record<string, unknown>>(prismaPayment.gatewayResponse, null);
      const metadata = parseJSON<Record<string, unknown>>(prismaPayment.metadata, null);

      // إنشاء Payment Props
      const props: PaymentProps = {
        id: new UniqueEntityId(prismaPayment.id),
        bookingId: prismaPayment.bookingId,
        userId: prismaPayment.userId,
        amount: amountResult.value,
        currency: prismaPayment.currency,
        type: prismaPayment.type,
        method: prismaPayment.method,
        cardInfo: cardInfo || null,
        bankInfo: bankInfo || null,
        status: prismaPayment.status,
        gatewayName: prismaPayment.gatewayName,
        gatewayTransactionId: prismaPayment.gatewayTransactionId,
        gatewayResponse: gatewayResponse ? {
          transactionId: (gatewayResponse.transactionId as string) || '',
          status: (gatewayResponse.status as string) || '',
          message: gatewayResponse.message as string | undefined,
          code: gatewayResponse.code as string | undefined,
          raw: gatewayResponse.raw as Record<string, unknown> | undefined,
          processedAt: new Date(),
        } : null,
        refundedAmount,
        refundReason: prismaPayment.refundReason,
        refundedAt: prismaPayment.refundedAt,
        failureReason: prismaPayment.failureReason,
        failureCode: prismaPayment.failureCode,
        failedAt: prismaPayment.failedAt,
        metadata,
        idempotencyKey: prismaPayment.idempotencyKey,
        processedAt: prismaPayment.processedAt,
        createdAt: prismaPayment.createdAt,
        updatedAt: prismaPayment.updatedAt,
        version: prismaPayment.version,
      };

      // إعادة بناء الـ Entity
      return ok(Payment.reconstitute(props));
    } catch (error) {
      return err(MapperError.conversionFailed('PrismaPayment', 'Payment', String(error)));
    }
  }

  // ==================== To Persistence ====================

  /**
   * تحويل Domain Entity إلى بيانات Prisma
   */
  toPersistence(payment: Payment): Record<string, unknown> {
    return {
      id: payment.idValue,
      bookingId: payment.bookingId,
      userId: payment.userId,
      amount: payment.amount.amount,
      currency: payment.currency,
      type: payment.getProps().type,
      method: payment.method,
      cardInfo: payment.getProps().cardInfo ? JSON.stringify(payment.getProps().cardInfo) : null,
      bankInfo: payment.getProps().bankInfo ? JSON.stringify(payment.getProps().bankInfo) : null,
      status: payment.status,
      gatewayName: payment.getProps().gatewayName,
      gatewayTransactionId: payment.getProps().gatewayTransactionId,
      gatewayResponse: payment.getProps().gatewayResponse ? JSON.stringify(payment.getProps().gatewayResponse) : null,
      refundedAmount: payment.refundedAmount.amount,
      refundReason: payment.getProps().refundReason,
      refundedAt: payment.getProps().refundedAt,
      failureReason: payment.getProps().failureReason,
      failureCode: payment.getProps().failureCode,
      failedAt: payment.getProps().failedAt,
      metadata: payment.getProps().metadata ? JSON.stringify(payment.getProps().metadata) : null,
      idempotencyKey: payment.getProps().idempotencyKey,
      processedAt: payment.getProps().processedAt,
      version: payment.version,
    };
  }

  /**
   * تحويل DTO للإنشاء إلى بيانات Prisma
   */
  createDTOToPersistence(dto: PaymentCreateDTO): Record<string, unknown> {
    return {
      bookingId: dto.bookingId,
      userId: dto.userId,
      amount: dto.amount,
      currency: dto.currency,
      type: dto.type,
      method: dto.method || null,
      cardInfo: null,
      bankInfo: null,
      status: 'pending',
      gatewayName: null,
      gatewayTransactionId: null,
      gatewayResponse: null,
      refundedAmount: 0,
      refundReason: null,
      refundedAt: null,
      failureReason: null,
      failureCode: null,
      failedAt: null,
      metadata: null,
      idempotencyKey: dto.idempotencyKey || null,
      processedAt: null,
    };
  }

  /**
   * تحويل DTO للتحديث إلى بيانات Prisma
   */
  updateDTOToPersistence(dto: PaymentUpdateDTO): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (dto.method !== undefined) data.method = dto.method;
    if (dto.cardInfo !== undefined) data.cardInfo = dto.cardInfo ? JSON.stringify(dto.cardInfo) : null;
    if (dto.bankInfo !== undefined) data.bankInfo = dto.bankInfo ? JSON.stringify(dto.bankInfo) : null;
    if (dto.metadata !== undefined) data.metadata = dto.metadata ? JSON.stringify(dto.metadata) : null;

    return data;
  }

  // ==================== To DTO ====================

  /**
   * تحويل Domain Entity إلى Response DTO
   */
  toDTO(payment: Payment): PaymentResponseDTO {
    return {
      id: payment.idValue,
      bookingId: payment.bookingId,
      userId: payment.userId,
      amount: payment.amount.amount,
      currency: payment.currency,
      type: payment.getProps().type,
      method: payment.method,
      cardInfo: payment.getProps().cardInfo,
      bankInfo: payment.getProps().bankInfo,
      status: payment.status,
      gatewayName: payment.getProps().gatewayName,
      gatewayTransactionId: payment.getProps().gatewayTransactionId,
      refundedAmount: payment.refundedAmount.amount,
      refundReason: payment.getProps().refundReason,
      refundedAt: payment.getProps().refundedAt,
      failureReason: payment.getProps().failureReason,
      failureCode: payment.getProps().failureCode,
      failedAt: payment.getProps().failedAt,
      processedAt: payment.getProps().processedAt,
      isCompleted: payment.isCompleted,
      isFailed: payment.isFailed,
      isRefunded: payment.isRefunded,
      canBeRefunded: payment.canBeRefunded,
      createdAt: payment.getProps().createdAt,
      updatedAt: payment.getProps().updatedAt,
    };
  }

  /**
   * تحويل Domain Entity إلى Summary DTO
   */
  toSummaryDTO(payment: Payment): PaymentSummaryDTO {
    return {
      id: payment.idValue,
      amount: payment.amount.amount,
      currency: payment.currency,
      status: payment.status,
      type: payment.getProps().type,
      createdAt: payment.getProps().createdAt,
    };
  }

  /**
   * تحويل Prisma Payment مباشرة إلى Response DTO
   */
  prismaToDTO(prismaPayment: PrismaPaymentWithIncludes): PaymentResponseDTO {
    const result = this.toDomain(prismaPayment);
    if (result.isFailure) {
      throw result.error;
    }
    return this.toDTO(result.value);
  }

  /**
   * حساب إجمالي المبالغ
   */
  static calculateTotals(payments: PaymentResponseDTO[]): {
    total: number;
    completed: number;
    refunded: number;
    pending: number;
    failed: number;
  } {
    return payments.reduce((acc, p) => {
      acc.total += p.amount;
      if (p.status === 'completed') acc.completed += p.amount;
      if (p.isRefunded) acc.refunded += p.refundedAmount;
      if (p.status === 'pending' || p.status === 'processing') acc.pending += p.amount;
      if (p.isFailed) acc.failed += p.amount;
      return acc;
    }, { total: 0, completed: 0, refunded: 0, pending: 0, failed: 0 });
  }
}
