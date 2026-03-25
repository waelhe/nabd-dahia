/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Predefined Roles - الأدوار المعرفة مسبقاً
 * 
 * جميع الأدوار في النظام مع صلاحياتها.
 * 
 * @module core/domain/authorization/roles
 */

import { Role } from './Role';
import { Permission, PermissionSet } from './Permission';
import {
  PERMISSIONS,
  USERS_READ,
  USERS_CREATE,
  USERS_UPDATE,
  USERS_MANAGE,
  USERS_VERIFY,
  COMPANIES_READ,
  COMPANIES_CREATE,
  COMPANIES_UPDATE,
  COMPANIES_MANAGE,
  COMPANIES_VERIFY,
  LISTINGS_READ,
  LISTINGS_CREATE,
  LISTINGS_UPDATE,
  LISTINGS_DELETE,
  LISTINGS_MANAGE,
  LISTINGS_PUBLISH,
  BOOKINGS_READ,
  BOOKINGS_CREATE,
  BOOKINGS_UPDATE,
  BOOKINGS_CANCEL,
  BOOKINGS_MANAGE,
  BOOKINGS_CONFIRM,
  PAYMENTS_READ,
  PAYMENTS_CREATE,
  PAYMENTS_REFUND,
  PAYMENTS_MANAGE,
  ESCROW_READ,
  ESCROW_CREATE,
  ESCROW_RELEASE,
  ESCROW_DISPUTE,
  ESCROW_MANAGE,
  REVIEWS_READ,
  REVIEWS_CREATE,
  REVIEWS_REPLY,
  REVIEWS_MANAGE,
  LOYALTY_READ,
  LOYALTY_EARN,
  LOYALTY_REDEEM,
  NOTIFICATIONS_READ,
  NOTIFICATIONS_SEND,
  AI_USE,
  COMMUNITY_READ,
  COMMUNITY_POST,
  MARKETPLACE_READ,
  MARKETPLACE_CREATE,
  MARKETPLACE_PURCHASE,
  MODERATION_READ,
  MEDICAL_READ,
  MEDICAL_BOOK,
  EDUCATION_READ,
  EDUCATION_APPLY,
  BUSINESS_READ,
  REPORTS_CREATE,
  REPORTS_READ,
  REPORTS_REVIEW,
  REPORTS_RESOLVE,
  REPORTS_MANAGE,
  SETTINGS_READ,
  SETTINGS_UPDATE,
  SETTINGS_MANAGE,
  ANALYTICS_READ,
  ANALYTICS_EXPORT,
  ANALYTICS_MANAGE,
  ADMIN_ACCESS,
  ADMIN_USERS,
  ADMIN_COMPANIES,
  ADMIN_CONTENT,
  ADMIN_SYSTEM,
  SUPER_ADMIN_ALL,
} from './permissions';

// ==================== Guest Role ====================

/**
 * دور الضيف (زائر غير مسجل)
 * 
 * الصلاحيات:
 * - تصفح المحتوى العام فقط
 */
const GUEST_PERMISSIONS = new PermissionSet([
  LISTINGS_READ,
  COMPANIES_READ,
  REVIEWS_READ,
  COMMUNITY_READ,
  MARKETPLACE_READ,
  MEDICAL_READ,
  EDUCATION_READ,
  BUSINESS_READ,
]);

export const GUEST_ROLE = new Role({
  name: 'guest',
  displayName: 'ضيف',
  description: 'زائر غير مسجل يمكنه تصفح المحتوى العام',
  level: 0,
  permissions: GUEST_PERMISSIONS,
  isSystem: true,
});

// ==================== User Role ====================

/**
 * دور المستخدم العادي
 * 
 * الصلاحيات:
 * - كل صلاحيات الضيف
 * - إنشاء وتعديل الملف الشخصي
 * - الحجز والإلغاء
 * - التقييمات والمراجعات
 * - المشاركة في المجتمع
 */
const USER_PERMISSIONS = GUEST_PERMISSIONS.merge(new PermissionSet([
  // Bookings
  BOOKINGS_CREATE,
  BOOKINGS_READ,
  BOOKINGS_UPDATE,
  BOOKINGS_CANCEL,
  
  // Payments
  PAYMENTS_CREATE,
  PAYMENTS_READ,
  
  // Escrow
  ESCROW_READ,
  ESCROW_CREATE,
  
  // Reviews
  REVIEWS_CREATE,
  REVIEWS_READ,
  
  // Loyalty
  LOYALTY_READ,
  LOYALTY_EARN,
  LOYALTY_REDEEM,
  
  // Notifications
  NOTIFICATIONS_READ,
  
  // AI
  AI_USE,
  
  // Community
  COMMUNITY_POST,
  
  // Marketplace
  MARKETPLACE_PURCHASE,
  
  // Medical
  MEDICAL_BOOK,
  
  // Education
  EDUCATION_APPLY,
  
  // Reports
  REPORTS_CREATE,
  
  // Settings
  SETTINGS_READ,
]));

export const USER_ROLE = new Role({
  name: 'user',
  displayName: 'مستخدم',
  description: 'مستخدم مسجل يمكنه الحجز والتقييم والمشاركة',
  level: 10,
  permissions: USER_PERMISSIONS,
  inherits: ['guest'],
  isSystem: true,
});

// ==================== Host Role ====================

/**
 * دور المضيف (صاحب إقامة)
 * 
 * الصلاحيات:
 * - كل صلاحيات المستخدم
 * - إدارة الإقامات الخاصة
 * - إدارة الحجوزات الواردة
 * - الرد على التقييمات
 * - عرض التحليلات
 */
const HOST_PERMISSIONS = USER_PERMISSIONS.merge(new PermissionSet([
  // Listings
  LISTINGS_CREATE,
  LISTINGS_UPDATE,
  LISTINGS_DELETE,
  LISTINGS_PUBLISH,
  
  // Bookings (Host view)
  BOOKINGS_CONFIRM,
  BOOKINGS_MANAGE,
  
  // Reviews
  REVIEWS_REPLY,
  
  // Analytics
  ANALYTICS_READ,
  
  // Notifications
  NOTIFICATIONS_SEND,
]));

export const HOST_ROLE = new Role({
  name: 'host',
  displayName: 'مضيف',
  description: 'صاحب إقامة يمكنه إدارة الإقامات والحجوزات',
  level: 20,
  permissions: HOST_PERMISSIONS,
  inherits: ['user'],
  isSystem: true,
});

// ==================== Company Role ====================

/**
 * دور الشركة
 * 
 * الصلاحيات:
 * - كل صلاحيات المضيف
 * - إدارة الشركة
 * - إدارة الموظفين
 * - التقارير المالية
 */
const COMPANY_PERMISSIONS = HOST_PERMISSIONS.merge(new PermissionSet([
  // Companies
  COMPANIES_CREATE,
  COMPANIES_UPDATE,
  COMPANIES_READ,
  
  // Listings
  LISTINGS_MANAGE,
  
  // Escrow
  ESCROW_MANAGE,
  ESCROW_RELEASE,
  ESCROW_DISPUTE,
  
  // Payments
  PAYMENTS_READ,
  PAYMENTS_REFUND,
  
  // Medical (إذا كانت شركة طبية)
  // EDUCATION (إذا كانت شركة تعليمية)
  // BUSINESS (إذا كانت شركة أعمال)
]));

export const COMPANY_ROLE = new Role({
  name: 'company',
  displayName: 'شركة',
  description: 'شركة خدمات يمكنها إدارة خدمات متعددة',
  level: 30,
  permissions: COMPANY_PERMISSIONS,
  inherits: ['host'],
  isSystem: true,
});

// ==================== Moderator Role ====================

/**
 * دور المشرف
 * 
 * الصلاحيات:
 * - الإشراف على المحتوى
 * - مراجعة البلاغات
 * - التعامل مع المنازعات
 */
const MODERATOR_PERMISSIONS = USER_PERMISSIONS.merge(new PermissionSet([
  // Moderation
  MODERATION_READ,
  
  // Reports
  REPORTS_CREATE,
  REPORTS_READ,
  REPORTS_REVIEW,
  REPORTS_RESOLVE,
  
  // Content
  REVIEWS_MANAGE,
  COMMUNITY_POST,
  
  // Users
  USERS_READ,
]));

export const MODERATOR_ROLE = new Role({
  name: 'moderator',
  displayName: 'مشرف',
  description: 'مشرف يمكنه مراجعة المحتوى والبلاغات',
  level: 50,
  permissions: MODERATOR_PERMISSIONS,
  inherits: ['user'],
  isSystem: true,
});

// ==================== Admin Role ====================

/**
 * دور المدير
 * 
 * الصلاحيات:
 * - إدارة المستخدمين
 * - إدارة الشركات
 * - التحقق من الحسابات
 * - الإشراف الكامل
 * - التقارير والتحليلات
 */
const ADMIN_PERMISSIONS = COMPANY_PERMISSIONS.merge(new PermissionSet([
  // Admin
  ADMIN_ACCESS,
  ADMIN_USERS,
  ADMIN_COMPANIES,
  ADMIN_CONTENT,
  
  // Users
  USERS_READ,
  USERS_CREATE,
  USERS_UPDATE,
  USERS_VERIFY,
  
  // Companies
  COMPANIES_READ,
  COMPANIES_VERIFY,
  
  // Moderation
  MODERATION_READ,
  
  // Reports
  REPORTS_MANAGE,
  
  // Analytics
  ANALYTICS_READ,
  ANALYTICS_EXPORT,
]));

export const ADMIN_ROLE = new Role({
  name: 'admin',
  displayName: 'مدير',
  description: 'مدير النظام يمكنه إدارة المستخدمين والشركات',
  level: 80,
  permissions: ADMIN_PERMISSIONS,
  inherits: ['company', 'moderator'],
  isSystem: true,
});

// ==================== Super Admin Role ====================

/**
 * دور المدير العام
 * 
 * الصلاحيات:
 * - كل الصلاحيات
 * - إدارة المديرين
 * - إعدادات النظام
 * - النسخ الاحتياطي
 */
const SUPER_ADMIN_PERMISSIONS = ADMIN_PERMISSIONS.merge(new PermissionSet([
  // Super Admin
  SUPER_ADMIN_ALL,
  ADMIN_SYSTEM,
  
  // All Management
  USERS_MANAGE,
  COMPANIES_MANAGE,
  LISTINGS_MANAGE,
  BOOKINGS_MANAGE,
  PAYMENTS_MANAGE,
  ESCROW_MANAGE,
  REVIEWS_MANAGE,
  NOTIFICATIONS_SEND,
  SETTINGS_READ,
  SETTINGS_UPDATE,
  SETTINGS_MANAGE,
  ANALYTICS_MANAGE,
]));

export const SUPER_ADMIN_ROLE = new Role({
  name: 'super_admin',
  displayName: 'مدير عام',
  description: 'مدير عام للنظام بصلاحيات كاملة',
  level: 100,
  permissions: SUPER_ADMIN_PERMISSIONS,
  inherits: ['admin'],
  isSystem: true,
});

// ==================== Collections ====================

/**
 * كل الأدوار
 */
export const ROLES = {
  guest: GUEST_ROLE,
  user: USER_ROLE,
  host: HOST_ROLE,
  company: COMPANY_ROLE,
  moderator: MODERATOR_ROLE,
  admin: ADMIN_ROLE,
  super_admin: SUPER_ADMIN_ROLE,
} as const;

/**
 * الحصول على دور بالاسم
 */
export function getRole(name: keyof typeof ROLES): Role {
  const role = ROLES[name];
  if (!role) {
    throw new Error(`Role not found: ${name}`);
  }
  return role;
}

/**
 * الحصول على كل الأدوار
 */
export function getAllRoles(): Role[] {
  return Object.values(ROLES);
}

/**
 * الحصول على أسماء الأدوار
 */
export function getRoleNames(): string[] {
  return Object.keys(ROLES);
}

/**
 * مقارنة مستوى الأدوار
 */
export function compareRoles(role1: keyof typeof ROLES, role2: keyof typeof ROLES): number {
  return ROLES[role1].level - ROLES[role2].level;
}

/**
 * التحقق من أن دور أعلى من آخر
 */
export function isHigherRole(role: keyof typeof ROLES, than: keyof typeof ROLES): boolean {
  return ROLES[role].level > ROLES[than].level;
}

/**
 * الحصول على الأدوار الأقل من مستوى معين
 */
export function getRolesBelowLevel(level: number): Role[] {
  return getAllRoles().filter(role => role.level < level);
}

/**
 * الحصول على الأدوار الأعلى من مستوى معين
 */
export function getRolesAboveLevel(level: number): Role[] {
  return getAllRoles().filter(role => role.level > level);
}

// Export types
export type RoleType = keyof typeof ROLES;
