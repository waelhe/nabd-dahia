/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Policy - السياسة
 * 
 * تمثل قاعدة تحكم في الوصول للموارد.
 * تدعم ABAC (Attribute-Based Access Control).
 * 
 * @module core/domain/authorization/Policy
 */

import { Permission } from './Permission';
import { Role, RoleName } from './Role';

export type PolicyEffect = 'allow' | 'deny';

export interface PolicyCondition {
  type: 'attribute' | 'time' | 'ip' | 'resource' | 'context';
  key: string;
  operator: 'eq' | 'ne' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
  value: unknown;
}

export interface PolicyStatement {
  effect: PolicyEffect;
  actions: string[]; // ['*', 'create', 'read', 'update', 'delete']
  resources: string[]; // ['listings/*', 'bookings/{userId}/*']
  conditions?: PolicyCondition[];
}

export interface PolicyProps {
  id: string;
  name: string;
  description?: string;
  statements: PolicyStatement[];
  priority: number; // كلما زاد الرقم، زادت الأولوية
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * سياق التقييم
 */
export interface PolicyEvaluationContext {
  userId: string;
  userRole: RoleName;
  userAttributes?: Record<string, unknown>;
  resourceType: string;
  resourceId: string;
  resourceAttributes?: Record<string, unknown>;
  action: string;
  environment?: Record<string, unknown>;
  time?: Date;
  ip?: string;
}

export class Policy {
  private readonly props: PolicyProps;

  constructor(props: PolicyProps) {
    this.props = {
      ...props,
      priority: props.priority ?? 0,
      isActive: props.isActive ?? true,
    };
    this.validate();
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get statements(): PolicyStatement[] {
    return this.props.statements;
  }

  get priority(): number {
    return this.props.priority;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error('Policy id is required');
    }

    if (!this.props.name) {
      throw new Error('Policy name is required');
    }

    if (!this.props.statements || this.props.statements.length === 0) {
      throw new Error('Policy must have at least one statement');
    }
  }

  // ==================== Evaluation ====================

  /**
   * تقييم السياسة
   */
  evaluate(context: PolicyEvaluationContext): PolicyEffect | null {
    if (!this.props.isActive) {
      return null;
    }

    // ترتيب التصريحات حسب الأولوية (deny أولاً)
    const sortedStatements = [...this.props.statements].sort((a, b) => {
      if (a.effect === 'deny' && b.effect !== 'deny') return -1;
      if (a.effect !== 'deny' && b.effect === 'deny') return 1;
      return 0;
    });

    for (const statement of sortedStatements) {
      const matchesAction = this.matchesAction(statement.actions, context.action);
      const matchesResource = this.matchesResource(statement.resources, context);

      if (matchesAction && matchesResource) {
        const conditionsMet = this.evaluateConditions(statement.conditions || [], context);
        
        if (conditionsMet) {
          return statement.effect;
        }
      }
    }

    return null;
  }

  /**
   * التحقق من مطابقة الإجراء
   */
  private matchesAction(actions: string[], targetAction: string): boolean {
    return actions.some(action => {
      if (action === '*') return true;
      return action === targetAction;
    });
  }

  /**
   * التحقق من مطابقة المورد
   */
  private matchesResource(resources: string[], context: PolicyEvaluationContext): boolean {
    return resources.some(resource => {
      // استبدال المتغيرات
      let pattern = resource
        .replace('{userId}', context.userId)
        .replace('{resourceId}', context.resourceId);

      // مطابقة النمط
      if (pattern === '*') return true;
      
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2);
        return context.resourceType.startsWith(prefix);
      }

      return context.resourceType === pattern || context.resourceId === pattern;
    });
  }

  /**
   * تقييم الشروط
   */
  private evaluateConditions(
    conditions: PolicyCondition[],
    context: PolicyEvaluationContext
  ): boolean {
    return conditions.every(condition => {
      let value: unknown;

      // الحصول على القيمة حسب نوع الشرط
      switch (condition.type) {
        case 'attribute':
          value = context.userAttributes?.[condition.key] ?? 
                  context.resourceAttributes?.[condition.key];
          break;
        case 'time':
          value = this.getTimeValue(condition.key, context.time);
          break;
        case 'ip':
          value = context.ip;
          break;
        case 'resource':
          value = context.resourceAttributes?.[condition.key];
          break;
        case 'context':
          value = context.environment?.[condition.key];
          break;
        default:
          return false;
      }

      return this.evaluateOperator(value, condition.operator, condition.value);
    });
  }

  /**
   * الحصول على قيمة الوقت
   */
  private getTimeValue(key: string, time?: Date): unknown {
    const date = time || new Date();
    
    switch (key) {
      case 'hour':
        return date.getHours();
      case 'day':
        return date.getDay();
      case 'date':
        return date.getDate();
      case 'month':
        return date.getMonth();
      case 'year':
        return date.getFullYear();
      default:
        return null;
    }
  }

  /**
   * تقييم العملية
   */
  private evaluateOperator(value: unknown, operator: string, target: unknown): boolean {
    switch (operator) {
      case 'eq':
        return value === target;
      case 'ne':
        return value !== target;
      case 'in':
        return Array.isArray(target) && target.includes(value);
      case 'not_in':
        return Array.isArray(target) && !target.includes(value);
      case 'contains':
        return String(value).includes(String(target));
      case 'starts_with':
        return String(value).startsWith(String(target));
      case 'ends_with':
        return String(value).endsWith(String(target));
      case 'gt':
        return Number(value) > Number(target);
      case 'gte':
        return Number(value) >= Number(target);
      case 'lt':
        return Number(value) < Number(target);
      case 'lte':
        return Number(value) <= Number(target);
      case 'between':
        if (Array.isArray(target) && target.length === 2) {
          const numValue = Number(value);
          return numValue >= Number(target[0]) && numValue <= Number(target[1]);
        }
        return false;
      default:
        return false;
    }
  }

  // ==================== Factory Methods ====================

  /**
   * سياسة السماح للمستخدم بموارده الخاصة فقط
   */
  static ownerOnly(resourceType: string): Policy {
    return new Policy({
      id: `owner-only-${resourceType}`,
      name: `Owner Only - ${resourceType}`,
      description: `السماح للمستخدمين بإدارة ${resourceType} الخاصة بهم فقط`,
      statements: [
        {
          effect: 'allow',
          actions: ['create', 'read', 'update', 'delete'],
          resources: [`${resourceType}/{userId}/*`],
        },
      ],
      priority: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * سياسة تقييد الوصول حسب الوقت
   */
  static timeRestricted(
    resourceType: string,
    startHour: number,
    endHour: number
  ): Policy {
    return new Policy({
      id: `time-restricted-${resourceType}`,
      name: `Time Restricted - ${resourceType}`,
      description: `تقييد الوصول إلى ${resourceType} بين الساعات ${startHour} و ${endHour}`,
      statements: [
        {
          effect: 'allow',
          actions: ['*'],
          resources: [resourceType],
          conditions: [
            {
              type: 'time',
              key: 'hour',
              operator: 'between',
              value: [startHour, endHour],
            },
          ],
        },
      ],
      priority: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * سياسة رفض صريح
   */
  static deny(
    resourceType: string,
    actions: string[],
    reason?: string
  ): Policy {
    return new Policy({
      id: `deny-${resourceType}`,
      name: `Deny - ${resourceType}`,
      description: reason || `رفض الوصول إلى ${resourceType}`,
      statements: [
        {
          effect: 'deny',
          actions,
          resources: [resourceType],
        },
      ],
      priority: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * إنشاء من كائن
   */
  static from(props: PolicyProps): Policy {
    return new Policy(props);
  }

  // ==================== Serialization ====================

  toJSON(): PolicyProps {
    return { ...this.props };
  }

  equals(other: Policy): boolean {
    return this.props.id === other.props.id;
  }
}

/**
 * PolicyEngine - محرك السياسات
 */
export class PolicyEngine {
  private policies: Policy[] = [];

  /**
   * إضافة سياسة
   */
  addPolicy(policy: Policy): void {
    this.policies.push(policy);
    this.sortPolicies();
  }

  /**
   * إزالة سياسة
   */
  removePolicy(policyId: string): void {
    this.policies = this.policies.filter(p => p.id !== policyId);
  }

  /**
   * ترتيب السياسات حسب الأولوية
   */
  private sortPolicies(): void {
    this.policies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * تقييم كل السياسات
   */
  evaluate(context: PolicyEvaluationContext): PolicyEffect {
    for (const policy of this.policies) {
      const result = policy.evaluate(context);
      if (result !== null) {
        return result;
      }
    }

    // الرفض الافتراضي
    return 'deny';
  }

  /**
   * التحقق من السماح
   */
  isAllowed(context: PolicyEvaluationContext): boolean {
    return this.evaluate(context) === 'allow';
  }

  /**
   * الحصول على جميع السياسات النشطة
   */
  getActivePolicies(): Policy[] {
    return this.policies.filter(p => p.isActive);
  }
}
