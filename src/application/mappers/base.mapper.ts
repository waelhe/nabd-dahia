/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base Mapper
 *
 * يوفر الأنماط الأساسية لجميع الـ Mappers.
 * يتضمن دوال مساعدة للتحويل والتحقق.
 *
 * @module application/mappers/base.mapper
 */

import { ok, err, type Result } from '@/core/types/result';

// ==================== Types ====================

/**
 * خطأ الـ Mapper
 */
export class MapperError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MapperError';
  }

  static invalidData(field: string, value: unknown, reason?: string): MapperError {
    return new MapperError('INVALID_DATA', 
      `Invalid ${field}: ${reason || 'validation failed'}`, 
      { field, value, reason }
    );
  }

  static missingField(field: string): MapperError {
    return new MapperError('MISSING_FIELD', `Required field is missing: ${field}`, { field });
  }

  static conversionFailed(from: string, to: string, reason?: string): MapperError {
    return new MapperError('CONVERSION_FAILED', 
      `Failed to convert ${from} to ${to}${reason ? `: ${reason}` : ''}`,
      { from, to, reason }
    );
  }
}

/**
 * خيارات الـ Mapper
 */
export interface MapperOptions {
  language?: string;
  includeRelations?: boolean;
  fields?: string[];
  excludeFields?: string[];
}

/**
 * نتيجة التحويل
 */
export type MapperResult<T> = Result<T, MapperError>;

// ==================== Helper Functions ====================

/**
 * تحويل التاريخ إلى ISO String أو null
 */
export function dateToISO(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date instanceof Date ? date.toISOString() : null;
}

/**
 * تحويل ISO String إلى Date أو null
 */
export function isoToDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * تحويل رقم إلى number صالح
 */
export function toNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

/**
 * تحويل قيمة إلى boolean
 */
export function toBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return defaultValue;
}

/**
 * تحويل JSON string إلى object
 */
export function parseJSON<T>(value: string | Record<string, unknown> | null, defaultValue: T): T {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * تحويل object إلى JSON string
 */
export function toJSON(value: Record<string, unknown> | null): string | null {
  if (!value) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

/**
 * إنشاء slug من نص
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '') // السماح بالأحرف العربية
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * اقتطاع نص
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * التحقق من وجود حقل
 */
export function hasField<T>(obj: T, field: keyof T): boolean {
  return obj !== null && obj !== undefined && field in obj;
}

/**
 * استخراج قيمة آمنة
 */
export function safeValue<T, K extends keyof T>(obj: T, field: K, defaultValue: T[K]): T[K] {
  if (obj === null || obj === undefined) return defaultValue;
  const value = obj[field];
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * تحويل مصفوفة
 */
export function mapArray<T, R>(
  items: T[] | null | undefined,
  mapper: (item: T) => R
): R[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(mapper);
}

/**
 * تصفية الحقول غير المعرفة
 */
export function filterUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

// ==================== Base Mapper Class ====================

/**
 * الـ Mapper الأساسي
 */
export abstract class BaseMapper<TEntity, TDTO, TPrisma, TCreateDTO, TUpdateDTO> {

  /**
   * تحويل من Prisma إلى Domain Entity
   */
  abstract toDomain(prisma: TPrisma): MapperResult<TEntity>;

  /**
   * تحويل من Domain Entity إلى Prisma
   */
  abstract toPersistence(entity: TEntity): Record<string, unknown>;

  /**
   * تحويل من Domain Entity إلى DTO
   */
  abstract toDTO(entity: TEntity): TDTO;

  /**
   * تحويل من Create DTO إلى Prisma
   */
  abstract createDTOToPersistence(dto: TCreateDTO): Record<string, unknown>;

  /**
   * تحويل من Update DTO إلى Prisma
   */
  abstract updateDTOToPersistence(dto: TUpdateDTO): Record<string, unknown>;

  /**
   * تحويل مجموعة من Prisma إلى Domain Entities
   */
  toDomainMany(prismaItems: TPrisma[]): MapperResult<TEntity[]> {
    const entities: TEntity[] = [];

    for (const item of prismaItems) {
      const result = this.toDomain(item);
      if (result.isFailure) {
        return result;
      }
      entities.push(result.value);
    }

    return ok(entities);
  }

  /**
   * تحويل مجموعة من Domain Entities إلى DTOs
   */
  toDTOs(entities: TEntity[]): TDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * تحويل مباشر من Prisma إلى DTO
   */
  prismaToDTO(prisma: TPrisma): TDTO {
    const result = this.toDomain(prisma);
    if (result.isFailure) {
      throw result.error;
    }
    return this.toDTO(result.value);
  }

  /**
   * تحويل مجموعة مباشرة من Prisma إلى DTOs
   */
  prismaToDTOs(prismaItems: TPrisma[]): TDTO[] {
    return prismaItems.map(item => {
      const result = this.toDomain(item);
      if (result.isSuccess) {
        return this.toDTO(result.value);
      }
      return null as unknown as TDTO;
    }).filter(Boolean);
  }
}

// ==================== Mapper Registry ====================

/**
 * سجل الـ Mappers
 */
class MapperRegistry {
  private mappers: Map<string, BaseMapper<unknown, unknown, unknown, unknown, unknown>> = new Map();

  register(name: string, mapper: BaseMapper<unknown, unknown, unknown, unknown, unknown>): void {
    this.mappers.set(name, mapper);
  }

  get<T extends BaseMapper<unknown, unknown, unknown, unknown, unknown>>(name: string): T | undefined {
    return this.mappers.get(name) as T | undefined;
  }

  has(name: string): boolean {
    return this.mappers.has(name);
  }
}

export const mapperRegistry = new MapperRegistry();
