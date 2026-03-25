/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Money Value Object - كائن قيمة المال
 * 
 * يمثل مبلغ مالي مع عملة.
 * يدعم العمليات الحسابية الأساسية.
 * يستخدم Result Pattern للمعالجة الآمنة.
 * 
 * @module core/domain/value-objects/Money
 */

import { Result, ok, err, ValidationError } from '../../types/result';

// ==================== Types ====================

export interface MoneyProps {
  amount: number;
  currency: string;
}

export type Currency = 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';

// ==================== Constants ====================

export const SUPPORTED_CURRENCIES: readonly Currency[] = [
  'SYP', // الليرة السورية
  'USD', // الدولار الأمريكي
  'EUR', // اليورو
  'TRY', // الليرة التركية
  'AED', // الدرهم الإماراتي
  'SAR', // الريال السعودي
] as const;

export const DECIMAL_PLACES: Record<Currency, number> = {
  SYP: 0,   // الليرة السورية لا تحتوي على كسور
  USD: 2,
  EUR: 2,
  TRY: 2,
  AED: 2,
  SAR: 2,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  SYP: 'ل.س',
  USD: '$',
  EUR: '€',
  TRY: '₺',
  AED: 'د.إ',
  SAR: 'ر.س',
};

// ==================== Errors ====================

export class MoneyError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MoneyError';
  }

  static unsupportedCurrency(currency: string): MoneyError {
    return new MoneyError('UNSUPPORTED_CURRENCY', `Unsupported currency: ${currency}`, { currency });
  }

  static invalidAmount(amount: unknown): MoneyError {
    return new MoneyError('INVALID_AMOUNT', `Invalid money amount: ${amount}`, { amount });
  }

  static differentCurrencies(left: string, right: string): MoneyError {
    return new MoneyError('DIFFERENT_CURRENCIES', 
      `Cannot operate on different currencies: ${left} and ${right}`,
      { left, right }
    );
  }

  static divisionByZero(): MoneyError {
    return new MoneyError('DIVISION_BY_ZERO', 'Cannot divide by zero');
  }

  static negativeAmount(amount: number): MoneyError {
    return new MoneyError('NEGATIVE_AMOUNT', `Amount cannot be negative: ${amount}`, { amount });
  }
}

// ==================== Money Class ====================

export class Money {
  private readonly _amount: number;
  private readonly _currency: Currency;

  private constructor(amount: number, currency: Currency) {
    // تقريب المبلغ حسب العملة
    const decimalPlaces = DECIMAL_PLACES[currency];
    this._amount = Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }

  get symbol(): string {
    return CURRENCY_SYMBOLS[this._currency];
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء مبلغ (آمن)
   */
  static create(amount: number, currency: string): Result<Money, MoneyError> {
    // التحقق من المبلغ
    if (typeof amount !== 'number' || isNaN(amount) || !Number.isFinite(amount)) {
      return err(MoneyError.invalidAmount(amount));
    }

    // التحقق من العملة
    const upperCurrency = currency.toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(upperCurrency as Currency)) {
      return err(MoneyError.unsupportedCurrency(currency));
    }

    return ok(new Money(amount, upperCurrency as Currency));
  }

  /**
   * إنشاء مبلغ (يرمي خطأ)
   * @deprecated استخدم create بدلاً منه
   */
  static from(amount: number, currency: string): Money {
    const result = Money.create(amount, currency);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء مبلغ صفر
   */
  static zero(currency: Currency = 'SYP'): Money {
    return new Money(0, currency);
  }

  /**
   * إنشاء من كائن
   */
  static fromProps(props: MoneyProps): Result<Money, MoneyError> {
    return Money.create(props.amount, props.currency);
  }

  /**
   * إنشاء من سلسلة نصية
   */
  static fromString(value: string): Result<Money, MoneyError> {
    const match = value.match(/^([\d,.\s]+)\s*([A-Z]{3})$/i);
    if (!match) {
      return err(new MoneyError('INVALID_FORMAT', `Invalid money string: ${value}`, { value }));
    }
    const amount = parseFloat(match[1].replace(/,/g, ''));
    const currency = match[2].toUpperCase();
    return Money.create(amount, currency);
  }

  // ==================== Operations ====================

  /**
   * إضافة مبلغ
   */
  add(other: Money): Result<Money, MoneyError> {
    if (this._currency !== other._currency) {
      return err(MoneyError.differentCurrencies(this._currency, other._currency));
    }
    return ok(new Money(this._amount + other._amount, this._currency));
  }

  /**
   * طرح مبلغ
   */
  subtract(other: Money): Result<Money, MoneyError> {
    if (this._currency !== other._currency) {
      return err(MoneyError.differentCurrencies(this._currency, other._currency));
    }
    return ok(new Money(this._amount - other._amount, this._currency));
  }

  /**
   * ضرب في عدد
   */
  multiply(factor: number): Result<Money, MoneyError> {
    if (typeof factor !== 'number' || isNaN(factor) || !Number.isFinite(factor)) {
      return err(MoneyError.invalidAmount(factor));
    }
    return ok(new Money(this._amount * factor, this._currency));
  }

  /**
   * قسمة على عدد
   */
  divide(divisor: number): Result<Money, MoneyError> {
    if (divisor === 0) {
      return err(MoneyError.divisionByZero());
    }
    if (typeof divisor !== 'number' || isNaN(divisor) || !Number.isFinite(divisor)) {
      return err(MoneyError.invalidAmount(divisor));
    }
    return ok(new Money(this._amount / divisor, this._currency));
  }

  /**
   * حساب نسبة مئوية
   */
  percentage(percent: number): Result<Money, MoneyError> {
    if (typeof percent !== 'number' || isNaN(percent)) {
      return err(MoneyError.invalidAmount(percent));
    }
    return ok(new Money((this._amount * percent) / 100, this._currency));
  }

  /**
   * تطبيق خصم
   */
  applyDiscount(discountPercent: number): Result<Money, MoneyError> {
    const discountResult = this.percentage(discountPercent);
    if (discountResult.isFailure) {
      return discountResult;
    }
    return this.subtract(discountResult.value);
  }

  /**
   * تقسيم المبلغ
   */
  split(parts: number): Result<Money[], MoneyError> {
    if (parts <= 0) {
      return err(new MoneyError('INVALID_PARTS', 'Parts must be greater than zero', { parts }));
    }
    
    const baseAmount = Math.floor(this._amount / parts);
    const remainder = this._amount - (baseAmount * parts);
    
    const result: Money[] = [];
    for (let i = 0; i < parts; i++) {
      const amount = i < remainder ? baseAmount + 1 : baseAmount;
      result.push(new Money(amount, this._currency));
    }
    
    return ok(result);
  }

  /**
   * القيمة المطلقة
   */
  abs(): Money {
    return new Money(Math.abs(this._amount), this._currency);
  }

  /**
   * سالب
   */
  negate(): Money {
    return new Money(-this._amount, this._currency);
  }

  // ==================== Comparisons ====================

  /**
   * مقارنة بمبلغ آخر
   */
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   * أكبر من
   */
  greaterThan(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw MoneyError.differentCurrencies(this._currency, other._currency);
    }
    return this._amount > other._amount;
  }

  /**
   * أكبر من أو يساوي
   */
  greaterThanOrEqual(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw MoneyError.differentCurrencies(this._currency, other._currency);
    }
    return this._amount >= other._amount;
  }

  /**
   * أصغر من
   */
  lessThan(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw MoneyError.differentCurrencies(this._currency, other._currency);
    }
    return this._amount < other._amount;
  }

  /**
   * أصغر من أو يساوي
   */
  lessThanOrEqual(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw MoneyError.differentCurrencies(this._currency, other._currency);
    }
    return this._amount <= other._amount;
  }

  /**
   * مقارنة
   */
  compare(other: Money): number {
    if (this._currency !== other._currency) {
      throw MoneyError.differentCurrencies(this._currency, other._currency);
    }
    return this._amount - other._amount;
  }

  /**
   * موجب
   */
  isPositive(): boolean {
    return this._amount > 0;
  }

  /**
   * سالب
   */
  isNegative(): boolean {
    return this._amount < 0;
  }

  /**
   * صفر
   */
  isZero(): boolean {
    return this._amount === 0;
  }

  // ==================== Formatting ====================

  /**
   * تنسيق للعرض
   */
  format(locale: string = 'ar-SY'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
      minimumFractionDigits: DECIMAL_PLACES[this._currency],
      maximumFractionDigits: DECIMAL_PLACES[this._currency],
    }).format(this._amount);
  }

  /**
   * تنسيق مختصر
   */
  formatShort(): string {
    return `${this._amount.toLocaleString()} ${this._currency}`;
  }

  /**
   * تنسيق مع الرمز
   */
  formatWithSymbol(): string {
    return `${this._amount.toLocaleString()} ${this.symbol}`;
  }

  // ==================== Serialization ====================

  toJSON(): MoneyProps {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  toString(): string {
    return this.formatShort();
  }

  valueOf(): number {
    return this._amount;
  }
}
