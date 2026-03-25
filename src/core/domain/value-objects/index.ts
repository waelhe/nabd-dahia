/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Value Objects Index
 * 
 * @module core/domain/value-objects
 */

// ==================== Classes ====================

export { UniqueEntityId } from './UniqueEntityId';
export { Money, MoneyError } from './Money';
export { Address, AddressError } from './Address';
export { Phone, PhoneError } from './Phone';
export { Email, EmailError } from './Email';
export { Rating, RatingError } from './Rating';
export { Translation, TranslationError } from './Translation';
export { DateRange, DateRangeError } from './DateRange';

// ==================== Types ====================

export type { MoneyProps, Currency } from './Money';
export type { AddressProps } from './Address';
export type { PhoneProps } from './Phone';
export type { RatingBreakdown, RatingProps } from './Rating';
export type { SupportedLanguage, TranslationMap, TranslationProps } from './Translation';
export type { DateRangeProps } from './DateRange';

// ==================== Constants ====================

export { 
  SUPPORTED_CURRENCIES, 
  DECIMAL_PLACES, 
  CURRENCY_SYMBOLS 
} from './Money';

export { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE, 
  LANGUAGE_NAMES, 
  RTL_LANGUAGES 
} from './Translation';
