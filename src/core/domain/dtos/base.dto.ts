/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base DTOs - كائنات نقل البيانات الأساسية
 * 
 * @module core/domain/dtos/base.dto
 */

// ==================== Base DTOs ====================

/**
 * DTO أساسي بمعرف
 */
export interface BaseEntityDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO لإنشاء كيان
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateEntityDTO {
  // فارغ - يتم توسيعه في كل كيان
}

/**
 * DTO لتحديث كيان
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateEntityDTO {
  // فارغ - يتم توسيعه في كل كيان
}

/**
 * DTO للبحث بالمعرف
 */
export interface FindByIdDTO {
  id: string;
}

/**
 * DTO للبحث بمعرفات متعددة
 */
export interface FindByIdsDTO {
  ids: string[];
}

// ==================== Timestamp DTOs ====================

/**
 * DTO مع تواريخ
 */
export interface TimestampedDTO extends BaseEntityDTO {
  deletedAt?: string | null;
}

/**
 * DTO مع إصدار
 */
export interface VersionedDTO extends BaseEntityDTO {
  version: number;
}

/**
 * DTO مترجم
 */
export interface TranslatableDTO<T = Record<string, string>> extends BaseEntityDTO {
  translations: T;
}

// ==================== Soft Delete DTOs ====================

/**
 * DTO للحذف الناعم
 */
export interface SoftDeleteDTO {
  deletedAt: string;
  deletedBy: string;
}

/**
 * DTO للاستعادة
 */
export interface RestoreDTO {
  id: string;
}

// ==================== Filter DTOs ====================

/**
 * DTO للتصفية بالتاريخ
 */
export interface DateRangeFilterDTO {
  from?: string;
  to?: string;
}

/**
 * DTO للتصفية بالنص
 */
export interface TextFilterDTO {
  query?: string;
  fields?: string[];
}

/**
 * DTO للترتيب
 */
export interface OrderByDTO {
  field: string;
  direction: 'asc' | 'desc';
}

// ==================== User Reference DTOs ====================

/**
 * DTO مرجعي للمستخدم
 */
export interface UserReferenceDTO {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
}

/**
 * DTO مختصر للمستخدم
 */
export interface UserSummaryDTO {
  id: string;
  fullName: string;
  avatar?: string;
  rating?: number;
}

// ==================== Company Reference DTOs ====================

/**
 * DTO مرجعي للشركة
 */
export interface CompanyReferenceDTO {
  id: string;
  name: string;
  logo?: string;
  type: string;
}

// ==================== Location DTOs ====================

/**
 * DTO للموقع
 */
export interface LocationDTO {
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * DTO للموقع المختصر
 */
export interface LocationSummaryDTO {
  city: string;
  country: string;
}

// ==================== Money DTOs ====================

/**
 * DTO للمال
 */
export interface MoneyDTO {
  amount: number;
  currency: string;
}

/**
 * DTO للمال منسق
 */
export interface MoneyFormattedDTO {
  amount: number;
  currency: string;
  formatted: string;
  formattedShort: string;
}

// ==================== Rating DTOs ====================

/**
 * DTO للتقييم
 */
export interface RatingDTO {
  value: number;
  count: number;
}

/**
 * DTO للتقييم المختصر
 */
export interface RatingSummaryDTO {
  average: number;
  total: number;
}

// ==================== Contact DTOs ====================

/**
 * DTO للاتصال
 */
export interface ContactDTO {
  email?: string;
  phone?: string;
  website?: string;
}

// ==================== Status DTOs ====================

/**
 * DTO للحالة
 */
export interface StatusDTO {
  status: string;
  statusLabel: string;
  changedAt?: string;
  changedBy?: string;
}

// ==================== Response DTOs ====================

/**
 * DTO للاستجابة الناجحة
 */
export interface SuccessResponseDTO<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * DTO للاستجابة الفاشلة
 */
export interface ErrorResponseDTO {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * DTO للاستجابة العامة
 */
export type ApiResponseDTO<T = unknown> = SuccessResponseDTO<T> | ErrorResponseDTO;

/**
 * DTO لرسالة بسيطة
 */
export interface MessageResponseDTO {
  success: true;
  message: string;
}

// ==================== Batch Operation DTOs ====================

/**
 * DTO للعملية المجمعة
 */
export interface BatchOperationDTO<T> {
  items: T[];
  continueOnError?: boolean;
}

/**
 * DTO لنتيجة العملية المجمعة
 */
export interface BatchResultDTO<T, E = unknown> {
  successful: T[];
  failed: Array<{ item: T; error: E }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

// ==================== Export DTOs ====================

/**
 * DTO للتصدير
 */
export interface ExportDTO {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields?: string[];
  filters?: Record<string, unknown>;
}

/**
 * DTO لنتيجة التصدير
 */
export interface ExportResultDTO {
  url: string;
  filename: string;
  format: string;
  expiresAt: string;
}
