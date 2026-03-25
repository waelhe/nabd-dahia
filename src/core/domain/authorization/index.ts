/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Authorization Module Index
 * 
 * @module core/domain/authorization
 */

// Classes
export { Permission, PermissionSet } from './Permission';
export { Role, ROLE_LEVELS } from './Role';
export type { RoleName } from './Role';
export { Policy, PolicyEngine } from './Policy';
export type { 
  PolicyEffect, 
  PolicyCondition, 
  PolicyStatement, 
  PolicyProps,
  PolicyEvaluationContext 
} from './Policy';

// Predefined Permissions
export { PERMISSIONS, getPermission } from './permissions';

// Predefined Roles
export { ROLES, getRole } from './roles';

// Types
export type { PermissionAction, PermissionCondition, PermissionProps } from './Permission';
