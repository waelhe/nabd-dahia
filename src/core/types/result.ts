/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Result Pattern - نمط النتيجة
 * 
 * معالجة الأخطاء بطريقة وظيفية (Functional Error Handling)
 * بدلاً من throw/catch التقليدي.
 * 
 * @module core/types/result
 */

// ==================== Types ====================

/**
 * نجاح العملية
 */
export class Success<T, E = never> {
  readonly isSuccess: true = true;
  readonly isFailure: false = false;
  
  private constructor(private readonly _value: T) {}
  
  get value(): T {
    return this._value;
  }
  
  get error(): E | undefined {
    return undefined;
  }
  
  /**
   * تحويل القيمة
   */
  map<U>(fn: (value: T) => U): Success<U, E> {
    return Success.create(fn(this._value));
  }
  
  /**
   * تحويل flatMap
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this._value);
  }
  
  /**
   * تحويل الخطأ (لا يفعل شيء في Success)
   */
  mapError<F>(_fn: (error: E) => F): Success<T, F> {
    return this as unknown as Success<T, F>;
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
   * تبديل القيمة
   */
  swap(): Failure<E, T> {
    throw new Error('Cannot swap a Success');
  }
  
  /**
   * تنفيذ إجراء
   */
  tap(fn: (value: T) => void): Success<T, E> {
    fn(this._value);
    return this;
  }
  
  /**
   * مطابقة النمط
   */
  match<U>(pattern: { success: (value: T) => U; failure: (error: E) => U }): U {
    return pattern.success(this._value);
  }
  
  /**
   * فحص شرط
   */
  filter<F>(predicate: (value: T) => boolean, error: F): Result<T, F | E> {
    if (predicate(this._value)) {
      return this as unknown as Success<T, F | E>;
    }
    return Failure.create<T, F>(error);
  }
  
  /**
   * التحويل إلى Option
   */
  toOption(): { isSome: true; value: T } | { isSome: false; value: null } {
    return { isSome: true, value: this._value };
  }
  
  /**
   * هل النتيجة ناجحة؟ (طريقة بديلة)
   */
  isOk(): this is Success<T, E> {
    return true;
  }
  
  /**
   * هل النتيجة فاشلة؟ (طريقة بديلة)
   */
  isErr(): this is Failure<E, T> {
    return false;
  }
  
  // ==================== Factory ====================
  
  static create<T, E = never>(value: T): Success<T, E> {
    return new Success(value);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): { isSuccess: true; value: T } {
    return { isSuccess: true, value: this._value };
  }
  
  toString(): string {
    return `Success(${JSON.stringify(this._value)})`;
  }
}

/**
 * فشل العملية
 */
export class Failure<E, T = never> {
  readonly isSuccess: false = false;
  readonly isFailure: true = true;
  
  private constructor(private readonly _error: E) {}
  
  get value(): T | undefined {
    return undefined;
  }
  
  get error(): E {
    return this._error;
  }
  
  /**
   * تحويل القيمة (لا يفعل شيء في Failure)
   */
  map<U>(_fn: (value: T) => U): Failure<E, U> {
    return this as unknown as Failure<E, U>;
  }
  
  /**
   * تحويل flatMap
   */
  flatMap<U>(_fn: (value: T) => Result<U, E>): Failure<E, U> {
    return this as unknown as Failure<E, U>;
  }
  
  /**
   * تحويل الخطأ
   */
  mapError<F>(fn: (error: E) => F): Failure<F, T> {
    return Failure.create<F, T>(fn(this._error));
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
   * تبديل الخطأ
   */
  swap(): Success<E, T> {
    return Success.create(this._error);
  }
  
  /**
   * تنفيذ إجراء على الخطأ
   */
  tapError(fn: (error: E) => void): Failure<E, T> {
    fn(this._error);
    return this;
  }
  
  /**
   * مطابقة النمط
   */
  match<U>(pattern: { success: (value: T) => U; failure: (error: E) => U }): U {
    return pattern.failure(this._error);
  }
  
  /**
   * فحص شرط (لا يفعل شيء في Failure)
   */
  filter<F>(_predicate: (value: T) => boolean, _error: F): Failure<E | F, T> {
    return this as unknown as Failure<E | F, T>;
  }
  
  /**
   * التحويل إلى Option
   */
  toOption(): { isSome: false; value: null } {
    return { isSome: false, value: null };
  }
  
  /**
   * هل النتيجة ناجحة؟ (طريقة بديلة)
   */
  isOk(): this is Success<T, E> {
    return false;
  }
  
  /**
   * هل النتيجة فاشلة؟ (طريقة بديلة)
   */
  isErr(): this is Failure<E, T> {
    return true;
  }
  
  // ==================== Factory ====================
  
  static create<E, T = never>(error: E): Failure<E, T> {
    return new Failure(error);
  }
  
  // ==================== Serialization ====================
  
  toJSON(): { isSuccess: false; error: E } {
    return { isSuccess: false, error: this._error };
  }
  
  toString(): string {
    return `Failure(${JSON.stringify(this._error)})`;
  }
}

// ==================== Result Type ====================

/**
 * Result - النتيجة (نجاح أو فشل)
 */
export type Result<T, E = AppError> = Success<T, E> | Failure<E, T>;

// ==================== Utilities ====================

/**
 * إنشاء نتيجة ناجحة
 */
export function ok<T, E = AppError>(value: T): Success<T, E> {
  return Success.create(value);
}

/**
 * إنشاء نتيجة فاشلة
 */
export function err<E, T = never>(error: E): Failure<E, T> {
  return Failure.create(error);
}

/**
 * فحص إذا كانت النتيجة ناجحة
 */
export function isOk<T, E>(result: Result<T, E>): result is Success<T, E> {
  return result.isSuccess;
}

/**
 * فحص إذا كانت النتيجة فاشلة
 */
export function isErr<T, E>(result: Result<T, E>): result is Failure<E, T> {
  return result.isFailure;
}

/**
 * تجميع نتائج متعددة
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  
  for (const result of results) {
    if (result.isFailure) {
      return result as unknown as Failure<E, T[]>;
    }
    values.push(result.value);
  }
  
  return ok(values);
}

/**
 * تجميع نتائج ككائن
 */
export function combineObject<T extends Record<string, unknown>, E>(
  results: { [K in keyof T]: Result<T[K], E> }
): Result<T, E> {
  const result: Partial<T> = {};
  
  for (const key in results) {
    const r = results[key];
    if (r.isFailure) {
      return r as unknown as Failure<E, T>;
    }
    result[key] = r.value;
  }
  
  return ok(result as T);
}

/**
 * تنفيذ عملية قد تفشل
 */
export async function tryAsync<T, E>(
  fn: () => Promise<T>,
  errorHandler: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(errorHandler(error));
  }
}

/**
 * تنفيذ عملية متزامنة قد تفشل
 */
export function trySync<T, E>(
  fn: () => T,
  errorHandler: (error: unknown) => E
): Result<T, E> {
  try {
    return ok(fn());
  } catch (error) {
    return err(errorHandler(error));
  }
}

/**
 * من قيمة اختيارية
 */
export function fromNullable<T, E>(value: T | null | undefined, error: E): Result<T, E> {
  if (value === null || value === undefined) {
    return err(error);
  }
  return ok(value);
}

/**
 * من شرط
 */
export function fromPredicate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  error: E
): Result<T, E> {
  if (predicate(value)) {
    return ok(value);
  }
  return err(error);
}

// ==================== App Error Base ====================

/**
 * الخطأ الأساسي في التطبيق
 */
export abstract class AppError {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly details?: Record<string, unknown>
  ) {}
  
  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
  
  toJSON(): { code: string; message: string; details?: Record<string, unknown> } {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * خطأ تحقق
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    details?: Record<string, unknown>
  ) {
    super('VALIDATION_ERROR', message, { field, ...details });
  }
}

/**
 * خطأ عدم وجود
 */
export class NotFoundError extends AppError {
  constructor(
    public readonly entity: string,
    public readonly id?: string
  ) {
    super('NOT_FOUND', `${entity} not found${id ? ` with id: ${id}` : ''}`, { entity, id });
  }
}

/**
 * خطأ صلاحيات
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message);
  }
}

/**
 * خطأ محظور
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message);
  }
}

/**
 * خطأ تعارض
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, details);
  }
}

/**
 * خطأ منطق أعمال
 */
export class BusinessError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(code, message, details);
  }
}

/**
 * خطأ تزامن
 */
export class ConcurrencyError extends AppError {
  constructor(
    public readonly entity: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number
  ) {
    super('CONCURRENCY_ERROR', 
      `${entity} has been modified. Expected version ${expectedVersion}, actual ${actualVersion}`,
      { entity, expectedVersion, actualVersion }
    );
  }
}
