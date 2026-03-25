/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Predefined Permissions - الصلاحيات المعرفة مسبقاً
 * 
 * جميع الصلاحيات في النظام منظمة حسب الوحدات.
 * 
 * @module core/domain/authorization/permissions
 */

import { Permission } from './Permission';

// ==================== Users Module ====================

export const USERS_READ = Permission.create('users', 'users', 'read', 'عرض المستخدمين');
export const USERS_CREATE = Permission.create('users', 'users', 'create', 'إنشاء مستخدم');
export const USERS_UPDATE = Permission.create('users', 'users', 'update', 'تعديل المستخدمين');
export const USERS_DELETE = Permission.create('users', 'users', 'delete', 'حذف المستخدمين');
export const USERS_MANAGE = Permission.create('users', 'users', 'manage', 'إدارة المستخدمين');
export const USERS_VERIFY = Permission.create('users', 'users', 'verify', 'التحقق من المستخدمين');
export const USERS_SUSPEND = Permission.create('users', 'users', 'suspend', 'تعليق المستخدمين');

// ==================== Companies Module ====================

export const COMPANIES_READ = Permission.create('companies', 'companies', 'read', 'عرض الشركات');
export const COMPANIES_CREATE = Permission.create('companies', 'companies', 'create', 'إنشاء شركة');
export const COMPANIES_UPDATE = Permission.create('companies', 'companies', 'update', 'تعديل الشركات');
export const COMPANIES_DELETE = Permission.create('companies', 'companies', 'delete', 'حذف الشركات');
export const COMPANIES_MANAGE = Permission.create('companies', 'companies', 'manage', 'إدارة الشركات');
export const COMPANIES_VERIFY = Permission.create('companies', 'companies', 'verify', 'التحقق من الشركات');
export const COMPANIES_SUSPEND = Permission.create('companies', 'companies', 'suspend', 'تعليق الشركات');

// ==================== Listings Module ====================

export const LISTINGS_READ = Permission.create('listings', 'listings', 'read', 'عرض الإقامات');
export const LISTINGS_CREATE = Permission.create('listings', 'listings', 'create', 'إنشاء إقامة');
export const LISTINGS_UPDATE = Permission.create('listings', 'listings', 'update', 'تعديل الإقامات');
export const LISTINGS_DELETE = Permission.create('listings', 'listings', 'delete', 'حذف الإقامات');
export const LISTINGS_MANAGE = Permission.create('listings', 'listings', 'manage', 'إدارة الإقامات');
export const LISTINGS_PUBLISH = Permission.create('listings', 'listings', 'publish', 'نشر الإقامات');
export const LISTINGS_MODERATE = Permission.create('listings', 'listings', 'moderate', 'الإشراف على الإقامات');

// ==================== Bookings Module ====================

export const BOOKINGS_READ = Permission.create('bookings', 'bookings', 'read', 'عرض الحجوزات');
export const BOOKINGS_CREATE = Permission.create('bookings', 'bookings', 'create', 'إنشاء حجز');
export const BOOKINGS_UPDATE = Permission.create('bookings', 'bookings', 'update', 'تعديل الحجوزات');
export const BOOKINGS_CANCEL = Permission.create('bookings', 'bookings', 'cancel', 'إلغاء الحجوزات');
export const BOOKINGS_MANAGE = Permission.create('bookings', 'bookings', 'manage', 'إدارة الحجوزات');
export const BOOKINGS_CONFIRM = Permission.create('bookings', 'bookings', 'confirm', 'تأكيد الحجوزات');
export const BOOKINGS_APPROVE = Permission.create('bookings', 'bookings', 'approve', 'الموافقة على الحجوزات');

// ==================== Payments Module ====================

export const PAYMENTS_READ = Permission.create('payments', 'payments', 'read', 'عرض المدفوعات');
export const PAYMENTS_CREATE = Permission.create('payments', 'payments', 'create', 'إنشاء دفعة');
export const PAYMENTS_REFUND = Permission.create('payments', 'payments', 'refund', 'استرداد المدفوعات');
export const PAYMENTS_MANAGE = Permission.create('payments', 'payments', 'manage', 'إدارة المدفوعات');

// ==================== Escrow Module ====================

export const ESCROW_READ = Permission.create('escrow', 'escrow', 'read', 'عرض الضمان');
export const ESCROW_CREATE = Permission.create('escrow', 'escrow', 'create', 'إنشاء ضمان');
export const ESCROW_RELEASE = Permission.create('escrow', 'escrow', 'release', 'إطلاق الضمان');
export const ESCROW_DISPUTE = Permission.create('escrow', 'escrow', 'dispute', 'فتح نزاع');
export const ESCROW_MANAGE = Permission.create('escrow', 'escrow', 'manage', 'إدارة الضمان');

// ==================== Reviews Module ====================

export const REVIEWS_READ = Permission.create('reviews', 'reviews', 'read', 'عرض التقييمات');
export const REVIEWS_CREATE = Permission.create('reviews', 'reviews', 'create', 'إنشاء تقييم');
export const REVIEWS_REPLY = Permission.create('reviews', 'reviews', 'reply', 'الرد على التقييمات');
export const REVIEWS_MANAGE = Permission.create('reviews', 'reviews', 'manage', 'إدارة التقييمات');
export const REVIEWS_MODERATE = Permission.create('reviews', 'reviews', 'moderate', 'الإشراف على التقييمات');

// ==================== Loyalty Module ====================

export const LOYALTY_READ = Permission.create('loyalty', 'loyalty', 'read', 'عرض نقاط الولاء');
export const LOYALTY_EARN = Permission.create('loyalty', 'loyalty', 'earn', 'كسب نقاط');
export const LOYALTY_REDEEM = Permission.create('loyalty', 'loyalty', 'redeem', 'استبدال نقاط');
export const LOYALTY_MANAGE = Permission.create('loyalty', 'loyalty', 'manage', 'إدارة الولاء');

// ==================== Notifications Module ====================

export const NOTIFICATIONS_READ = Permission.create('notifications', 'notifications', 'read', 'عرض الإشعارات');
export const NOTIFICATIONS_SEND = Permission.create('notifications', 'notifications', 'send', 'إرسال إشعارات');
export const NOTIFICATIONS_MANAGE = Permission.create('notifications', 'notifications', 'manage', 'إدارة الإشعارات');

// ==================== AI Module ====================

export const AI_USE = Permission.create('ai', 'ai', 'use', 'استخدام الذكاء الاصطناعي');
export const AI_MANAGE = Permission.create('ai', 'ai', 'manage', 'إدارة الذكاء الاصطناعي');
export const AI_TRAIN = Permission.create('ai', 'ai', 'train', 'تدريب النموذج');

// ==================== Community Module ====================

export const COMMUNITY_READ = Permission.create('community', 'community', 'read', 'عرض المجتمع');
export const COMMUNITY_POST = Permission.create('community', 'community', 'post', 'نشر محتوى');
export const COMMUNITY_MODERATE = Permission.create('community', 'community', 'moderate', 'الإشراف على المجتمع');
export const COMMUNITY_MANAGE = Permission.create('community', 'community', 'manage', 'إدارة المجتمع');

// ==================== Marketplace Module ====================

export const MARKETPLACE_READ = Permission.create('marketplace', 'marketplace', 'read', 'عرض السوق');
export const MARKETPLACE_CREATE = Permission.create('marketplace', 'marketplace', 'create', 'إنشاء منتج');
export const MARKETPLACE_UPDATE = Permission.create('marketplace', 'marketplace', 'update', 'تعديل المنتجات');
export const MARKETPLACE_DELETE = Permission.create('marketplace', 'marketplace', 'delete', 'حذف المنتجات');
export const MARKETPLACE_MANAGE = Permission.create('marketplace', 'marketplace', 'manage', 'إدارة السوق');
export const MARKETPLACE_PURCHASE = Permission.create('marketplace', 'marketplace', 'purchase', 'شراء من السوق');

// ==================== Moderation Module ====================

export const MODERATION_READ = Permission.create('moderation', 'moderation', 'read', 'عرض الإشراف');
export const MODERATION_REVIEW = Permission.create('moderation', 'moderation', 'review', 'مراجعة المحتوى');
export const MODERATION_ACTION = Permission.create('moderation', 'moderation', 'action', 'اتخاذ إجراء');
export const MODERATION_MANAGE = Permission.create('moderation', 'moderation', 'manage', 'إدارة الإشراف');

// ==================== Medical Module ====================

export const MEDICAL_READ = Permission.create('medical', 'medical', 'read', 'عرض العلاج');
export const MEDICAL_BOOK = Permission.create('medical', 'medical', 'book', 'حجز علاج');
export const MEDICAL_CREATE = Permission.create('medical', 'medical', 'create', 'إنشاء خدمة علاجية');
export const MEDICAL_UPDATE = Permission.create('medical', 'medical', 'update', 'تعديل خدمات العلاج');
export const MEDICAL_MANAGE = Permission.create('medical', 'medical', 'manage', 'إدارة العلاج');

// ==================== Education Module ====================

export const EDUCATION_READ = Permission.create('education', 'education', 'read', 'عرض الدراسة');
export const EDUCATION_APPLY = Permission.create('education', 'education', 'apply', 'التقديم للدراسة');
export const EDUCATION_CREATE = Permission.create('education', 'education', 'create', 'إنشاء برنامج دراسي');
export const EDUCATION_UPDATE = Permission.create('education', 'education', 'update', 'تعديل البرامج');
export const EDUCATION_MANAGE = Permission.create('education', 'education', 'manage', 'إدارة الدراسة');

// ==================== Business Module ====================

export const BUSINESS_READ = Permission.create('business', 'business', 'read', 'عرض فرص العمل');
export const BUSINESS_CREATE = Permission.create('business', 'business', 'create', 'إنشاء فرصة');
export const BUSINESS_UPDATE = Permission.create('business', 'business', 'update', 'تعديل الفرص');
export const BUSINESS_MANAGE = Permission.create('business', 'business', 'manage', 'إدارة فرص العمل');

// ==================== Reports Module ====================

export const REPORTS_CREATE = Permission.create('reports', 'reports', 'create', 'إنشاء بلاغ');
export const REPORTS_READ = Permission.create('reports', 'reports', 'read', 'عرض البلاغات');
export const REPORTS_REVIEW = Permission.create('reports', 'reports', 'review', 'مراجعة البلاغات');
export const REPORTS_RESOLVE = Permission.create('reports', 'reports', 'resolve', 'حل البلاغات');
export const REPORTS_MANAGE = Permission.create('reports', 'reports', 'manage', 'إدارة البلاغات');

// ==================== Settings Module ====================

export const SETTINGS_READ = Permission.create('settings', 'settings', 'read', 'عرض الإعدادات');
export const SETTINGS_UPDATE = Permission.create('settings', 'settings', 'update', 'تعديل الإعدادات');
export const SETTINGS_MANAGE = Permission.create('settings', 'settings', 'manage', 'إدارة الإعدادات');

// ==================== Analytics Module ====================

export const ANALYTICS_READ = Permission.create('analytics', 'analytics', 'read', 'عرض التحليلات');
export const ANALYTICS_EXPORT = Permission.create('analytics', 'analytics', 'export', 'تصدير التحليلات');
export const ANALYTICS_MANAGE = Permission.create('analytics', 'analytics', 'manage', 'إدارة التحليلات');

// ==================== Audit Module ====================

export const AUDIT_READ = Permission.create('audit', 'audit', 'read', 'عرض سجلات التدقيق');
export const AUDIT_EXPORT = Permission.create('audit', 'audit', 'export', 'تصدير سجلات التدقيق');

// ==================== Admin Module ====================

export const ADMIN_ACCESS = Permission.create('admin', 'admin', 'access', 'الوصول للوحة الإدارة');
export const ADMIN_USERS = Permission.create('admin', 'users', 'manage', 'إدارة المستخدمين');
export const ADMIN_COMPANIES = Permission.create('admin', 'companies', 'manage', 'إدارة الشركات');
export const ADMIN_CONTENT = Permission.create('admin', 'content', 'moderate', 'الإشراف على المحتوى');
export const ADMIN_SYSTEM = Permission.create('admin', 'system', 'manage', 'إدارة النظام');

// ==================== Super Admin ====================

export const SUPER_ADMIN_ALL = Permission.create('super_admin', 'all', 'manage', 'كل الصلاحيات');

// ==================== Collections ====================

/**
 * كل الصلاحيات
 */
export const PERMISSIONS = {
  // Users
  USERS_READ,
  USERS_CREATE,
  USERS_UPDATE,
  USERS_DELETE,
  USERS_MANAGE,
  USERS_VERIFY,
  USERS_SUSPEND,

  // Companies
  COMPANIES_READ,
  COMPANIES_CREATE,
  COMPANIES_UPDATE,
  COMPANIES_DELETE,
  COMPANIES_MANAGE,
  COMPANIES_VERIFY,
  COMPANIES_SUSPEND,

  // Listings
  LISTINGS_READ,
  LISTINGS_CREATE,
  LISTINGS_UPDATE,
  LISTINGS_DELETE,
  LISTINGS_MANAGE,
  LISTINGS_PUBLISH,
  LISTINGS_MODERATE,

  // Bookings
  BOOKINGS_READ,
  BOOKINGS_CREATE,
  BOOKINGS_UPDATE,
  BOOKINGS_CANCEL,
  BOOKINGS_MANAGE,
  BOOKINGS_CONFIRM,
  BOOKINGS_APPROVE,

  // Payments
  PAYMENTS_READ,
  PAYMENTS_CREATE,
  PAYMENTS_REFUND,
  PAYMENTS_MANAGE,

  // Escrow
  ESCROW_READ,
  ESCROW_CREATE,
  ESCROW_RELEASE,
  ESCROW_DISPUTE,
  ESCROW_MANAGE,

  // Reviews
  REVIEWS_READ,
  REVIEWS_CREATE,
  REVIEWS_REPLY,
  REVIEWS_MANAGE,
  REVIEWS_MODERATE,

  // Loyalty
  LOYALTY_READ,
  LOYALTY_EARN,
  LOYALTY_REDEEM,
  LOYALTY_MANAGE,

  // Notifications
  NOTIFICATIONS_READ,
  NOTIFICATIONS_SEND,
  NOTIFICATIONS_MANAGE,

  // AI
  AI_USE,
  AI_MANAGE,
  AI_TRAIN,

  // Community
  COMMUNITY_READ,
  COMMUNITY_POST,
  COMMUNITY_MODERATE,
  COMMUNITY_MANAGE,

  // Marketplace
  MARKETPLACE_READ,
  MARKETPLACE_CREATE,
  MARKETPLACE_UPDATE,
  MARKETPLACE_DELETE,
  MARKETPLACE_MANAGE,
  MARKETPLACE_PURCHASE,

  // Moderation
  MODERATION_READ,
  MODERATION_REVIEW,
  MODERATION_ACTION,
  MODERATION_MANAGE,

  // Medical
  MEDICAL_READ,
  MEDICAL_BOOK,
  MEDICAL_CREATE,
  MEDICAL_UPDATE,
  MEDICAL_MANAGE,

  // Education
  EDUCATION_READ,
  EDUCATION_APPLY,
  EDUCATION_CREATE,
  EDUCATION_UPDATE,
  EDUCATION_MANAGE,

  // Business
  BUSINESS_READ,
  BUSINESS_CREATE,
  BUSINESS_UPDATE,
  BUSINESS_MANAGE,

  // Reports
  REPORTS_CREATE,
  REPORTS_READ,
  REPORTS_REVIEW,
  REPORTS_RESOLVE,
  REPORTS_MANAGE,

  // Settings
  SETTINGS_READ,
  SETTINGS_UPDATE,
  SETTINGS_MANAGE,

  // Analytics
  ANALYTICS_READ,
  ANALYTICS_EXPORT,
  ANALYTICS_MANAGE,

  // Audit
  AUDIT_READ,
  AUDIT_EXPORT,

  // Admin
  ADMIN_ACCESS,
  ADMIN_USERS,
  ADMIN_COMPANIES,
  ADMIN_CONTENT,
  ADMIN_SYSTEM,

  // Super Admin
  SUPER_ADMIN_ALL,
} as const;

/**
 * الحصول على صلاحية بالاسم
 */
export function getPermission(name: keyof typeof PERMISSIONS): Permission {
  const permission = PERMISSIONS[name];
  if (!permission) {
    throw new Error(`Permission not found: ${name}`);
  }
  return permission;
}

/**
 * الحصول على صلاحيات وحدة معينة
 */
export function getModulePermissions(module: string): Permission[] {
  const modulePermissions: Permission[] = [];
  
  for (const [key, permission] of Object.entries(PERMISSIONS)) {
    if (key.toLowerCase().startsWith(module.toLowerCase() + '_')) {
      modulePermissions.push(permission);
    }
  }
  
  return modulePermissions;
}

/**
 * الحصول على كل أسماء الصلاحيات
 */
export function getPermissionNames(): string[] {
  return Object.keys(PERMISSIONS);
}
