/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Users API Endpoint
 *
 * نقطة نهاية API للمستخدمين مع تحقق محسن
 *
 * @route GET /api/users - قائمة المستخدمين
 * @route POST /api/users - إنشاء مستخدم جديد
 * @updated Fixed formatValidationErrors import
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { UserMapper } from '@/application/mappers';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  getPaginationParams,
  getSortParams,
} from '@/lib/api-response';
import {
  createUserSchema,
  validate,
  formatValidationErrors,
} from '@/lib/api-validation';

// Initialize repository
const userRepository = new UserRepository();

// ==================== GET - List Users ====================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Only admins can list users
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية للوصول', 403);
    }

    const { searchParams } = new URL(request.url);

    // Check for stats request
    if (searchParams.get('stats') === 'true') {
      return handleGetStats();
    }

    // Check for search request
    const searchQuery = searchParams.get('q') || searchParams.get('search');
    if (searchQuery) {
      return handleSearch(searchQuery, searchParams);
    }

    // List users with pagination
    return handleList(searchParams);

  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب المستخدمين', 500);
  }
}

// ==================== POST - Create User ====================

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Only admins can create users directly
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لإنشاء مستخدم', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = validate(createUserSchema, body);
    if (!validation.success) {
      return validationErrorResponse(formatValidationErrors(validation.errors));
    }

    const data = validation.data;

    // Check for existing email
    if (data.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        return errorResponse('EMAIL_EXISTS', 'البريد الإلكتروني مستخدم بالفعل', 409);
      }
    }

    // Check for existing phone
    if (data.phone) {
      const existingPhone = await userRepository.findByPhone(data.phone);
      if (existingPhone) {
        return errorResponse('PHONE_EXISTS', 'رقم الهاتف مستخدم بالفعل', 409);
      }
    }

    // Create user
    const createData = UserMapper.createDTOToPersistence(data);
    const newUser = await userRepository.create(createData);

    return createdResponse(UserMapper.prismaToDTO(newUser as any));

  } catch (error) {
    console.error('Error creating user:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء المستخدم', 500);
  }
}

// ==================== Helper Functions ====================

async function handleGetStats() {
  const stats = await userRepository.getStats();

  return successResponse({
    total: stats.total,
    active: stats.active,
    pending: stats.pending,
    suspended: stats.suspended,
    hosts: stats.hosts,
    companies: stats.companies,
    guests: stats.guests,
    byRole: stats.byRole,
    newThisMonth: stats.newThisMonth,
    verifiedUsers: stats.verified,
  });
}

async function handleSearch(query: string, searchParams: URLSearchParams) {
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '10', 10));

  const users = await userRepository.search(query, { limit });

  return successResponse({
    items: users.map(u => UserMapper.prismaToDTO(u as any)),
    query,
    total: users.length,
  });
}

async function handleList(searchParams: URLSearchParams) {
  const { page, limit, skip } = getPaginationParams(searchParams);
  const { sortBy, sortOrder } = getSortParams(searchParams);

  // Build filter
  const filter = {
    status: searchParams.get('status') || undefined,
    role: searchParams.get('role') || undefined,
    country: searchParams.get('country') || undefined,
    city: searchParams.get('city') || undefined,
  };

  // Get users
  const [users, total] = await Promise.all([
    userRepository.findMany({
      filter,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    userRepository.count(filter),
  ]);

  return paginatedResponse(
    users.map(u => UserMapper.prismaToDTO(u as any)),
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }
  );
}
