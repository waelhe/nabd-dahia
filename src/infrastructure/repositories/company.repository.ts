/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Company Repository Implementation
 * 
 * تنفيذ مستودع الشركات باستخدام Prisma
 * 
 * @module infrastructure/repositories/company.repository
 */

import { db } from '@/lib/db';
import { SoftDeletableRepository } from './base.repository';
import type {
  ICompanyRepository,
  CompanyFilter,
  CompanyCreateData,
  CompanyUpdateData,
  CompanyEmployeeData,
} from '@/core/interfaces/repositories/company.repository';
import type { FindOptions, PaginatedResult, OperationResult } from '@/core/interfaces/repositories/base.repository';
import { Company, CompanyType, CompanyStatus } from '@/core/domain/entities/Company';
import { UniqueEntityId } from '@/core/domain/value-objects/UniqueEntityId';
import type { Company as PrismaCompany } from '@prisma/client';

// ==================== Company Repository ====================

export class CompanyRepository
  extends SoftDeletableRepository<PrismaCompany, string>
  implements ICompanyRepository
{
  constructor() {
    super(db.company as Parameters<typeof SoftDeletableRepository<PrismaCompany, string>['constructor']>[0], 'id');
  }

  // ==================== Query Methods ====================

  async findBySlug(slug: string): Promise<Company | null> {
    const company = await db.company.findUnique({
      where: { slug },
    });

    return company ? this.mapToEntity(company) : null;
  }

  async findByType(type: CompanyType, options?: FindOptions): Promise<PaginatedResult<Company>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { type, status: 'active', deletedAt: null };

    const [items, total] = await Promise.all([
      db.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.company.count({ where }),
    ]);

    return {
      items: items.map(c => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByOwnerId(ownerId: string, options?: FindOptions): Promise<PaginatedResult<Company>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Find companies where user is owner
    const employeeWhere = { userId: ownerId, role: 'owner' };
    const employee = await db.companyEmployee.findFirst({ where: employeeWhere });
    
    if (!employee) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false,
      };
    }

    const where = { id: employee.companyId, deletedAt: null };

    const [items, total] = await Promise.all([
      db.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.company.count({ where }),
    ]);

    return {
      items: items.map(c => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findByEmployeeId(employeeId: string, options?: FindOptions): Promise<PaginatedResult<Company>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get company IDs where user is employee
    const employeeRecords = await db.companyEmployee.findMany({
      where: { userId: employeeId },
      select: { companyId: true },
    });

    const companyIds = employeeRecords.map(e => e.companyId);

    const where = { id: { in: companyIds }, deletedAt: null };

    const [items, total] = await Promise.all([
      db.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.company.count({ where }),
    ]);

    return {
      items: items.map(c => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async findVerified(options?: FindOptions): Promise<PaginatedResult<Company>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = { verifiedAt: { not: null }, status: 'active', deletedAt: null };

    const [items, total] = await Promise.all([
      db.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.company.count({ where }),
    ]);

    return {
      items: items.map(c => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async search(filter: CompanyFilter, options?: FindOptions): Promise<PaginatedResult<Company>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = this.buildFilter(filter);

    const [items, total] = await Promise.all([
      db.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.company.count({ where }),
    ]);

    return {
      items: items.map(c => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  // ==================== Employee Management ====================

  async addEmployee(companyId: string, data: CompanyEmployeeData): Promise<OperationResult> {
    try {
      await db.companyEmployee.create({
        data: {
          companyId,
          userId: data.userId,
          role: data.role,
          permissions: data.permissions,
          status: 'active',
          invitedAt: new Date(),
          joinedAt: new Date(),
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to add employee' };
    }
  }

  async updateEmployee(
    companyId: string,
    userId: string,
    data: Partial<CompanyEmployeeData>
  ): Promise<OperationResult> {
    try {
      await db.companyEmployee.update({
        where: {
          companyId_userId: { companyId, userId },
        },
        data: {
          role: data.role,
          permissions: data.permissions,
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update employee' };
    }
  }

  async removeEmployee(companyId: string, userId: string): Promise<OperationResult> {
    try {
      await db.companyEmployee.delete({
        where: {
          companyId_userId: { companyId, userId },
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to remove employee' };
    }
  }

  async getEmployees(companyId: string): Promise<Array<{
    userId: string;
    role: string;
    permissions?: string[];
    joinedAt: Date;
  }>> {
    const employees = await db.companyEmployee.findMany({
      where: { companyId, status: 'active' },
      select: {
        userId: true,
        role: true,
        permissions: true,
        joinedAt: true,
      },
    });

    return employees.map(e => ({
      userId: e.userId,
      role: e.role,
      permissions: e.permissions as string[] | undefined,
      joinedAt: e.joinedAt ?? e.createdAt,
    }));
  }

  async isEmployee(companyId: string, userId: string): Promise<boolean> {
    const count = await db.companyEmployee.count({
      where: { companyId, userId, status: 'active' },
    });
    return count > 0;
  }

  async getEmployeeRole(companyId: string, userId: string): Promise<string | null> {
    const employee = await db.companyEmployee.findFirst({
      where: { companyId, userId, status: 'active' },
      select: { role: true },
    });
    return employee?.role ?? null;
  }

  // ==================== Verification ====================

  async updateVerification(
    companyId: string,
    verified: boolean,
    verifiedBy?: string
  ): Promise<OperationResult> {
    try {
      await db.company.update({
        where: { id: companyId },
        data: {
          verifiedAt: verified ? new Date() : null,
          verifiedBy: verified ? verifiedBy : null,
          status: verified ? 'active' : 'pending',
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update verification' };
    }
  }

  // ==================== Statistics ====================

  async updateRating(
    companyId: string,
    ratingAverage: number,
    ratingCount: number
  ): Promise<OperationResult> {
    try {
      await db.company.update({
        where: { id: companyId },
        data: { ratingAverage, ratingCount },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update rating' };
    }
  }

  async updateListingCount(companyId: string, increment: number): Promise<OperationResult> {
    try {
      await db.company.update({
        where: { id: companyId },
        data: {
          totalListings: { increment },
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update listing count' };
    }
  }

  async updateBookingCount(companyId: string, increment: number): Promise<OperationResult> {
    try {
      await db.company.update({
        where: { id: companyId },
        data: {
          totalBookings: { increment },
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update booking count' };
    }
  }

  // ==================== Services ====================

  async addService(
    companyId: string,
    service: {
      name: string;
      description?: string;
      type: string;
      price?: number;
      currency?: string;
    }
  ): Promise<OperationResult> {
    try {
      await db.companyService.create({
        data: {
          companyId,
          name: service.name,
          description: service.description,
          type: service.type,
          price: service.price,
          currency: service.currency ?? 'SYP',
          isActive: true,
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to add service' };
    }
  }

  async updateService(
    companyId: string,
    serviceId: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      currency: string;
      isActive: boolean;
    }>
  ): Promise<OperationResult> {
    try {
      await db.companyService.update({
        where: { id: serviceId, companyId },
        data,
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update service' };
    }
  }

  async removeService(companyId: string, serviceId: string): Promise<OperationResult> {
    try {
      await db.companyService.delete({
        where: { id: serviceId, companyId },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to remove service' };
    }
  }

  async getServices(companyId: string): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    type: string;
    price?: number;
    currency: string;
    isActive: boolean;
  }>> {
    const services = await db.companyService.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    return services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      type: s.type,
      price: s.price ?? undefined,
      currency: s.currency,
      isActive: s.isActive,
    }));
  }

  // ==================== Helper Methods ====================

  private buildFilter(filter: CompanyFilter): Record<string, unknown> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filter.type) where.type = filter.type;
    
    if (filter.status) {
      where.status = Array.isArray(filter.status)
        ? { in: filter.status }
        : filter.status;
    }
    
    if (filter.city) where.city = filter.city;
    if (filter.country) where.country = filter.country;
    
    if (filter.verified !== undefined) {
      where.verifiedAt = filter.verified ? { not: null } : null;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.ownerId) {
      // Need to join with companyEmployee
      where.employees = {
        some: { userId: filter.ownerId, role: 'owner' },
      };
    }

    if (filter.employeeId) {
      where.employees = {
        some: { userId: filter.employeeId },
      };
    }

    return where;
  }

  private mapToEntity(company: PrismaCompany): Company {
    const props = {
      name: company.name,
      slug: company.slug,
      description: company.description ?? undefined,
      logo: company.logo ?? undefined,
      coverImage: company.coverImage ?? undefined,
      type: company.type as CompanyType,
      registrationNumber: company.registrationNumber ?? undefined,
      taxId: company.taxId ?? undefined,
      email: company.email ?? undefined,
      phone: company.phone ?? undefined,
      website: company.website ?? undefined,
      address: {
        country: company.country ?? undefined,
        city: company.city ?? undefined,
        address: company.address ?? undefined,
        latitude: company.latitude ?? undefined,
        longitude: company.longitude ?? undefined,
      },
      status: company.status as CompanyStatus,
      verifiedAt: company.verifiedAt ?? undefined,
      verifiedBy: company.verifiedBy ?? undefined,
      ratingAverage: company.ratingAverage ?? undefined,
      ratingCount: company.ratingCount,
      totalListings: company.totalListings,
      totalBookings: company.totalBookings,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt ?? undefined,
    };

    return {
      id: new UniqueEntityId(company.id),
      props,
    } as unknown as Company;
  }
}

// ==================== Singleton Instance ====================

export const companyRepository = new CompanyRepository();
