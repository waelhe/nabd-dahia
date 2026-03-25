/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Application Services
 * 
 * خدمات مجال التطبيق
 * 
 * @module application/services
 */

// ==================== Domain Services ====================

export * from './booking.service';
export * from './payment.service';
export * from './notification.service';

// ==================== Service Types ====================

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
