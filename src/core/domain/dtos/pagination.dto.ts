/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pagination DTOs - كائنات نقل البيانات للتصفح
 * 
 * @module core/domain/dtos/pagination.dto
 */

// ==================== Request DTOs ====================

/**
 * DTO لطلب التصفح الأساسي
 */
export interface PaginationRequestDTO {
  /**
   * رقم الصفحة (يبدأ من 1)
   * @default 1
   */
  page?: number;

  /**
   * عدد العناصر في الصفحة
   * @default 20
   */
  limit?: number;

  /**
   * الترتيب
   */
  orderBy?: OrderByDTO;

  /**
   * تضمين المحذوفين
   * @default false
   */
  withDeleted?: boolean;
}

/**
 * DTO للترتيب
 */
export interface OrderByDTO {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * DTO لطلب التصفح المتقدم
 */
export interface AdvancedPaginationRequestDTO extends PaginationRequestDTO {
  /**
   * البحث النصي
   */
  search?: string;

  /**
   * حقول البحث
   */
  searchFields?: string[];

  /**
   * الفلاتر
   */
  filters?: FilterDTO[];

  /**
   * تضمين العلاقات
   */
  include?: string[];

  /**
   * تحديد الحقول
   */
  select?: string[];
}

/**
 * DTO للفلتر
 */
export interface FilterDTO {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * عوامل الفلتر
 */
export type FilterOperator =
  | 'eq'        // يساوي
  | 'neq'       // لا يساوي
  | 'gt'        // أكبر من
  | 'gte'       // أكبر من أو يساوي
  | 'lt'        // أصغر من
  | 'lte'       // أصغر من أو يساوي
  | 'in'        // في قائمة
  | 'notIn'     // ليس في قائمة
  | 'contains'  // يحتوي
  | 'startsWith'// يبدأ بـ
  | 'endsWith'  // ينتهي بـ
  | 'isNull'    // فارغ
  | 'isNotNull' // غير فارغ
  | 'between'   // بين قيمتين
  | 'search';   // بحث نصي

// ==================== Response DTOs ====================

/**
 * DTO لاستجابة التصفح
 */
export interface PaginationResponseDTO<T> {
  /**
   * البيانات
   */
  data: T[];

  /**
   * معلومات التصفح
   */
  pagination: PaginationMetaDTO;

  /**
   * روابط التنقل
   */
  links?: PaginationLinksDTO;
}

/**
 * DTO لمعلومات التصفح
 */
export interface PaginationMetaDTO {
  /**
   * الصفحة الحالية
   */
  page: number;

  /**
   * عدد العناصر في الصفحة
   */
  limit: number;

  /**
   * إجمالي العناصر
   */
  totalItems: number;

  /**
   * إجمالي الصفحات
   */
  totalPages: number;

  /**
   * هل توجد صفحة تالية
   */
  hasNext: boolean;

  /**
   * هل توجد صفحة سابقة
   */
  hasPrev: boolean;

  /**
   * من عنصر
   */
  fromItem?: number;

  /**
   * إلى عنصر
   */
  toItem?: number;
}

/**
 * DTO لروابط التنقل
 */
export interface PaginationLinksDTO {
  first: string;
  last: string;
  prev?: string;
  next?: string;
}

// ==================== Cursor Pagination ====================

/**
 * DTO لطلب التصفح بالمؤشر
 */
export interface CursorPaginationRequestDTO {
  /**
   * المؤشر (للصفحة التالية)
   */
  cursor?: string;

  /**
   * عدد العناصر
   * @default 20
   */
  limit?: number;

  /**
   * اتجاه التصفح
   */
  direction?: 'forward' | 'backward';
}

/**
 * DTO لاستجابة التصفح بالمؤشر
 */
export interface CursorPaginationResponseDTO<T> {
  /**
   * البيانات
   */
  data: T[];

  /**
   * المؤشر التالي
   */
  nextCursor?: string;

  /**
   * المؤشر السابق
   */
  prevCursor?: string;

  /**
   * هل توجد صفحة تالية
   */
  hasNext: boolean;

  /**
   * هل توجد صفحة سابقة
   */
  hasPrev: boolean;
}

// ==================== Infinite Scroll ====================

/**
 * DTO للتمرير اللانهائي
 */
export interface InfiniteScrollRequestDTO {
  /**
   * آخر معرف تم تحميله
   */
  lastId?: string;

  /**
   * آخر قيمة للترتيب
   */
  lastValue?: unknown;

  /**
   * عدد العناصر
   * @default 20
   */
  limit?: number;
}

/**
 * DTO لاستجابة التمرير اللانهائي
 */
export interface InfiniteScrollResponseDTO<T> {
  /**
   * البيانات
   */
  items: T[];

  /**
   * آخر معرف
   */
  lastId?: string;

  /**
   * آخر قيمة للترتيب
   */
  lastValue?: unknown;

  /**
   * هل توجد المزيد
   */
  hasMore: boolean;
}

// ==================== Helpers ====================

/**
 * حساب معلومات التصفح
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMetaDTO {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const fromItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const toItem = Math.min(page * limit, totalItems);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNext,
    hasPrev,
    fromItem,
    toItem,
  };
}

/**
 * التحقق من صحة طلب التصفح
 */
export function validatePaginationRequest(
  page?: number,
  limit?: number,
  maxLimit: number = 100
): { page: number; limit: number } {
  const validPage = Math.max(1, page ?? 1);
  const validLimit = Math.min(Math.max(1, limit ?? 20), maxLimit);

  return { page: validPage, limit: validLimit };
}

/**
 * حساب الإزاحة (offset)
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * إنشاء روابط التنقل
 */
export function createPaginationLinks(
  baseUrl: string,
  page: number,
  limit: number,
  totalPages: number,
  queryParams?: Record<string, string>
): PaginationLinksDTO {
  const buildUrl = (p: number): string => {
    const params = new URLSearchParams({ ...queryParams, page: String(p), limit: String(limit) });
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    first: buildUrl(1),
    last: buildUrl(totalPages),
    prev: page > 1 ? buildUrl(page - 1) : undefined,
    next: page < totalPages ? buildUrl(page + 1) : undefined,
  };
}

/**
 * تحويل التصفح للـ Prisma
 */
export function toPrismaPagination(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: calculateOffset(page, limit),
    take: limit,
  };
}

/**
 * تحويل الترتيب للـ Prisma
 */
export function toPrismaOrderBy(orderBy?: OrderByDTO): Record<string, 'asc' | 'desc'> | undefined {
  if (!orderBy) return undefined;
  return { [orderBy.field]: orderBy.direction };
}
