/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Rules - قواعد الدفع
 * 
 * يحتوي على كل القواعد المتعلقة بالمدفوعات.
 * 
 * @module core/domain/rules/payment-rules
 */

import { Money } from '../value-objects/Money';

// ==================== Types ====================

export interface PaymentRuleContext {
  userId: string;
  bookingId: string;
  amount: Money;
  method: PaymentMethod;
  currency: string;
  userVerified: boolean;
  userMembershipLevel: string;
  previousPayments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: Money;
  status: PaymentStatus;
  createdAt: Date;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'wallet';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface PaymentValidationResult {
  isValid: boolean;
  errors: PaymentError[];
  warnings: PaymentWarning[];
  fees: PaymentFees;
}

export interface PaymentError {
  code: string;
  message: string;
}

export interface PaymentWarning {
  code: string;
  message: string;
}

export interface PaymentFees {
  processingFee: Money;
  platformFee: Money;
  totalFees: Money;
}

// ==================== Constants ====================

/**
 * الحد الأدنى للدفع
 */
export const MIN_PAYMENT_AMOUNTS: Record<string, number> = {
  SYP: 1000,
  USD: 1,
  EUR: 1,
  TRY: 10,
  AED: 5,
  SAR: 5,
};

/**
 * الحد الأقصى للدفع النقدي
 */
export const MAX_CASH_AMOUNTS: Record<string, number> = {
  SYP: 500000,
  USD: 500,
  EUR: 500,
  TRY: 5000,
  AED: 2000,
  SAR: 2000,
};

/**
 * نسبة رسوم المعالجة
 */
export const PROCESSING_FEE_PERCENT = {
  credit_card: 2.9,
  debit_card: 1.5,
  bank_transfer: 0,
  cash: 0,
  wallet: 0,
};

/**
 * نسبة رسوم المنصة
 */
export const PLATFORM_FEE_PERCENT = 12;

/**
 * عملات الدعم النقدي
 */
export const CASH_SUPPORTED_CURRENCIES = ['SYP'];

// ==================== Validation Rules ====================

/**
 * التحقق من صلاحية الدفع
 */
export function validatePayment(context: PaymentRuleContext): PaymentValidationResult {
  const errors: PaymentError[] = [];
  const warnings: PaymentWarning[] = [];

  // التحقق من المبلغ
  const amountErrors = validateAmount(context);
  errors.push(...amountErrors);

  // التحقق من طريقة الدفع
  const methodErrors = validateMethod(context);
  errors.push(...methodErrors);

  // التحقق من المستخدم
  const userErrors = validateUser(context);
  errors.push(...userErrors);

  // حساب الرسوم
  const fees = calculateFees(context);

  // تحذيرات
  warnings.push(...generateWarnings(context));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fees,
  };
}

/**
 * التحقق من المبلغ
 */
function validateAmount(context: PaymentRuleContext): PaymentError[] {
  const errors: PaymentError[] = [];
  const minAmount = MIN_PAYMENT_AMOUNTS[context.currency] || 1;

  if (!context.amount.isPositive()) {
    errors.push({
      code: 'INVALID_AMOUNT',
      message: 'مبلغ الدفع يجب أن يكون موجباً',
    });
  }

  if (context.amount.amount < minAmount) {
    errors.push({
      code: 'AMOUNT_TOO_LOW',
      message: `الحد الأدنى للدفع هو ${minAmount} ${context.currency}`,
    });
  }

  return errors;
}

/**
 * التحقق من طريقة الدفع
 */
function validateMethod(context: PaymentRuleContext): PaymentError[] {
  const errors: PaymentError[] = [];

  // التحقق من الدعم النقدي
  if (context.method === 'cash') {
    if (!CASH_SUPPORTED_CURRENCIES.includes(context.currency)) {
      errors.push({
        code: 'CASH_NOT_SUPPORTED',
        message: 'الدفع النقدي غير مدعوم لهذه العملة',
      });
    }

    const maxCash = MAX_CASH_AMOUNTS[context.currency] || 0;
    if (context.amount.amount > maxCash) {
      errors.push({
        code: 'CASH_LIMIT_EXCEEDED',
        message: `الحد الأقصى للدفع النقدي هو ${maxCash} ${context.currency}`,
      });
    }
  }

  // التحقق من الدفع بالمحفظة للمستخدمين غير الموثقين
  if (context.method === 'wallet' && !context.userVerified) {
    errors.push({
      code: 'WALLET_REQUIRES_VERIFICATION',
      message: 'يجب توثيق الحساب لاستخدام المحفظة الإلكترونية',
    });
  }

  return errors;
}

/**
 * التحقق من المستخدم
 */
function validateUser(context: PaymentRuleContext): PaymentError[] {
  const errors: PaymentError[] = [];

  // التحقق من عدم وجود مدفوعات معلقة سابقة
  const pendingPayments = context.previousPayments.filter(
    p => p.status === 'pending' || p.status === 'processing'
  );

  if (pendingPayments.length > 0) {
    errors.push({
      code: 'PENDING_PAYMENT_EXISTS',
      message: 'يوجد دفعات معلقة سابقة يجب إتمامها أولاً',
    });
  }

  return errors;
}

/**
 * حساب الرسوم
 */
function calculateFees(context: PaymentRuleContext): PaymentFees {
  const processingPercent = PROCESSING_FEE_PERCENT[context.method] || 0;
  const processingFee = context.amount.percentage(processingPercent);
  
  const platformFee = context.amount.percentage(PLATFORM_FEE_PERCENT);
  
  const totalFees = processingFee.add(platformFee);

  return {
    processingFee,
    platformFee,
    totalFees,
  };
}

/**
 * توليد التحذيرات
 */
function generateWarnings(context: PaymentRuleContext): PaymentWarning[] {
  const warnings: PaymentWarning[] = [];

  // تحذير للدفع النقدي
  if (context.method === 'cash') {
    warnings.push({
      code: 'CASH_PAYMENT_WARNING',
      message: 'الدفع النقدي يتطلب وجود المبلغ كاملاً عند الوصول',
    });
  }

  // تحذير للتحويل البنكي
  if (context.method === 'bank_transfer') {
    warnings.push({
      code: 'BANK_TRANSFER_DELAY',
      message: 'التحويل البنكي قد يستغرق 1-3 أيام عمل للتأكيد',
    });
  }

  return warnings;
}

// ==================== Refund Rules ====================

/**
 * حساب مبلغ الاسترداد
 */
export function calculateRefundAmount(
  originalAmount: Money,
  paidAt: Date,
  bookingStatus: string,
  hoursUntilCheckIn: number
): { refundAmount: Money; refundPercent: number; reason: string } {
  const now = new Date();
  const hoursSincePayment = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60);

  // إذا تم الإلغاء من المضيف = استرداد كامل
  if (bookingStatus === 'cancelled_by_host') {
    return {
      refundAmount: originalAmount,
      refundPercent: 100,
      reason: 'إلغاء من المضيف - استرداد كامل',
    };
  }

  // إلغاء من المستخدم
  if (hoursUntilCheckIn >= 48) {
    // أكثر من 48 ساعة = استرداد كامل
    return {
      refundAmount: originalAmount,
      refundPercent: 100,
      reason: 'إلغاء قبل 48 ساعة - استرداد كامل',
    };
  } else if (hoursUntilCheckIn >= 24) {
    // بين 24-48 ساعة = 75% استرداد
    const refundAmount = originalAmount.percentage(75);
    return {
      refundAmount,
      refundPercent: 75,
      reason: 'إلغاء بين 24-48 ساعة - استرداد 75%',
    };
  } else if (hoursUntilCheckIn >= 6) {
    // بين 6-24 ساعة = 50% استرداد
    const refundAmount = originalAmount.percentage(50);
    return {
      refundAmount,
      refundPercent: 50,
      reason: 'إلغاء بين 6-24 ساعة - استرداد 50%',
    };
  } else {
    // أقل من 6 ساعات = بدون استرداد
    return {
      refundAmount: Money.zero(originalAmount.currency),
      refundPercent: 0,
      reason: 'إلغاء أقل من 6 ساعات - بدون استرداد',
    };
  }
}

/**
 * التحقق من إمكانية الاسترداد
 */
export function canRefund(
  paymentStatus: PaymentStatus,
  paidAt: Date,
  maxRefundDays: number = 180
): { allowed: boolean; reason?: string } {
  if (paymentStatus === 'refunded') {
    return { allowed: false, reason: 'تم الاسترداد بالفعل' };
  }

  if (paymentStatus !== 'completed') {
    return { allowed: false, reason: 'لا يمكن استرداد دفعة غير مكتملة' };
  }

  const daysSincePayment = (Date.now() - paidAt.getTime()) / (24 * 60 * 60 * 1000);
  if (daysSincePayment > maxRefundDays) {
    return { allowed: false, reason: `تجاوزت فترة الاسترداد (${maxRefundDays} يوم)` };
  }

  return { allowed: true };
}

// ==================== Split Payment Rules ====================

/**
 * تقسيم الدفعة (للضمان)
 */
export function splitPayment(
  totalAmount: Money,
  platformFeePercent: number = PLATFORM_FEE_PERCENT
): {
  hostAmount: Money;
  platformFee: Money;
  taxAmount: Money;
} {
  // رسوم المنصة
  const platformFee = totalAmount.percentage(platformFeePercent);
  
  // ضريبة القيمة المضافة على رسوم المنصة
  const taxAmount = platformFee.percentage(5);
  
  // مبلغ المضيف
  const hostAmount = totalAmount.subtract(platformFee).subtract(taxAmount);

  return {
    hostAmount,
    platformFee,
    taxAmount,
  };
}
