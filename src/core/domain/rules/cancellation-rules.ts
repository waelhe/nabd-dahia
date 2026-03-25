/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cancellation Rules - قواعد الإلغاء
 * 
 * @module core/domain/rules/cancellation-rules
 */

// ==================== Types ====================

export type CancellationReason = 
  | 'guest_request'
  | 'host_request'
  | 'force_majeure'
  | 'no_response'
  | 'payment_failed'
  | 'policy_violation'
  | 'admin_decision';

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'super_strict';

export interface CancellationContext {
  bookingId: string;
  userId: string;
  hostId: string;
  policy: CancellationPolicy;
  reason: CancellationReason;
  hoursUntilCheckIn: number;
  daysUntilCheckIn: number;
  bookingStatus: string;
  totalAmount: number;
  currency: string;
  isInstantBook: boolean;
  hasStarted: boolean;
}

export interface CancellationResult {
  canCancel: boolean;
  refundPercent: number;
  refundAmount: number;
  hostPayoutPercent: number;
  platformKeepPercent: number;
  penalty: CancellationPenalty | null;
  reason: string;
}

export interface CancellationPenalty {
  type: 'fee' | 'restriction' | 'rating_impact';
  amount?: number;
  duration?: number; // بالأيام
  description: string;
}

// ==================== Policy Definitions ====================

/**
 * سياسات الإلغاء
 */
export const CANCELLATION_POLICIES: Record<CancellationPolicy, {
  name: string;
  description: string;
  refundSchedule: Array<{ hoursBefore: number; refundPercent: number }>;
}> = {
  flexible: {
    name: 'مرن',
    description: 'إلغاء مجاني حتى 24 ساعة قبل الوصول',
    refundSchedule: [
      { hoursBefore: 24, refundPercent: 100 },
      { hoursBefore: 12, refundPercent: 75 },
      { hoursBefore: 6, refundPercent: 50 },
      { hoursBefore: 0, refundPercent: 0 },
    ],
  },
  moderate: {
    name: 'معتدل',
    description: 'إلغاء مجاني حتى 48 ساعة قبل الوصول',
    refundSchedule: [
      { hoursBefore: 48, refundPercent: 100 },
      { hoursBefore: 24, refundPercent: 75 },
      { hoursBefore: 12, refundPercent: 50 },
      { hoursBefore: 0, refundPercent: 0 },
    ],
  },
  strict: {
    name: 'صارم',
    description: 'إلغاء مجاني حتى 7 أيام قبل الوصول',
    refundSchedule: [
      { hoursBefore: 168, refundPercent: 100 }, // 7 أيام
      { hoursBefore: 72, refundPercent: 50 },   // 3 أيام
      { hoursBefore: 0, refundPercent: 0 },
    ],
  },
  super_strict: {
    name: 'صارم جداً',
    description: 'إلغاء مجاني حتى 30 يوم قبل الوصول',
    refundSchedule: [
      { hoursBefore: 720, refundPercent: 100 }, // 30 يوم
      { hoursBefore: 336, refundPercent: 50 },  // 14 يوم
      { hoursBefore: 0, refundPercent: 0 },
    ],
  },
};

// ==================== Main Functions ====================

/**
 * التحقق من إمكانية الإلغاء
 */
export function canCancel(context: CancellationContext): CancellationResult {
  // إذا كان الحجز قد بدأ
  if (context.hasStarted) {
    return {
      canCancel: false,
      refundPercent: 0,
      refundAmount: 0,
      hostPayoutPercent: 100,
      platformKeepPercent: 0,
      penalty: {
        type: 'restriction',
        description: 'لا يمكن إلغاء حجز بدأ بالفعل',
      },
      reason: 'الحجز قد بدأ',
    };
  }

  // إلغاء من المضيف
  if (context.reason === 'host_request') {
    return handleHostCancellation(context);
  }

  // إلغاء قاهر (ظروف قاهرة)
  if (context.reason === 'force_majeure') {
    return handleForceMajeure(context);
  }

  // إلغاء من الإدارة
  if (context.reason === 'admin_decision') {
    return {
      canCancel: true,
      refundPercent: 100,
      refundAmount: context.totalAmount,
      hostPayoutPercent: 0,
      platformKeepPercent: 0,
      penalty: null,
      reason: 'قرار إداري - استرداد كامل',
    };
  }

  // إلغاء عادي من الضيف
  return handleGuestCancellation(context);
}

/**
 * معالجة إلغاء الضيف
 */
function handleGuestCancellation(context: CancellationContext): CancellationResult {
  const policy = CANCELLATION_POLICIES[context.policy];
  const schedule = policy.refundSchedule;

  // البحث عن نسبة الاسترداد المناسبة
  let refundPercent = 0;
  for (const tier of schedule) {
    if (context.hoursUntilCheckIn >= tier.hoursBefore) {
      refundPercent = tier.refundPercent;
      break;
    }
  }

  const refundAmount = (context.totalAmount * refundPercent) / 100;

  // حساب حصة المضيف
  let hostPayoutPercent = 0;
  if (refundPercent < 100) {
    // إذا لم يكن استرداد كامل، المضيف يحصل على جزء
    hostPayoutPercent = refundPercent === 0 ? 100 : (100 - refundPercent) / 2;
  }

  const platformKeepPercent = 100 - refundPercent - hostPayoutPercent;

  // عقوبات الضيف
  let penalty: CancellationPenalty | null = null;
  if (refundPercent < 50) {
    penalty = {
      type: 'rating_impact',
      description: 'الإلغاء المتأخر يؤثر على تقييمك',
    };
  }

  return {
    canCancel: true,
    refundPercent,
    refundAmount,
    hostPayoutPercent,
    platformKeepPercent,
    penalty,
    reason: `سياسة ${policy.name} - استرداد ${refundPercent}%`,
  };
}

/**
 * معالجة إلغاء المضيف
 */
function handleHostCancellation(context: CancellationContext): CancellationResult {
  // المضيف يتحمل كل المسؤولية
  return {
    canCancel: true,
    refundPercent: 100,
    refundAmount: context.totalAmount,
    hostPayoutPercent: 0,
    platformKeepPercent: 0,
    penalty: {
      type: 'rating_impact',
      description: 'إلغاء من المضيف يؤثر سلباً على تقييم الإقامة',
    },
    reason: 'إلغاء من المضيف - استرداد كامل للضيف',
  };
}

/**
 * معالجة الظروف القاهرة
 */
function handleForceMajeure(context: CancellationContext): CancellationResult {
  // الظروف القاهرة = استرداد كامل بدون عقوبات
  return {
    canCancel: true,
    refundPercent: 100,
    refundAmount: context.totalAmount,
    hostPayoutPercent: 0,
    platformKeepPercent: 0,
    penalty: null,
    reason: 'ظروف قاهرة - استرداد كامل',
  };
}

/**
 * الحصول على سياسة الإلغاء
 */
export function getCancellationPolicy(policy: CancellationPolicy) {
  return CANCELLATION_POLICIES[policy];
}

/**
 * حساب موعد آخر إلغاء مجاني
 */
export function getLastFreeCancellationDate(
  checkIn: Date,
  policy: CancellationPolicy
): Date {
  const hours = policy === 'flexible' ? 24 :
                policy === 'moderate' ? 48 :
                policy === 'strict' ? 168 : 720;

  const lastFree = new Date(checkIn);
  lastFree.setHours(lastFree.getHours() - hours);
  return lastFree;
}

/**
 * التحقق من إمكانية الإلغاء المجاني
 */
export function canCancelForFree(context: CancellationContext): boolean {
  const policy = CANCELLATION_POLICIES[context.policy];
  const firstTier = policy.refundSchedule[0];
  return context.hoursUntilCheckIn >= firstTier.hoursBefore;
}
