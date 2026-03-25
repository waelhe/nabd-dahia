/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced Base Repository Implementation
 * 
 * التنفيذ الأساسي المحسن للمستودع باستخدام Prisma
 * 
 * @module infrastructure/repositories/base.repository
 */

import { db } from '@/lib/db';
import type {
  IBaseRepository,
  FindOptions,
  PaginationOptions,
  PaginatedResult,
  SearchCriteria,
  WriteOptions,
  OperationResult,
  OrderBy,
} from '@/core/interfaces/repositories/base.repository';
import { Result, ok, err } from '@/core/types/result';
import { Prisma } from '@prisma/client';

// ==================== Types ====================

type PrismaModel = {
  findUnique: (args: { where: Record<string, unknown> }) => Promise<unknown>;
  findFirst: (args: Prisma.SelectSubset<{ where?: Record<string, unknown>; include?: Record<string, unknown>; orderBy?: Record<string, unknown>; skip?: number; take?: number }, unknown>) => Promise<unknown>;
  findMany: (args: Prisma.SelectSubset<{ where?: Record<string, unknown>; include?: Record<string, unknown>; orderBy?: Record<string, unknown>; skip?: number; take?: number }, unknown>) => Promise<unknown[]>;
  create: (args: { data: Record<string, unknown>; include?: Record<string, unknown> }) => Promise<unknown>;
  update: (args: { where: Record<string, unknown>; data: Record<string, unknown>; include?: Record<string, unknown> }) => Promise<unknown>;
  delete: (args: { where: Record<string, unknown> }) => Promise<unknown>;
  count: (args: { where?: Record<string, unknown> }) => Promise<number>;
  updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>;
  deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
};

// ==================== Repository Error ====================

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'ALREADY_EXISTS' | 'CONSTRAINT_VIOLATION' | 'VERSION_CONFLICT' | 'UNKNOWN',
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }

  static notFound(entity: string, id: string): RepositoryError {
    return new RepositoryError(`${entity} with id ${id} not found`, 'NOT_FOUND');
  }

  static alreadyExists(entity: string, field: string, value: string): RepositoryError {
    return new RepositoryError(`${entity} with ${field}=${value} already exists`, 'ALREADY_EXISTS');
  }

  static constraintViolation(message: string, cause?: Error): RepositoryError {
    return new RepositoryError(message, 'CONSTRAINT_VIOLATION', cause);
  }

  static versionConflict(entity: string, id: string): RepositoryError {
    return new RepositoryError(`${entity} with id ${id} has been modified by another transaction`, 'VERSION_CONFLICT');
  }

  static unknown(message: string, cause?: Error): RepositoryError {
    return new RepositoryError(message, 'UNKNOWN', cause);
  }
}

// ==================== Base Repository Implementation ====================

export abstract class BaseRepository<T, TId = string, TCreate = Partial<T>, TUpdate = Partial<T>>
  implements IBaseRepository<T, TId, TCreate, TUpdate>
{
  protected model: PrismaModel;
  protected idField: string;
  protected deletedAtField?: string;
  protected versionField?: string;
  protected entityName: string;

  constructor(
    model: PrismaModel,
    idField: string = 'id',
    entityName: string = 'Entity',
    deletedAtField?: string,
    versionField?: string,
  ) {
    this.model = model;
    this.idField = idField;
    this.entityName = entityName;
    this.deletedAtField = deletedAtField;
    this.versionField = versionField;
  }

  // ==================== Read Operations ====================

  async findById(id: TId, options?: FindOptions): Promise<Result<T, Error>> {
    try {
      const where = { [this.idField]: id };
      
      // Handle soft delete
      if (this.deletedAtField && !options?.withDeleted) {
        (where as Record<string, unknown>)[this.deletedAtField] = null;
      }

      const result = await this.model.findUnique({
        where,
        include: this.buildInclude(options),
      });

      if (!result) {
        return err(RepositoryError.notFound(this.entityName, String(id)));
      }

      return ok(result as T);
    } catch (error) {
      return err(RepositoryError.unknown(`Failed to find ${this.entityName} by id`, error as Error));
    }
  }

  async findByIdOrNull(id: TId, options?: FindOptions): Promise<T | null> {
    const result = await this.findById(id, options);
    return result.isOk() ? result.value : null;
  }

  async findOne(criteria: SearchCriteria): Promise<Result<T, Error>> {
    try {
      const where = this.buildWhere(criteria);
      
      const result = await this.model.findFirst({
        where,
        include: this.buildIncludeFromCriteria(criteria),
        orderBy: this.buildOrderBy(criteria.orderBy),
      });

      if (!result) {
        return err(RepositoryError.notFound(this.entityName, 'with criteria'));
      }

      return ok(result as T);
    } catch (error) {
      return err(RepositoryError.unknown(`Failed to find ${this.entityName}`, error as Error));
    }
  }

  async findOneOrNull(criteria: SearchCriteria): Promise<T | null> {
    const result = await this.findOne(criteria);
    return result.isOk() ? result.value : null;
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    try {
      const where: Record<string, unknown> = {};

      // Handle soft delete
      if (this.deletedAtField && !options?.withDeleted) {
        where[this.deletedAtField] = null;
      }

      const results = await this.model.findMany({
        where,
        include: this.buildInclude(options),
      });

      return results as T[];
    } catch {
      return [];
    }
  }

  async findMany(criteria: SearchCriteria): Promise<T[]> {
    try {
      const where = this.buildWhere(criteria);

      const results = await this.model.findMany({
        where,
        include: this.buildIncludeFromCriteria(criteria),
        orderBy: this.buildOrderBy(criteria.orderBy),
        skip: criteria.offset,
        take: criteria.limit,
      });

      return results as T[];
    } catch {
      return [];
    }
  }

  async findPaginated(
    options: PaginationOptions,
    criteria?: SearchCriteria,
  ): Promise<PaginatedResult<T>> {
    try {
      const page = options.page ?? 1;
      const limit = options.limit ?? 20;
      const offset = (page - 1) * limit;

      const where = criteria ? this.buildWhere(criteria) : {};

      // Handle soft delete
      if (this.deletedAtField) {
        where[this.deletedAtField] = null;
      }

      const [items, totalItems] = await Promise.all([
        this.model.findMany({
          where,
          include: this.buildInclude(options),
          orderBy: this.buildOrderBy(options.orderBy),
          skip: offset,
          take: limit,
        }),
        this.model.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: items as T[],
        items: items as T[],
        total: totalItems,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch {
      return {
        data: [],
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasMore: false,
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  async count(criteria?: SearchCriteria): Promise<number> {
    try {
      const where = criteria ? this.buildWhere(criteria) : {};

      // Handle soft delete
      if (this.deletedAtField) {
        where[this.deletedAtField] = null;
      }

      return this.model.count({ where });
    } catch {
      return 0;
    }
  }

  async exists(id: TId): Promise<boolean> {
    const result = await this.findByIdOrNull(id);
    return result !== null;
  }

  async existsBy(criteria: SearchCriteria): Promise<boolean> {
    const count = await this.count(criteria);
    return count > 0;
  }

  // ==================== Create Operations ====================

  async create(entity: TCreate, options?: WriteOptions): Promise<Result<T, Error>> {
    try {
      const result = await this.model.create({
        data: entity as Record<string, unknown>,
      });

      return ok(result as T);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return err(RepositoryError.alreadyExists(
            this.entityName,
            'field',
            'value',
          ));
        }
      }
      return err(RepositoryError.unknown(`Failed to create ${this.entityName}`, error as Error));
    }
  }

  async createMany(entities: TCreate[], options?: WriteOptions): Promise<Result<T[], Error>> {
    try {
      const results = await db.$transaction(
        entities.map((entity) =>
          this.model.create({ data: entity as Record<string, unknown> }),
        ),
      );

      return ok(results as T[]);
    } catch (error) {
      return err(RepositoryError.unknown(`Failed to create ${this.entityName}s`, error as Error));
    }
  }

  // ==================== Update Operations ====================

  async update(id: TId, entity: TUpdate, options?: WriteOptions): Promise<Result<T, Error>> {
    try {
      const updateData = { ...(entity as Record<string, unknown>) };

      // Add version increment if versioned
      if (this.versionField) {
        updateData[this.versionField] = { increment: 1 };
      }

      const result = await this.model.update({
        where: { [this.idField]: id },
        data: updateData,
      });

      return ok(result as T);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(RepositoryError.notFound(this.entityName, String(id)));
        }
        if (error.code === 'P2002') {
          return err(RepositoryError.alreadyExists(this.entityName, 'field', 'value'));
        }
      }
      return err(RepositoryError.unknown(`Failed to update ${this.entityName}`, error as Error));
    }
  }

  async updateMany(
    criteria: SearchCriteria,
    entity: TUpdate,
    options?: WriteOptions,
  ): Promise<Result<OperationResult, Error>> {
    try {
      const where = this.buildWhere(criteria);
      const result = await this.model.updateMany({
        where,
        data: entity as Record<string, unknown>,
      });

      return ok({ success: true, affected: result.count });
    } catch (error) {
      return err(RepositoryError.unknown(`Failed to update ${this.entityName}s`, error as Error));
    }
  }

  // ==================== Delete Operations ====================

  async delete(id: TId, options?: WriteOptions): Promise<Result<OperationResult, Error>> {
    try {
      await this.model.delete({
        where: { [this.idField]: id },
      });

      return ok({ success: true, affected: 1 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(RepositoryError.notFound(this.entityName, String(id)));
        }
      }
      return err(RepositoryError.unknown(`Failed to delete ${this.entityName}`, error as Error));
    }
  }

  async deleteMany(
    criteria: SearchCriteria,
    options?: WriteOptions,
  ): Promise<Result<OperationResult, Error>> {
    try {
      const where = this.buildWhere(criteria);
      const result = await this.model.deleteMany({ where });

      return ok({ success: true, affected: result.count });
    } catch (error) {
      return err(RepositoryError.unknown(`Failed to delete ${this.entityName}s`, error as Error));
    }
  }

  // ==================== Helper Methods ====================

  protected buildWhere(criteria: SearchCriteria): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (criteria.where) {
      Object.assign(where, criteria.where);
    }

    // Handle soft delete
    if (this.deletedAtField) {
      where[this.deletedAtField] = null;
    }

    // Handle search query
    if (criteria.query && criteria.searchFields) {
      const searchConditions = criteria.searchFields.map((field) => ({
        [field]: { contains: criteria.query, mode: 'insensitive' },
      }));
      where.OR = searchConditions;
    }

    return where;
  }

  protected buildInclude(options?: FindOptions | PaginationOptions): Record<string, unknown> | undefined {
    if (!options?.include) return undefined;

    const include: Record<string, unknown> = {};
    for (const field of options.include) {
      include[field] = true;
    }
    return include;
  }

  protected buildIncludeFromCriteria(criteria?: SearchCriteria): Record<string, unknown> | undefined {
    if (!criteria?.where) return undefined;

    // Extract include from where if present
    const where = criteria.where as Record<string, unknown>;
    if (where._include) {
      return where._include as Record<string, unknown>;
    }
    return undefined;
  }

  protected buildOrderBy(orderBy?: OrderBy[]): Record<string, unknown> | undefined {
    if (!orderBy || orderBy.length === 0) return undefined;

    const result: Record<string, unknown> = {};
    for (const order of orderBy) {
      result[order.field] = order.direction;
    }
    return result;
  }
}

// ==================== Soft Deletable Repository ====================

export abstract class SoftDeletableRepository<T, TId = string, TCreate = Partial<T>, TUpdate = Partial<T>>
  extends BaseRepository<T, TId, TCreate, TUpdate>
{
  constructor(
    model: PrismaModel,
    idField: string = 'id',
    entityName: string = 'Entity',
    deletedAtField: string = 'deletedAt',
  ) {
    super(model, idField, entityName, deletedAtField);
  }

  async softDelete(id: TId, options?: WriteOptions): Promise<Result<OperationResult, Error>> {
    try {
      await this.model.update({
        where: { [this.idField]: id },
        data: { [this.deletedAtField!]: new Date() },
      });

      return ok({ success: true, affected: 1 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(RepositoryError.notFound(this.entityName, String(id)));
        }
      }
      return err(RepositoryError.unknown(`Failed to soft delete ${this.entityName}`, error as Error));
    }
  }

  async restore(id: TId, options?: WriteOptions): Promise<Result<T, Error>> {
    try {
      const result = await this.model.update({
        where: { [this.idField]: id },
        data: { [this.deletedAtField!]: null },
      });

      return ok(result as T);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(RepositoryError.notFound(this.entityName, String(id)));
        }
      }
      return err(RepositoryError.unknown(`Failed to restore ${this.entityName}`, error as Error));
    }
  }

  async findDeleted(options?: FindOptions): Promise<T[]> {
    try {
      const results = await this.model.findMany({
        where: { [this.deletedAtField!]: { not: null } },
        include: this.buildInclude(options),
      });

      return results as T[];
    } catch {
      return [];
    }
  }

  async findWithDeleted(options?: FindOptions): Promise<T[]> {
    try {
      const results = await this.model.findMany({
        include: this.buildInclude(options),
      });

      return results as T[];
    } catch {
      return [];
    }
  }

  async forceDelete(id: TId, options?: WriteOptions): Promise<Result<OperationResult, Error>> {
    // Temporarily set deletedAtField to undefined to bypass soft delete check
    const originalField = this.deletedAtField;
    this.deletedAtField = undefined;

    const result = await this.delete(id, options);

    this.deletedAtField = originalField;
    return result;
  }
}

// ==================== Versioned Repository ====================

export abstract class VersionedRepository<T, TId = string, TCreate = Partial<T>, TUpdate = Partial<T>>
  extends SoftDeletableRepository<T, TId, TCreate, TUpdate>
{
  constructor(
    model: PrismaModel,
    idField: string = 'id',
    entityName: string = 'Entity',
    deletedAtField: string = 'deletedAt',
    versionField: string = 'version',
  ) {
    super(model, idField, entityName, deletedAtField);
    this.versionField = versionField;
  }

  async updateWithVersion(
    id: TId,
    version: number,
    entity: TUpdate,
    options?: WriteOptions,
  ): Promise<Result<T, Error>> {
    try {
      const result = await this.model.update({
        where: {
          [this.idField]: id,
          [this.versionField!]: version,
        },
        data: {
          ...(entity as Record<string, unknown>),
          [this.versionField!]: { increment: 1 },
        },
      });

      return ok(result as T);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(RepositoryError.versionConflict(this.entityName, String(id)));
        }
      }
      return err(RepositoryError.unknown(`Failed to update ${this.entityName}`, error as Error));
    }
  }

  async getVersion(id: TId): Promise<number | null> {
    const entity = await this.findByIdOrNull(id);
    if (!entity) return null;
    return (entity as Record<string, unknown>)[this.versionField!] as number;
  }

  async checkVersion(id: TId, expectedVersion: number): Promise<boolean> {
    const currentVersion = await this.getVersion(id);
    return currentVersion === expectedVersion;
  }
}

// ==================== Transactional Repository ====================

export interface ITransactionalContext {
  $transaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R>;
}

export abstract class TransactionalRepository<T, TId = string, TCreate = Partial<T>, TUpdate = Partial<T>>
  extends VersionedRepository<T, TId, TCreate, TUpdate>
  implements ITransactionalContext
{
  async $transaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R> {
    return db.$transaction(fn as (tx: Prisma.TransactionClient) => Promise<R>);
  }
}
