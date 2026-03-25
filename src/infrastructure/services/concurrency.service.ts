/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Concurrency Service Implementation
 * 
 * تنفيذ خدمة التزامن
 * 
 * @module infrastructure/services/concurrency.service
 */

import {
  IConcurrencyService,
  DistributedLock,
  DistributedLockType,
  DistributedLockOptions,
  LockAcquireResult,
  Semaphore,
  SemaphoreOptions,
  RateLimiterConfig,
  RateLimiterStatus,
  CircuitBreakerConfig,
  CircuitBreakerState,
  CircuitBreakerStats,
  QueueOptions,
  QueueTask,
  QueueStats,
} from '@/core/interfaces/services/concurrency.service';
import { Result, ok, err } from '@/core/types/result';

// ==================== In-Memory Implementations ====================

/**
 * قفل موزع في الذاكرة
 */
interface MemoryLock extends DistributedLock {
  holder: string;
  type: DistributedLockType;
}

/**
 * سيمافور في الذاكرة
 */
interface MemorySemaphore extends Semaphore {
  holders: Set<string>;
}

/**
 * Circuit Breaker في الذاكرة
 */
interface MemoryCircuitBreaker {
  config: CircuitBreakerConfig;
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  nextAttempt?: Date;
}

/**
 * قائمة انتظار في الذاكرة
 */
interface MemoryQueue {
  name: string;
  options: QueueOptions;
  tasks: Map<string, QueueTask>;
  taskCounter: number;
}

// ==================== Concurrency Service ====================

/**
 * تنفيذ خدمة التزامن
 */
export class ConcurrencyService implements IConcurrencyService {
  private locks: Map<string, MemoryLock> = new Map();
  private semaphores: Map<string, MemorySemaphore> = new Map();
  private rateLimiters: Map<string, Map<string, { count: number; resetAt: Date; blocked?: Date }>> = new Map();
  private rateLimiterConfigs: Map<string, RateLimiterConfig> = new Map();
  private circuitBreakers: Map<string, MemoryCircuitBreaker> = new Map();
  private queues: Map<string, MemoryQueue> = new Map();
  private leaders: Map<string, { leaderId: string; expiresAt: Date }> = new Map();

  private processedTasks = 0;

  // ==================== Distributed Lock ====================

  async acquireLock(
    key: string,
    holder: string,
    options?: DistributedLockOptions,
  ): Promise<LockAcquireResult> {
    const existing = this.locks.get(key);

    // Check if lock exists and is not expired
    if (existing && existing.expiresAt > new Date()) {
      // Check if same holder
      if (existing.holder === holder) {
        // Extend the lock
        existing.expiresAt = new Date(Date.now() + (options?.ttl ?? 30000));
        return { acquired: true, lock: existing };
      }

      return {
        acquired: false,
        currentHolder: existing.holder,
        waitTime: existing.expiresAt.getTime() - Date.now(),
      };
    }

    // Create new lock
    const lock: MemoryLock = {
      id: `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      key,
      holder,
      type: options?.metadata?.lockType as DistributedLockType ?? 'exclusive',
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + (options?.ttl ?? 30000)),
      metadata: options?.metadata,
    };

    this.locks.set(key, lock);

    return { acquired: true, lock };
  }

  async acquireLockOrWait(
    key: string,
    holder: string,
    options?: DistributedLockOptions,
  ): Promise<Result<DistributedLock, Error>> {
    const timeout = options?.timeout ?? 10000;
    const retryDelay = options?.retryDelay ?? 100;
    const retryCount = options?.retryCount ?? 10;

    for (let i = 0; i < retryCount; i++) {
      const result = await this.acquireLock(key, holder, options);

      if (result.acquired && result.lock) {
        return ok(result.lock);
      }

      if (result.waitTime && result.waitTime > timeout) {
        return err(new Error(`Lock wait time exceeds timeout: ${result.waitTime}ms`));
      }

      await this.delay(retryDelay);
    }

    return err(new Error(`Failed to acquire lock after ${retryCount} attempts`));
  }

  async releaseLock(key: string, holder: string): Promise<boolean> {
    const lock = this.locks.get(key);

    if (!lock) {
      return false;
    }

    if (lock.holder !== holder) {
      return false;
    }

    this.locks.delete(key);
    return true;
  }

  async extendLock(key: string, holder: string, ttl: number): Promise<boolean> {
    const lock = this.locks.get(key);

    if (!lock || lock.holder !== holder) {
      return false;
    }

    lock.expiresAt = new Date(Date.now() + ttl);
    return true;
  }

  async isLocked(key: string): Promise<boolean> {
    const lock = this.locks.get(key);
    if (!lock) return false;

    if (lock.expiresAt <= new Date()) {
      this.locks.delete(key);
      return false;
    }

    return true;
  }

  async getLockHolder(key: string): Promise<string | null> {
    const lock = this.locks.get(key);
    if (!lock || lock.expiresAt <= new Date()) {
      return null;
    }
    return lock.holder;
  }

  async getLockInfo(key: string): Promise<DistributedLock | null> {
    const lock = this.locks.get(key);
    if (!lock || lock.expiresAt <= new Date()) {
      return null;
    }
    return lock;
  }

  async getActiveLocks(filter?: { holder?: string; prefix?: string }): Promise<DistributedLock[]> {
    let locks = Array.from(this.locks.values()).filter((l) => l.expiresAt > new Date());

    if (filter?.holder) {
      locks = locks.filter((l) => l.holder === filter.holder);
    }

    if (filter?.prefix) {
      locks = locks.filter((l) => l.key.startsWith(filter.prefix));
    }

    return locks;
  }

  async cleanupExpiredLocks(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(key);
        count++;
      }
    }

    return count;
  }

  // ==================== Semaphore ====================

  async createSemaphore(key: string, maxCount: number): Promise<void> {
    const semaphore: MemorySemaphore = {
      key,
      maxCount,
      currentCount: 0,
      waiters: 0,
      holders: new Set(),
      createdAt: new Date(),
    };

    this.semaphores.set(key, semaphore);
  }

  async acquireSemaphore(key: string, holder: string, options?: SemaphoreOptions): Promise<Result<boolean, Error>> {
    const semaphore = this.semaphores.get(key);

    if (!semaphore) {
      return err(new Error(`Semaphore ${key} not found`));
    }

    if (semaphore.holders.has(holder)) {
      return ok(true); // Already acquired
    }

    if (semaphore.currentCount < semaphore.maxCount) {
      semaphore.currentCount++;
      semaphore.holders.add(holder);
      return ok(true);
    }

    semaphore.waiters++;

    // Wait for availability
    const timeout = options?.timeout ?? 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (semaphore.currentCount < semaphore.maxCount) {
        semaphore.currentCount++;
        semaphore.holders.add(holder);
        semaphore.waiters--;
        return ok(true);
      }
      await this.delay(50);
    }

    semaphore.waiters--;
    return err(new Error('Semaphore acquire timeout'));
  }

  async releaseSemaphore(key: string, holder: string): Promise<void> {
    const semaphore = this.semaphores.get(key);

    if (!semaphore || !semaphore.holders.has(holder)) {
      return;
    }

    semaphore.holders.delete(holder);
    semaphore.currentCount--;
  }

  async getSemaphoreInfo(key: string): Promise<Semaphore | null> {
    const semaphore = this.semaphores.get(key);
    if (!semaphore) return null;

    return {
      key: semaphore.key,
      maxCount: semaphore.maxCount,
      currentCount: semaphore.currentCount,
      waiters: semaphore.waiters,
      createdAt: semaphore.createdAt,
    };
  }

  async deleteSemaphore(key: string): Promise<void> {
    this.semaphores.delete(key);
  }

  // ==================== Rate Limiting ====================

  async createRateLimiter(config: RateLimiterConfig): Promise<void> {
    this.rateLimiterConfigs.set(config.key, config);
    this.rateLimiters.set(config.key, new Map());
  }

  async checkRateLimit(key: string, identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
  }> {
    const config = this.rateLimiterConfigs.get(key);
    if (!config) {
      return { allowed: true, remaining: Infinity, resetAt: new Date(Date.now() + 60000) };
    }

    const limiter = this.rateLimiters.get(key) ?? new Map();
    const now = new Date();
    const windowStart = new Date(Math.floor(now.getTime() / config.windowMs) * config.windowMs);
    const resetAt = new Date(windowStart.getTime() + config.windowMs);

    let entry = limiter.get(identifier);

    // Reset if window has passed
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt };
      limiter.set(identifier, entry);
    }

    // Check if blocked
    if (entry.blocked && entry.blocked > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: entry.blocked.getTime() - now.getTime(),
      };
    }

    const remaining = config.maxRequests - entry.count;

    if (entry.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt };
    }

    entry.count++;

    return { allowed: true, remaining: remaining - 1, resetAt };
  }

  async getRateLimiterStatus(key: string, identifier: string): Promise<RateLimiterStatus> {
    const config = this.rateLimiterConfigs.get(key);
    const limiter = this.rateLimiters.get(key);
    const entry = limiter?.get(identifier);

    return {
      key,
      totalHits: entry?.count ?? 0,
      remainingHits: config ? config.maxRequests - (entry?.count ?? 0) : 0,
      resetAt: entry?.resetAt ?? new Date(),
      isBlocked: entry?.blocked ? entry.blocked > new Date() : false,
      blockedUntil: entry?.blocked,
    };
  }

  async resetRateLimiter(key: string, identifier?: string): Promise<void> {
    if (identifier) {
      this.rateLimiters.get(key)?.delete(identifier);
    } else {
      this.rateLimiters.set(key, new Map());
    }
  }

  async deleteRateLimiter(key: string): Promise<void> {
    this.rateLimiterConfigs.delete(key);
    this.rateLimiters.delete(key);
  }

  // ==================== Circuit Breaker ====================

  async createCircuitBreaker(name: string, config: CircuitBreakerConfig): Promise<void> {
    this.circuitBreakers.set(name, {
      config,
      state: 'closed',
      failures: 0,
      successes: 0,
    });
  }

  async executeWithCircuitBreaker<T>(name: string, fn: () => Promise<T>): Promise<Result<T, Error>> {
    const cb = this.circuitBreakers.get(name);
    if (!cb) {
      return err(new Error(`Circuit breaker ${name} not found`));
    }

    // Check state
    if (cb.state === 'open') {
      if (cb.nextAttempt && cb.nextAttempt <= new Date()) {
        cb.state = 'half_open';
      } else {
        return err(new Error('Circuit breaker is open'));
      }
    }

    try {
      const result = await fn();
      await this.recordSuccess(name);
      return ok(result);
    } catch (error) {
      await this.recordFailure(name);
      return err(error instanceof Error ? error : new Error('Circuit breaker execution failed'));
    }
  }

  async getCircuitBreakerState(name: string): Promise<CircuitBreakerState> {
    return this.circuitBreakers.get(name)?.state ?? 'closed';
  }

  async getCircuitBreakerStats(name: string): Promise<CircuitBreakerStats> {
    const cb = this.circuitBreakers.get(name);
    if (!cb) {
      return {
        state: 'closed',
        failures: 0,
        successes: 0,
      };
    }

    return {
      state: cb.state,
      failures: cb.failures,
      successes: cb.successes,
      lastFailure: cb.lastFailure,
      lastSuccess: cb.lastSuccess,
      nextAttempt: cb.nextAttempt,
    };
  }

  async resetCircuitBreaker(name: string): Promise<void> {
    const cb = this.circuitBreakers.get(name);
    if (cb) {
      cb.state = 'closed';
      cb.failures = 0;
      cb.successes = 0;
      cb.nextAttempt = undefined;
    }
  }

  async deleteCircuitBreaker(name: string): Promise<void> {
    this.circuitBreakers.delete(name);
  }

  private async recordSuccess(name: string): Promise<void> {
    const cb = this.circuitBreakers.get(name);
    if (!cb) return;

    cb.successes++;
    cb.lastSuccess = new Date();

    if (cb.state === 'half_open' && cb.successes >= cb.config.successThreshold) {
      cb.state = 'closed';
      cb.failures = 0;
      cb.successes = 0;
      cb.nextAttempt = undefined;
    }
  }

  private async recordFailure(name: string): Promise<void> {
    const cb = this.circuitBreakers.get(name);
    if (!cb) return;

    cb.failures++;
    cb.lastFailure = new Date();

    if (cb.failures >= cb.config.failureThreshold) {
      cb.state = 'open';
      cb.nextAttempt = new Date(Date.now() + cb.config.resetTimeout);
      cb.config.onStateChange?.('closed', 'open');
    }
  }

  // ==================== Job Queue ====================

  async createQueue(name: string, options?: QueueOptions): Promise<void> {
    this.queues.set(name, {
      name,
      options: options ?? {},
      tasks: new Map(),
      taskCounter: 0,
    });
  }

  async enqueue<T>(queueName: string, data: T, options?: { priority?: number; delay?: number }): Promise<string> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      await this.createQueue(queueName);
    }

    const q = queue ?? this.queues.get(queueName)!;
    q.taskCounter++;

    const taskId = `task_${Date.now()}_${q.taskCounter}`;
    const task: QueueTask<T> = {
      id: taskId,
      queueName,
      data,
      priority: options?.priority ?? 0,
      attempts: 0,
      maxAttempts: q.options.retryCount ?? 3,
      status: 'pending',
      createdAt: new Date(),
    };

    q.tasks.set(taskId, task);
    return taskId;
  }

  async enqueueBatch<T>(queueName: string, items: T[]): Promise<string[]> {
    const taskIds: string[] = [];
    for (const item of items) {
      const taskId = await this.enqueue(queueName, item);
      taskIds.push(taskId);
    }
    return taskIds;
  }

  async dequeue<T>(queueName: string): Promise<QueueTask<T> | null> {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    // Get pending tasks sorted by priority
    const pending = Array.from(queue.tasks.values())
      .filter((t) => t.status === 'pending')
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    if (pending.length === 0) return null;

    const task = pending[0] as QueueTask<T>;
    task.status = 'running';
    task.startedAt = new Date();
    task.attempts++;

    return task;
  }

  async completeTask(queueName: string, taskId: string, result?: unknown): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    const task = queue.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.completedAt = new Date();
    task.result = result;
    this.processedTasks++;
  }

  async failTask(queueName: string, taskId: string, error: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    const task = queue.tasks.get(taskId);
    if (!task) return;

    if (task.attempts >= task.maxAttempts) {
      task.status = 'failed';
      task.failedAt = new Date();
      task.error = error;
    } else {
      task.status = 'pending'; // Retry
    }
  }

  async retryTask(queueName: string, taskId: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    const task = queue.tasks.get(taskId);
    if (!task || task.status !== 'failed') return;

    task.status = 'pending';
    task.attempts = 0;
    task.error = undefined;
    task.failedAt = undefined;
  }

  async getQueueStats(queueName: string): Promise<QueueStats> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      return {
        total: 0,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
      };
    }

    const tasks = Array.from(queue.tasks.values());

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      running: tasks.filter((t) => t.status === 'running').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    };
  }

  async getQueueTasks(
    queueName: string,
    status?: QueueTask['status'],
    options?: { limit?: number; offset?: number },
  ): Promise<QueueTask[]> {
    const queue = this.queues.get(queueName);
    if (!queue) return [];

    let tasks = Array.from(queue.tasks.values());

    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    return tasks.slice(offset, offset + limit);
  }

  async deleteTask(queueName: string, taskId: string): Promise<void> {
    this.queues.get(queueName)?.tasks.delete(taskId);
  }

  async deleteQueue(queueName: string): Promise<void> {
    this.queues.delete(queueName);
  }

  // ==================== Leader Election ====================

  async runForLeadership(electionKey: string, candidateId: string, ttl: number): Promise<boolean> {
    const existing = this.leaders.get(electionKey);

    // Check if there's an active leader
    if (existing && existing.expiresAt > new Date()) {
      if (existing.leaderId === candidateId) {
        // Extend leadership
        existing.expiresAt = new Date(Date.now() + ttl);
        return true;
      }
      return false;
    }

    // Become leader
    this.leaders.set(electionKey, {
      leaderId: candidateId,
      expiresAt: new Date(Date.now() + ttl),
    });

    return true;
  }

  async isLeader(electionKey: string, candidateId: string): Promise<boolean> {
    const leader = this.leaders.get(electionKey);
    if (!leader || leader.expiresAt <= new Date()) {
      return false;
    }
    return leader.leaderId === candidateId;
  }

  async getLeader(electionKey: string): Promise<string | null> {
    const leader = this.leaders.get(electionKey);
    if (!leader || leader.expiresAt <= new Date()) {
      return null;
    }
    return leader.leaderId;
  }

  async resignLeadership(electionKey: string, candidateId: string): Promise<void> {
    const leader = this.leaders.get(electionKey);
    if (leader?.leaderId === candidateId) {
      this.leaders.delete(electionKey);
    }
  }

  // ==================== Stats ====================

  async getStats(): Promise<{
    activeLocks: number;
    activeSemaphores: number;
    activeQueues: number;
    rateLimiters: number;
    circuitBreakers: number;
    totalQueuedTasks: number;
    processedTasks: number;
  }> {
    let totalQueuedTasks = 0;

    for (const queue of this.queues.values()) {
      totalQueuedTasks += queue.tasks.size;
    }

    return {
      activeLocks: this.locks.size,
      activeSemaphores: this.semaphores.size,
      activeQueues: this.queues.size,
      rateLimiters: this.rateLimiterConfigs.size,
      circuitBreakers: this.circuitBreakers.size,
      totalQueuedTasks,
      processedTasks: this.processedTasks,
    };
  }

  // ==================== Private Methods ====================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== Singleton ====================

export const concurrencyService = new ConcurrencyService();
