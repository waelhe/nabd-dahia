/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Companies Use Cases
 * 
 * حالات استخدام الشركات
 * 
 * @module application/companies/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { companyRepository } from '@/infrastructure/repositories/company.repository';
import { userRepository } from '@/infrastructure/repositories/user.repository';

// ==================== Types ====================

export interface CreateCompanyInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: string;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  ownerId: string;
}

export interface UpdateCompanyInput {
  name?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Partial<{
    country: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
  registrationNumber?: string;
  taxId?: string;
  status?: string;
  settings?: Record<string, unknown>;
}

export interface AddEmployeeInput {
  companyId: string;
  userId: string;
  role: 'owner' | 'manager' | 'staff';
  permissions?: string[];
}

export interface CompanyFilter {
  type?: string;
  status?: string | string[];
  city?: string;
  country?: string;
  verified?: boolean;
  search?: string;
  ownerId?: string;
  employeeId?: string;
}

export interface CompanyOutput {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: string;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  address: {
    country?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  status: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  ratingAverage?: number;
  ratingCount: number;
  totalListings: number;
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyEmployeeOutput {
  userId: string;
  role: string;
  permissions?: string[];
  joinedAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatar?: string;
  };
}

export interface PaginatedCompanies {
  items: CompanyOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ==================== Use Cases ====================

/**
 * إنشاء شركة جديدة
 */
export async function createCompany(
  input: CreateCompanyInput
): Promise<Result<CompanyOutput, Error>> {
  try {
    // Verify owner exists using repository
    const owner = await userRepository.findById(input.ownerId);

    if (!owner) {
      return err(new Error('Owner not found'));
    }

    // Check slug uniqueness
    const existingSlug = await companyRepository.findBySlug(input.slug);
    if (existingSlug) {
      return err(new Error('Company slug already exists'));
    }

    // Create company using repository
    const company = await companyRepository.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      logo: input.logo,
      coverImage: input.coverImage,
      type: input.type,
      registrationNumber: input.registrationNumber,
      taxId: input.taxId,
      email: input.email,
      phone: input.phone,
      website: input.website,
      country: input.address?.country,
      city: input.address?.city,
      address: input.address?.address,
      latitude: input.address?.latitude,
      longitude: input.address?.longitude,
      status: 'pending',
    });

    // Add owner as employee using repository
    await companyRepository.addEmployee((company as { id: string }).id, {
      userId: input.ownerId,
      role: 'owner',
      permissions: ['all'],
    });

    return ok(mapToCompanyOutput(company as Record<string, unknown>));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create company'));
  }
}

/**
 * الحصول على شركة بالمعرف
 */
export async function getCompany(id: string): Promise<Result<CompanyOutput, Error>> {
  try {
    const company = await companyRepository.findById(id);

    if (!company) {
      return err(new Error('Company not found'));
    }

    return ok(mapToCompanyOutput(company as Record<string, unknown>));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get company'));
  }
}
/**
 * الحصول على شركة بالـ slug
 */
export async function getCompanyBySlug(slug: string): Promise<Result<CompanyOutput, Error>> {
  try {
    const company = await companyRepository.findBySlug(slug);

    if (!company) {
      return err(new Error('Company not found'));
    }

    return ok(mapToCompanyOutput(company as Record<string, unknown>));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get company'));
  }
}
/**
 * تحديث شركة
 */
export async function updateCompany(
  id: string,
  input: UpdateCompanyInput
): Promise<Result<CompanyOutput, Error>> {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.logo !== undefined) updateData.logo = input.logo;
    if (input.coverImage !== undefined) updateData.coverImage = input.coverImage;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.website !== undefined) updateData.website = input.website;
    if (input.address?.country !== undefined) updateData.country = input.address.country;
    if (input.address?.city !== undefined) updateData.city = input.address.city;
    if (input.address?.address !== undefined) updateData.address = input.address.address;
    if (input.address?.latitude !== undefined) updateData.latitude = input.address.latitude;
    if (input.address?.longitude !== undefined) updateData.longitude = input.address.longitude;
    if (input.registrationNumber !== undefined) updateData.registrationNumber = input.registrationNumber;
    if (input.taxId !== undefined) updateData.taxId = input.taxId;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.settings !== undefined) updateData.settings = input.settings;

    const company = await companyRepository.update(id, updateData);

    return ok(mapToCompanyOutput(company as Record<string, unknown>));
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to update company'));
  }
}
/**
 * حذف شركة (ناعم)
 */
export async function deleteCompany(id: string): Promise<Result<void, Error>> {
  try {
    await companyRepository.update(id, {
      deletedAt: new Date(),
      status: 'deleted',
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete company'));
  }
}
/**
 * التحقق من شركة
 */
export async function verifyCompany(
  id: string,
  verifiedBy: string
): Promise<Result<void, Error>> {
  try {
    const result = await companyRepository.updateVerification(id, true, verifiedBy);

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to verify company'));
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to verify company'));
  }
}
/**
 * البحث عن شركات
 */
export async function searchCompanies(
  filter: CompanyFilter,
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedCompanies, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const result = await companyRepository.search(filter, { page, limit });

    return ok({
      items: result.items.map(c => mapToCompanyOutput(c as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to search companies'));
  }
}
/**
 * شركات المستخدم (كمالك)
 */
export async function getUserCompanies(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<Result<PaginatedCompanies, Error>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const result = await companyRepository.findByOwnerId(userId, { page, limit });

    return ok({
      items: result.items.map(c => mapToCompanyOutput(c as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get user companies'));
  }
}
/**
 * إضافة موظف
 */
export async function addCompanyEmployee(
  input: AddEmployeeInput
): Promise<Result<void, Error>> {
  try {
    const result = await companyRepository.addEmployee(input.companyId, {
      userId: input.userId,
      role: input.role,
      permissions: input.permissions,
    });

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to add employee'));
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to add employee'));
  }
}
/**
 * إزالة موظف
 */
export async function removeCompanyEmployee(
  companyId: string,
  userId: string
): Promise<Result<void, Error>> {
  try {
    const result = await companyRepository.removeEmployee(companyId, userId);

    if (!result.success) {
      return err(new Error(result.error ?? 'Failed to remove employee'));
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to remove employee'));
  }
}
/**
 * موظفو الشركة
 */
export async function getCompanyEmployees(
  companyId: string
): Promise<Result<CompanyEmployeeOutput[], Error>> {
  try {
    const employees = await companyRepository.getEmployees(companyId);

    // Get user details using repository
    const userIds = employees.map(e => e.userId);
    const users = await userRepository.findMany({
      where: { id: { in: userIds } },
    });

    const userMap = new Map(users.map(u => [(u as { id: string }).id, u]));

    return ok(
      employees.map(e => ({
        ...e,
        user: userMap.get(e.userId) as CompanyEmployeeOutput['user'],
      }))
    );
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to get employees'));
  }
}
/**
 * التحقق من موظف
 */
export async function isCompanyEmployee(
  companyId: string,
  userId: string
): Promise<boolean> {
  return companyRepository.isEmployee(companyId, userId);
}
/**
 * دور الموظف
 */
export async function getEmployeeRole(
  companyId: string,
  userId: string
): Promise<string | null> {
  return companyRepository.getEmployeeRole(companyId, userId);
}

// ==================== Helper Functions ====================

function mapToCompanyOutput(company: Record<string, unknown>): CompanyOutput {
  return {
    id: company.id as string,
    name: company.name as string,
    slug: company.slug as string,
    description: company.description as string | undefined,
    logo: company.logo as string | undefined,
    coverImage: company.coverImage as string | undefined,
    type: company.type as string,
    registrationNumber: company.registrationNumber as string | undefined,
    taxId: company.taxId as string | undefined,
    email: company.email as string | undefined,
    phone: company.phone as string | undefined,
    website: company.website as string | undefined,
    address: {
      country: company.country as string | undefined,
      city: company.city as string | undefined,
      address: company.address as string | undefined,
      latitude: company.latitude as number | undefined,
      longitude: company.longitude as number | undefined,
    },
    status: company.status as string,
    verifiedAt: company.verifiedAt as Date | undefined,
    verifiedBy: company.verifiedBy as string | undefined,
    ratingAverage: company.ratingAverage as number | undefined,
    ratingCount: company.ratingCount as number,
    totalListings: company.totalListings as number,
    totalBookings: company.totalBookings as number,
    createdAt: company.createdAt as Date,
    updatedAt: company.updatedAt as Date,
  };
}
