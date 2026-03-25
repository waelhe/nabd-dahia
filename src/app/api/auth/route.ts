/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auth API Endpoint
 *
 * نقطة نهاية API للمصادقة مع تحقق محسن
 *
 * @route GET /api/auth - الحصول على المستخدم الحالي
 * @route POST /api/auth/register - تسجيل مستخدم جديد
 * @route POST /api/auth/login - تسجيل الدخول
 * @route POST /api/auth/logout - تسجيل الخروج
 * @route POST /api/auth/refresh - تجديد الرمز
 * @route POST /api/auth/password/change - تغيير كلمة المرور
 * @route POST /api/auth/password/reset - إعادة تعيين كلمة المرور
 * @updated Fixed formatValidationErrors import
 */

import { NextRequest } from 'next/server';
import { getCurrentUser, setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { AuthService } from '@/infrastructure/services/auth.service';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api-response';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  validate,
  formatValidationErrors,
} from '@/lib/api-validation';

// Initialize services
const authService = new AuthService();

// ==================== GET - Get Current User ====================

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }

    return successResponse({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      isVerified: !!(user as any).emailVerifiedAt || !!(user as any).phoneVerifiedAt,
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب المستخدم', 500);
  }
}

// ==================== POST - Auth Actions ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'login';

    switch (action) {
      case 'register':
        return await handleRegister(body);
      case 'login':
        return await handleLogin(body);
      case 'logout':
        return await handleLogout();
      case 'refresh':
        return await handleRefresh(body);
      case 'password/change':
        return await handleChangePassword(body);
      case 'password/reset':
        return await handlePasswordReset(body);
      case 'password/reset/confirm':
        return await handlePasswordResetConfirm(body);
      case 'verify/email':
        return await handleVerifyEmail(body);
      case 'verify/phone':
        return await handleVerifyPhone(body);
      default:
        return errorResponse('INVALID_ACTION', 'إجراء غير معروف', 400);
    }

  } catch (error) {
    console.error('Auth error:', error);

    if (error instanceof Error) {
      if (error.message.includes('مستخدم') || error.message.includes('صحيحة') || error.message.includes('موقوف')) {
        return errorResponse('AUTH_ERROR', error.message, 400);
      }
    }

    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء المصادقة', 500);
  }
}

// ==================== Handlers ====================

async function handleRegister(body: unknown) {
  // Validate input
  const validation = validate(registerSchema, body);
  if (!validation.success) {
    return validationErrorResponse(formatValidationErrors(validation.errors));
  }

  const data = validation.data;

  try {
    const result = await authService.register({
      email: data.email || undefined,
      phone: data.phone || undefined,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (result.isFailure) {
      return errorResponse('REGISTRATION_ERROR', result.error.message, 400);
    }

    const { user, session, requiresVerification } = result.value;

    await setAuthCookies({
      accessToken: session.token,
      refreshToken: session.refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    });

    return createdResponse({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      message: 'تم التسجيل بنجاح',
      requiresVerification,
    });

  } catch (error) {
    if (error instanceof Error) {
      return errorResponse('REGISTRATION_ERROR', error.message, 400);
    }
    throw error;
  }
}

async function handleLogin(body: unknown) {
  // Validate input
  const validation = validate(loginSchema, body);
  if (!validation.success) {
    return validationErrorResponse(formatValidationErrors(validation.errors));
  }

  const data = validation.data;

  try {
    const result = await authService.login({
      identifier: data.identifier,
      password: data.password,
    });

    if (result.isFailure) {
      return errorResponse('LOGIN_ERROR', result.error.message, 401);
    }

    const { user, session, requiresTwoFactor } = result.value;

    await setAuthCookies({
      accessToken: session.token,
      refreshToken: session.refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    });

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
      message: 'تم تسجيل الدخول بنجاح',
      requiresTwoFactor,
    });

  } catch (error) {
    if (error instanceof Error) {
      return errorResponse('LOGIN_ERROR', error.message, 401);
    }
    throw error;
  }
}

async function handleLogout() {
  const user = await getCurrentUser();

  if (user) {
    await authService.logout(user.id);
  }

  await clearAuthCookies();

  return successResponse({ message: 'تم تسجيل الخروج بنجاح' });
}

async function handleRefresh(body: { refreshToken?: string }) {
  if (!body.refreshToken) {
    return errorResponse('INVALID_INPUT', 'رمز التجديد مطلوب', 400);
  }

  const result = await authService.refreshToken(body.refreshToken);

  if (result.isFailure) {
    return errorResponse('TOKEN_EXPIRED', result.error.message, 401);
  }

  const { token, refreshToken } = result.value;

  await setAuthCookies({
    accessToken: token,
    refreshToken: refreshToken,
    expiresIn: 15 * 60, // 15 minutes
  });

  return successResponse({
    message: 'تم تجديد الرمز بنجاح',
  });
}

async function handleChangePassword(body: unknown) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
  }

  // Validate input
  const validation = validate(changePasswordSchema, body);
  if (!validation.success) {
    return validationErrorResponse(formatValidationErrors(validation.errors));
  }

  const data = validation.data;

  const result = await authService.changePassword(user.id, {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.newPassword,
  });

  if (result.isFailure) {
    return errorResponse('PASSWORD_ERROR', result.error.message, 400);
  }

  return successResponse({ message: 'تم تغيير كلمة المرور بنجاح' });
}

async function handlePasswordReset(body: { email?: string; phone?: string }) {
  if (!body.email && !body.phone) {
    return errorResponse('INVALID_INPUT', 'البريد الإلكتروني أو رقم الهاتف مطلوب', 400);
  }

  const result = await authService.requestPasswordReset({
    email: body.email,
    phone: body.phone,
  });

  if (result.isFailure) {
    return errorResponse('RESET_ERROR', result.error.message, 400);
  }

  return successResponse({
    message: 'تم إرسال رابط إعادة التعيين',
  });
}

async function handlePasswordResetConfirm(body: {
  token: string;
  newPassword: string;
}) {
  if (!body.token || !body.newPassword) {
    return errorResponse('INVALID_INPUT', 'الرمز وكلمة المرور الجديدة مطلوبان', 400);
  }

  if (body.newPassword.length < 8) {
    return errorResponse('INVALID_INPUT', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', 400);
  }

  const result = await authService.confirmPasswordReset({
    token: body.token,
    newPassword: body.newPassword,
    confirmPassword: body.newPassword,
  });

  if (result.isFailure) {
    return errorResponse('RESET_ERROR', result.error.message, 400);
  }

  return successResponse({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
}

async function handleVerifyEmail(body: { token: string }) {
  if (!body.token) {
    return errorResponse('INVALID_INPUT', 'رمز التحقق مطلوب', 400);
  }

  const result = await authService.verify({
    code: body.token,
    type: 'email',
  });

  if (result.isFailure) {
    return errorResponse('VERIFICATION_ERROR', result.error.message, 400);
  }

  return successResponse({ message: 'تم التحقق من البريد الإلكتروني بنجاح' });
}

async function handleVerifyPhone(body: { code: string }) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
  }

  if (!body.code) {
    return errorResponse('INVALID_INPUT', 'رمز التحقق مطلوب', 400);
  }

  const result = await authService.verify({
    code: body.code,
    type: 'phone',
  });

  if (result.isFailure) {
    return errorResponse('VERIFICATION_ERROR', result.error.message, 400);
  }

  return successResponse({ message: 'تم التحقق من رقم الهاتف بنجاح' });
}
