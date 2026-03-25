/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Role - الدور
 * 
 * يمثل دور مستخدم في النظام مع مجموعة من الصلاحيات.
 * 
 * @module core/domain/authorization/Role
 */

import { Permission, PermissionSet } from './Permission';

export interface RoleProps {
  name: string;
  displayName: string;
  description?: string;
  level: number;
  permissions: PermissionSet;
  inherits?: string[];
  isSystem?: boolean;
}

export type RoleName = 'guest' | 'user' | 'host' | 'company' | 'admin' | 'super_admin';

/**
 * مستويات الأدوار
 */
export const ROLE_LEVELS: Record<RoleName, number> = {
  guest: 0,
  user: 10,
  host: 20,
  company: 30,
  admin: 80,
  super_admin: 100,
};

export class Role {
  private readonly props: RoleProps;

  constructor(props: RoleProps) {
    this.props = {
      ...props,
      name: props.name.toLowerCase().trim() as RoleName,
      isSystem: props.isSystem ?? false,
    };
    this.validate();
  }

  get name(): RoleName {
    return this.props.name as RoleName;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get level(): number {
    return this.props.level;
  }

  get permissions(): PermissionSet {
    return this.props.permissions;
  }

  get inherits(): string[] {
    return this.props.inherits || [];
  }

  get isSystem(): boolean {
    return this.props.isSystem;
  }

  private validate(): void {
    if (!this.props.name) {
      throw new Error('Role name is required');
    }

    if (!this.props.displayName) {
      throw new Error('Role display name is required');
    }

    if (this.props.level < 0 || this.props.level > 100) {
      throw new Error('Role level must be between 0 and 100');
    }
  }

  // ==================== Permission Checks ====================

  /**
   * التحقق من وجود صلاحية
   */
  hasPermission(permission: Permission): boolean {
    return this.props.permissions.has(permission.name);
  }

  /**
   * التحقق من وجود صلاحية بالاسم
   */
  hasPermissionByName(permissionName: string): boolean {
    return this.props.permissions.has(permissionName);
  }

  /**
   * التحقق من أي صلاحية من مجموعة
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  /**
   * التحقق من كل الصلاحيات
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  // ==================== Role Comparison ====================

  /**
   * هل الدور أعلى من دور آخر
   */
  isHigherThan(other: Role): boolean {
    return this.props.level > other.props.level;
  }

  /**
   * هل الدور أدنى من دور آخر
   */
  isLowerThan(other: Role): boolean {
    return this.props.level < other.props.level;
  }

  /**
   * هل الدور يساوي أو أعلى من دور آخر
   */
  isAtLeast(other: Role): boolean {
    return this.props.level >= other.props.level;
  }

  /**
   * مقارنة الدور بدور آخر
   */
  compare(other: Role): number {
    return this.props.level - other.props.level;
  }

  // ==================== Role Operations ====================

  /**
   * إضافة صلاحية
   */
  addPermission(permission: Permission): Role {
    const newPermissions = this.props.permissions.add(permission);
    
    return new Role({
      ...this.props,
      permissions: newPermissions,
      isSystem: false, // لا يمكن تعديل الأدوار النظامية
    });
  }

  /**
   * إزالة صلاحية
   */
  removePermission(permissionName: string): Role {
    const newPermissions = this.props.permissions.remove(permissionName);
    
    return new Role({
      ...this.props,
      permissions: newPermissions,
      isSystem: false,
    });
  }

  // ==================== Static Factory Methods ====================

  /**
   * إنشاء دور جديد (للاستخدام في Mappers)
   */
  static create(props: RoleProps): Role {
    return new Role(props);
  }

  /**
   * دور الضيف (زائر)
   */
  static guest(): Role {
    return new Role({
      name: 'guest',
      displayName: 'ضيف',
      description: 'زائر غير مسجل',
      level: ROLE_LEVELS.guest,
      permissions: new PermissionSet([
        Permission.create('listings', 'listings', 'read', 'تصفح الإقامات'),
        Permission.create('destinations', 'destinations', 'read', 'تصفح الوجهات'),
        Permission.create('activities', 'activities', 'read', 'تصفح الأنشطة'),
        Permission.create('reviews', 'reviews', 'read', 'قراءة التقييمات'),
      ]),
      isSystem: true,
    });
  }

  /**
   * دور المستخدم العادي
   */
  static user(): Role {
    const guestRole = Role.guest();
    
    return new Role({
      name: 'user',
      displayName: 'مستخدم',
      description: 'مستخدم مسجل',
      level: ROLE_LEVELS.user,
      permissions: guestRole.permissions.merge(new PermissionSet([
        Permission.create('bookings', 'bookings', 'create', 'إنشاء حجز'),
        Permission.create('bookings', 'bookings', 'read', 'عرض الحجوزات'),
        Permission.create('bookings', 'bookings', 'update', 'تعديل الحجز'),
        Permission.create('bookings', 'bookings', 'delete', 'إلغاء الحجز'),
        Permission.create('reviews', 'reviews', 'create', 'إنشاء تقييم'),
        Permission.create('profile', 'profile', 'update', 'تعديل الملف الشخصي'),
        Permission.create('favorites', 'favorites', 'manage', 'إدارة المفضلة'),
        Permission.create('notifications', 'notifications', 'manage', 'إدارة الإشعارات'),
      ])),
      inherits: ['guest'],
      isSystem: true,
    });
  }

  /**
   * دور المضيف (صاحب إقامة)
   */
  static host(): Role {
    const userRole = Role.user();
    
    return new Role({
      name: 'host',
      displayName: 'مضيف',
      description: 'صاحب إقامة أو نشاط',
      level: ROLE_LEVELS.host,
      permissions: userRole.permissions.merge(new PermissionSet([
        Permission.create('listings', 'listings', 'create', 'إضافة إقامة'),
        Permission.create('listings', 'listings', 'update', 'تعديل الإقامة'),
        Permission.create('listings', 'listings', 'delete', 'حذف الإقامة'),
        Permission.create('bookings', 'host_bookings', 'read', 'عرض حجوزات الاستقبال'),
        Permission.create('bookings', 'host_bookings', 'update', 'إدارة الحجوزات الواردة'),
        Permission.create('analytics', 'analytics', 'read', 'عرض التحليلات'),
        Permission.create('calendar', 'calendar', 'manage', 'إدارة التقويم'),
        Permission.create('reviews', 'reviews', 'reply', 'الرد على التقييمات'),
      ])),
      inherits: ['user'],
      isSystem: true,
    });
  }

  /**
   * دور الشركة
   */
  static company(): Role {
    const hostRole = Role.host();
    
    return new Role({
      name: 'company',
      displayName: 'شركة',
      description: 'شركة خدمات',
      level: ROLE_LEVELS.company,
      permissions: hostRole.permissions.merge(new PermissionSet([
        Permission.create('company', 'company', 'manage', 'إدارة الشركة'),
        Permission.create('company', 'employees', 'manage', 'إدارة الموظفين'),
        Permission.create('company', 'reports', 'read', 'التقارير المالية'),
        Permission.create('services', 'services', 'manage', 'إدارة الخدمات'),
        Permission.create('bookings', 'company_bookings', 'manage', 'إدارة حجوزات الشركة'),
      ])),
      inherits: ['host'],
      isSystem: true,
    });
  }

  /**
   * دور المدير
   */
  static admin(): Role {
    return new Role({
      name: 'admin',
      displayName: 'مدير',
      description: 'مدير النظام',
      level: ROLE_LEVELS.admin,
      permissions: new PermissionSet([
        // كل صلاحيات manage
        Permission.create('users', 'users', 'manage', 'إدارة المستخدمين'),
        Permission.create('bookings', 'bookings', 'manage', 'إدارة الحجوزات'),
        Permission.create('listings', 'listings', 'manage', 'إدارة الإقامات'),
        Permission.create('reviews', 'reviews', 'manage', 'إدارة التقييمات'),
        Permission.create('payments', 'payments', 'read', 'عرض المدفوعات'),
        Permission.create('companies', 'companies', 'manage', 'إدارة الشركات'),
        Permission.create('companies', 'companies', 'verify', 'التحقق من الشركات'),
        Permission.create('content', 'content', 'moderate', 'إشراف المحتوى'),
        Permission.create('reports', 'reports', 'manage', 'إدارة البلاغات'),
        Permission.create('disputes', 'disputes', 'manage', 'إدارة المنازعات'),
        Permission.create('analytics', 'analytics', 'read', 'عرض التحليلات'),
      ]),
      inherits: ['company'],
      isSystem: true,
    });
  }

  /**
   * دور المدير العام
   */
  static superAdmin(): Role {
    const adminRole = Role.admin();
    
    return new Role({
      name: 'super_admin',
      displayName: 'مدير عام',
      description: 'مدير عام للنظام',
      level: ROLE_LEVELS.super_admin,
      permissions: adminRole.permissions.merge(new PermissionSet([
        Permission.create('admin', 'admins', 'manage', 'إدارة المديرين'),
        Permission.create('settings', 'settings', 'manage', 'إدارة الإعدادات'),
        Permission.create('backups', 'backups', 'manage', 'إدارة النسخ الاحتياطية'),
        Permission.create('logs', 'logs', 'read', 'عرض السجلات'),
        Permission.create('*', '*', 'manage', 'كل الصلاحيات'),
      ])),
      inherits: ['admin'],
      isSystem: true,
    });
  }

  /**
   * الحصول على دور بالاسم
   */
  static fromName(name: RoleName): Role {
    switch (name) {
      case 'guest':
        return Role.guest();
      case 'user':
        return Role.user();
      case 'host':
        return Role.host();
      case 'company':
        return Role.company();
      case 'admin':
        return Role.admin();
      case 'super_admin':
        return Role.superAdmin();
      default:
        throw new Error(`Unknown role: ${name}`);
    }
  }

  /**
   * كل الأدوار
   */
  static allRoles(): Role[] {
    return [
      Role.guest(),
      Role.user(),
      Role.host(),
      Role.company(),
      Role.admin(),
      Role.superAdmin(),
    ];
  }

  // ==================== Serialization ====================

  toJSON(): {
    name: string;
    displayName: string;
    description?: string;
    level: number;
    permissions: string[];
    inherits?: string[];
    isSystem: boolean;
  } {
    return {
      name: this.props.name,
      displayName: this.props.displayName,
      description: this.props.description,
      level: this.props.level,
      permissions: this.props.permissions.toJSON(),
      inherits: this.props.inherits,
      isSystem: this.props.isSystem,
    };
  }

  toString(): string {
    return this.props.name;
  }

  equals(other: Role): boolean {
    return this.props.name === other.props.name;
  }
}
