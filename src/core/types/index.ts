/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core Types - الأنواع الأساسية
 * 
 * @module core/types
 */

// Result Pattern
export {
  Success,
  Failure,
  Result,
  ok,
  err,
  combine,
  combineObject,
  tryAsync,
  trySync,
  fromNullable,
  fromPredicate,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  BusinessError,
  ConcurrencyError,
} from './result';

// Option Pattern
export {
  Some,
  None,
  Option,
  some,
  none,
  fromNullable as optionFromNullable,
  fromArray,
  fromPredicate as optionFromPredicate,
  sequence,
  filterSomes,
  getOrElse,
  firstSome,
} from './option';

// Type Guards
export {
  // Primitive
  isString,
  isNumber,
  isInteger,
  isPositiveNumber,
  isNegativeNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isPromise,
  isNull,
  isUndefined,
  isNullish,
  isNotNullish,
  // String
  isNonEmptyString,
  isEmail,
  isUrl,
  isUuid,
  isPhoneNumber,
  // Domain
  isRoleName,
  isUserStatus,
  isGender,
  isMembershipLevel,
  isBookingStatus,
  isPaymentStatus,
  isCurrency,
  isLanguageCode,
  // Result/Option
  isSuccess,
  isFailure,
  isSome,
  isNone,
  // Object
  hasProperty,
  hasProperties,
  createTypeGuard,
  isShape,
  // Assertions
  assertDefined,
  assertCondition,
  assertNever,
  // Types
  type RoleName,
  type UserStatus,
  type Gender,
  type MembershipLevel,
  type BookingStatus,
  type PaymentStatus,
  type Currency,
  type LanguageCode,
} from './guards';
