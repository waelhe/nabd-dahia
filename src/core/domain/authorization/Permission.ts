/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Force rebuild - v2
/**
 * Permission - الصلاحية
 * 
 * تمثل صلاحية واحدة في النظام.
 * 
 * @module core/domain/authorization/Permission
 */

export interface PermissionProps {
  name: string;
  displayName: string;
  description?: string;
  module: string;
  action: PermissionAction;
  resource: string;
  conditions?: PermissionCondition[];
}

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage'   // كل العمليات
  | 'approve'
  | 'reject'
  | 'verify'
  | 'publish'
  | 'moderate';

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export class Permission {
  private readonly props: PermissionProps;

  constructor(props: PermissionProps) {
    this.props = {
      ...props,
      name: props.name.toLowerCase().trim(),
    };
    this.validate();
  }

  get name(): string {
    return this.props.name;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get module(): string {
    return this.props.module;
  }

  get action(): PermissionAction {
    return this.props.action;
  }

  get resource(): string {
    return this.props.resource;
  }

  get conditions(): PermissionCondition[] {
    return this.props.conditions || [];
  }

  private validate(): void {
    if (!this.props.name || this.props.name.length === 0) {
      throw new Error('Permission name is required');
    }

    if (!this.props.displayName || this.props.displayName.length === 0) {
      throw new Error('Permission display name is required');
    }

    if (!this.props.module || this.props.module.length === 0) {
      throw new Error('Permission module is required');
    }

    if (!this.props.resource || this.props.resource.length === 0) {
      throw new Error('Permission resource is required');
    }

    // التحقق من تنسيق الاسم (يسمح بـ * للـ wildcard) - updated
    const namePattern = /^[a-z0-9_:*]+$/;
    if (!namePattern.test(this.props.name)) {
      throw new Error('Permission name must be lowercase alphanumeric with underscores, colons, and asterisks only');
    }
  }

  /**
   * التحقق من أن الصلاحية تمنح صلاحية أخرى
   */
  implies(other: Permission): boolean {
    // نفس الصلاحية
    if (this.equals(other)) return true;

    // صلاحية manage تمنح كل الصلاحيات على نفس المورد
    if (this.props.action === 'manage' && 
        this.props.resource === other.props.resource &&
        this.props.module === other.props.module) {
      return true;
    }

    return false;
  }

  /**
   * التحقق من تطابق الشروط
   */
  matchesConditions(context: Record<string, unknown>): boolean {
    if (!this.props.conditions || this.props.conditions.length === 0) {
      return true;
    }

    return this.props.conditions.every(condition => {
      const fieldValue = context[condition.field];
      
      switch (condition.operator) {
        case 'eq':
          return fieldValue === condition.value;
        case 'ne':
          return fieldValue !== condition.value;
        case 'gt':
          return fieldValue > condition.value;
        case 'gte':
          return fieldValue >= condition.value;
        case 'lt':
          return fieldValue < condition.value;
        case 'lte':
          return fieldValue <= condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء صلاحية من الاسم
   */
  static fromName(name: string, displayName?: string): Permission {
    const parts = name.split(':');
    
    if (parts.length < 3) {
      throw new Error('Permission name must be in format: module:resource:action');
    }

    const [module, resource, action] = parts;

    return new Permission({
      name,
      displayName: displayName || `${action} ${resource}`,
      module,
      action: action as PermissionAction,
      resource,
    });
  }

  /**
   * إنشاء صلاحية مخصصة
   */
  static create(
    module: string,
    resource: string,
    action: PermissionAction,
    displayName?: string,
    description?: string
  ): Permission {
    const name = `${module}:${resource}:${action}`;

    return new Permission({
      name,
      displayName: displayName || `${action} ${resource}`,
      description,
      module,
      action,
      resource,
    });
  }

  // ==================== Serialization ====================

  toJSON(): PermissionProps {
    return { ...this.props };
  }

  toString(): string {
    return this.props.name;
  }

  equals(other: Permission): boolean {
    return this.props.name === other.props.name;
  }

  hashCode(): string {
    return this.props.name;
  }
}

/**
 * PermissionSet - مجموعة صلاحيات
 */
export class PermissionSet {
  private readonly permissions: Map<string, Permission>;

  constructor(permissions: Permission[] = []) {
    this.permissions = new Map();
    permissions.forEach(p => this.permissions.set(p.name, p));
  }

  /**
   * إضافة صلاحية
   */
  add(permission: Permission): PermissionSet {
    const newSet = new PermissionSet(Array.from(this.permissions.values()));
    newSet.permissions.set(permission.name, permission);
    return newSet;
  }

  /**
   * إزالة صلاحية
   */
  remove(permissionName: string): PermissionSet {
    const newSet = new PermissionSet(Array.from(this.permissions.values()));
    newSet.permissions.delete(permissionName);
    return newSet;
  }

  /**
   * التحقق من وجود صلاحية
   */
  has(permissionName: string): boolean {
    // التحقق المباشر
    if (this.permissions.has(permissionName)) {
      return true;
    }

    // التحقق من الصلاحيات الضمنية
    for (const perm of this.permissions.values()) {
      const targetPerm = Permission.fromName(permissionName);
      if (perm.implies(targetPerm)) {
        return true;
      }
    }

    return false;
  }

  /**
   * الحصول على صلاحية
   */
  get(permissionName: string): Permission | undefined {
    return this.permissions.get(permissionName);
  }

  /**
   * كل الصلاحيات
   */
  getAll(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * دمج مجموعتين
   */
  merge(other: PermissionSet): PermissionSet {
    const allPermissions = [
      ...this.permissions.values(),
      ...other.permissions.values(),
    ];
    return new PermissionSet(allPermissions);
  }

  /**
   * عدد الصلاحيات
   */
  get size(): number {
    return this.permissions.size;
  }

  /**
   * هل المجموعة فارغة
   */
  isEmpty(): boolean {
    return this.permissions.size === 0;
  }

  // ==================== Serialization ====================

  toJSON(): string[] {
    return Array.from(this.permissions.keys());
  }

  static fromJSON(names: string[]): PermissionSet {
    const permissions = names.map(name => Permission.fromName(name));
    return new PermissionSet(permissions);
  }
}
