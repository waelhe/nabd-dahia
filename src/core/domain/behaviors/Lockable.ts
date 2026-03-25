/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lockable Interface & Mixin
 * 
 * سلوك القفل - يسمح بقفل الكيانات للتحكم في التزامن.
 * يستخدم لمنع التعديلات المتزامنة على نفس الكيان.
 * 
 * @module core/domain/behaviors/Lockable
 */

/**
 * واجهة السلوك
 */
export interface ILockable {
  isLocked: boolean;
  lockedBy: string | null;
  lockedAt: Date | null;
  lockVersion: number;
  acquireLock(userId: string, ttl?: number): boolean;
  releaseLock(): void;
  extendLock(ttl?: number): boolean;
}

/**
 * حالة القفل
 */
export type LockStatus = 'unlocked' | 'locked' | 'expired';

/**
 * Props للكيانات القابلة للقفل
 */
export interface LockableProps {
  lockVersion: number;
  lockedBy: string | null;
  lockedAt: Date | null;
  lockExpiresAt: Date | null;
}

/**
 * إنشاء props افتراضية للقفل
 */
export function createLockableProps(): LockableProps {
  return {
    lockVersion: 0,
    lockedBy: null,
    lockedAt: null,
    lockExpiresAt: null,
  };
}

/**
 * الوقت الافتراضي للقفل (5 دقائق)
 */
export const DEFAULT_LOCK_TTL = 5 * 60 * 1000; // 5 دقائق بالمللي ثانية

/**
 * التحقق من حالة القفل
 */
export function getLockStatus(props: LockableProps): LockStatus {
  if (!props.lockedBy || !props.lockedAt) {
    return 'unlocked';
  }
  
  if (props.lockExpiresAt && props.lockExpiresAt < new Date()) {
    return 'expired';
  }
  
  return 'locked';
}

/**
 * هل الكيان مقفل
 */
export function isLocked(props: LockableProps): boolean {
  return getLockStatus(props) === 'locked';
}

/**
 * هل الكيان مقفل من قبل مستخدم معين
 */
export function isLockedBy(props: LockableProps, userId: string): boolean {
  return props.lockedBy === userId && isLocked(props);
}

/**
 * هل القفل منتهي الصلاحية
 */
export function isLockExpired(props: LockableProps): boolean {
  return getLockStatus(props) === 'expired';
}

/**
 * الحصول على الوقت المتبقي للقفل
 */
export function getRemainingLockTime(props: LockableProps): number | null {
  if (!isLocked(props) || !props.lockExpiresAt) {
    return null;
  }
  
  const remaining = props.lockExpiresAt.getTime() - Date.now();
  return Math.max(0, remaining);
}

/**
 * محاولة اكتساب القفل
 */
export function acquireLock<T extends LockableProps & { updatedAt: Date }>(
  entity: T,
  userId: string,
  ttl: number = DEFAULT_LOCK_TTL
): boolean {
  // إذا كان مقفلاً من نفس المستخدم، نجدد القفل
  if (isLockedBy(entity, userId)) {
    return extendLock(entity, ttl);
  }
  
  // إذا كان مقفلاً من مستخدم آخر
  if (isLocked(entity)) {
    return false;
  }
  
  // إذا كان القفل منتهياً، يمكن اكتسابه
  if (isLockExpired(entity)) {
    // تحرير القفل القديم
    releaseLock(entity);
  }
  
  // اكتساب القفل
  entity.lockVersion += 1;
  entity.lockedBy = userId;
  entity.lockedAt = new Date();
  entity.lockExpiresAt = new Date(Date.now() + ttl);
  entity.updatedAt = new Date();
  
  return true;
}

/**
 * تحرير القفل
 */
export function releaseLock<T extends LockableProps & { updatedAt: Date }>(entity: T): void {
  entity.lockedBy = null;
  entity.lockedAt = null;
  entity.lockExpiresAt = null;
  entity.updatedAt = new Date();
}

/**
 * تمديد القفل
 */
export function extendLock<T extends LockableProps & { updatedAt: Date }>(
  entity: T,
  ttl: number = DEFAULT_LOCK_TTL
): boolean {
  if (!isLocked(entity)) {
    return false;
  }
  
  entity.lockExpiresAt = new Date(Date.now() + ttl);
  entity.updatedAt = new Date();
  
  return true;
}

/**
 * التحقق من صلاحية القفل للتعديل
 */
export function canModify(props: LockableProps, userId: string): boolean {
  // غير مقفل = يمكن التعديل
  if (!isLocked(props)) return true;
  
  // مقفل من نفس المستخدم = يمكن التعديل
  if (isLockedBy(props, userId)) return true;
  
  // مقفل من غيره = لا يمكن التعديل
  return false;
}

/**
 * التحقق من تطابق نسخة القفل
 * يستخدم للتحقق من أن البيانات لم تتغير منذ القراءة
 */
export function validateLockVersion(
  props: LockableProps,
  expectedVersion: number
): boolean {
  return props.lockVersion === expectedVersion;
}

/**
 * زيادة نسخة القفل (عند التعديل)
 */
export function incrementLockVersion<T extends LockableProps & { updatedAt: Date }>(
  entity: T
): void {
  entity.lockVersion += 1;
  entity.updatedAt = new Date();
}

/**
 * معلومات القفل
 */
export interface LockInfo {
  status: LockStatus;
  lockedBy: string | null;
  lockedAt: Date | null;
  expiresAt: Date | null;
  remainingTime: number | null;
  version: number;
}

/**
 * الحصول على معلومات القفل
 */
export function getLockInfo(props: LockableProps): LockInfo {
  return {
    status: getLockStatus(props),
    lockedBy: props.lockedBy,
    lockedAt: props.lockedAt,
    expiresAt: props.lockExpiresAt,
    remainingTime: getRemainingLockTime(props),
    version: props.lockVersion,
  };
}

/**
 * فرض تحرير القفل (للمديرين فقط)
 */
export function forceReleaseLock<T extends LockableProps & { updatedAt: Date }>(entity: T): void {
  releaseLock(entity);
}
