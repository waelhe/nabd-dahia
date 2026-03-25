/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Email Value Object - كائن قيمة البريد الإلكتروني
 * 
 * يمثل عنوان بريد إلكتروني مع التحقق.
 * يدعم Result Pattern للإنشاء الآمن.
 * 
 * @module core/domain/value-objects/Email
 */

import type { Result } from '../../types/result';
import { ok, err, ValidationError } from '../../types/result';

// ==================== Email Error ====================

export class EmailError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EmailError';
  }

  static required(): EmailError {
    return new EmailError('REQUIRED', 'Email is required');
  }

  static tooLong(length: number): EmailError {
    return new EmailError('TOO_LONG', `Email is too long (${length}/254 characters)`, { length });
  }

  static invalidFormat(email: string): EmailError {
    return new EmailError('INVALID_FORMAT', `Invalid email format: ${email}`, { email });
  }

  static disposableDomain(domain: string): EmailError {
    return new EmailError('DISPOSABLE_DOMAIN', `Disposable email addresses are not allowed: ${domain}`, { domain });
  }
}

// ==================== Email Value Object ====================

export class Email {
  private readonly _value: string;
  private readonly _localPart: string;
  private readonly _domain: string;

  // نمط التحقق من البريد الإلكتروني
  private static readonly EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // النطاقات المؤقتة الممنوعة
  private static readonly DISPOSABLE_DOMAINS = [
    'tempmail.com',
    'throwaway.email',
    'guerrillamail.com',
    'mailinator.com',
    '10minutemail.com',
    'dispostable.com',
    'fakeinbox.com',
    'temp-mail.org',
  ];

  private constructor(email: string) {
    this._value = email;
    const parts = email.split('@');
    this._localPart = parts[0];
    this._domain = parts[1];
  }

  get value(): string {
    return this._value;
  }

  get localPart(): string {
    return this._localPart;
  }

  get domain(): string {
    return this._domain;
  }

  /**
   * التحقق من صحة البريد (للاستخدام الداخلي)
   */
  private static validate(email: string): Result<void, EmailError> {
    if (!email || email.length === 0) {
      return err(EmailError.required());
    }

    if (email.length > 254) {
      return err(EmailError.tooLong(email.length));
    }

    if (!Email.EMAIL_PATTERN.test(email)) {
      return err(EmailError.invalidFormat(email));
    }

    // التحقق من النطاقات المؤقتة
    const domain = email.split('@')[1];
    if (Email.DISPOSABLE_DOMAINS.includes(domain)) {
      return err(EmailError.disposableDomain(domain));
    }

    return ok(undefined);
  }

  /**
   * التحقق من أن البريد تجاري
   */
  isBusiness(): boolean {
    const personalProviders = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'aol.com',
      'icloud.com',
      'mail.com',
      'protonmail.com',
      'zoho.com',
    ];
    
    return !personalProviders.includes(this._domain);
  }

  /**
   * التحقق من أن البريد شخصي
   */
  isPersonal(): boolean {
    return !this.isBusiness();
  }

  /**
   * إخفاء جزء من البريد
   */
  mask(): string {
    const localLength = this._localPart.length;
    
    if (localLength <= 2) {
      return `${this._localPart[0]}***@${this._domain}`;
    }
    
    const visible = Math.min(2, Math.floor(localLength / 2));
    const masked = localLength - visible;
    
    return `${this._localPart.slice(0, visible)}${'*'.repeat(masked)}@${this._domain}`;
  }

  /**
   * الحصول على الأحرف الأولى من البريد
   */
  getInitials(): string {
    return this._localPart.slice(0, 2).toUpperCase();
  }

  /**
   * إنشاء رابط mailto
   */
  toMailtoLink(subject?: string, body?: string): string {
    let link = `mailto:${this._value}`;
    const params: string[] = [];
    
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      link += `?${params.join('&')}`;
    }
    
    return link;
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء آمن مع Result Pattern
   */
  static create(email: string): Result<Email, EmailError> {
    return Email.tryCreate(email);
  }

  /**
   * إنشاء من نص (يرمي خطأ - للتوافق)
   */
  static from(email: string): Email {
    const result = Email.tryCreate(email);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء آمن مع Result Pattern
   */
  static tryCreate(email: string): Result<Email, EmailError> {
    const normalized = email.toLowerCase().trim();
    
    const validationResult = Email.validate(normalized);
    if (validationResult.isFailure) {
      return err(validationResult.error);
    }
    
    return ok(new Email(normalized));
  }

  /**
   * التحقق من صحة البريد بدون إنشاء
   */
  static isValid(email: string): boolean {
    return Email.tryCreate(email).isSuccess;
  }

  /**
   * إنشاء من Local Part و Domain
   */
  static fromParts(localPart: string, domain: string): Result<Email, EmailError> {
    return Email.tryCreate(`${localPart}@${domain}`);
  }

  // ==================== Serialization ====================

  toJSON(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  valueOf(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
