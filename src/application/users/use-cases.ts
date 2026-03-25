/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Application Use Cases - Users
 * 
 * حالات استخدام المستخدمين
 * 
 * @module application/users
 */

import { Result, ok, err, ValidationError } from '@/core/types/result';
import { userRepository, UserRepository } from '@/infrastructure/repositories/user.repository';
import type { User } from '@prisma/client';

// ==================== Types ====================

export interface CreateUserInput {
  email?: string | null;
  phone?: string | null;
  firstName: string;
  lastName: string;
  displayName?: string;
  bio?: string;
  dateOfBirth?: Date | null;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  country?: string;
  city?: string;
  preferredLanguage?: 'ar' | 'en' | 'fr' | 'tr' | 'ru';
  preferredCurrency?: 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: Date | null;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  country?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  preferredLanguage?: 'ar' | 'en' | 'fr' | 'tr' | 'ru';
  preferredCurrency?: 'SYP' | 'USD' | 'EUR' | 'TRY' | 'AED' | 'SAR';
  notificationSettings?: Record<string, unknown>;
}

export interface ListUsersInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserOutput {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  status: string;
  role: string;
  membershipLevel: string;
  loyaltyPoints: number;
  ratingAverage: number | null;
  ratingCount: number;
  country: string | null;
  city: string | null;
  preferredLanguage: string;
  preferredCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListOutput {
  items: UserOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ==================== Errors ====================

export class UserUseCaseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'UserUseCaseError';
  }

  static notFound(id: string): UserUseCaseError {
    return new UserUseCaseError('NOT_FOUND', `المستخدم غير موجود: ${id}`, { id });
  }

  static emailExists(email: string): UserUseCaseError {
    return new UserUseCaseError('EMAIL_EXISTS', `البريد الإلكتروني مستخدم بالفعل: ${email}`, { email });
  }

  static phoneExists(phone: string): UserUseCaseError {
    return new UserUseCaseError('PHONE_EXISTS', `رقم الهاتف مستخدم بالفعل: ${phone}`, { phone });
  }

  static invalidInput(reason: string): UserUseCaseError {
    return new UserUseCaseError('INVALID_INPUT', `بيانات غير صالحة: ${reason}`);
  }

  static unauthorized(): UserUseCaseError {
    return new UserUseCaseError('UNAUTHORIZED', 'غير مصرح بهذه العملية');
  }
}

// ==================== Helper Functions ====================

function toUserOutput(user: User): UserOutput {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    role: user.role,
    membershipLevel: user.membershipLevel,
    loyaltyPoints: user.loyaltyPoints,
    ratingAverage: user.ratingAverage,
    ratingCount: user.ratingCount,
    country: user.country,
    city: user.city,
    preferredLanguage: user.preferredLanguage,
    preferredCurrency: user.preferredCurrency,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ==================== Use Cases ====================

/**
 * إنشاء مستخدم جديد
 */
export async function createUser(
  input: CreateUserInput,
  repo: UserRepository = userRepository
): Promise<Result<UserOutput, UserUseCaseError>> {
  // Validate required fields
  if (!input.firstName || input.firstName.length < 2) {
    return err(UserUseCaseError.invalidInput('الاسم الأول يجب أن يكون حرفين على الأقل'));
  }

  if (!input.lastName || input.lastName.length < 2) {
    return err(UserUseCaseError.invalidInput('الاسم الأخير يجب أن يكون حرفين على الأقل'));
  }

  // Check email uniqueness
  if (input.email) {
    const existingEmail = await repo.findByEmail(input.email);
    if (existingEmail) {
      return err(UserUseCaseError.emailExists(input.email));
    }
  }

  // Check phone uniqueness
  if (input.phone) {
    const existingPhone = await repo.findByPhone(input.phone);
    if (existingPhone) {
      return err(UserUseCaseError.phoneExists(input.phone));
    }
  }

  // Create user
  const user = await repo.create({
    email: input.email,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
    displayName: input.displayName || `${input.firstName} ${input.lastName}`,
    bio: input.bio,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    nationality: input.nationality,
    country: input.country,
    city: input.city,
    preferredLanguage: input.preferredLanguage || 'ar',
    preferredCurrency: input.preferredCurrency || 'SYP',
    status: 'pending',
    role: 'user',
    membershipLevel: 'bronze',
    loyaltyPoints: 0,
    totalSpent: 0,
    totalBookings: 0,
    ratingCount: 0,
    totalListings: 0,
    isSuperhost: false,
  });

  return ok(toUserOutput(user as User));
}

/**
 * الحصول على مستخدم
 */
export async function getUser(
  id: string,
  repo: UserRepository = userRepository
): Promise<Result<UserOutput, UserUseCaseError>> {
  const user = await repo.findById(id);

  if (!user) {
    return err(UserUseCaseError.notFound(id));
  }

  return ok(toUserOutput(user as User));
}

/**
 * تحديث مستخدم
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
  repo: UserRepository = userRepository
): Promise<Result<UserOutput, UserUseCaseError>> {
  // Check if user exists
  const existingUser = await repo.findById(id);
  if (!existingUser) {
    return err(UserUseCaseError.notFound(id));
  }

  // Update user
  const user = await repo.update(id, {
    ...input,
    updatedAt: new Date(),
  });

  return ok(toUserOutput(user as User));
}

/**
 * حذف مستخدم (ناعم)
 */
export async function deleteUser(
  id: string,
  repo: UserRepository = userRepository
): Promise<Result<void, UserUseCaseError>> {
  // Check if user exists
  const existingUser = await repo.findById(id);
  if (!existingUser) {
    return err(UserUseCaseError.notFound(id));
  }

  // Soft delete
  await repo.softDelete(id);

  return ok(undefined);
}

/**
 * قائمة المستخدمين
 */
export async function listUsers(
  input: ListUsersInput,
  repo: UserRepository = userRepository
): Promise<Result<UserListOutput, UserUseCaseError>> {
  const page = input.page ?? 1;
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));

  // Build filter
  const where: Record<string, unknown> = {};
  
  if (input.status) {
    where.status = input.status;
  }
  
  if (input.role) {
    where.role = input.role;
  }
  
  if (input.search) {
    where.OR = [
      { firstName: { contains: input.search } },
      { lastName: { contains: input.search } },
      { displayName: { contains: input.search } },
      { email: { contains: input.search } },
    ];
  }

  // Get paginated results
  const result = await repo.findWithPagination({
    where,
    page,
    limit,
    orderBy: input.sortBy ? { [input.sortBy]: input.sortOrder ?? 'desc' } : { createdAt: 'desc' },
  });

  return ok({
    items: result.items.map(u => toUserOutput(u as User)),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
  });
}

/**
 * البحث عن مستخدمين
 */
export async function searchUsers(
  query: string,
  limit: number = 10,
  repo: UserRepository = userRepository
): Promise<Result<UserOutput[], UserUseCaseError>> {
  if (!query || query.length < 2) {
    return err(UserUseCaseError.invalidInput('الاستعلام يجب أن يكون حرفين على الأقل'));
  }

  const users = await repo.search(query, { limit });

  return ok(users.map(u => toUserOutput(u as User)));
}

/**
 * الحصول على إحصائيات المستخدمين
 */
export async function getUserStats(
  repo: UserRepository = userRepository
): Promise<Result<{
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  byMembership: Record<string, number>;
}, UserUseCaseError>> {
  const [total, byRole, byStatus, byMembership] = await Promise.all([
    repo.count(),
    repo.countByRole(),
    repo.countByStatus(),
    repo.countByMembershipLevel(),
  ]);

  return ok({ total, byRole, byStatus, byMembership });
}
