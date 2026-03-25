/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Application Layer
 * 
 * طبقة التطبيق - تحتوي على جميع Use Cases
 * 
 * @module application
 */

// ==================== Types ====================

export * from './types';

// ==================== Mappers ====================

export * from './mappers';

// ==================== Domain Services ====================

export * from './services';

// ==================== Use Cases by Module ====================

// Users - إدارة المستخدمين
export * from './users';

// Listings - إدارة الإقامات والخدمات
export * from './listings';

// Bookings - إدارة الحجوزات
export * from './bookings';

// Payments - إدارة المدفوعات
export * from './payments';

// Reviews - إدارة التقييمات
export * from './reviews';

// Notifications - إدارة الإشعارات
export * from './notifications';

// Companies - إدارة الشركات
export * from './companies';

// Escrow - إدارة الضمان
export * from './escrow';

// Dashboard - لوحة التحكم
export * from './dashboard';

// Reports - التقارير
export * from './reports';

// ==================== Re-export Common Types ====================

export type {
  Result,
  Ok,
  Err,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  AppError,
} from '@/core/types/result';

export { ok, err, isOk, isErr } from '@/core/types/result';
