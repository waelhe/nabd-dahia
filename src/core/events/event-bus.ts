/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Event Bus - ناقل الأحداث المركزي
 * 
 * النظام العصبي للمشروع - يربط كل الوحدات ببعضها.
 * 
 * @module core/events/event-bus
 */

import { DomainEvent } from '../domain/entities/base/Entity';

// ==================== Types ====================

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export type EventFilter = (event: DomainEvent) => boolean;

export interface Subscription {
  id: string;
  eventType: string | RegExp;
  handler: EventHandler<DomainEvent>;
  filter?: EventFilter;
  priority: number;
  once: boolean;
}

export interface EventBusStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  totalSubscribers: number;
  subscribersByType: Record<string, number>;
}

// ==================== Event Bus Class ====================

/**
 * ناقل الأحداث الرئيسي
 */
export class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private wildcardSubscriptions: Subscription[] = [];
  private eventHistory: DomainEvent[] = [];
  private maxHistorySize: number = 1000;
  private isProcessing: boolean = false;
  private eventQueue: DomainEvent[] = [];

  private static instance: EventBus | null = null;

  private constructor() {}

  /**
   * الحصول على المثيل الوحيد
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // ==================== Subscribe ====================

  /**
   * الاشتراك في حدث معين
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options?: {
      priority?: number;
      filter?: EventFilter;
      once?: boolean;
    }
  ): string {
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      eventType,
      handler: handler as EventHandler<DomainEvent>,
      filter: options?.filter,
      priority: options?.priority ?? 0,
      once: options?.once ?? false,
    };

    // إذا كان نمط wildcard
    if (eventType === '*' || eventType.includes('*')) {
      this.wildcardSubscriptions.push(subscription);
      this.wildcardSubscriptions.sort((a, b) => b.priority - a.priority);
    } else {
      if (!this.subscriptions.has(eventType)) {
        this.subscriptions.set(eventType, []);
      }
      
      this.subscriptions.get(eventType)!.push(subscription);
      this.subscriptions.get(eventType)!.sort((a, b) => b.priority - a.priority);
    }

    return subscription.id;
  }

  /**
   * الاشتراك مرة واحدة
   */
  once<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): string {
    return this.subscribe(eventType, handler, { once: true });
  }

  /**
   * الاشتراك في عدة أحداث
   */
  subscribeMultiple(
    eventTypes: string[],
    handler: EventHandler<DomainEvent>
  ): string[] {
    return eventTypes.map(type => this.subscribe(type, handler));
  }

  /**
   * الاشتراك في كل الأحداث
   */
  subscribeAll(handler: EventHandler<DomainEvent>): string {
    return this.subscribe('*', handler);
  }

  // ==================== Unsubscribe ====================

  /**
   * إلغاء الاشتراك
   */
  unsubscribe(subscriptionId: string): boolean {
    // البحث في الاشتراكات العادية
    for (const [type, subs] of this.subscriptions) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(type);
        }
        return true;
      }
    }

    // البحث في الاشتراكات العامة
    const wildcardIndex = this.wildcardSubscriptions.findIndex(
      s => s.id === subscriptionId
    );
    if (wildcardIndex !== -1) {
      this.wildcardSubscriptions.splice(wildcardIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * إلغاء كل الاشتراكات لحدث معين
   */
  unsubscribeAll(eventType: string): number {
    const subs = this.subscriptions.get(eventType);
    const count = subs?.length ?? 0;
    this.subscriptions.delete(eventType);
    return count;
  }

  // ==================== Publish ====================

  /**
   * نشر حدث
   */
  async publish(event: DomainEvent): Promise<void> {
    // إضافة للطابور إذا كنا نعالج أحداثاً أخرى
    if (this.isProcessing) {
      this.eventQueue.push(event);
      return;
    }

    this.isProcessing = true;

    try {
      // حفظ في التاريخ
      this.addToHistory(event);

      // جمع المعالجات المناسبة
      const handlers = this.getHandlersForEvent(event);

      // تنفيذ المعالجات بالترتيب
      for (const sub of handlers) {
        try {
          // التحقق من الفلتر
          if (sub.filter && !sub.filter(event)) {
            continue;
          }

          // تنفيذ المعالج
          await sub.handler(event);

          // إزالة إذا كان once
          if (sub.once) {
            this.unsubscribe(sub.id);
          }
        } catch (error) {
          console.error(`Error in event handler for ${event.eventType}:`, error);
          // نستمر في تنفيذ باقي المعالجات
        }
      }
    } finally {
      this.isProcessing = false;

      // معالجة الأحداث المعلقة
      if (this.eventQueue.length > 0) {
        const queuedEvent = this.eventQueue.shift();
        if (queuedEvent) {
          await this.publish(queuedEvent);
        }
      }
    }
  }

  /**
   * نشر عدة أحداث
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * نشر متزامن (للاستخدامات الخاصة)
   */
  publishSync(event: DomainEvent): void {
    this.addToHistory(event);
    const handlers = this.getHandlersForEvent(event);

    for (const sub of handlers) {
      if (sub.filter && !sub.filter(event)) continue;
      
      try {
        sub.handler(event);
        if (sub.once) this.unsubscribe(sub.id);
      } catch (error) {
        console.error(`Error in sync handler for ${event.eventType}:`, error);
      }
    }
  }

  // ==================== Helpers ====================

  /**
   * الحصول على المعالجات المناسبة لحدث
   */
  private getHandlersForEvent(event: DomainEvent): Subscription[] {
    const handlers: Subscription[] = [];

    // المعالجات الخاصة بالنوع
    const specificHandlers = this.subscriptions.get(event.eventType) || [];
    handlers.push(...specificHandlers);

    // المعالجات العامة (wildcard)
    for (const sub of this.wildcardSubscriptions) {
      if (this.matchesPattern(sub.eventType, event.eventType)) {
        handlers.push(sub);
      }
    }

    // ترتيب حسب الأولوية
    handlers.sort((a, b) => b.priority - a.priority);

    return handlers;
  }

  /**
   * التحقق من مطابقة النمط
   */
  private matchesPattern(pattern: string, eventType: string): boolean {
    if (pattern === '*') return true;
    
    // تحويل النمط إلى RegExp
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(eventType);
  }

  /**
   * إضافة للتاريخ
   */
  private addToHistory(event: DomainEvent): void {
    this.eventHistory.push(event);
    
    // الحفاظ على الحجم
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  // ==================== Query ====================

  /**
   * الحصول على تاريخ الأحداث
   */
  getHistory(eventType?: string): DomainEvent[] {
    if (eventType) {
      return this.eventHistory.filter(e => e.eventType === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * الحصول على آخر حدث
   */
  getLastEvent(eventType?: string): DomainEvent | null {
    if (eventType) {
      for (let i = this.eventHistory.length - 1; i >= 0; i--) {
        if (this.eventHistory[i].eventType === eventType) {
          return this.eventHistory[i];
        }
      }
      return null;
    }
    return this.eventHistory[this.eventHistory.length - 1] || null;
  }

  /**
   * الحصول على إحصائيات
   */
  getStats(): EventBusStats {
    const eventsByType: Record<string, number> = {};
    for (const event of this.eventHistory) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    }

    const subscribersByType: Record<string, number> = {};
    for (const [type, subs] of this.subscriptions) {
      subscribersByType[type] = subs.length;
    }
    subscribersByType['*'] = this.wildcardSubscriptions.length;

    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      totalSubscribers: Array.from(this.subscriptions.values())
        .reduce((sum, subs) => sum + subs.length, 0) + this.wildcardSubscriptions.length,
      subscribersByType,
    };
  }

  /**
   * مسح التاريخ
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * إعادة تعيين كاملة
   */
  reset(): void {
    this.subscriptions.clear();
    this.wildcardSubscriptions = [];
    this.eventHistory = [];
    this.eventQueue = [];
  }
}

// ==================== Global Instance ====================

/**
 * المثيل العام لناقل الأحداث
 */
export const eventBus = EventBus.getInstance();

// ==================== Decorators ====================

/**
 * مزخرف للاشتراك في حدث
 */
export function Subscribe(eventType: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    // تسجيل الاشتراك عند تهيئة الكلاس
    if (typeof target === 'object' && target !== null) {
      const constructor = target.constructor as { subscriptions?: string[] };
      if (!constructor.subscriptions) {
        constructor.subscriptions = [];
      }
      
      const subscriptionId = eventBus.subscribe(
        eventType,
        originalMethod.bind(target)
      );
      constructor.subscriptions.push(subscriptionId);
    }
    
    return descriptor;
  };
}
