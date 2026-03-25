/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * User by ID API Endpoint
 *
 * نقطة نهاية API لمستخدم محدد
 *
 * @route GET /api/users/[id] - الحصول على مستخدم
 * @route PUT /api/users/[id] - تحديث مستخدم
 * @route DELETE /api/users/[id] - حذف مستخدم
 * @updated Fixed formatValidationErrors import
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { UserMapper } from '@/application/mappers';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  noContentResponse,
} from '@/lib/api-response';
import {
  updateUserSchema,
  idSchema,
  validate,
  formatValidationErrors,
} from '@/lib/api-validation';

// Initialize repository
const userRepository = new UserRepository();

// ==================== GET - Get User ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { id } = await params;

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف المستخدم غير صالح', 400);
    }

    // Get user
    const user = await userRepository.findById(id);

    if (!user) {
      return notFoundResponse('المستخدم');
    }

    // Check access - users can view their own profile, admins can view all
    const isOwner = currentUser?.id === id;
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      // Return limited public profile
      return successResponse({
        id: (user as any).id,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        displayName: (user as any).displayName,
        avatar: (user as any).avatar,
        rating: (user as any).ratingAverage,
        isSuperhost: (user as any).isSuperhost,
        totalReviews: (user as any).ratingCount,
        hostingSince: (user as any).hostingSince,
        preferredLanguage: (user as any).preferredLanguage,
      });
    }

    // Return full profile for owner or admin
    return successResponse(UserMapper.prismaToDTO(user as any));

  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب المستخدم', 500);
  }
}

// ==================== PUT - Update User ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { id } = await params;

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف المستخدم غير صالح', 400);
    }

    // Check access
    const isOwner = currentUser.id === id;
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لتعديل هذا المستخدم', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = validate(updateUserSchema, body);
    if (!validation.success) {
      return validationErrorResponse(formatValidationErrors(validation.errors));
    }

    const data = validation.data;

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      return notFoundResponse('المستخدم');
    }

    // Update user
    const updateData = UserMapper.updateDTOToPersistence(data);
    const updatedUser = await userRepository.update(id, updateData);

    return successResponse(UserMapper.prismaToDTO(updatedUser as any));

  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث المستخدم', 500);
  }
}

// ==================== DELETE - Delete User ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { id } = await params;

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف المستخدم غير صالح', 400);
    }

    // Check access
    const isOwner = currentUser.id === id;
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لحذف هذا المستخدم', 403);
    }

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      return notFoundResponse('المستخدم');
    }

    // Soft delete
    await userRepository.softDelete(id, currentUser.id);

    return noContentResponse();

  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء حذف المستخدم', 500);
  }
}

// ==================== PATCH - Partial Update ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate ID
    const idValidation = validate(idSchema, id);
    if (!idValidation.success) {
      return errorResponse('INVALID_ID', 'معرف المستخدم غير صالح', 400);
    }

    // Check access
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

    if (!isAdmin) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لهذا الإجراء', 403);
    }

    // Handle specific actions
    const action = body.action;

    switch (action) {
      case 'verify': {
        const user = await userRepository.update(id, {
          emailVerifiedAt: new Date(),
          phoneVerifiedAt: new Date(),
        });
        return successResponse({ message: 'تم التحقق من المستخدم', user: UserMapper.prismaToDTO(user as any) });
      }

      case 'suspend': {
        const user = await userRepository.update(id, {
          status: 'suspended',
        });
        return successResponse({ message: 'تم تعليق المستخدم', user: UserMapper.prismaToDTO(user as any) });
      }

      case 'activate': {
        const user = await userRepository.update(id, {
          status: 'active',
        });
        return successResponse({ message: 'تم تفعيل المستخدم', user: UserMapper.prismaToDTO(user as any) });
      }

      case 'make-host': {
        const user = await userRepository.update(id, {
          role: 'host',
          hostingSince: new Date(),
        });
        return successResponse({ message: 'تم ترقية المستخدم إلى مضيف', user: UserMapper.prismaToDTO(user as any) });
      }

      default:
        return errorResponse('INVALID_ACTION', 'إجراء غير معروف', 400);
    }

  } catch (error) {
    console.error('Error patching user:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث المستخدم', 500);
  }
}
