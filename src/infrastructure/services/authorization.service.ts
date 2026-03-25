/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Authorization Service Implementation
 * 
 * تنفيذ خدمة التفويض
 * 
 * @module infrastructure/services/authorization.service
 */

import { db } from '@/lib/db';
import {
  IAuthorizationService,
  Resource,
  Action,
  AuthorizationContext,
  PermissionCheck,
  AuthorizationResult,
  AuthorizationCondition,
  PermissionDefinition,
  AuthorizationPolicy,
  CheckRequest,
  UserPermissions,
  BatchCheckResult,
  AuthorizationReport,
} from '@/core/interfaces/services/authorization.service';
import { Result, ok, err } from '@/core/types/result';

// ==================== Role Permissions Map ====================

/**
 * تعريف صلاحيات الأدوار الافتراضية
 */
const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionDefinition[]> = {
  admin: [
    { id: 'admin_all', name: 'Full Admin Access', resource: '*', action: 'manage', description: 'Full system access' },
  ],
  company: [
    { id: 'company_read', name: 'Read Company', resource: 'company', action: 'read', description: 'View company' },
    { id: 'company_update', name: 'Update Company', resource: 'company', action: 'update', description: 'Edit company' },
    { id: 'listing_manage', name: 'Manage Listings', resource: 'listing', action: 'manage', description: 'Full listing access' },
    { id: 'booking_manage', name: 'Manage Bookings', resource: 'booking', action: 'manage', description: 'Full booking access' },
    { id: 'user_read', name: 'Read Users', resource: 'user', action: 'read', description: 'View users' },
    { id: 'report_read', name: 'Read Reports', resource: 'report', action: 'read', description: 'View reports' },
  ],
  host: [
    { id: 'listing_create', name: 'Create Listing', resource: 'listing', action: 'create', description: 'Create listings' },
    { id: 'listing_read_own', name: 'Read Own Listings', resource: 'listing', action: 'read', description: 'View own listings' },
    { id: 'listing_update_own', name: 'Update Own Listings', resource: 'listing', action: 'update', description: 'Edit own listings' },
    { id: 'listing_delete_own', name: 'Delete Own Listings', resource: 'listing', action: 'delete', description: 'Delete own listings' },
    { id: 'booking_read_own', name: 'Read Own Bookings', resource: 'booking', action: 'read', description: 'View own bookings' },
    { id: 'booking_update_own', name: 'Update Own Bookings', resource: 'booking', action: 'update', description: 'Manage own bookings' },
    { id: 'review_read', name: 'Read Reviews', resource: 'review', action: 'read', description: 'View reviews' },
  ],
  user: [
    { id: 'booking_create', name: 'Create Booking', resource: 'booking', action: 'create', description: 'Create bookings' },
    { id: 'booking_read_own', name: 'Read Own Bookings', resource: 'booking', action: 'read', description: 'View own bookings' },
    { id: 'review_create', name: 'Create Review', resource: 'review', action: 'create', description: 'Create reviews' },
    { id: 'review_read', name: 'Read Reviews', resource: 'review', action: 'read', description: 'View reviews' },
    { id: 'user_read_own', name: 'Read Own Profile', resource: 'user', action: 'read', description: 'View own profile' },
    { id: 'user_update_own', name: 'Update Own Profile', resource: 'user', action: 'update', description: 'Edit own profile' },
    { id: 'listing_read', name: 'Read Listings', resource: 'listing', action: 'read', description: 'View listings' },
  ],
  guest: [
    { id: 'listing_read', name: 'Read Listings', resource: 'listing', action: 'read', description: 'View listings' },
    { id: 'booking_create', name: 'Create Booking', resource: 'booking', action: 'create', description: 'Create bookings' },
    { id: 'user_register', name: 'Register', resource: 'user', action: 'create', description: 'Register account' },
  ],
};

// ==================== Authorization Service ====================

/**
 * تنفيذ خدمة التفويض
 */
export class AuthorizationService implements IAuthorizationService {
  private permissionCache: Map<string, UserPermissions> = new Map();
  private policies: Map<string, AuthorizationPolicy> = new Map();
  private customPermissions: Map<string, PermissionDefinition> = new Map();
  private denialStats: Array<{ userId: string; resource: Resource; reason: string; timestamp: Date }> = [];

  constructor() {
    this.initializeDefaultPolicies();
  }

  // ==================== Permission Checks ====================

  async can(request: CheckRequest): Promise<Result<AuthorizationResult, Error>> {
    try {
      // Skip cache if requested
      if (request.skipCache) {
        this.permissionCache.delete(request.userId);
      }

      // Get user permissions
      const userPerms = await this.getUserPermissions(request.userId);
      const context = await this.getUserContext(request.userId);

      // Check explicit permissions
      const permissionMatch = this.findMatchingPermission(
        userPerms.permissions,
        request.permission,
      );

      if (permissionMatch) {
        // Check ownership if needed
        if (request.permission.resourceId) {
          const isOwner = await this.checkOwnership(
            request.userId,
            request.permission.resource,
            request.permission.resourceId,
          );

          if (!isOwner && permissionMatch.id.includes('_own')) {
            return ok({
              allowed: false,
              reason: 'You can only access your own resources',
              missingPermissions: [permissionMatch.id.replace('_own', '')],
            });
          }
        }

        // Check policies
        const policyResult = await this.checkPolicies(request.userId, request.permission, context);
        if (!policyResult.allowed) {
          return ok(policyResult);
        }

        return ok({ allowed: true, conditions: this.buildConditions(permissionMatch) });
      }

      // Check wildcard permissions
      const hasWildcard = userPerms.permissions.some(
        (p) => p.resource === '*' || p.action === 'manage',
      );

      if (hasWildcard) {
        return ok({ allowed: true });
      }

      // Check role permissions
      const rolePermission = DEFAULT_ROLE_PERMISSIONS[userPerms.role];
      if (rolePermission) {
        const match = this.findMatchingPermission(rolePermission, request.permission);
        if (match) {
          return ok({ allowed: true, conditions: this.buildConditions(match) });
        }
      }

      // Denied
      this.recordDenial(request.userId, request.permission.resource, 'No matching permission');

      return ok({
        allowed: false,
        reason: `No permission to ${request.permission.action} on ${request.permission.resource}`,
        missingPermissions: [`${request.permission.action}:${request.permission.resource}`],
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Authorization check failed'));
    }
  }

  async canMany(userId: string, permissions: PermissionCheck[]): Promise<BatchCheckResult> {
    const results = new Map<string, AuthorizationResult>();
    const allowed: string[] = [];
    const denied: string[] = [];

    for (const permission of permissions) {
      const key = `${permission.action}:${permission.resource}:${permission.resourceId ?? ''}`;
      const result = await this.can({ userId, permission });

      results.set(key, result.isOk() ? result.value : { allowed: false, reason: result.error?.message });

      if (result.isOk() && result.value.allowed) {
        allowed.push(key);
      } else {
        denied.push(key);
      }
    }

    return { results, allowed, denied };
  }

  async canAny(userId: string, permissions: PermissionCheck[]): Promise<boolean> {
    const result = await this.canMany(userId, permissions);
    return result.allowed.length > 0;
  }

  async canAll(userId: string, permissions: PermissionCheck[]): Promise<boolean> {
    const result = await this.canMany(userId, permissions);
    return result.denied.length === 0;
  }

  // ==================== Role-Based ====================

  async getRolePermissions(role: string): Promise<PermissionDefinition[]> {
    return DEFAULT_ROLE_PERMISSIONS[role] ?? [];
  }

  async getResourceRoles(resource: Resource): Promise<Array<{ role: string; actions: Action[] }>> {
    const result: Array<{ role: string; actions: Action[] }> = [];

    for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const actions = permissions
        .filter((p) => p.resource === resource || p.resource === '*')
        .map((p) => p.action);
      if (actions.length > 0) {
        result.push({ role, actions });
      }
    }

    return result;
  }

  async canUpgradeRole(userId: string, targetRole: string): Promise<AuthorizationResult> {
    const userPerms = await this.getUserPermissions(userId);
    const roleHierarchy = ['guest', 'user', 'host', 'company', 'admin'];

    const currentLevel = roleHierarchy.indexOf(userPerms.role);
    const targetLevel = roleHierarchy.indexOf(targetRole);

    if (targetLevel <= currentLevel) {
      return {
        allowed: false,
        reason: 'Cannot downgrade or maintain same role',
      };
    }

    if (userPerms.role !== 'admin' && targetRole === 'admin') {
      return {
        allowed: false,
        reason: 'Only admins can create other admins',
      };
    }

    return { allowed: true };
  }

  // ==================== Resource-Based ====================

  async isOwner(userId: string, resource: Resource, resourceId: string): Promise<boolean> {
    try {
      switch (resource) {
        case 'user':
          return userId === resourceId;

        case 'listing': {
          const listing = await db.listing.findUnique({
            where: { id: resourceId },
            select: { hostId: true },
          });
          return listing?.hostId === userId;
        }

        case 'booking': {
          const booking = await db.booking.findUnique({
            where: { id: resourceId },
            select: { guestId: true, hostId: true },
          });
          return booking?.guestId === userId || booking?.hostId === userId;
        }

        case 'review': {
          const review = await db.review.findUnique({
            where: { id: resourceId },
            select: { reviewerId: true },
          });
          return review?.reviewerId === userId;
        }

        case 'company': {
          const company = await db.company.findUnique({
            where: { id: resourceId },
            select: { ownerId: true },
          });
          return company?.ownerId === userId;
        }

        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  async isCompanyMember(userId: string, companyId: string): Promise<boolean> {
    try {
      const company = await db.company.findUnique({
        where: { id: companyId },
        select: { ownerId: true },
      });

      if (company?.ownerId === userId) return true;

      // Check if user is in company members (if applicable)
      // This depends on your schema

      return false;
    } catch {
      return false;
    }
  }

  async getCompanyRole(userId: string, companyId: string): Promise<string | null> {
    const isMember = await this.isCompanyMember(userId, companyId);
    if (!isMember) return null;

    try {
      const company = await db.company.findUnique({
        where: { id: companyId },
        select: { ownerId: true },
      });

      if (company?.ownerId === userId) return 'owner';
      return 'member';
    } catch {
      return null;
    }
  }

  async getAllowedResources(userId: string, action: Action): Promise<Resource[]> {
    const userPerms = await this.getUserPermissions(userId);

    const resources = new Set<Resource>();

    // From explicit permissions
    for (const perm of userPerms.permissions) {
      if (perm.action === action || perm.action === 'manage') {
        resources.add(perm.resource);
      }
    }

    // From role
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[userPerms.role] ?? [];
    for (const perm of rolePerms) {
      if (perm.action === action || perm.action === 'manage') {
        resources.add(perm.resource);
      }
    }

    return Array.from(resources).filter((r) => r !== '*');
  }

  async getAllowedActions(userId: string, resource: Resource): Promise<Action[]> {
    const userPerms = await this.getUserPermissions(userId);
    const actions = new Set<Action>();

    for (const perm of userPerms.permissions) {
      if (perm.resource === resource || perm.resource === '*') {
        actions.add(perm.action);
      }
    }

    const rolePerms = DEFAULT_ROLE_PERMISSIONS[userPerms.role] ?? [];
    for (const perm of rolePerms) {
      if (perm.resource === resource || perm.resource === '*') {
        actions.add(perm.action);
      }
    }

    return Array.from(actions);
  }

  // ==================== Policy Management ====================

  async createPolicy(policy: Omit<AuthorizationPolicy, 'id'>): Promise<Result<AuthorizationPolicy, Error>> {
    const newPolicy: AuthorizationPolicy = {
      ...policy,
      id: `policy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    this.policies.set(newPolicy.id, newPolicy);
    return ok(newPolicy);
  }

  async updatePolicy(id: string, policy: Partial<AuthorizationPolicy>): Promise<Result<AuthorizationPolicy, Error>> {
    const existing = this.policies.get(id);
    if (!existing) {
      return err(new Error('Policy not found'));
    }

    const updated = { ...existing, ...policy };
    this.policies.set(id, updated);
    return ok(updated);
  }

  async deletePolicy(id: string): Promise<Result<void, Error>> {
    if (!this.policies.has(id)) {
      return err(new Error('Policy not found'));
    }
    this.policies.delete(id);
    return ok(undefined);
  }

  async getUserPolicies(userId: string): Promise<AuthorizationPolicy[]> {
    return Array.from(this.policies.values()).filter((p) =>
      p.principals.includes(userId) || p.principals.includes(`user:${userId}`),
    );
  }

  async getRolePolicies(role: string): Promise<AuthorizationPolicy[]> {
    return Array.from(this.policies.values()).filter((p) =>
      p.principals.includes(role) || p.principals.includes(`role:${role}`),
    );
  }

  // ==================== Permission Management ====================

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Check cache
    const cached = this.permissionCache.get(userId);
    if (cached) return cached;

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return {
          userId,
          role: 'guest',
          permissions: [],
          effectivePermissions: [],
          policies: [],
        };
      }

      const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.role] ?? [];
      const customPerms = Array.from(this.customPermissions.values());
      const permissions = [...rolePerms, ...customPerms];

      const effectivePermissions = permissions.map((p) => p.id);
      const policies = await this.getUserPolicies(userId);

      const result: UserPermissions = {
        userId,
        role: user.role,
        permissions,
        effectivePermissions,
        policies,
      };

      // Cache result
      this.permissionCache.set(userId, result);

      return result;
    } catch {
      return {
        userId,
        role: 'guest',
        permissions: [],
        effectivePermissions: [],
        policies: [],
      };
    }
  }

  async grantPermission(userId: string, permission: string): Promise<Result<void, Error>> {
    // In production, store in database
    const permDef: PermissionDefinition = {
      id: permission,
      name: permission,
      resource: permission.split(':')[1] as Resource,
      action: permission.split(':')[0] as Action,
      description: `Custom permission: ${permission}`,
    };

    this.customPermissions.set(permission, permDef);
    this.permissionCache.delete(userId);

    return ok(undefined);
  }

  async revokePermission(userId: string, permission: string): Promise<Result<void, Error>> {
    this.customPermissions.delete(permission);
    this.permissionCache.delete(userId);
    return ok(undefined);
  }

  async grantPermissions(userId: string, permissions: string[]): Promise<Result<void, Error>> {
    for (const perm of permissions) {
      await this.grantPermission(userId, perm);
    }
    return ok(undefined);
  }

  // ==================== Scope ====================

  async checkScope(userId: string, scope: string): Promise<boolean> {
    const userPerms = await this.getUserPermissions(userId);
    return userPerms.effectivePermissions.includes(scope);
  }

  async getUserScopes(userId: string): Promise<string[]> {
    const userPerms = await this.getUserPermissions(userId);
    return userPerms.effectivePermissions;
  }

  async requireScope(userId: string, scope: string): Promise<Result<void, Error>> {
    const hasScope = await this.checkScope(userId, scope);
    if (!hasScope) {
      return err(new Error(`Required scope '${scope}' not granted`));
    }
    return ok(undefined);
  }

  // ==================== Caching ====================

  refreshCache(userId: string): Promise<void> {
    this.permissionCache.delete(userId);
    return Promise.resolve();
  }

  clearCache(userId?: string): Promise<void> {
    if (userId) {
      this.permissionCache.delete(userId);
    } else {
      this.permissionCache.clear();
    }
    return Promise.resolve();
  }

  // ==================== Reporting ====================

  async getReport(filter?: { from?: Date; to?: Date; userId?: string }): Promise<AuthorizationReport> {
    const stats = this.denialStats.filter((d) => {
      if (filter?.from && d.timestamp < filter.from) return false;
      if (filter?.to && d.timestamp > filter.to) return false;
      if (filter?.userId && d.userId !== filter.userId) return false;
      return true;
    });

    const byResource: Record<Resource, { allowed: number; denied: number }> = {} as Record<Resource, { allowed: number; denied: number }>;
    const byAction: Record<Action, { allowed: number; denied: number }> = {} as Record<Action, { allowed: number; denied: number }>;
    const deniedReasons: Record<string, number> = {};

    for (const stat of stats) {
      if (!byResource[stat.resource]) {
        byResource[stat.resource] = { allowed: 0, denied: 0 };
      }
      byResource[stat.resource].denied++;

      deniedReasons[stat.reason] = (deniedReasons[stat.reason] ?? 0) + 1;
    }

    return {
      totalChecks: stats.length,
      allowed: 0, // Would need to track
      denied: stats.length,
      byResource,
      byAction,
      deniedReasons,
    };
  }

  async getDenialStats(filter?: { from?: Date; to?: Date }): Promise<{
    total: number;
    byReason: Record<string, number>;
    byResource: Record<Resource, number>;
    byUser: Array<{ userId: string; count: number }>;
  }> {
    const stats = this.denialStats.filter((d) => {
      if (filter?.from && d.timestamp < filter.from) return false;
      if (filter?.to && d.timestamp > filter.to) return false;
      return true;
    });

    const byReason: Record<string, number> = {};
    const byResource: Record<Resource, number> = {} as Record<Resource, number>;
    const byUser: Record<string, number> = {};

    for (const stat of stats) {
      byReason[stat.reason] = (byReason[stat.reason] ?? 0) + 1;
      byResource[stat.resource] = (byResource[stat.resource] ?? 0) + 1;
      byUser[stat.userId] = (byUser[stat.userId] ?? 0) + 1;
    }

    return {
      total: stats.length,
      byReason,
      byResource,
      byUser: Object.entries(byUser).map(([userId, count]) => ({ userId, count })),
    };
  }

  // ==================== Utilities ====================

  permissionExists(permission: string): boolean {
    // Check custom permissions
    if (this.customPermissions.has(permission)) return true;

    // Check role permissions
    for (const perms of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      if (perms.some((p) => p.id === permission)) return true;
    }

    return false;
  }

  async getPermissionInfo(permission: string): Promise<PermissionDefinition | null> {
    // Check custom permissions
    const custom = this.customPermissions.get(permission);
    if (custom) return custom;

    // Check role permissions
    for (const perms of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      const found = perms.find((p) => p.id === permission);
      if (found) return found;
    }

    return null;
  }

  getAllPermissions(): PermissionDefinition[] {
    const all = new Map<string, PermissionDefinition>();

    for (const perms of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      for (const perm of perms) {
        all.set(perm.id, perm);
      }
    }

    for (const [id, perm] of this.customPermissions) {
      all.set(id, perm);
    }

    return Array.from(all.values());
  }

  // ==================== Private Methods ====================

  private initializeDefaultPolicies(): void {
    // Time-based policy (no access outside business hours)
    // IP whitelist policy
    // etc.
  }

  private async getUserContext(userId: string): Promise<AuthorizationContext> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      return {
        userId,
        role: user?.role ?? 'guest',
      };
    } catch {
      return {
        userId,
        role: 'guest',
      };
    }
  }

  private findMatchingPermission(
    permissions: PermissionDefinition[],
    check: PermissionCheck,
  ): PermissionDefinition | null {
    return permissions.find((p) => {
      if (p.resource !== check.resource && p.resource !== '*') return false;
      if (p.action !== check.action && p.action !== 'manage') return false;
      return true;
    }) ?? null;
  }

  private async checkPolicies(
    userId: string,
    permission: PermissionCheck,
    context: AuthorizationContext,
  ): Promise<AuthorizationResult> {
    const policies = await this.getUserPolicies(userId);

    for (const policy of policies.sort((a, b) => b.priority - a.priority)) {
      if (!policy.isActive) continue;

      const matchesResource = policy.resources.includes(permission.resource) ||
        policy.resources.includes('*');
      const matchesAction = policy.actions.includes(permission.action) ||
        policy.actions.includes('manage');

      if (matchesResource && matchesAction) {
        // Check conditions
        if (policy.conditions && policy.conditions.length > 0) {
          for (const condition of policy.conditions) {
            if (!this.evaluateCondition(condition, context)) {
              return {
                allowed: policy.effect === 'deny',
                reason: `Policy '${policy.name}' condition not met`,
              };
            }
          }
        }

        return {
          allowed: policy.effect === 'allow',
          reason: policy.effect === 'deny' ? `Denied by policy '${policy.name}'` : undefined,
        };
      }
    }

    return { allowed: true };
  }

  private evaluateCondition(
    condition: { type: string; operator: string; values: unknown[] },
    context: AuthorizationContext,
  ): boolean {
    switch (condition.type) {
      case 'ip':
        if (!context.ip) return false;
        return condition.values.includes(context.ip);

      case 'time':
        const now = new Date();
        const hour = now.getHours();
        // Example: only allow during business hours (9-17)
        if (condition.operator === 'between') {
          return hour >= 9 && hour <= 17;
        }
        return true;

      default:
        return true;
    }
  }

  private buildConditions(permission: PermissionDefinition): AuthorizationCondition[] {
    return [
      {
        type: 'permission',
        description: `Has permission: ${permission.name}`,
        satisfied: true,
      },
    ];
  }

  private recordDenial(userId: string, resource: Resource, reason: string): void {
    this.denialStats.push({
      userId,
      resource,
      reason,
      timestamp: new Date(),
    });

    // Keep only last 1000 denials
    if (this.denialStats.length > 1000) {
      this.denialStats.shift();
    }
  }
}

// ==================== Singleton ====================

export const authorizationService = new AuthorizationService();
