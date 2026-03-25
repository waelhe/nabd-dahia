/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Entity Base Class - الفئة الأساسية لجميع الكيانات
 * 
 * تطبق مبدأ Identity (الهوية) من DDD.
 * يدعم Result Pattern و UniqueEntityId.
 * 
 * @module core/domain/entities/base/Entity
 */

import { UniqueEntityId } from '../../value-objects/UniqueEntityId';
import { Result, ok, err, ValidationError, ConcurrencyError } from '../../../types/result';
import { isString, isDate, isObject } from '../../../types/guards';

// ==================== Types ====================

/**
 * خصائص الكيان الأساسية
 */
export interface EntityProps {
  id: UniqueEntityId | string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * خيارات إنشاء الكيان
 */
export interface EntityCreateOptions {
  id?: string;
  skipValidation?: boolean;
}

// ==================== Domain Event ====================

/**
 * حدث النطاق
 */
export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    version?: number;
  };
}

/**
 * إنشاء حدث نطاق
 */
export function createDomainEvent(
  eventType: string,
  aggregateId: string,
  aggregateType: string,
  payload: Record<string, unknown>,
  metadata?: DomainEvent['metadata']
): DomainEvent {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    aggregateId,
    aggregateType,
    occurredAt: new Date(),
    payload,
    metadata,
  };
}

// ==================== Entity Base Class ====================

/**
 * الفئة الأساسية لجميع الكيانات في النظام
 * تطبق مبدأ Identity (الهوية) من DDD
 */
export abstract class Entity<T extends EntityProps> {
  protected readonly props: T;
  private readonly _id: UniqueEntityId;

  constructor(props: T) {
    this.props = props;
    // استخراج الـ ID كـ UniqueEntityId
    this._id = props.id instanceof UniqueEntityId 
      ? props.id 
      : new UniqueEntityId(props.id);
  }

  /**
   * المعرف الفريد للكيان
   */
  get id(): UniqueEntityId {
    return this._id;
  }

  /**
   * المعرف كنص
   */
  get idValue(): string {
    return this._id.value;
  }

  /**
   * تاريخ الإنشاء
   */
  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * تاريخ آخر تحديث
   */
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * تحديث تاريخ التعديل
   */
  protected touch(): void {
    (this.props as Record<string, unknown>).updatedAt = new Date();
  }

  /**
   * التحقق من تساوي كيانين (بناءً على الهوية)
   */
  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    if (this === entity) {
      return true;
    }
    return this._id.equals(entity._id);
  }

  /**
   * التحقق من أن الكيان جديد (لم يتم حفظه)
   */
  isNew(): boolean {
    // يمكن تجاوز هذه الدالة في الكيانات الفرعية
    return this.props.createdAt === this.props.updatedAt;
  }

  /**
   * تحويل الكيان إلى كائن عادي
   */
  abstract toJSON(): Record<string, unknown>;

  /**
   * تحويل الكيان إلى سلسلة نصية
   */
  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  // ==================== Static Helpers ====================

  /**
   * التحقق من صحة الـ Props الأساسية
   */
  protected static validateBaseProps(props: EntityProps): Result<void, ValidationError> {
    if (!props.id) {
      return err(new ValidationError('id is required', 'id'));
    }

    if (!isDate(props.createdAt)) {
      return err(new ValidationError('createdAt must be a valid date', 'createdAt'));
    }

    if (!isDate(props.updatedAt)) {
      return err(new ValidationError('updatedAt must be a valid date', 'updatedAt'));
    }

    return ok(undefined);
  }
}

// ==================== AggregateRoot ====================

/**
 * AggregateRoot Base Class
 * للكيانات التي تمثل جذور تجميعية (Aggregate Roots)
 */
export abstract class AggregateRoot<T extends EntityProps> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 1;

  /**
   * الأحداث المعلقة للنشر
   */
  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * إصدار الكيان (للتزامن المتفائل)
   */
  get version(): number {
    return this._version;
  }

  /**
   * الحصول على خصائص الكيان (للاستخدام في Mappers)
   * يُرجع نسخة للقراءة فقط
   */
  getProps(): Readonly<T> {
    return this.props;
  }

  /**
   * إضافة حدث نطاق جديد
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * إنشاء وإضافة حدث
   */
  protected raiseEvent(
    eventType: string,
    payload: Record<string, unknown>,
    metadata?: DomainEvent['metadata']
  ): void {
    const event = createDomainEvent(
      eventType,
      this.idValue,
      this.constructor.name,
      payload,
      { ...metadata, version: this._version }
    );
    this.addDomainEvent(event);
  }

  /**
   * مسح الأحداث بعد النشر
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * زيادة الإصدار
   */
  protected incrementVersion(): void {
    this._version += 1;
    this.touch();
  }

  /**
   * تحديد الإصدار (من قاعدة البيانات)
   */
  setVersion(version: number): void {
    this._version = version;
  }

  /**
   * التحقق من الإصدار (للتزامن المتفائل)
   */
  checkVersion(expectedVersion: number): Result<void, ConcurrencyError> {
    if (this._version !== expectedVersion) {
      return err(new ConcurrencyError(
        this.constructor.name,
        expectedVersion,
        this._version
      ));
    }
    return ok(undefined);
  }

  // ==================== Serialization ====================

  toJSON(): Record<string, unknown> {
    return {
      id: this.idValue,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this._version,
    };
  }
}

// ==================== Entity Validation Helpers ====================

/**
 * نتيجة التحقق من الكيان
 */
export interface EntityValidationResult<T> {
  isValid: boolean;
  errors: EntityValidationError[];
  sanitizedProps?: T;
}

/**
 * خطأ التحقق من الكيان
 */
export interface EntityValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * إنشاء خطأ تحقق
 */
export function createValidationError(
  field: string,
  message: string,
  code: string,
  value?: unknown
): EntityValidationError {
  return { field, message, code, value };
}

/**
 * دمج نتائج التحقق
 */
export function mergeValidationResults<T>(
  ...results: EntityValidationResult<Partial<T>>[]
): EntityValidationResult<T> {
  const errors: EntityValidationError[] = [];
  const sanitizedProps: Partial<T> = {};

  for (const result of results) {
    errors.push(...result.errors);
    if (result.sanitizedProps) {
      Object.assign(sanitizedProps, result.sanitizedProps);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedProps: sanitizedProps as T,
  };
}
