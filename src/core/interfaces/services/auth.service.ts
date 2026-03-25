/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auth Service Interface - واجهة خدمة المصادقة
 * 
 * @module core/interfaces/services/auth.service
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * طلب التسجيل
 */
export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  referralCode?: string;
}

/**
 * نتيجة التسجيل
 */
export interface RegisterResult {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
  session: {
    token: string;
    refreshToken: string;
    expiresAt: Date;
  };
  requiresVerification: boolean;
}

/**
 * طلب تسجيل الدخول
 */
export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
  deviceInfo?: {
    name?: string;
    type?: string;
    os?: string;
    browser?: string;
  };
  rememberMe?: boolean;
  twoFactorCode?: string;
}

/**
 * نتيجة تسجيل الدخول
 */
export interface LoginResult {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    avatar?: string;
  };
  session: {
    token: string;
    refreshToken: string;
    expiresAt: Date;
  };
  requiresTwoFactor: boolean;
  isNewDevice: boolean;
}

/**
 * طلب OAuth
 */
export interface OAuthRequest {
  provider: 'google' | 'facebook' | 'apple' | 'twitter';
  accessToken?: string;
  idToken?: string;
  code?: string;
  redirectUri?: string;
}

/**
 * نتيجة OAuth
 */
export interface OAuthResult {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    role: string;
  };
  session: {
    token: string;
    refreshToken: string;
    expiresAt: Date;
  };
  isNewUser: boolean;
  requiresAdditionalInfo: boolean;
}

/**
 * نتيجة تجديد الرمز
 */
export interface RefreshResult {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * طلب التحقق
 */
export interface VerificationRequest {
  type: 'email' | 'phone';
  code?: string;
  token?: string;
}

/**
 * نتيجة التحقق
 */
export interface VerificationResult {
  verified: boolean;
  type: 'email' | 'phone';
  verifiedAt: Date;
}

/**
 * طلب إرسال كود التحقق
 */
export interface SendVerificationRequest {
  type: 'email' | 'phone';
  email?: string;
  phone?: string;
}

/**
 * طلب إعادة تعيين كلمة المرور
 */
export interface PasswordResetRequest {
  email?: string;
  phone?: string;
}

/**
 * طلب تأكيد إعادة التعيين
 */
export interface ConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * طلب تغيير كلمة المرور
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * جلسة المستخدم
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt?: Date;
}

/**
 * معلومات الجهاز
 */
export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  os: string;
  browser: string;
  lastUsed: Date;
  location?: {
    country?: string;
    city?: string;
  };
  isCurrent: boolean;
}

/**
 * حالة Two-Factor
 */
export interface TwoFactorStatus {
  enabled: boolean;
  method?: 'app' | 'sms' | 'email';
  verifiedAt?: Date;
  backupCodesRemaining?: number;
}

/**
 * إعداد Two-Factor
 */
export interface SetupTwoFactorRequest {
  method: 'app' | 'sms' | 'email';
  phoneNumber?: string;
}

/**
 * نتيجة إعداد Two-Factor
 */
export interface SetupTwoFactorResult {
  secret?: string;
  qrCodeUrl?: string;
  backupCodes: string[];
  verificationRequired: boolean;
}

/**
 * فحص كلمة المرور
 */
export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  feedback: string[];
  suggestions: string[];
  crackTimeEstimate?: string;
}

// ==================== Service Interface ====================

/**
 * واجهة خدمة المصادقة
 */
export interface IAuthService {
  // ==================== Registration ====================

  /**
   * تسجيل مستخدم جديد
   */
  register(request: RegisterRequest): Promise<Result<RegisterResult, Error>>;

  /**
   * التحقق من توفر البريد
   */
  isEmailAvailable(email: string): Promise<boolean>;

  /**
   * التحقق من توفر الهاتف
   */
  isPhoneAvailable(phone: string): Promise<boolean>;

  // ==================== Login ====================

  /**
   * تسجيل الدخول
   */
  login(request: LoginRequest): Promise<Result<LoginResult, Error>>;

  /**
   * تسجيل دخول OAuth
   */
  loginWithOAuth(request: OAuthRequest): Promise<Result<OAuthResult, Error>>;

  /**
   * تسجيل الخروج
   */
  logout(token: string): Promise<Result<void, Error>>;

  /**
   * تسجيل الخروج من كل الأجهزة
   */
  logoutAll(userId: string): Promise<Result<number, Error>>;

  /**
   * تسجيل الخروج من جهاز محدد
   */
  logoutDevice(sessionId: string): Promise<Result<void, Error>>;

  // ==================== Session ====================

  /**
   * تجديد الرمز
   */
  refreshToken(refreshToken: string): Promise<Result<RefreshResult, Error>>;

  /**
   * التحقق من الرمز
   */
  validateToken(token: string): Promise<Result<{ userId: string; sessionId: string }, Error>>;

  /**
   * جلسة المستخدم
   */
  getSession(sessionId: string): Promise<Result<UserSession, Error>>;

  /**
   * جلسات المستخدم
   */
  getUserSessions(userId: string): Promise<UserSession[]>;

  /**
   * أجهزة المستخدم
   */
  getUserDevices(userId: string): Promise<DeviceInfo[]>;

  // ==================== Verification ====================

  /**
   * إرسال كود التحقق
   */
  sendVerificationCode(request: SendVerificationRequest): Promise<Result<void, Error>>;

  /**
   * التحقق من الكود
   */
  verify(request: VerificationRequest): Promise<Result<VerificationResult, Error>>;

  /**
   * إعادة إرسال التحقق
   */
  resendVerification(type: 'email' | 'phone', userId: string): Promise<Result<void, Error>>;

  // ==================== Password ====================

  /**
   * طلب إعادة تعيين كلمة المرور
   */
  requestPasswordReset(request: PasswordResetRequest): Promise<Result<void, Error>>;

  /**
   * تأكيد إعادة التعيين
   */
  confirmPasswordReset(request: ConfirmPasswordResetRequest): Promise<Result<void, Error>>;

  /**
   * تغيير كلمة المرور
   */
  changePassword(userId: string, request: ChangePasswordRequest): Promise<Result<void, Error>>;

  /**
   * فحص قوة كلمة المرور
   */
  checkPasswordStrength(password: string): Promise<PasswordStrength>;

  /**
   * التحقق من كلمة المرور
   */
  verifyPassword(userId: string, password: string): Promise<boolean>;

  // ==================== Two-Factor ====================

  /**
   * حالة Two-Factor
   */
  getTwoFactorStatus(userId: string): Promise<TwoFactorStatus>;

  /**
   * إعداد Two-Factor
   */
  setupTwoFactor(userId: string, request: SetupTwoFactorRequest): Promise<Result<SetupTwoFactorResult, Error>>;

  /**
   * تفعيل Two-Factor
   */
  enableTwoFactor(userId: string, code: string): Promise<Result<void, Error>>;

  /**
   * تعطيل Two-Factor
   */
  disableTwoFactor(userId: string, code: string): Promise<Result<void, Error>>;

  /**
   * التحقق من كود Two-Factor
   */
  verifyTwoFactor(userId: string, code: string): Promise<boolean>;

  /**
   * إعادة توليد أكواد النسخ الاحتياطي
   */
  regenerateBackupCodes(userId: string, password: string): Promise<Result<string[], Error>>;

  // ==================== Security ====================

  /**
   * سجل تسجيل الدخول
   */
  getLoginHistory(userId: string, options?: { limit?: number; offset?: number }): Promise<Array<{
    id: string;
    ipAddress: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: { country?: string; city?: string };
    successful: boolean;
    timestamp: Date;
  }>>;

  /**
   * تحديث آخر نشاط
   */
  updateLastActivity(sessionId: string): Promise<void>;

  /**
   * تنظيف الجلسات المنتهية
   */
  cleanupExpiredSessions(): Promise<number>;
}
