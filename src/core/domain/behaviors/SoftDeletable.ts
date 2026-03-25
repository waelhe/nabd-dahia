/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SoftDeletable Interface & Mixin
 * 
 * سلوك الحذف الناعم - يسمح بـ "حذف" الكيانات دون إزالتها من قاعدة البيانات.
 * 
 * @module core/domain/behaviors/SoftDeletable
 */

/**
 * واجهة السلوك
 */
export interface ISoftDeletable {
  deletedAt: Date | null;
  deletedBy: string | null;
  isDeleted: boolean;
  softDelete(deletedBy: string): void;
  restore(): void;
}

/**
 * Props للكيانات القابلة للحذف الناعم
 */
export interface SoftDeletableProps {
  deletedAt: Date | null;
  deletedBy: string | null;
}

/**
 * إنشاء props افتراضية للحذف الناعم
 */
export function createSoftDeletableProps(): SoftDeletableProps {
  return {
    deletedAt: null,
    deletedBy: null,
  };
}

/**
 * تطبيق سلوك الحذف الناعم
 */
export function applySoftDeletable<T extends { 
  deletedAt: Date | null; 
  deletedBy: string | null;
  updatedAt: Date;
}>(
  entity: T,
  action: 'softDelete' | 'restore',
  options?: { deletedBy?: string }
): void {
  switch (action) {
    case 'softDelete':
      entity.deletedAt = new Date();
      entity.deletedBy = options?.deletedBy || null;
      entity.updatedAt = new Date();
      break;
    case 'restore':
      entity.deletedAt = null;
      entity.deletedBy = null;
      entity.updatedAt = new Date();
      break;
  }
}

/**
 * التحقق من أن الكيان محذوف
 */
export function isSoftDeleted(props: SoftDeletableProps): boolean {
  return props.deletedAt !== null;
}

/**
 * الحصول على مدة الحذف بالأيام
 */
export function getDaysSinceDeletion(props: SoftDeletableProps): number | null {
  if (!props.deletedAt) return null;
  
  const now = new Date();
  const diff = now.getTime() - props.deletedAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * التحقق من إمكانية الاسترداد
 */
export function canBeRestored(props: SoftDeletableProps, maxDays: number = 30): boolean {
  const days = getDaysSinceDeletion(props);
  if (days === null) return false;
  return days <= maxDays;
}
