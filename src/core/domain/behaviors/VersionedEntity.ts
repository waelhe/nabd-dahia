/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * VersionedEntity Interface & Mixin
 * 
 * سلوك الإصدارات - يسمح بتتبع تغييرات الكيان عبر الزمن.
 * 
 * @module core/domain/behaviors/VersionedEntity
 */

/**
 * واجهة السلوك
 */
export interface IVersionedEntity {
  version: number;
  incrementVersion(): void;
  getVersionHistory(): EntityVersion[];
  getPreviousVersion(): EntityVersion | null;
}

/**
 * إصدار الكيان
 */
export interface EntityVersion {
  version: number;
  timestamp: Date;
  changedBy: string | null;
  changes: Record<string, { old: unknown; new: unknown }>;
  reason?: string;
}

/**
 * Props للكيانات ذات الإصدارات
 */
export interface VersionedEntityProps {
  version: number;
  versionHistory?: EntityVersion[];
}

/**
 * إنشاء props افتراضية للإصدارات
 */
export function createVersionedEntityProps(): VersionedEntityProps {
  return {
    version: 1,
    versionHistory: [],
  };
}

/**
 * زيادة رقم الإصدار
 */
export function incrementVersion<T extends { 
  version: number; 
  versionHistory?: EntityVersion[];
  updatedAt: Date;
}>(
  entity: T,
  changes?: Record<string, { old: unknown; new: unknown }>,
  changedBy?: string,
  reason?: string
): void {
  const previousVersion = entity.version;
  entity.version = previousVersion + 1;
  entity.updatedAt = new Date();
  
  // إضافة للسجل إذا كان موجوداً
  if (entity.versionHistory && changes) {
    entity.versionHistory.push({
      version: entity.version,
      timestamp: new Date(),
      changedBy: changedBy || null,
      changes,
      reason,
    });
  }
}

/**
 * تسجيل تغيير
 */
export function recordChange(
  field: string,
  oldValue: unknown,
  newValue: unknown
): { old: unknown; new: unknown } | null {
  if (oldValue === newValue) return null;
  
  return {
    old: oldValue,
    new: newValue,
  };
}

/**
 * تسجيل مجموعة تغييرات
 */
export function recordChanges(
  changes: Record<string, { old: unknown; new: unknown } | null>
): Record<string, { old: unknown; new: unknown }> {
  const validChanges: Record<string, { old: unknown; new: unknown }> = {};
  
  for (const [field, change] of Object.entries(changes)) {
    if (change !== null) {
      validChanges[field] = change;
    }
  }
  
  return validChanges;
}

/**
 * الحصول على تاريخ الإصدارات
 */
export function getVersionHistory(props: VersionedEntityProps): EntityVersion[] {
  return props.versionHistory || [];
}

/**
 * الحصول على الإصدار السابق
 */
export function getPreviousVersion(props: VersionedEntityProps): EntityVersion | null {
  const history = getVersionHistory(props);
  if (history.length < 2) return null;
  
  // الإصدار قبل الأخير
  return history[history.length - 2] || null;
}

/**
 * الحصول على إصدار معين
 */
export function getVersion(props: VersionedEntityProps, version: number): EntityVersion | null {
  const history = getVersionHistory(props);
  return history.find(v => v.version === version) || null;
}

/**
 * مقارنة إصدارين
 */
export function compareVersions(
  props: VersionedEntityProps,
  version1: number,
  version2: number
): { added: string[]; removed: string[]; changed: string[] } | null {
  const v1 = getVersion(props, version1);
  const v2 = getVersion(props, version2);
  
  if (!v1 || !v2) return null;
  
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  
  const allFields = new Set([
    ...Object.keys(v1.changes),
    ...Object.keys(v2.changes),
  ]);
  
  for (const field of allFields) {
    const inV1 = field in v1.changes;
    const inV2 = field in v2.changes;
    
    if (!inV1 && inV2) added.push(field);
    else if (inV1 && !inV2) removed.push(field);
    else if (inV1 && inV2 && v1.changes[field].new !== v2.changes[field].new) {
      changed.push(field);
    }
  }
  
  return { added, removed, changed };
}

/**
 * التحقق من أن الكيان تم تعديله
 */
export function hasBeenModified(props: VersionedEntityProps): boolean {
  return props.version > 1;
}

/**
 * الحصول على عدد التعديلات
 */
export function getModificationCount(props: VersionedEntityProps): number {
  return Math.max(0, props.version - 1);
}
