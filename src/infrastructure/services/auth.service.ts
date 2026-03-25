/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auth Service Implementation
 * 
 * تنفيذ خدمة المصادقة
 * 
 * @module infrastructure/services/auth.service
 */

import { db } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import {
  IAuthService,
  RegisterRequest,
  RegisterResult,
  LoginRequest,
  LoginResult,
  OAuthRequest,
  OAuthResult,
  RefreshResult,
  VerificationRequest,
  VerificationResult,
  SendVerificationRequest,
  PasswordResetRequest,
  ConfirmPasswordResetRequest,
  ChangePasswordRequest,
  UserSession,
  DeviceInfo,
  TwoFactorStatus,
  SetupTwoFactorRequest,
  SetupTwoFactorResult,
  PasswordStrength,
} from '@/core/interfaces/services/auth.service';
import { Result, ok, err } from '@/core/types/result';

// ==================== Types ====================

interface Session {
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

interface TwoFactorConfig {
  enabled: boolean;
  method?: 'app' | 'sms' | 'email';
  secret?: string;
  verifiedAt?: Date;
  backupCodes: string[];
}

// ==================== Constants ====================

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const BCRYPT_ROUNDS = 12;

// ==================== Auth Service ====================

/**
 * تنفيذ خدمة المصادقة
 */
export class AuthService implements IAuthService {
  private sessions: Map<string, Session> = new Map();
  private refreshTokens: Map<string, { userId: string; sessionId: string; expiresAt: Date }> = new Map();
  private verificationCodes: Map<string, { code: string; expiresAt: Date; type: 'email' | 'phone' }> = new Map();
  private passwordResetTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private twoFactorConfigs: Map<string, TwoFactorConfig> = new Map();
  private loginHistory: Map<string, Array<{
    id: string;
    ipAddress: string;
    userAgent?: string;
    deviceInfo?: string;
    successful: boolean;
    timestamp: Date;
  }>> = new Map();

  // ==================== Registration ====================

  async register(request: RegisterRequest): Promise<Result<RegisterResult, Error>> {
    try {
      // Check if email exists
      if (request.email && !(await this.isEmailAvailable(request.email))) {
        return err(new Error('Email is already registered'));
      }

      // Check if phone exists
      if (request.phone && !(await this.isPhoneAvailable(request.phone))) {
        return err(new Error('Phone number is already registered'));
      }

      // Hash password
      const passwordHash = await hash(request.password, BCRYPT_ROUNDS);

      // Generate verification code
      const verificationCode = this.generateCode(6);

      // Create user
      const user = await db.user.create({
        data: {
          email: request.email,
          phone: request.phone,
          passwordHash,
          firstName: request.firstName,
          lastName: request.lastName,
          displayName: request.displayName ?? `${request.firstName} ${request.lastName}`,
          dateOfBirth: request.dateOfBirth,
          gender: request.gender,
          nationality: request.nationality,
          preferredLanguage: request.preferredLanguage ?? 'ar',
          preferredCurrency: request.preferredCurrency ?? 'SYP',
          role: 'user',
          status: 'pending_verification',
        },
      });

      // Store verification code
      const key = request.email ?? request.phone ?? '';
      this.verificationCodes.set(key, {
        code: verificationCode,
        expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY),
        type: request.email ? 'email' : 'phone',
      });

      // Send verification code (in production, send actual email/SMS)
      console.log(`[AUTH] Verification code for ${key}: ${verificationCode}`);

      // Create session
      const { session, token, refreshToken } = await this.createSession(user.id);

      return ok({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt,
        },
        requiresVerification: true,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Registration failed'));
    }
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await db.user.findUnique({ where: { email } });
    return !user;
  }

  async isPhoneAvailable(phone: string): Promise<boolean> {
    const user = await db.user.findUnique({ where: { phone } });
    return !user;
  }

  // ==================== Login ====================

  async login(request: LoginRequest): Promise<Result<LoginResult, Error>> {
    try {
      // Find user by email or phone
      const user = await db.user.findFirst({
        where: {
          OR: [
            { email: request.identifier },
            { phone: request.identifier },
          ],
        },
      });

      if (!user) {
        this.recordLoginAttempt('', request.identifier, false);
        return err(new Error('Invalid credentials'));
      }

      // Check if account is locked or suspended
      if (user.status === 'suspended') {
        return err(new Error('Account is suspended'));
      }

      // Verify password
      if (!user.passwordHash) {
        return err(new Error('Account has no password set'));
      }

      const isValid = await compare(request.password, user.passwordHash);
      if (!isValid) {
        this.recordLoginAttempt(user.id, request.identifier, false);
        return err(new Error('Invalid credentials'));
      }

      // Check two-factor authentication
      const twoFactorConfig = this.twoFactorConfigs.get(user.id);
      if (twoFactorConfig?.enabled) {
        if (!request.twoFactorCode) {
          return ok({
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              status: user.status,
            },
            session: {
              token: '',
              refreshToken: '',
              expiresAt: new Date(),
            },
            requiresTwoFactor: true,
            isNewDevice: false,
          });
        }

        // Verify 2FA code
        const isValidCode = await this.verifyTwoFactorCode(user.id, request.twoFactorCode);
        if (!isValidCode) {
          return err(new Error('Invalid two-factor code'));
        }
      }

      // Create session
      const { session, token, refreshToken } = await this.createSession(user.id);

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Record successful login
      this.recordLoginAttempt(user.id, request.identifier, true);

      return ok({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          avatar: user.avatar ?? undefined,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt,
        },
        requiresTwoFactor: false,
        isNewDevice: false,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Login failed'));
    }
  }

  async loginWithOAuth(request: OAuthRequest): Promise<Result<OAuthResult, Error>> {
    // OAuth implementation would verify the token with the provider
    // For now, return not implemented
    return err(new Error(`OAuth with ${request.provider} is not implemented yet`));
  }

  async logout(token: string): Promise<Result<void, Error>> {
    const session = this.sessions.get(token);
    if (session) {
      this.refreshTokens.delete(session.refreshToken);
      this.sessions.delete(token);
    }
    return ok(undefined);
  }

  async logoutAll(userId: string): Promise<Result<number, Error>> {
    let count = 0;

    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.refreshTokens.delete(session.refreshToken);
        this.sessions.delete(token);
        count++;
      }
    }

    return ok(count);
  }

  async logoutDevice(sessionId: string): Promise<Result<void, Error>> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.id === sessionId) {
        this.refreshTokens.delete(session.refreshToken);
        this.sessions.delete(token);
        break;
      }
    }
    return ok(undefined);
  }

  // ==================== Session ====================

  async refreshToken(refreshToken: string): Promise<Result<RefreshResult, Error>> {
    const tokenData = this.refreshTokens.get(refreshToken);

    if (!tokenData || tokenData.expiresAt < new Date()) {
      return err(new Error('Invalid or expired refresh token'));
    }

    // Get old session
    const oldSession = this.sessions.get(refreshToken);

    // Create new session
    const { session, token, refreshToken: newRefreshToken } = await this.createSession(tokenData.userId);

    // Delete old session
    if (oldSession) {
      this.sessions.delete(oldSession.token);
    }
    this.refreshTokens.delete(refreshToken);

    return ok({
      token,
      refreshToken: newRefreshToken,
      expiresAt: session.expiresAt,
    });
  }

  async validateToken(token: string): Promise<Result<{ userId: string; sessionId: string }, Error>> {
    const session = this.sessions.get(token);

    if (!session) {
      return err(new Error('Invalid token'));
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return err(new Error('Token expired'));
    }

    // Update last used
    session.lastUsedAt = new Date();

    return ok({ userId: session.userId, sessionId: session.id });
  }

  async getSession(sessionId: string): Promise<Result<UserSession, Error>> {
    for (const session of this.sessions.values()) {
      if (session.id === sessionId) {
        return ok(session);
      }
    }
    return err(new Error('Session not found'));
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId);
  }

  async getUserDevices(userId: string): Promise<DeviceInfo[]> {
    const sessions = await this.getUserSessions(userId);
    const currentSessionId = sessions[0]?.id; // Assume first is current

    return sessions.map((s) => ({
      id: s.id,
      name: s.deviceInfo ?? 'Unknown device',
      type: 'unknown',
      os: 'unknown',
      browser: 'unknown',
      lastUsed: s.lastUsedAt ?? s.createdAt,
      isCurrent: s.id === currentSessionId,
    }));
  }

  // ==================== Verification ====================

  async sendVerificationCode(request: SendVerificationRequest): Promise<Result<void, Error>> {
    const key = request.email ?? request.phone ?? '';
    const code = this.generateCode(6);

    this.verificationCodes.set(key, {
      code,
      expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY),
      type: request.type,
    });

    // In production, send actual email/SMS
    console.log(`[AUTH] Verification code for ${key}: ${code}`);

    return ok(undefined);
  }

  async verify(request: VerificationRequest): Promise<Result<VerificationResult, Error>> {
    const storedCode = this.verificationCodes.get(request.code ?? '');

    if (!storedCode || storedCode.expiresAt < new Date()) {
      return err(new Error('Invalid or expired verification code'));
    }

    // Find and update user
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: request.code },
          { phone: request.code },
        ],
      },
    });

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          status: 'active',
          ...(request.type === 'email'
            ? { emailVerifiedAt: new Date() }
            : { phoneVerifiedAt: new Date() }),
        },
      });
    }

    this.verificationCodes.delete(request.code ?? '');

    return ok({
      verified: true,
      type: request.type,
      verifiedAt: new Date(),
    });
  }

  async resendVerification(type: 'email' | 'phone', userId: string): Promise<Result<void, Error>> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return err(new Error('User not found'));
    }

    const key = type === 'email' ? user.email : user.phone;
    if (!key) {
      return err(new Error(`${type} not set`));
    }

    return this.sendVerificationCode({ type, [type]: key });
  }

  // ==================== Password ====================

  async requestPasswordReset(request: PasswordResetRequest): Promise<Result<void, Error>> {
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: request.email },
          { phone: request.phone },
        ],
      },
    });

    // Don't reveal if user exists
    if (!user) {
      return ok(undefined);
    }

    const token = this.generateToken();
    this.passwordResetTokens.set(token, {
      userId: user.id,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
    });

    // In production, send email/SMS with reset link
    console.log(`[AUTH] Password reset token for ${request.email ?? request.phone}: ${token}`);

    return ok(undefined);
  }

  async confirmPasswordReset(request: ConfirmPasswordResetRequest): Promise<Result<void, Error>> {
    const tokenData = this.passwordResetTokens.get(request.token);

    if (!tokenData || tokenData.expiresAt < new Date()) {
      return err(new Error('Invalid or expired reset token'));
    }

    if (request.newPassword !== request.confirmPassword) {
      return err(new Error('Passwords do not match'));
    }

    const passwordHash = await hash(request.newPassword, BCRYPT_ROUNDS);

    await db.user.update({
      where: { id: tokenData.userId },
      data: { passwordHash },
    });

    this.passwordResetTokens.delete(request.token);

    // Logout all sessions
    await this.logoutAll(tokenData.userId);

    return ok(undefined);
  }

  async changePassword(userId: string, request: ChangePasswordRequest): Promise<Result<void, Error>> {
    if (request.newPassword !== request.confirmPassword) {
      return err(new Error('Passwords do not match'));
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return err(new Error('User not found'));
    }

    // Verify current password
    const isValid = await compare(request.currentPassword, user.passwordHash);
    if (!isValid) {
      return err(new Error('Current password is incorrect'));
    }

    const passwordHash = await hash(request.newPassword, BCRYPT_ROUNDS);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return ok(undefined);
  }

  async checkPasswordStrength(password: string): Promise<PasswordStrength> {
    let score = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else feedback.push('Include both lowercase and uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Include at least one number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Include at least one special character');

    // Check for common patterns
    if (password.toLowerCase().includes('password') || password.includes('123456')) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common passwords');
    }

    const levels: PasswordStrength['level'][] = ['weak', 'weak', 'fair', 'good', 'strong', 'very_strong'];
    const level = levels[score] ?? 'weak';

    if (feedback.length === 0) {
      feedback.push('Password is strong');
    }

    return {
      score,
      level,
      feedback,
      suggestions,
    };
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) return false;

    return compare(password, user.passwordHash);
  }

  // ==================== Two-Factor ====================

  async getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
    const config = this.twoFactorConfigs.get(userId);

    return {
      enabled: config?.enabled ?? false,
      method: config?.method,
      verifiedAt: config?.verifiedAt,
      backupCodesRemaining: config?.backupCodes.length ?? 0,
    };
  }

  async setupTwoFactor(userId: string, request: SetupTwoFactorRequest): Promise<Result<SetupTwoFactorResult, Error>> {
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes(10);

    const config: TwoFactorConfig = {
      enabled: false,
      method: request.method,
      secret,
      backupCodes,
    };

    this.twoFactorConfigs.set(userId, config);

    return ok({
      secret,
      qrCodeUrl: `otpauth://totp/Dayf:user${userId}?secret=${secret}&issuer=Dayf`,
      backupCodes,
      verificationRequired: true,
    });
  }

  async enableTwoFactor(userId: string, code: string): Promise<Result<void, Error>> {
    const config = this.twoFactorConfigs.get(userId);
    if (!config) {
      return err(new Error('Two-factor not setup'));
    }

    // Verify code
    const isValid = this.verifyTotpCode(config.secret!, code);
    if (!isValid) {
      return err(new Error('Invalid verification code'));
    }

    config.enabled = true;
    config.verifiedAt = new Date();
    this.twoFactorConfigs.set(userId, config);

    return ok(undefined);
  }

  async disableTwoFactor(userId: string, code: string): Promise<Result<void, Error>> {
    const config = this.twoFactorConfigs.get(userId);
    if (!config || !config.enabled) {
      return err(new Error('Two-factor not enabled'));
    }

    // Verify code
    const isValid = await this.verifyTwoFactorCode(userId, code);
    if (!isValid) {
      return err(new Error('Invalid verification code'));
    }

    this.twoFactorConfigs.delete(userId);

    return ok(undefined);
  }

  async verifyTwoFactor(userId: string, code: string): Promise<boolean> {
    return this.verifyTwoFactorCode(userId, code);
  }

  async regenerateBackupCodes(userId: string, password: string): Promise<Result<string[], Error>> {
    const isValid = await this.verifyPassword(userId, password);
    if (!isValid) {
      return err(new Error('Invalid password'));
    }

    const config = this.twoFactorConfigs.get(userId);
    if (!config) {
      return err(new Error('Two-factor not setup'));
    }

    const backupCodes = this.generateBackupCodes(10);
    config.backupCodes = backupCodes;
    this.twoFactorConfigs.set(userId, config);

    return ok(backupCodes);
  }

  // ==================== Security ====================

  async getLoginHistory(userId: string, options?: { limit?: number; offset?: number }): Promise<Array<{
    id: string;
    ipAddress: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: { country?: string; city?: string };
    successful: boolean;
    timestamp: Date;
  }>> {
    const history = this.loginHistory.get(userId) ?? [];
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    return history.slice(offset, offset + limit);
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.id === sessionId) {
        session.lastUsedAt = new Date();
        break;
      }
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.refreshTokens.delete(session.refreshToken);
        this.sessions.delete(token);
        count++;
      }
    }

    // Cleanup refresh tokens
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.expiresAt < now) {
        this.refreshTokens.delete(token);
      }
    }

    return count;
  }

  // ==================== Private Methods ====================

  private async createSession(userId: string): Promise<{
    session: Session;
    token: string;
    refreshToken: string;
  }> {
    const id = this.generateId();
    const token = this.generateToken();
    const refreshToken = this.generateToken();

    const session: Session = {
      id,
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY),
      createdAt: new Date(),
    };

    this.sessions.set(token, session);
    this.refreshTokens.set(refreshToken, {
      userId,
      sessionId: id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    return { session, token, refreshToken };
  }

  private generateId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateToken(): string {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
  }

  private generateCode(length: number): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * digits.length)];
    }
    return code;
  }

  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateCode(8));
    }
    return codes;
  }

  private verifyTotpCode(secret: string, code: string): boolean {
    // Simplified TOTP verification
    // In production, use a proper TOTP library
    return code.length === 6 && /^\d+$/.test(code);
  }

  private async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    const config = this.twoFactorConfigs.get(userId);
    if (!config || !config.enabled) return false;

    // Check TOTP
    if (this.verifyTotpCode(config.secret!, code)) {
      return true;
    }

    // Check backup codes
    const backupIndex = config.backupCodes.indexOf(code);
    if (backupIndex !== -1) {
      config.backupCodes.splice(backupIndex, 1);
      this.twoFactorConfigs.set(userId, config);
      return true;
    }

    return false;
  }

  private recordLoginAttempt(userId: string, identifier: string, successful: boolean): void {
    const key = userId || identifier;
    const history = this.loginHistory.get(key) ?? [];

    history.unshift({
      id: `login_${Date.now()}`,
      ipAddress: 'unknown',
      successful,
      timestamp: new Date(),
    });

    // Keep only last 50 attempts
    if (history.length > 50) {
      history.pop();
    }

    this.loginHistory.set(key, history);
  }
}

// ==================== Singleton ====================

export const authService = new AuthService();
