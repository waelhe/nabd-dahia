/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain Behaviors Index
 * 
 * @module core/domain/behaviors
 */

// SoftDeletable
export type { ISoftDeletable, SoftDeletableProps } from './SoftDeletable';
export {
  createSoftDeletableProps,
  applySoftDeletable,
  isSoftDeleted,
  getDaysSinceDeletion,
  canBeRestored,
} from './SoftDeletable';

// VersionedEntity
export type { IVersionedEntity, EntityVersion, VersionedEntityProps } from './VersionedEntity';
export {
  createVersionedEntityProps,
  incrementVersion,
  recordChange,
  recordChanges,
  getVersionHistory,
  getPreviousVersion,
  getVersion,
  compareVersions,
  hasBeenModified,
  getModificationCount,
} from './VersionedEntity';

// Translatable
export type { ITranslatable, TranslatableField, TranslatableProps } from './Translatable';
export {
  createTranslatableProps,
  createTranslatableField,
  getTranslation,
  setTranslation,
  hasTranslation,
  getAvailableTranslations,
  getAllTranslations,
  isFullyTranslated,
  getTranslationCompleteness,
  getMissingTranslations,
  copyTranslations,
  mergeTranslations,
  removeTranslation,
  removeAllFieldTranslations,
} from './Translatable';
export type { SupportedLanguage } from '../value-objects/Translation';

// Lockable
export type { ILockable, LockStatus, LockableProps, LockInfo } from './Lockable';
export {
  createLockableProps,
  DEFAULT_LOCK_TTL,
  getLockStatus,
  isLocked,
  isLockedBy,
  isLockExpired,
  getRemainingLockTime,
  acquireLock,
  releaseLock,
  extendLock,
  canModify,
  validateLockVersion,
  incrementLockVersion,
  getLockInfo,
  forceReleaseLock,
} from './Lockable';
