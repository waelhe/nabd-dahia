/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Type Guards - حراس الأنواع
 * 
 * دوال للتحقق من الأنواع وقت التشغيل.
 * 
 * @module core/types/guards
 */

import type { Result, Success, Failure } from './result';
import type { Option, Some, None } from './option';

// ==================== Primitive Type Guards ====================

/**
 * التحقق من أن القيمة string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * التحقق من أن القيمة number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * التحقق من أن القيمة عدد صحيح
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * التحقق من أن القيمة number موجب
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * التحقق من أن القيمة number سالب
 */
export function isNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value < 0;
}

/**
 * التحقق من أن القيمة boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * التحقق من أن القيمة object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * التحقق من أن القيمة مصفوفة
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * التحقق من أن القيمة دالة
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * التحقق من أن القيمة Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * التحقق من أن القيمة Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) && 
    isFunction((value as Record<string, unknown>).then)
  );
}

/**
 * التحقق من أن القيمة null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * التحقق من أن القيمة undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * التحقق من أن القيمة null أو undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * التحقق من أن القيمة ليست null أو undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// ==================== String Type Guards ====================

/**
 * التحقق من أن القيمة string غير فارغة
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * التحقق من أن القيمة email
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * التحقق من أن القيمة URL
 */
export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من أن القيمة UUID
 */
export function isUuid(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * التحقق من أن القيمة رقم هاتف
 */
export function isPhoneNumber(value: unknown): value is string {
  if (!isString(value)) return false;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(value.replace(/[\s-]/g, ''));
}

// ==================== Domain Type Guards ====================

/**
 * أسماء الأدوار
 */
export type RoleName = 'guest' | 'user' | 'host' | 'company' | 'admin' | 'super_admin';

const VALID_ROLES: RoleName[] = ['guest', 'user', 'host', 'company', 'admin', 'super_admin'];

/**
 * التحقق من أن القيمة RoleName
 */
export function isRoleName(value: unknown): value is RoleName {
  return isString(value) && VALID_ROLES.includes(value as RoleName);
}

/**
 * حالة المستخدم
 */
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

const VALID_USER_STATUSES: UserStatus[] = ['pending', 'active', 'suspended', 'deleted'];

/**
 * التحقق من أن القيمة UserStatus
 */
export function isUserStatus(value: unknown): value is UserStatus {
  return isString(value) && VALID_USER_STATUSES.includes(value as UserStatus);
}

/**
 * الجنس
 */
export type Gender = 'male' | 'female' | 'other';

const VALID_GENDERS: Gender[] = ['male', 'female', 'other'];

/**
 * التحقق من أن القيمة Gender
 */
export function isGender(value: unknown): value is Gender {
  return isString(value) && VALID_GENDERS.includes(value as Gender);
}

/**
 * مستوى العضوية
 */
export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

const VALID_MEMBERSHIP_LEVELS: MembershipLevel[] = ['bronze', 'silver', 'gold', 'platinum'];

/**
 * التحقق من أن القيمة MembershipLevel
 */
export function isMembershipLevel(value: unknown): value is MembershipLevel {
  return isString(value) && VALID_MEMBERSHIP_LEVELS.includes(value as MembershipLevel);
}

/**
 * حالة الحجز
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed' | 'no_show';

const VALID_BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'rejected', 'completed', 'no_show'];

/**
 * التحقق من أن القيمة BookingStatus
 */
export function isBookingStatus(value: unknown): value is BookingStatus {
  return isString(value) && VALID_BOOKING_STATUSES.includes(value as BookingStatus);
}

/**
 * حالة الدفع
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'processing', 'completed', 'failed', 'refunded'];

/**
 * التحقق من أن القيمة PaymentStatus
 */
export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return isString(value) && VALID_PAYMENT_STATUSES.includes(value as PaymentStatus);
}

/**
 * العملات المدعومة
 */
export type Currency = 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';

const VALID_CURRENCIES: Currency[] = ['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR'];

/**
 * التحقق من أن القيمة Currency
 */
export function isCurrency(value: unknown): value is Currency {
  return isString(value) && VALID_CURRENCIES.includes(value as Currency);
}

/**
 * اللغات المدعومة
 */
export type LanguageCode = 'ar' | 'en' | 'fr' | 'tr' | 'ru';

const VALID_LANGUAGES: LanguageCode[] = ['ar', 'en', 'fr', 'tr', 'ru'];

/**
 * التحقق من أن القيمة LanguageCode
 */
export function isLanguageCode(value: unknown): value is LanguageCode {
  return isString(value) && VALID_LANGUAGES.includes(value as LanguageCode);
}

// ==================== Result/Option Type Guards ====================

/**
 * التحقق من أن القيمة Success
 */
export function isSuccess<T, E>(value: Result<T, E>): value is Success<T, E> {
  return value.isSuccess === true;
}

/**
 * التحقق من أن القيمة Failure
 */
export function isFailure<T, E>(value: Result<T, E>): value is Failure<E, T> {
  return value.isFailure === true;
}

/**
 * التحقق من أن القيمة Some
 */
export function isSome<T>(value: Option<T>): value is Some<T> {
  return value.isSome === true;
}

/**
 * التحقق من أن القيمة None
 */
export function isNone<T>(value: Option<T>): value is None<T> {
  return value.isNone === true;
}

// ==================== Object Type Guards ====================

/**
 * التحقق من وجود خاصية في كائن
 */
export function hasProperty<K extends string>(
  value: unknown,
  property: K
): value is Record<K, unknown> {
  return isObject(value) && property in value;
}

/**
 * التحقق من وجود عدة خصائص
 */
export function hasProperties<K extends string>(
  value: unknown,
  properties: K[]
): value is Record<K, unknown> {
  return isObject(value) && properties.every(p => p in value);
}

/**
 * إنشاء Type Guard مخصص
 */
export function createTypeGuard<T>(
  check: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => check(value);
}

/**
 * التحقق من شكل كائن
 */
export function isShape<T extends Record<string, unknown>>(
  value: unknown,
  shape: { [K in keyof T]: (v: unknown) => v is T[K] }
): value is T {
  if (!isObject(value)) return false;
  
  for (const key in shape) {
    const guard = shape[key];
    if (!guard(value[key])) {
      return false;
    }
  }
  
  return true;
}

// ==================== Assertion Functions ====================

/**
 * تأكيد أن القيمة ليست nullish
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (isNullish(value)) {
    throw new Error(message ?? 'Value is null or undefined');
  }
}

/**
 * تأكيد شرط
 */
export function assertCondition(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}

/**
 * تأكيد عدم الوصول (never)
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
