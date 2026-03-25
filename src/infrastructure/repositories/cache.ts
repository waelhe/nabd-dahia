/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cache Layer for Repositories - طبقة التخزين المؤقت للمستودعات
 * 
 * @module infrastructure/repositories/cache
 */

import { Result, ok, err } from '@/core/types/result';

// ==================== Types ====================

/**
 * خيارات التخزين المؤقت
 */
export interface CacheOptions {
  /**
   * وقت الانتهاء بالثواني
   */
  ttl?: number;

  /**
   * مفتاح مخصص
   */
  key?: string;

  /**
   * تخطي التخزين المؤقت
   */
  skip?: boolean;

  /**
   * تحديث القيمة المخزنة
   */
  refresh?: boolean;

  /**
   * علامات للتجميع
   */
  tags?: string[];
}

/**
 * إحصائيات التخزين المؤقت
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage?: number;
}

/**
 * عنصر مخزن
 */
interface CacheItem<T> {
  value: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

/**
 * تكوين التخزين المؤقت
 */
export interface CacheConfig {
  /**
   * الوقت الافتراضي للانتهاء بالثواني
   */
  defaultTTL: number;

  /**
   * الحد الأقصى لعدد العناصر
   */
  maxSize: number;

  /**
   * تفعيل التخزين المؤقت
   */
  enabled: boolean;

  /**
   * تنظيف تلقائي
   */
  autoCleanup: boolean;

  /**
   * فترة التنظيف بالثواني
   */
  cleanupInterval: number;
}

// ==================== Memory Cache Implementation ====================

/**
 * تنفيذ التخزين المؤقت في الذاكرة
 */
export class MemoryCache {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private stats = { hits: 0, misses: 0 };
  private cleanupTimer?: NodeJS.Timeout;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: config?.defaultTTL ?? 300, // 5 minutes
      maxSize: config?.maxSize ?? 1000,
      enabled: config?.enabled ?? true,
      autoCleanup: config?.autoCleanup ?? true,
      cleanupInterval: config?.cleanupInterval ?? 60, // 1 minute
    };

    if (this.config.autoCleanup) {
      this.startCleanup();
    }
  }

  // ==================== Basic Operations ====================

  /**
   * الحصول على قيمة
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      this.stats.misses++;
      return null;
    }

    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value as T;
  }

  /**
   * تخزين قيمة
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.config.enabled || options?.skip) {
      return;
    }

    // Check size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const ttl = options?.ttl ?? this.config.defaultTTL;

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
      tags: options?.tags ?? [],
      createdAt: Date.now(),
    });
  }

  /**
   * حذف قيمة
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * التحقق من وجود مفتاح
   */
  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * مسح جميع القيم
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  // =================--- Tag Operations -------------------//

  /**
   * حذف حسب العلامة
   */
  async deleteByTag(tag: string): Promise<number> {
    let count = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * حذف حسب علامات متعددة
   */
  async deleteByTags(tags: string[]): Promise<number> {
    let count = 0;

    for (const tag of tags) {
      count += await this.deleteByTag(tag);
    }

    return count;
  }

  /**
   * الحصول على مفاتيح حسب العلامة
   */
  async getKeysByTag(tag: string): Promise<string[]> {
    const keys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        keys.push(key);
      }
    }

    return keys;
  }

  // =================--- Pattern Operations -------------------//

  /**
   * حذف حسب النمط
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const regex = this.patternToRegex(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * الحصول على مفاتيح حسب النمط
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    const regex = this.patternToRegex(pattern);
    const keys: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keys.push(key);
      }
    }

    return keys;
  }

  // =================--- Stats -------------------//

  /**
   * الحصول على الإحصائيات
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      totalKeys: this.cache.size,
    };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  // =================--- Lifecycle -------------------//

  /**
   * إيقاف التخزين المؤقت
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }

  // =================--- Private Methods -------------------//

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval * 1000);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }
}

// ==================== Cache Decorator for Repositories ====================

/**
 * مفتاح التخزين المؤقت للمستودع
 */
export class RepositoryCacheKey {
  private static prefix = 'repo';

  static forEntity(entity: string, id: string): string {
    return `${this.prefix}:${entity}:${id}`;
  }

  static forList(entity: string, query: Record<string, unknown>): string {
    const sortedQuery = JSON.stringify(query, Object.keys(query).sort());
    return `${this.prefix}:${entity}:list:${Buffer.from(sortedQuery).toString('base64')}`;
  }

  static forCount(entity: string, query?: Record<string, unknown>): string {
    const sortedQuery = query
      ? JSON.stringify(query, Object.keys(query).sort())
      : 'all';
    return `${this.prefix}:${entity}:count:${Buffer.from(sortedQuery).toString('base64')}`;
  }

  static forExists(entity: string, id: string): string {
    return `${this.prefix}:${entity}:exists:${id}`;
  }

  static forEntityTag(entity: string): string {
    return `entity:${entity}`;
  }

  static forListTag(entity: string): string {
    return `list:${entity}`;
  }
}

/**
 * مزخرف التخزين المؤقت للمستودع
 */
export class CachedRepository<T> {
  private cache: MemoryCache;
  private entityName: string;

  constructor(cache: MemoryCache, entityName: string) {
    this.cache = cache;
    this.entityName = entityName;
  }

  /**
   * الحصول على قيمة مع التخزين المؤقت
   */
  async getOrSet<R>(
    key: string,
    fetcher: () => Promise<R>,
    options?: CacheOptions,
  ): Promise<R> {
    if (options?.skip) {
      return fetcher();
    }

    // Try to get from cache
    const cached = await this.cache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const value = await fetcher();
    await this.cache.set(key, value, options);

    return value;
  }

  /**
   * إبطال التخزين المؤقت للكيان
   */
  async invalidateEntity(id: string): Promise<void> {
    await this.cache.delete(RepositoryCacheKey.forEntity(this.entityName, id));
    await this.cache.delete(RepositoryCacheKey.forExists(this.entityName, id));
  }

  /**
   * إبطال التخزين المؤقت للقوائم
   */
  async invalidateLists(): Promise<void> {
    await this.cache.deleteByTag(RepositoryCacheKey.forListTag(this.entityName));
  }

  /**
   * إبطال جميع التخزين المؤقت للكيان
   */
  async invalidateAll(): Promise<void> {
    await this.cache.deleteByTag(RepositoryCacheKey.forEntityTag(this.entityName));
    await this.invalidateLists();
  }

  /**
   * تحديث التخزين المؤقت للكيان
   */
  async updateEntity(id: string, value: T, options?: CacheOptions): Promise<void> {
    const key = RepositoryCacheKey.forEntity(this.entityName, id);
    await this.cache.set(key, value, {
      ...options,
      tags: [RepositoryCacheKey.forEntityTag(this.entityName)],
    });
  }
}

// ==================== Singleton Instance ====================

let cacheInstance: MemoryCache | null = null;

/**
 * تهيئة التخزين المؤقت
 */
export function initializeCache(config?: Partial<CacheConfig>): MemoryCache {
  cacheInstance = new MemoryCache(config);
  return cacheInstance;
}

/**
 * الحصول على التخزين المؤقت
 */
export function getCache(): MemoryCache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache();
  }
  return cacheInstance;
}

/**
 * إنشاء مستودع مؤقت
 */
export function createCachedRepository<T>(
  entityName: string,
  cache?: MemoryCache,
): CachedRepository<T> {
  return new CachedRepository<T>(cache || getCache(), entityName);
}
