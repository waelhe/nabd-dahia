/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow Entity - كيان الضمان
 * 
 * يمثل حساب الضمان للحفاظ على الأموال خلال المعاملات.
 * يدعم الإفراج التلقائي والنزاعات.
 * 
 * @module core/domain/entities/Escrow
 */

import { AggregateRoot, type DomainEvent } from './base/Entity';
import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Money, Currency } from '../value-objects/Money';
import type { Result, ValidationError, BusinessError } from '../../types/result';
import { ok, err } from '../../types/result';
import { isString, isDate, isNumber } from '../../types/guards';

// ==================== Types ====================

/**
 * حالة الضمان
 */
export type EscrowStatus = 
  | 'pending'       // في انتظار الاستلام
  | 'held'          // محجوز
  | 'partial_release' // إفراج جزئي
  | 'released'      // تم الإفراج
  | 'refunded'      // تم الاسترداد
  | 'disputed'      // في النزاع
  | 'cancelled';    // ملغي

/**
 * نوع الضمان
 */
export type EscrowType = 'booking' | 'deposit' | 'custom';

/**
 * شروط الإفراج
 */
export interface ReleaseConditions {
  releaseAfterDays: number; // عدد الأيام بعد إكمال الحجز
  autoRelease: boolean; // إفراج تلقائي
  requireBothParties: boolean; // يتطلب موافقة الطرفين
  allowEarlyRelease: boolean; // سماح بالإفراج المبكر
}

/**
 * طرف الضمان
 */
export interface EscrowParty {
  userId: string;
  role: 'payer' | 'payee';
  agreedAt: Date | null;
  releasedAt: Date | null;
}

/**
 * سجل المعاملات
 */
export interface EscrowTransaction {
  id: string;
  type: 'hold' | 'release' | 'refund' | 'partial' | 'dispute_hold';
  amount: Money;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  description?: string;
}

/**
 * خصائص الضمان
 */
export interface EscrowProps {
  id: UniqueEntityId | string;
  
  // المراجع
  bookingId: string;
  payerId: string;
  payeeId: string;
  
  // النوع
  type: EscrowType;
  
  // المبالغ
  totalAmount: Money;
  heldAmount: Money;
  releasedAmount: Money;
  refundedAmount: Money;
  currency: Currency;
  
  // الحالة
  status: EscrowStatus;
  
  // الأطراف
  parties: EscrowParty[];
  
  // الشروط
  conditions: ReleaseConditions;
  
  // التواريخ المهمة
  holdAt: Date | null;
  releaseAt: Date | null;
  autoReleaseAt: Date | null;
  refundedAt: Date | null;
  
  // النزاع
  disputeId: string | null;
  disputedAt: Date | null;
  
  // سجل المعاملات
  transactions: EscrowTransaction[];
  
  // الملاحظات
  notes: string | null;
  
  // التواريخ
  createdAt: Date;
  updatedAt: Date;
  
  // الإصدار
  version: number;
}

/**
 * إحصائيات الضمان
 */
export interface EscrowStats {
  totalHeld: Money;
  totalReleased: Money;
  totalRefunded: Money;
  pendingRelease: Money;
  averageHoldDays: number;
}

// ==================== Escrow Errors ====================

export class EscrowError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EscrowError';
  }

  static invalidAmount(amount: number): EscrowError {
    return new EscrowError('INVALID_AMOUNT', `Invalid escrow amount: ${amount}`, { amount });
  }

  static alreadyHeld(): EscrowError {
    return new EscrowError('ALREADY_HELD', 'Escrow is already held');
  }

  static notHeld(): EscrowError {
    return new EscrowError('NOT_HELD', 'Escrow must be held first');
  }

  static alreadyReleased(): EscrowError {
    return new EscrowError('ALREADY_RELEASED', 'Escrow has already been released');
  }

  static alreadyRefunded(): EscrowError {
    return new EscrowError('ALREADY_REFUNDED', 'Escrow has already been refunded');
  }

  static cannotRelease(): EscrowError {
    return new EscrowError('CANNOT_RELEASE', 'Escrow cannot be released in current state');
  }

  static cannotRefund(): EscrowError {
    return new EscrowError('CANNOT_REFUND', 'Escrow cannot be refunded in current state');
  }

  static insufficientFunds(): EscrowError {
    return new EscrowError('INSUFFICIENT_FUNDS', 'Insufficient funds in escrow');
  }

  static inDispute(): EscrowError {
    return new EscrowError('IN_DISPUTE', 'Escrow is currently in dispute');
  }

  static partyNotAgreed(role: string): EscrowError {
    return new EscrowError('PARTY_NOT_AGREED', `${role} has not agreed to release`, { role });
  }
}

// ==================== Escrow Entity ====================

export class Escrow extends AggregateRoot<EscrowProps> {
  
  // ==================== Getters ====================
  
  get bookingId(): string {
    return this.props.bookingId;
  }
  
  get payerId(): string {
    return this.props.payerId;
  }
  
  get payeeId(): string {
    return this.props.payeeId;
  }
  
  get totalAmount(): Money {
    return this.props.totalAmount;
  }
  
  get heldAmount(): Money {
    return this.props.heldAmount;
  }
  
  get releasedAmount(): Money {
    return this.props.releasedAmount;
  }
  
  get refundedAmount(): Money {
    return this.props.refundedAmount;
  }
  
  get status(): EscrowStatus {
    return this.props.status;
  }
  
  get isHeld(): boolean {
    return ['held', 'partial_release', 'disputed'].includes(this.props.status);
  }
  
  get isReleased(): boolean {
    return this.props.status === 'released';
  }
  
  get isRefunded(): boolean {
    return this.props.status === 'refunded';
  }
  
  get isInDispute(): boolean {
    return this.props.status === 'disputed';
  }
  
  get availableForRelease(): Money {
    const subtract = this.props.heldAmount.subtract(this.props.releasedAmount);
    return subtract.isSuccess ? subtract.value : Money.zero(this.props.currency);
  }
  
  get autoReleaseDue(): boolean {
    if (!this.props.autoReleaseAt) return false;
    return this.props.autoReleaseAt <= new Date();
  }
  
  // ==================== Business Methods ====================
  
  /**
   * حجز المبلغ
   */
  hold(): Result<void, EscrowError> {
    if (this.props.status !== 'pending') {
      return err(EscrowError.alreadyHeld());
    }
    
    const now = new Date();
    
    this.props.status = 'held';
    this.props.holdAt = now;
    this.props.heldAmount = this.props.totalAmount;
    
    // حساب تاريخ الإفراج التلقائي
    if (this.props.conditions.autoRelease) {
      this.props.autoReleaseAt = new Date(
        now.getTime() + this.props.conditions.releaseAfterDays * 24 * 60 * 60 * 1000
      );
    }
    
    // إضافة معاملة
    this.addTransaction('hold', this.props.totalAmount);
    
    this.incrementVersion();
    this.raiseEvent('escrow.held', {
      bookingId: this.props.bookingId,
      amount: this.props.totalAmount.amount,
    });
    
    return ok(undefined);
  }
  
  /**
   * الإفراج عن المبلغ (كلي أو جزئي)
   */
  release(amount?: Money, releasedBy?: string): Result<void, EscrowError | ValidationError> {
    if (!this.isHeld) {
      return err(EscrowError.notHeld());
    }
    
    if (this.isInDispute) {
      return err(EscrowError.inDispute());
    }
    
    const releaseAmount = amount || this.availableForRelease;
    
    // التحقق من المبلغ المتاح
    const compare = releaseAmount.compare(this.availableForRelease);
    if (compare === 'greater') {
      return err(EscrowError.insufficientFunds());
    }
    
    // التحقق من موافقة الأطراف إذا لزم الأمر
    if (this.props.conditions.requireBothParties && releasedBy) {
      const partyAgreed = this.props.parties.some(
        p => p.userId === releasedBy && p.agreedAt !== null
      );
      if (!partyAgreed) {
        return err(EscrowError.partyNotAgreed(releasedBy));
      }
    }
    
    // تحديث المبالغ
    const newReleased = this.props.releasedAmount.add(releaseAmount);
    if (!newReleased.isSuccess) {
      return err(new ValidationError('Failed to update released amount', 'releasedAmount'));
    }
    this.props.releasedAmount = newReleased.value;
    
    const newHeld = this.props.heldAmount.subtract(releaseAmount);
    if (!newHeld.isSuccess) {
      this.props.heldAmount = Money.zero(this.props.currency);
    } else {
      this.props.heldAmount = newHeld.value;
    }
    
    // تحديث الحالة
    const isFullRelease = this.props.releasedAmount.compare(this.props.totalAmount) === 'equal';
    if (isFullRelease) {
      this.props.status = 'released';
      this.props.releaseAt = new Date();
    } else {
      this.props.status = 'partial_release';
    }
    
    // إضافة معاملة
    this.addTransaction(isFullRelease ? 'release' : 'partial', releaseAmount);
    
    this.incrementVersion();
    this.raiseEvent('escrow.released', {
      bookingId: this.props.bookingId,
      amount: releaseAmount.amount,
      isFull: isFullRelease,
    });
    
    return ok(undefined);
  }
  
  /**
   * استرداد المبلغ
   */
  refund(amount?: Money, reason?: string): Result<void, EscrowError | ValidationError> {
    if (!this.isHeld && this.props.status !== 'partial_release') {
      return err(EscrowError.cannotRefund());
    }
    
    if (this.isInDispute) {
      return err(EscrowError.inDispute());
    }
    
    const refundAmount = amount || this.availableForRelease;
    
    // التحقق من المبلغ المتاح
    const compare = refundAmount.compare(this.availableForRelease);
    if (compare === 'greater') {
      return err(EscrowError.insufficientFunds());
    }
    
    // تحديث المبالغ
    const newRefunded = this.props.refundedAmount.add(refundAmount);
    if (!newRefunded.isSuccess) {
      return err(new ValidationError('Failed to update refunded amount', 'refundedAmount'));
    }
    this.props.refundedAmount = newRefunded.value;
    
    const newHeld = this.props.heldAmount.subtract(refundAmount);
    if (!newHeld.isSuccess) {
      this.props.heldAmount = Money.zero(this.props.currency);
    } else {
      this.props.heldAmount = newHeld.value;
    }
    
    // تحديث الحالة
    const isFullRefund = this.props.refundedAmount.compare(this.props.totalAmount) === 'equal';
    if (isFullRefund) {
      this.props.status = 'refunded';
      this.props.refundedAt = new Date();
    }
    
    // إضافة معاملة
    this.addTransaction('refund', refundAmount, reason);
    
    this.incrementVersion();
    this.raiseEvent('escrow.refunded', {
      bookingId: this.props.bookingId,
      amount: refundAmount.amount,
      reason,
    });
    
    return ok(undefined);
  }
  
  /**
   * فتح نزاع
   */
  openDispute(disputeId: string): Result<void, EscrowError> {
    if (!this.isHeld && this.props.status !== 'partial_release') {
      return err(EscrowError.notHeld());
    }
    
    if (this.isInDispute) {
      return err(new EscrowError('ALREADY_DISPUTED', 'Escrow is already in dispute'));
    }
    
    this.props.status = 'disputed';
    this.props.disputeId = disputeId;
    this.props.disputedAt = new Date();
    
    // إضافة معاملة
    this.addTransaction('dispute_hold', this.props.heldAmount);
    
    this.incrementVersion();
    this.raiseEvent('escrow.disputed', {
      bookingId: this.props.bookingId,
      disputeId,
    });
    
    return ok(undefined);
  }
  
  /**
   * حل النزاع
   */
  resolveDispute(
    payeeAmount: Money,
    payerAmount: Money
  ): Result<void, EscrowError | ValidationError> {
    if (!this.isInDispute) {
      return err(new EscrowError('NOT_IN_DISPUTE', 'Escrow is not in dispute'));
    }
    
    // التحقق من أن المبالغ تتساوى مع المبلغ المحجوز
    const total = payeeAmount.add(payerAmount);
    if (!total.isSuccess) {
      return err(new ValidationError('Failed to calculate total', 'amount'));
    }
    
    const compare = total.value.compare(this.props.heldAmount);
    if (compare !== 'equal') {
      return err(new EscrowError('AMOUNT_MISMATCH', 
        `Payee (${payeeAmount.amount}) + Payer (${payerAmount.amount}) must equal held (${this.props.heldAmount.amount})`
      ));
    }
    
    // الإفراج للمستفيد
    if (!payeeAmount.isZero) {
      this.props.releasedAmount = payeeAmount;
    }
    
    // الاسترداد للدافع
    if (!payerAmount.isZero) {
      this.props.refundedAmount = payerAmount;
    }
    
    this.props.heldAmount = Money.zero(this.props.currency);
    this.props.status = 'released';
    this.props.releaseAt = new Date();
    this.props.disputeId = null;
    
    this.incrementVersion();
    this.raiseEvent('escrow.dispute_resolved', {
      bookingId: this.props.bookingId,
      payeeAmount: payeeAmount.amount,
      payerAmount: payerAmount.amount,
    });
    
    return ok(undefined);
  }
  
  /**
   * موافقة طرف
   */
  partyAgree(userId: string): Result<void, EscrowError> {
    const party = this.props.parties.find(p => p.userId === userId);
    if (!party) {
      return err(new EscrowError('NOT_PARTY', 'User is not a party to this escrow'));
    }
    
    party.agreedAt = new Date();
    this.incrementVersion();
    
    // إذا وافق كلا الطرفين وكان الإفراج التلقائي معطلاً
    if (this.props.conditions.requireBothParties) {
      const allAgreed = this.props.parties.every(p => p.agreedAt !== null);
      if (allAgreed) {
        this.raiseEvent('escrow.all_parties_agreed', { bookingId: this.props.bookingId });
      }
    }
    
    return ok(undefined);
  }
  
  /**
   * إفراج تلقائي (يُستدعى من scheduler)
   */
  autoRelease(): Result<void, EscrowError> {
    if (!this.props.conditions.autoRelease) {
      return err(new EscrowError('NO_AUTO_RELEASE', 'Auto release is not enabled'));
    }
    
    if (!this.autoReleaseDue) {
      return err(new EscrowError('NOT_DUE', 'Auto release is not due yet'));
    }
    
    return this.release();
  }
  
  /**
   * إضافة معاملة
   */
  private addTransaction(
    type: EscrowTransaction['type'],
    amount: Money,
    description?: string
  ): void {
    this.props.transactions.push({
      id: crypto.randomUUID(),
      type,
      amount,
      status: 'completed',
      createdAt: new Date(),
      description,
    });
  }
  
  /**
   * تحديث الملاحظات
   */
  setNotes(notes: string): void {
    this.props.notes = notes;
    this.touch();
  }
  
  /**
   * الحصول على إحصائيات
   */
  getStats(): EscrowStats {
    const holdDuration = this.props.holdAt 
      ? (this.props.releaseAt?.getTime() || Date.now()) - this.props.holdAt.getTime()
      : 0;
    
    return {
      totalHeld: this.props.totalAmount,
      totalReleased: this.props.releasedAmount,
      totalRefunded: this.props.refundedAmount,
      pendingRelease: this.availableForRelease,
      averageHoldDays: Math.round(holdDuration / (1000 * 60 * 60 * 24)),
    };
  }
  
  // ==================== Factory Methods ====================
  
  /**
   * إنشاء ضمان جديد
   */
  static create(props: Omit<EscrowProps, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'holdAt' | 'releaseAt' | 'autoReleaseAt' | 'refundedAt' | 'disputedAt' | 'disputeId' | 'heldAmount' | 'releasedAmount' | 'refundedAmount' | 'transactions' | 'parties'> & { id?: string }): Result<Escrow, ValidationError | EscrowError> {
    // التحقق من المبلغ
    if (props.totalAmount.isNegative || props.totalAmount.isZero) {
      return err(EscrowError.invalidAmount(props.totalAmount.amount));
    }
    
    // التحقق من المراجع
    if (!props.bookingId) {
      return err(new ValidationError('Booking ID is required', 'bookingId'));
    }
    if (!props.payerId) {
      return err(new ValidationError('Payer ID is required', 'payerId'));
    }
    if (!props.payeeId) {
      return err(new ValidationError('Payee ID is required', 'payeeId'));
    }
    
    const now = new Date();
    
    const escrow = new Escrow({
      ...props,
      id: props.id || new UniqueEntityId(),
      heldAmount: Money.zero(props.currency),
      releasedAmount: Money.zero(props.currency),
      refundedAmount: Money.zero(props.currency),
      holdAt: null,
      releaseAt: null,
      autoReleaseAt: null,
      refundedAt: null,
      disputedAt: null,
      disputeId: null,
      parties: [
        { userId: props.payerId, role: 'payer', agreedAt: null, releasedAt: null },
        { userId: props.payeeId, role: 'payee', agreedAt: null, releasedAt: null },
      ],
      transactions: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
    
    escrow.raiseEvent('escrow.created', {
      bookingId: props.bookingId,
      amount: props.totalAmount.amount,
    });
    
    return ok(escrow);
  }
  
  /**
   * إنشاء ضمان حجز قياسي
   */
  static createBookingEscrow(
    bookingId: string,
    payerId: string,
    payeeId: string,
    amount: Money
  ): Result<Escrow, ValidationError | EscrowError> {
    return Escrow.create({
      bookingId,
      payerId,
      payeeId,
      amount,
      currency: amount.currency,
      totalAmount: amount,
      type: 'booking',
      status: 'pending',
      conditions: {
        releaseAfterDays: 1, // يوم واحد بعد إكمال الحجز
        autoRelease: true,
        requireBothParties: false,
        allowEarlyRelease: true,
      },
      notes: null,
    });
  }
  
  /**
   * إعادة بناء من قاعدة البيانات
   */
  static reconstitute(props: EscrowProps): Escrow {
    return new Escrow(props);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      bookingId: this.props.bookingId,
      payerId: this.props.payerId,
      payeeId: this.props.payeeId,
      type: this.props.type,
      totalAmount: this.props.totalAmount.toJSON(),
      heldAmount: this.props.heldAmount.toJSON(),
      releasedAmount: this.props.releasedAmount.toJSON(),
      refundedAmount: this.props.refundedAmount.toJSON(),
      currency: this.props.currency,
      status: this.props.status,
      conditions: this.props.conditions,
      parties: this.props.parties,
      transactions: this.props.transactions.map(t => ({
        ...t,
        amount: t.amount.toJSON(),
      })),
      holdAt: this.props.holdAt?.toISOString() || null,
      releaseAt: this.props.releaseAt?.toISOString() || null,
      autoReleaseAt: this.props.autoReleaseAt?.toISOString() || null,
      refundedAt: this.props.refundedAt?.toISOString() || null,
      disputeId: this.props.disputeId,
      disputedAt: this.props.disputedAt?.toISOString() || null,
      notes: this.props.notes,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      version: this.version,
    };
  }
}
