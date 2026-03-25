/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Escrow Repository Interface
 * 
 * واجهة مستودع الضمان
 * 
 * @module core/interfaces/repositories/escrow.repository
 */

import { IRepository, FindOptions, PaginatedResult, OperationResult, WriteOptions } from './base.repository';
import { Escrow, EscrowStatus } from '../../domain/entities/Escrow';
import { UniqueEntityId } from '../../domain/value-objects/UniqueEntityId';

// ==================== Types ====================

export interface EscrowFilter {
  bookingId?: string;
  status?: EscrowStatus | EscrowStatus[];
  heldFrom?: Date;
  heldTo?: Date;
  releasedFrom?: Date;
  releasedTo?: Date;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
}

export interface EscrowCreateData {
  bookingId: string;
  amount: number;
  currency: string;
  heldAt?: Date;
}

export interface EscrowUpdateData {
  status?: EscrowStatus;
  releasedAt?: Date;
  refundedAt?: Date;
  releasedTo?: 'host' | 'guest';
  notes?: string;
}

export interface DisputeData {
  reason: string;
  description?: string;
  evidence?: string[];
  openedBy: 'host' | 'guest';
}

export interface EscrowStats {
  total: number;
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  totalDisputed: number;
  averageHeldDuration: number; // بالساعات
  byStatus: Record<EscrowStatus, number>;
  byCurrency: Record<string, { count: number; amount: number }>;
}

export interface EscrowTimelineEntry {
  action: 'created' | 'held' | 'released' | 'refunded' | 'disputed' | 'resolved';
  timestamp: Date;
  actor?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// ==================== Interface ====================

export interface IEscrowRepository extends IRepository<Escrow, UniqueEntityId> {
  // ==================== Query Methods ====================

  /**
   * البحث بالحجز
   */
  findByBookingId(bookingId: string): Promise<Escrow | null>;

  /**
   * البحث بالحالة
   */
  findByStatus(
    status: EscrowStatus,
    options?: FindOptions
  ): Promise<PaginatedResult<Escrow>>;

  /**
   * البحث عن الضمانات المحتجزة
   */
  findHeld(options?: FindOptions): Promise<PaginatedResult<Escrow>>;

  /**
   * البحث عن الضمانات المتنازع عليها
   */
  findDisputed(options?: FindOptions): Promise<PaginatedResult<Escrow>>;

  /**
   * البحث عن ضمانات جاهزة للإفراج التلقائي
   */
  findReadyForAutoRelease(hoursAfterHeld: number): Promise<Escrow[]>;

  /**
   * البحث المتقدم
   */
  search(filter: EscrowFilter, options?: FindOptions): Promise<PaginatedResult<Escrow>>;

  // ==================== Status Operations ====================

  /**
   * إفراج للمضيف
   */
  releaseToHost(
    escrowId: string,
    releasedBy?: string,
    notes?: string
  ): Promise<OperationResult>;

  /**
   * إفراج للضيف (استرداد)
   */
  releaseToGuest(
    escrowId: string,
    releasedBy?: string,
    notes?: string
  ): Promise<OperationResult>;

  /**
   * إفراج مقسم
   */
  releaseSplit(
    escrowId: string,
    hostAmount: number,
    guestAmount: number,
    releasedBy?: string,
    notes?: string
  ): Promise<OperationResult>;

  // ==================== Dispute Operations ====================

  /**
   * فتح نزاع
   */
  openDispute(
    escrowId: string,
    data: DisputeData
  ): Promise<OperationResult>;

  /**
   * حل النزاع
   */
  resolveDispute(
    escrowId: string,
    resolution: {
      hostAmount: number;
      guestAmount: number;
      resolvedBy: string;
      notes?: string;
    }
  ): Promise<OperationResult>;

  /**
   * إضافة دليل للنزاع
   */
  addDisputeEvidence(
    escrowId: string,
    evidence: string[]
  ): Promise<OperationResult>;

  /**
   * تحديث النزاع
   */
  updateDispute(
    escrowId: string,
    data: Partial<{
      reason: string;
      description: string;
      status: string;
    }>
  ): Promise<OperationResult>;

  // ==================== Timeline ====================

  /**
   * الحصول على الجدول الزمني
   */
  getTimeline(escrowId: string): Promise<EscrowTimelineEntry[]>;

  /**
   * إضافة حدث للجدول الزمني
   */
  addTimelineEntry(
    escrowId: string,
    entry: Omit<EscrowTimelineEntry, 'timestamp'>
  ): Promise<OperationResult>;

  // ==================== Statistics ====================

  /**
   * إحصائيات عامة
   */
  getStats(from?: Date, to?: Date): Promise<EscrowStats>;

  /**
   * إجمالي المبالغ المحتجزة
   */
  getTotalHeld(currency?: string): Promise<number>;

  /**
   * إجمالي المبالغ المفرج عنها
   */
  getTotalReleased(currency?: string, from?: Date, to?: Date): Promise<number>;

  // ==================== Bulk Operations ====================

  /**
   * إفراج تلقائي للضمانات المستحقة
   */
  autoReleaseReady(): Promise<{
    released: number;
    failed: number;
    total: number;
  }>;

  // ==================== Validation ====================

  /**
   * التحقق من وجود ضمان للحجز
   */
  existsForBooking(bookingId: string): Promise<boolean>;

  /**
   * التحقق من إمكانية الإفراج
   */
  canRelease(escrowId: string): Promise<{
    canRelease: boolean;
    reason?: string;
  }>;
}
