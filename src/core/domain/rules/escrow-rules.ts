/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow Rules - قواعد الضمان
 * 
 * تحتوي على القواعد المنطقية لإدارة حسابات الضمان.
 * 
 * @module core/domain/rules/escrow-rules
 */

import { Money, Currency } from '../value-objects/Money';
import type { Result } from '../../types/result';
import { ok, err, ValidationError, BusinessError } from '../../types/result';

// ==================== Types ====================

/**
 * حالة الضمان
 */
export type EscrowStatus = 'pending' | 'held' | 'partial_release' | 'released' | 'refunded' | 'disputed' | 'cancelled';

/**
 * نوع الإفراج
 */
export type ReleaseType = 'auto' | 'manual' | 'early' | 'disputed';

/**
 * معايير الإفراج
 */
export interface ReleaseCriteria {
  escrowStatus: EscrowStatus;
  bookingStatus: 'completed' | 'cancelled' | 'in_progress';
  holdDuration: number; // بالأيام
  hasDispute: boolean;
  agreedParties: ('payer' | 'payee')[];
  amount: Money;
}

/**
 * نتيجة التحقق من الإفراج
 */
export interface ReleaseValidationResult {
  canRelease: boolean;
  reasons: string[];
  releaseType?: ReleaseType;
  releaseDate?: Date;
  warnings?: string[];
}

/**
 * قواعد الإفراج
 */
export interface ReleaseRules {
  minHoldDays: number;
  maxHoldDays: number;
  autoReleaseDays: number;
  earlyReleaseAllowed: boolean;
  disputeHoldDays: number;
}

/**
 * تكوين الضمان
 */
export interface EscrowConfig {
  platformFeePercent: number;
  minEscrowAmount: number;
  maxEscrowAmount: number;
  autoReleaseEnabled: boolean;
  disputeResolutionDays: number;
}

// ==================== Constants ====================

export const DEFAULT_ESCROW_CONFIG: EscrowConfig = {
  platformFeePercent: 5, // 5%
  minEscrowAmount: 100, // الحد الأدنى
  maxEscrowAmount: 10000000, // الحد الأقصى
  autoReleaseEnabled: true,
  disputeResolutionDays: 14,
};

export const DEFAULT_RELEASE_RULES: ReleaseRules = {
  minHoldDays: 0,
  maxHoldDays: 90,
  autoReleaseDays: 1, // يوم واحد بعد إكمال الحجز
  earlyReleaseAllowed: true,
  disputeHoldDays: 30,
};

// ==================== Escrow Rules Class ====================

/**
 * محرك قواعد الضمان
 */
export class EscrowRulesEngine {
  private config: EscrowConfig;
  private rules: ReleaseRules;

  constructor(
    config: Partial<EscrowConfig> = {},
    rules: Partial<ReleaseRules> = {}
  ) {
    this.config = { ...DEFAULT_ESCROW_CONFIG, ...config };
    this.rules = { ...DEFAULT_RELEASE_RULES, ...rules };
  }

  /**
   * التحقق من إمكانية إنشاء الضمان
   */
  canCreateEscrow(amount: Money): Result<void, ValidationError> {
    if (amount.isNegative || amount.isZero) {
      return err(new ValidationError('Escrow amount must be positive', 'amount'));
    }

    if (amount.amount < this.config.minEscrowAmount) {
      return err(new ValidationError(
        `Minimum escrow amount is ${this.config.minEscrowAmount}`,
        'amount'
      ));
    }

    if (amount.amount > this.config.maxEscrowAmount) {
      return err(new ValidationError(
        `Maximum escrow amount is ${this.config.maxEscrowAmount}`,
        'amount'
      ));
    }

    return ok(undefined);
  }

  /**
   * التحقق من إمكانية الإفراج
   */
  canRelease(criteria: ReleaseCriteria): ReleaseValidationResult {
    const reasons: string[] = [];
    const warnings: string[] = [];

    // التحقق من الحالة
    if (!['held', 'partial_release'].includes(criteria.escrowStatus)) {
      reasons.push(`Escrow status '${criteria.escrowStatus}' does not allow release`);
    }

    // التحقق من النزاع
    if (criteria.hasDispute) {
      reasons.push('Cannot release while escrow is in dispute');
    }

    // التحقق من مدة الحجز
    if (criteria.holdDuration < this.rules.minHoldDays) {
      reasons.push(`Minimum hold period is ${this.rules.minHoldDays} days`);
    }

    // التحقق من حالة الحجز
    if (criteria.bookingStatus === 'in_progress') {
      warnings.push('Booking is still in progress');
    }

    // التحقق من المبلغ
    if (criteria.amount.isZero) {
      reasons.push('No amount available for release');
    }

    // تحديد نوع الإفراج
    let releaseType: ReleaseType | undefined;
    if (reasons.length === 0) {
      if (criteria.holdDuration >= this.rules.autoReleaseDays && criteria.bookingStatus === 'completed') {
        releaseType = 'auto';
      } else if (criteria.holdDuration < this.rules.autoReleaseDays && criteria.agreedParties.length === 2) {
        releaseType = 'early';
      } else {
        releaseType = 'manual';
      }
    }

    return {
      canRelease: reasons.length === 0,
      reasons,
      releaseType,
      releaseDate: reasons.length === 0 ? new Date() : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * التحقق من إمكانية الاسترداد
   */
  canRefund(
    escrowStatus: EscrowStatus,
    bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress',
    hasDispute: boolean
  ): ReleaseValidationResult {
    const reasons: string[] = [];

    if (!['held', 'partial_release'].includes(escrowStatus)) {
      reasons.push(`Cannot refund from status '${escrowStatus}'`);
    }

    if (hasDispute) {
      reasons.push('Cannot refund while in dispute');
    }

    if (bookingStatus === 'in_progress') {
      reasons.push('Cannot refund while booking is in progress');
    }

    if (bookingStatus === 'completed') {
      reasons.push('Cannot refund after booking is completed');
    }

    return {
      canRelease: reasons.length === 0,
      reasons,
    };
  }

  /**
   * حساب رسوم المنصة
   */
  calculatePlatformFee(amount: Money): Money {
    const fee = amount.multiply(this.config.platformFeePercent / 100);
    return fee.isSuccess ? fee.value : Money.zero(amount.currency);
  }

  /**
   * حساب مبلغ الإفراج الصافي
   */
  calculateNetRelease(amount: Money): { gross: Money; fee: Money; net: Money } {
    const fee = this.calculatePlatformFee(amount);
    const net = amount.subtract(fee);
    
    return {
      gross: amount,
      fee,
      net: net.isSuccess ? net.value : amount,
    };
  }

  /**
   * حساب تاريخ الإفراج التلقائي
   */
  calculateAutoReleaseDate(holdDate: Date, bookingCompletedAt: Date): Date {
    const baseDate = bookingCompletedAt > holdDate ? bookingCompletedAt : holdDate;
    return new Date(baseDate.getTime() + this.rules.autoReleaseDays * 24 * 60 * 60 * 1000);
  }

  /**
   * التحقق من استحقاق الإفراج التلقائي
   */
  isAutoReleaseDue(holdDate: Date, bookingCompletedAt: Date): boolean {
    if (!this.config.autoReleaseEnabled) return false;
    
    const autoReleaseDate = this.calculateAutoReleaseDate(holdDate, bookingCompletedAt);
    return new Date() >= autoReleaseDate;
  }

  /**
   * التحقق من صحة الموافقة المتبادلة
   */
  validateMutualAgreement(
    payerAgreed: boolean,
    payeeAgreed: boolean,
    requireBoth: boolean
  ): { isValid: boolean; missingParties: string[] } {
    const missingParties: string[] = [];

    if (requireBoth) {
      if (!payerAgreed) missingParties.push('payer');
      if (!payeeAgreed) missingParties.push('payee');
    }

    return {
      isValid: requireBoth ? missingParties.length === 0 : (payerAgreed || payeeAgreed),
      missingParties,
    };
  }

  /**
   * تقسيم المبلغ في حالة الإفراج الجزئي
   */
  calculatePartialRelease(
    totalAmount: Money,
    releasePercentage: number,
    holdPercentage: number
  ): { releaseAmount: Money; holdAmount: Money } {
    const releaseAmount = totalAmount.multiply(releasePercentage / 100);
    const holdAmount = totalAmount.multiply(holdPercentage / 100);

    return {
      releaseAmount: releaseAmount.isSuccess ? releaseAmount.value : Money.zero(totalAmount.currency),
      holdAmount: holdAmount.isSuccess ? holdAmount.value : Money.zero(totalAmount.currency),
    };
  }

  /**
   * التحقق من انتهاء صلاحية الضمان
   */
  isEscrowExpired(createdAt: Date): boolean {
    const maxAge = this.rules.maxHoldDays + this.rules.disputeHoldDays;
    const expiryDate = new Date(createdAt.getTime() + maxAge * 24 * 60 * 60 * 1000);
    return new Date() > expiryDate;
  }
}

// ==================== Helper Functions ====================

/**
 * إنشاء محرك قواعد افتراضي
 */
export function createEscrowRulesEngine(
  config?: Partial<EscrowConfig>,
  rules?: Partial<ReleaseRules>
): EscrowRulesEngine {
  return new EscrowRulesEngine(config, rules);
}

/**
 * التحقق السريع من إمكانية الإفراج
 */
export function canReleaseEscrow(criteria: ReleaseCriteria): boolean {
  const engine = new EscrowRulesEngine();
  return engine.canRelease(criteria).canRelease;
}

/**
 * حساب الرسوم السريع
 */
export function calculateFee(amount: Money, feePercent: number = 5): Money {
  const fee = amount.multiply(feePercent / 100);
  return fee.isSuccess ? fee.value : Money.zero(amount.currency);
}
