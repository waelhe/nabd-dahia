/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Option Pattern - نمط الخيار
 * 
 * معالجة القيم الاختيارية بطريقة آمنة (Null-Safety)
 * بدلاً من null/undefined.
 * 
 * @module core/types/option
 */

// ==================== Types ====================

/**
 * قيمة موجودة
 */
export class Some<T> {
  readonly isSome: true = true;
  readonly isNone: false = false;
  
  private constructor(private readonly _value: T) {}
  
  get value(): T {
    return this._value;
  }
  
  /**
   * تحويل القيمة
   */
  map<U>(fn: (value: T) => U): Some<U> {
    return Some.create(fn(this._value));
  }
  
  /**
   * تحويل flatMap
   */
  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this._value);
  }
  
  /**
   * تصفية
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    if (predicate(this._value)) {
      return this;
    }
    return None.create<T>();
  }
  
  /**
   * الحصول على القيمة أو قيمة افتراضية
   */
  getOrElse(_defaultValue: T): T {
    return this._value;
  }
  
  /**
   * الحصول على القيمة أو حساب قيمة افتراضية
   */
  getOrElseCompute(_fn: () => T): T {
    return this._value;
  }
  
  /**
   * الحصول على القيمة أو رمي خطأ
   */
  getOrThrow(_error?: Error): T {
    return this._value;
  }
  
  /**
   * تنفيذ إجراء
   */
  tap(fn: (value: T) => void): Some<T> {
    fn(this._value);
    return this;
  }
  
  /**
   * مطابقة النمط
   */
  match<U>(pattern: { some: (value: T) => U; none: () => U }): U {
    return pattern.some(this._value);
  }
  
  /**
   * فحص المساواة
   */
  equals(other: Option<T>): boolean {
    return other.isSome && other.value === this._value;
  }
  
  /**
   * يحتوي على قيمة
   */
  contains(value: T): boolean {
    return this._value === value;
  }
  
  /**
   * التحويل إلى مصفوفة
   */
  toArray(): [T] {
    return [this._value];
  }
  
  /**
   * التحويل إلى Result
   */
  toResult<E>(error: E): import('./result').Result<T, E> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ok } = require('./result');
    return ok(this._value);
  }
  
  // ==================== Factory ====================
  
  static create<T>(value: T): Some<T> {
    return new Some(value);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): { isSome: true; value: T } {
    return { isSome: true, value: this._value };
  }
  
  toString(): string {
    return `Some(${JSON.stringify(this._value)})`;
  }
}

/**
 * قيمة غير موجودة
 */
export class None<T = never> {
  readonly isSome: false = false;
  readonly isNone: true = true;
  
  private constructor() {}
  
  get value(): T | undefined {
    return undefined;
  }
  
  /**
   * تحويل القيمة (لا يفعل شيء في None)
   */
  map<U>(_fn: (value: T) => U): None<U> {
    return this as unknown as None<U>;
  }
  
  /**
   * تحويل flatMap
   */
  flatMap<U>(_fn: (value: T) => Option<U>): None<U> {
    return this as unknown as None<U>;
  }
  
  /**
   * تصفية (لا يفعل شيء في None)
   */
  filter(_predicate: (value: T) => boolean): None<T> {
    return this;
  }
  
  /**
   * الحصول على القيمة أو قيمة افتراضية
   */
  getOrElse(defaultValue: T): T {
    return defaultValue;
  }
  
  /**
   * الحصول على القيمة أو حساب قيمة افتراضية
   */
  getOrElseCompute(fn: () => T): T {
    return fn();
  }
  
  /**
   * الحصول على القيمة أو رمي خطأ
   */
  getOrThrow(error?: Error): T {
    throw error ?? new Error('No value present');
  }
  
  /**
   * تنفيذ إجراء (لا يفعل شيء في None)
   */
  tap(_fn: (value: T) => void): None<T> {
    return this;
  }
  
  /**
   * مطابقة النمط
   */
  match<U>(pattern: { some: (value: T) => U; none: () => U }): U {
    return pattern.none();
  }
  
  /**
   * فحص المساواة
   */
  equals(other: Option<T>): boolean {
    return other.isNone;
  }
  
  /**
   * يحتوي على قيمة
   */
  contains(_value: T): boolean {
    return false;
  }
  
  /**
   * التحويل إلى مصفوفة
   */
  toArray(): [] {
    return [];
  }
  
  /**
   * التحويل إلى Result
   */
  toResult<E>(error: E): import('./result').Result<T, E> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { err } = require('./result');
    return err(error);
  }
  
  // ==================== Factory ====================
  
  private static instance: None<never> | null = null;
  
  static create<T>(): None<T> {
    if (!None.instance) {
      None.instance = new None();
    }
    return None.instance as unknown as None<T>;
  }
  
  // ==================== Serialization ====================
  
  toJSON(): { isSome: false } {
    return { isSome: false };
  }
  
  toString(): string {
    return 'None';
  }
}

// ==================== Option Type ====================

/**
 * Option - الخيار (قيمة موجودة أو غير موجودة)
 */
export type Option<T> = Some<T> | None<T>;

// ==================== Utilities ====================

/**
 * إنشاء Some
 */
export function some<T>(value: T): Some<T> {
  return Some.create(value);
}

/**
 * إنشاء None
 */
export function none<T = never>(): None<T> {
  return None.create<T>();
}

/**
 * من قيمة nullable
 */
export function fromNullable<T>(value: T | null | undefined): Option<T> {
  if (value === null || value === undefined) {
    return none();
  }
  return some(value);
}

/**
 * من مصفوفة (أول عنصر)
 */
export function fromArray<T>(array: T[]): Option<T> {
  if (array.length === 0) {
    return none();
  }
  return some(array[0]);
}

/**
 * من شرط
 */
export function fromPredicate<T>(value: T, predicate: (value: T) => boolean): Option<T> {
  if (predicate(value)) {
    return some(value);
  }
  return none();
}

/**
 * تجميع Options
 */
export function sequence<T>(options: Option<T>[]): Option<T[]> {
  const values: T[] = [];
  
  for (const option of options) {
    if (option.isNone) {
      return none();
    }
    values.push(option.value);
  }
  
  return some(values);
}

/**
 * تصفية Some values
 */
export function filterSomes<T>(options: Option<T>[]): T[] {
  return options
    .filter(opt => opt.isSome)
    .map(opt => (opt as Some<T>).value);
}

/**
 * قيمة افتراضية عالمية
 */
export function getOrElse<T>(option: Option<T>, defaultValue: T): T {
  return option.getOrElse(defaultValue);
}

/**
 * أول Some
 */
export function firstSome<T>(...options: Option<T>[]): Option<T> {
  for (const option of options) {
    if (option.isSome) {
      return option;
    }
  }
  return none();
}
