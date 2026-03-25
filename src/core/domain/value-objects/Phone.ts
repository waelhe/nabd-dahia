/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Phone Value Object - كائن قيمة رقم الهاتف
 * 
 * يمثل رقم هاتف مع رمز الدولة.
 * يدعم التحقق والتنسيق و Result Pattern.
 * 
 * @module core/domain/value-objects/Phone
 */

import type { Result } from '../../types/result';
import { ok, err, ValidationError } from '../../types/result';

// ==================== Types ====================

export interface PhoneProps {
  countryCode: string;
  number: string;
  formatted?: string;
}

// ==================== Phone Error ====================

export class PhoneError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PhoneError';
  }

  static required(): PhoneError {
    return new PhoneError('REQUIRED', 'Phone number is required');
  }

  static unsupportedCountry(code: string): PhoneError {
    return new PhoneError('UNSUPPORTED_COUNTRY', `Unsupported country code: ${code}`, { code });
  }

  static invalidFormat(country: string): PhoneError {
    return new PhoneError('INVALID_FORMAT', `Invalid phone number format for ${country}`, { country });
  }

  static cannotParse(): PhoneError {
    return new PhoneError('CANNOT_PARSE', 'Could not determine country code from phone number');
  }
}

// ==================== Phone Value Object ====================

export class Phone {
  private readonly props: PhoneProps;

  // رموز الدول المدعومة
  static readonly COUNTRY_CODES: Record<string, { code: string; name: string; pattern: RegExp }> = {
    SY: { code: '+963', name: 'سوريا', pattern: /^9\d{8}$/ },
    SA: { code: '+966', name: 'السعودية', pattern: /^5\d{8}$/ },
    AE: { code: '+971', name: 'الإمارات', pattern: /^5[024-9]\d{7}$/ },
    TR: { code: '+90', name: 'تركيا', pattern: /^5\d{9}$/ },
    EG: { code: '+20', name: 'مصر', pattern: /^1[0-25]\d{8}$/ },
    JO: { code: '+962', name: 'الأردن', pattern: /^7[9-9]\d{7}$/ },
    LB: { code: '+961', name: 'لبنان', pattern: /^[37]\d{6}$/ },
    IQ: { code: '+964', name: 'العراق', pattern: /^7[3-9]\d{8}$/ },
    US: { code: '+1', name: 'أمريكا', pattern: /^\d{10}$/ },
    GB: { code: '+44', name: 'بريطانيا', pattern: /^7[1-9]\d{8}$/ },
    FR: { code: '+33', name: 'فرنسا', pattern: /^[67]\d{8}$/ },
    DE: { code: '+49', name: 'ألمانيا', pattern: /^1[5-7]\d{8,9}$/ },
    RU: { code: '+7', name: 'روسيا', pattern: /^9\d{9}$/ },
    IR: { code: '+98', name: 'إيران', pattern: /^9\d{9}$/ },
  };

  private constructor(countryCode: string, number: string) {
    this.props = {
      countryCode: countryCode.toUpperCase(),
      number: number.replace(/\D/g, ''),
    };
  }

  get countryCode(): string {
    return this.props.countryCode;
  }

  get number(): string {
    return this.props.number;
  }

  get fullNumber(): string {
    const code = Phone.COUNTRY_CODES[this.props.countryCode]?.code || '';
    return `${code}${this.props.number}`;
  }

  get internationalFormat(): string {
    return this.fullNumber;
  }

  get countryInfo(): { code: string; name: string } | null {
    return Phone.COUNTRY_CODES[this.props.countryCode] || null;
  }

  /**
   * التحقق من صحة الرقم (للاستخدام الداخلي)
   */
  private static validate(countryCode: string, number: string): Result<void, PhoneError> {
    const countryInfo = Phone.COUNTRY_CODES[countryCode.toUpperCase()];
    
    if (!countryInfo) {
      return err(PhoneError.unsupportedCountry(countryCode));
    }
    
    if (!number || number.length === 0) {
      return err(PhoneError.required());
    }
    
    // التحقق من تنسيق الرقم حسب الدولة
    if (!countryInfo.pattern.test(number)) {
      return err(PhoneError.invalidFormat(countryInfo.name));
    }

    return ok(undefined);
  }

  /**
   * تنسيق للعرض
   */
  format(): string {
    const countryInfo = Phone.COUNTRY_CODES[this.props.countryCode];
    const code = countryInfo?.code || '';
    const number = this.props.number;
    
    // تنسيق خاص لكل دولة
    switch (this.props.countryCode) {
      case 'SY':
        return `${code} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
      case 'SA':
        return `${code} ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
      case 'AE':
        return `${code} ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
      case 'US':
        return `${code} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
      default:
        return `${code} ${number}`;
    }
  }

  /**
   * تنسيق محلي (بدون رمز الدولة)
   */
  formatLocal(): string {
    // بعض الدول تبدأ بـ 0 محلياً
    switch (this.props.countryCode) {
      case 'SY':
      case 'SA':
      case 'AE':
      case 'EG':
        return `0${this.props.number}`;
      default:
        return this.props.number;
    }
  }

  /**
   * تنسيق للرابط (tel:)
   */
  toTelLink(): string {
    return `tel:${this.fullNumber}`;
  }

  /**
   * تنسيق للواتساب
   */
  toWhatsAppLink(): string {
    return `https://wa.me/${this.fullNumber.replace('+', '')}`;
  }

  /**
   * إخفاء جزء من الرقم
   */
  mask(): string {
    const number = this.props.number;
    if (number.length <= 4) return number;
    
    const visible = Math.ceil(number.length / 4);
    const masked = number.length - (visible * 2);
    
    return `${number.slice(0, visible)}${'*'.repeat(masked)}${number.slice(-visible)}`;
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء من رقم كامل مع رمز الدولة (يرمي خطأ - للتوافق)
   */
  static fromFullNumber(fullNumber: string): Phone {
    const result = Phone.tryFromFullNumber(fullNumber);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء آمن من رقم كامل مع Result Pattern
   */
  static tryFromFullNumber(fullNumber: string): Result<Phone, PhoneError> {
    // إزالة كل غير الأرقام و +
    const cleaned = fullNumber.replace(/[^\d+]/g, '');
    
    // البحث عن رمز الدولة
    for (const [code, info] of Object.entries(Phone.COUNTRY_CODES)) {
      if (cleaned.startsWith(info.code) || cleaned.startsWith(info.code.replace('+', ''))) {
        const number = cleaned.replace(info.code, '').replace('+', '');
        return Phone.tryCreate(code, number);
      }
    }
    
    return err(PhoneError.cannotParse());
  }

  /**
   * إنشاء آمن مع Result Pattern (alias for tryCreate)
   */
  static create(countryCode: string, number: string): Result<Phone, PhoneError> {
    return Phone.tryCreate(countryCode, number);
  }

  /**
   * إنشاء آمن مع Result Pattern
   */
  static tryCreate(countryCode: string, number: string): Result<Phone, PhoneError> {
    const normalizedCode = countryCode.toUpperCase();
    const normalizedNumber = number.replace(/\D/g, '');
    
    const validationResult = Phone.validate(normalizedCode, normalizedNumber);
    if (validationResult.isFailure) {
      return err(validationResult.error);
    }
    
    return ok(new Phone(normalizedCode, normalizedNumber));
  }

  /**
   * إنشاء من countryCode و number (يرمي خطأ - للتوافق)
   */
  static from(countryCode: string, number: string): Phone {
    const result = Phone.tryCreate(countryCode, number);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء رقم سوري
   */
  static syrian(number: string): Result<Phone, PhoneError> {
    const cleanNumber = number.replace(/^0/, '').replace(/\D/g, '');
    return Phone.tryCreate('SY', cleanNumber);
  }

  /**
   * إنشاء رقم سعودي
   */
  static saudi(number: string): Result<Phone, PhoneError> {
    const cleanNumber = number.replace(/^0/, '').replace(/\D/g, '');
    return Phone.tryCreate('SA', cleanNumber);
  }

  /**
   * إنشاء من كائن
   */
  static fromProps(props: PhoneProps): Result<Phone, PhoneError> {
    return Phone.tryCreate(props.countryCode, props.number);
  }

  /**
   * التحقق من صحة الرقم بدون إنشاء
   */
  static isValid(countryCode: string, number: string): boolean {
    return Phone.tryCreate(countryCode, number).isSuccess;
  }

  // ==================== Serialization ====================

  toJSON(): PhoneProps {
    return {
      countryCode: this.props.countryCode,
      number: this.props.number,
      formatted: this.format(),
    };
  }

  toString(): string {
    return this.fullNumber;
  }

  equals(other: Phone): boolean {
    return this.props.countryCode === other.props.countryCode &&
           this.props.number === other.props.number;
  }
}
