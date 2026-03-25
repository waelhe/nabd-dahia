/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auth Utilities
 * 
 * أدوات المصادقة والتشفير
 * 
 * @module lib/auth
 */

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

// ==================== Types ====================

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatar: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthPayload {
  userId: string;
  email: string | null;
  role: string;
  iat: number;
  exp: number;
}

// ==================== Constants ====================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes in seconds

// ==================== Password Functions ====================

/**
 * تشفير كلمة المرور
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// ==================== Token Functions ====================

/**
 * إنشاء Access Token
 */
export async function generateAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * إنشاء Refresh Token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({
    userId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * التحقق من Token
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * إنشاء Tokens كاملة
 */
export async function generateTokens(user: AuthUser): Promise<AuthTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user.id),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  };
}

// ==================== Session Functions ====================

/**
 * إنشاء جلسة جديدة
 */
export async function createSession(userId: string, deviceInfo?: string, ipAddress?: string): Promise<string> {
  const tokens = await generateTokens({
    id: userId,
    email: null,
    phone: null,
    firstName: '',
    lastName: '',
    role: 'user',
    status: 'active',
    avatar: null,
  });

  // Create refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.userSession.create({
    data: {
      userId,
      token: tokens.refreshToken,
      refreshToken: tokens.refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    },
  });

  return tokens.refreshToken;
}

/**
 * حذف الجلسة (تسجيل الخروج)
 */
export async function deleteSession(token: string): Promise<void> {
  await db.userSession.deleteMany({
    where: { token },
  });
}

/**
 * حذف جميع جلسات المستخدم
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.userSession.deleteMany({
    where: { userId },
  });
}

/**
 * التحقق من الجلسة
 */
export async function validateSession(refreshToken: string): Promise<{ userId: string } | null> {
  const session = await db.userSession.findFirst({
    where: {
      refreshToken,
      expiresAt: { gt: new Date() },
    },
    select: { userId: true },
  });

  return session;
}

// ==================== Cookie Functions ====================

/**
 * تعيين Cookies للمصادقة
 */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  
  // Access token cookie
  cookieStore.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expiresIn,
    path: '/',
  });

  // Refresh token cookie
  cookieStore.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * حذف Cookies المصادقة
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

/**
 * الحصول على Access Token من Cookie
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}

/**
 * الحصول على Refresh Token من Cookie
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refreshToken')?.value;
}

// ==================== Auth Functions ====================

/**
 * الحصول على المستخدم الحالي
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    return null;
  }

  const payload = await verifyToken(accessToken);
  
  if (!payload) {
    return null;
  }

  const user = await db.user.findFirst({
    where: {
      id: payload.userId,
      deletedAt: null,
      status: { not: 'deleted' },
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  return user;
}

/**
 * التحقق من المصادقة
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * التحقق من دور معين
 */
export async function requireRole(roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  
  return user;
}

// ==================== Registration ====================

/**
 * تسجيل مستخدم جديد
 */
export async function registerUser(input: {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  // Check if email exists
  if (input.email) {
    const existingEmail = await db.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) {
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }
  }

  // Check if phone exists
  if (input.phone) {
    const existingPhone = await db.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) {
      throw new Error('رقم الهاتف مستخدم بالفعل');
    }
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const user = await db.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: `${input.firstName} ${input.lastName}`,
      status: 'pending',
      role: 'user',
      membershipLevel: 'bronze',
      loyaltyPoints: 0,
      totalSpent: 0,
      totalBookings: 0,
      ratingCount: 0,
      totalListings: 0,
      isSuperhost: false,
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  // Generate tokens
  const tokens = await generateTokens(user);

  // Create session
  await createSession(user.id);

  // Set cookies
  await setAuthCookies(tokens);

  return { user, tokens };
}

/**
 * تسجيل الدخول
 */
export async function loginUser(identifier: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  // Find user by email or phone
  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
      deletedAt: null,
    },
  });

  if (!user || !user.passwordHash) {
    throw new Error('بيانات الدخول غير صحيحة');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    throw new Error('بيانات الدخول غير صحيحة');
  }

  // Check if user is active
  if (user.status === 'suspended') {
    throw new Error('الحساب موقوف. تواصل مع الدعم');
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const tokens = await generateTokens({
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
  });

  // Create session
  await createSession(user.id);

  // Set cookies
  await setAuthCookies(tokens);

  return {
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
    tokens,
  };
}

/**
 * تسجيل الخروج
 */
export async function logoutUser(): Promise<void> {
  const refreshToken = await getRefreshToken();
  
  if (refreshToken) {
    await deleteSession(refreshToken);
  }
  
  await clearAuthCookies();
}
