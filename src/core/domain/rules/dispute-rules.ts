/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Dispute Rules - قواعد النزاعات
 * 
 * تحتوي على القواعد المنطقية لإدارة النزاعات.
 * 
 * @module core/domain/rules/dispute-rules
 */

import { Money, Currency } from '../value-objects/Money';
import type { Result } from '../../types/result';
import { ok, err, ValidationError, BusinessError } from '../../types/result';

// ==================== Types ====================

/**
 * حالة النزاع
 */
export type DisputeStatus = 
  | 'pending'       // في انتظار المراجعة
  | 'under_review'  // قيد المراجعة
  | 'escalated'     // تصعيد
  | 'resolved'      // تم الحل
  | 'closed';       // مغلق

/**
 * نوع النزاع
 */
export type DisputeType = 
  | 'service_quality'  // جودة الخدمة
  | 'listing_not_as_described' // الإقامة مختلفة
  | 'host_issue'       // مشكلة مع المضيف
  | 'guest_issue'      // مشكلة مع الضيف
  | 'payment_issue'    // مشكلة دفع
  | 'cancellation'     // إلغاء
  | 'damage'           // أضرار
  | 'safety'           // سلامة
  | 'other';           // أخرى

/**
 * من فتح النزاع
 */
export type DisputeInitiator = 'guest' | 'host' | 'platform' | 'system';

/**
 * نتيجة النزاع
 */
export type DisputeOutcome = 
  | 'favor_guest'      // لصالح الضيف
  | 'favor_host'       // لصالح المضيف
  | 'split'            // تقسيم
  | 'no_action'        // لا إجراء
  | 'mutual_agreement'; // اتفاق متبادل

/**
 * أولوية النزاع
 */
export type DisputePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * معايير النزاع
 */
export interface DisputeCriteria {
  type: DisputeType;
  initiator: DisputeInitiator;
  amount: Money;
  bookingStatus: string;
  hasEvidence: boolean;
  evidenceCount: number;
  priorDisputes: number;
  responseTime?: number; // ساعات
}

/**
 * قرار النزاع
 */
export interface DisputeDecision {
  outcome: DisputeOutcome;
  guestAmount: Money;
  hostAmount: Money;
  platformCompensation?: Money;
  reason: string;
  evidenceConsidered: string[];
  decidedAt: Date;
  decidedBy: string;
  appealDeadline?: Date;
}

/**
 * قواعد النزاع
 */
export interface DisputeRules {
  maxResolutionDays: number;
  maxEscalationDays: number;
  appealWindowDays: number;
  autoResolveDays: number;
  minEvidenceCount: number;
  maxEvidenceCount: number;
  maxResponseTimeHours: number;
}

/**
 * تكوين النزاع
 */
export interface DisputeConfig {
  autoResolveEnabled: boolean;
  platformInterventionThreshold: number; // قيمة بالعملة
  urgentThreshold: number;
  maxCompensationAmount: number;
  evidenceRequired: boolean;
}

// ==================== Constants ====================

export const DEFAULT_DISPUTE_CONFIG: DisputeConfig = {
  autoResolveEnabled: false,
  platformInterventionThreshold: 10000,
  urgentThreshold: 50000,
  maxCompensationAmount: 100000,
  evidenceRequired: true,
};

export const DEFAULT_DISPUTE_RULES: DisputeRules = {
  maxResolutionDays: 14,
  maxEscalationDays: 7,
  appealWindowDays: 7,
  autoResolveDays: 30,
  minEvidenceCount: 1,
  maxEvidenceCount: 20,
  maxResponseTimeHours: 48,
};

// ==================== Priority Matrix ====================

const PRIORITY_MATRIX: Record<DisputeType, { 
  base: DisputePriority;
  factors: Record<string, DisputePriority> 
}> = {
  safety: { base: 'urgent', factors: {} },
  damage: { base: 'high', factors: { high_value: 'urgent' } },
  payment_issue: { base: 'high', factors: { large_amount: 'urgent' } },
  service_quality: { base: 'normal', factors: { multiple_complaints: 'high' } },
  listing_not_as_described: { base: 'normal', factors: { misleading: 'high' } },
  host_issue: { base: 'normal', factors: { unresponsive: 'high' } },
  guest_issue: { base: 'normal', factors: { property_damage: 'high' } },
  cancellation: { base: 'low', factors: { last_minute: 'normal' } },
  other: { base: 'low', factors: {} },
};

// ==================== Dispute Rules Engine ====================

/**
 * محرك قواعد النزاعات
 */
export class DisputeRulesEngine {
  private config: DisputeConfig;
  private rules: DisputeRules;

  constructor(
    config: Partial<DisputeConfig> = {},
    rules: Partial<DisputeRules> = {}
  ) {
    this.config = { ...DEFAULT_DISPUTE_CONFIG, ...config };
    this.rules = { ...DEFAULT_DISPUTE_RULES, ...rules };
  }

  /**
   * التحقق من إمكانية فتح نزاع
   */
  canOpenDispute(criteria: DisputeCriteria): Result<void, ValidationError> {
    // التحقق من المبلغ
    if (criteria.amount.isNegative) {
      return err(new ValidationError('Dispute amount cannot be negative', 'amount'));
    }

    // التحقق من حالة الحجز
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(criteria.bookingStatus)) {
      return err(new ValidationError(
        `Cannot open dispute for booking with status '${criteria.bookingStatus}'`,
        'bookingStatus'
      ));
    }

    // التحقق من الأدلة
    if (this.config.evidenceRequired && criteria.evidenceCount < this.rules.minEvidenceCount) {
      return err(new ValidationError(
        `At least ${this.rules.minEvidenceCount} evidence item(s) required`,
        'evidence'
      ));
    }

    return ok(undefined);
  }

  /**
   * تحديد أولوية النزاع
   */
  determinePriority(criteria: DisputeCriteria): DisputePriority {
    const matrix = PRIORITY_MATRIX[criteria.type] || PRIORITY_MATRIX.other;
    let priority = matrix.base;

    // تطبيق العوامل
    if (criteria.amount.amount >= this.config.urgentThreshold) {
      priority = 'urgent';
    } else if (criteria.amount.amount >= this.config.platformInterventionThreshold) {
      if (priority === 'low') priority = 'normal';
      else if (priority === 'normal') priority = 'high';
    }

    // النزاعات السابقة
    if (criteria.priorDisputes > 2) {
      if (priority !== 'urgent') {
        const levels: DisputePriority[] = ['low', 'normal', 'high', 'urgent'];
        const currentIndex = levels.indexOf(priority);
        priority = levels[Math.min(currentIndex + 1, levels.length - 1)];
      }
    }

    return priority;
  }

  /**
   * التحقق من إمكانية التصعيد
   */
  canEscalate(
    status: DisputeStatus,
    createdAt: Date,
    reason: string
  ): { canEscalate: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (status === 'escalated') {
      reasons.push('Dispute is already escalated');
    }

    if (status === 'resolved' || status === 'closed') {
      reasons.push('Cannot escalate resolved or closed disputes');
    }

    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > this.rules.maxEscalationDays) {
      reasons.push(`Escalation window has passed (${this.rules.maxEscalationDays} days)`);
    }

    if (!reason || reason.trim().length === 0) {
      reasons.push('Escalation reason is required');
    }

    return {
      canEscalate: reasons.length === 0,
      reasons,
    };
  }

  /**
   * التحقق من صلاحية الطعن
   */
  canAppeal(
    status: DisputeStatus,
    decidedAt: Date,
    hasAppealed: boolean
  ): { canAppeal: boolean; deadline: Date | null; reasons: string[] } {
    const reasons: string[] = [];
    let deadline: Date | null = null;

    if (status !== 'resolved') {
      reasons.push('Only resolved disputes can be appealed');
    }

    if (hasAppealed) {
      reasons.push('Dispute has already been appealed');
    }

    const appealDeadline = new Date(
      decidedAt.getTime() + this.rules.appealWindowDays * 24 * 60 * 60 * 1000
    );

    if (new Date() > appealDeadline) {
      reasons.push('Appeal window has closed');
    } else {
      deadline = appealDeadline;
    }

    return {
      canAppeal: reasons.length === 0,
      deadline,
      reasons,
    };
  }

  /**
   * حساب تقسيم المبلغ
   */
  calculateSplit(
    totalAmount: Money,
    guestFaultPercent: number,
    hostFaultPercent: number
  ): { guestAmount: Money; hostAmount: Money; platformCompensation: Money } {
    // النسبة المئوية يجب أن تساوي 100
    const total = guestFaultPercent + hostFaultPercent;
    if (total !== 100) {
      // تعديل النسب
      const factor = 100 / total;
      guestFaultPercent *= factor;
      hostFaultPercent *= factor;
    }

    const guestAmount = totalAmount.multiply(hostFaultPercent / 100); // الضيف يحصل على نسبة خطأ المضيف
    const hostAmount = totalAmount.multiply(guestFaultPercent / 100); // المضيف يحصل على نسبة خطأ الضيف

    return {
      guestAmount: guestAmount.isSuccess ? guestAmount.value : Money.zero(totalAmount.currency),
      hostAmount: hostAmount.isSuccess ? hostAmount.value : Money.zero(totalAmount.currency),
      platformCompensation: Money.zero(totalAmount.currency),
    };
  }

  /**
   * التحقق من صحة القرار
   */
  validateDecision(
    decision: DisputeDecision,
    totalAmount: Money
  ): Result<void, ValidationError> {
    // التحقق من أن المبالغ تساوي المبلغ الإجمالي
    const total = decision.guestAmount.add(decision.hostAmount);
    if (!total.isSuccess) {
      return err(new ValidationError('Failed to calculate total', 'amount'));
    }

    const compare = total.value.compare(totalAmount);
    if (compare === 'greater') {
      return err(new ValidationError(
        'Decision amounts cannot exceed dispute amount',
        'amount'
      ));
    }

    // التحقق من السبب
    if (!decision.reason || decision.reason.trim().length < 10) {
      return err(new ValidationError(
        'Decision reason must be at least 10 characters',
        'reason'
      ));
    }

    return ok(undefined);
  }

  /**
   * التحقق من الحل التلقائي
   */
  shouldAutoResolve(
    status: DisputeStatus,
    createdAt: Date,
    lastActivityAt: Date,
    responseCount: number
  ): { shouldAutoResolve: boolean; reason: string } {
    if (!this.config.autoResolveEnabled) {
      return { shouldAutoResolve: false, reason: 'Auto-resolve is disabled' };
    }

    if (status === 'resolved' || status === 'closed') {
      return { shouldAutoResolve: false, reason: 'Dispute already resolved' };
    }

    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation >= this.rules.autoResolveDays) {
      return {
        shouldAutoResolve: true,
        reason: `No resolution after ${this.rules.autoResolveDays} days`,
      };
    }

    const daysSinceActivity = (Date.now() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity >= 7 && responseCount === 0) {
      return {
        shouldAutoResolve: true,
        reason: 'No activity for 7 days and no responses',
      };
    }

    return { shouldAutoResolve: false, reason: '' };
  }

  /**
   * حساب موعد الحل المتوقع
   */
  calculateExpectedResolution(priority: DisputePriority, createdAt: Date): Date {
    const daysByPriority: Record<DisputePriority, number> = {
      urgent: 3,
      high: 7,
      normal: 14,
      low: 21,
    };

    const days = daysByPriority[priority];
    return new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * التحقق من تجاوز مهلة الاستجابة
   */
  isResponseOverdue(lastResponseAt: Date | null, expectedBy: 'guest' | 'host'): boolean {
    const lastActivity = lastResponseAt || new Date();
    const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > this.rules.maxResponseTimeHours;
  }
}

// ==================== Helper Functions ====================

/**
 * إنشاء محرك قواعد افتراضي
 */
export function createDisputeRulesEngine(
  config?: Partial<DisputeConfig>,
  rules?: Partial<DisputeRules>
): DisputeRulesEngine {
  return new DisputeRulesEngine(config, rules);
}

/**
 * تحديد الأولوية السريع
 */
export function getDisputePriority(criteria: DisputeCriteria): DisputePriority {
  const engine = new DisputeRulesEngine();
  return engine.determinePriority(criteria);
}

/**
 * حساب التقسيم السريع
 */
export function calculateDisputeSplit(
  totalAmount: Money,
  guestFaultPercent: number,
  hostFaultPercent: number
): { guestAmount: Money; hostAmount: Money } {
  const engine = new DisputeRulesEngine();
  return engine.calculateSplit(totalAmount, guestFaultPercent, hostFaultPercent);
}
