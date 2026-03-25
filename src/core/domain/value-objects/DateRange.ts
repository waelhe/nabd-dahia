/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DateRange Value Object - كائن قيمة نطاق التاريخ
 * 
 * يمثل فترة زمنية بين تاريخين.
 * يستخدم Result Pattern للمعالجة الآمنة.
 * 
 * @module core/domain/value-objects/DateRange
 */

import { Result, ok, err } from '../../types/result';

// ==================== Types ====================

export interface DateRangeProps {
  start: Date | string;
  end: Date | string;
}

// ==================== Errors ====================

export class DateRangeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DateRangeError';
  }

  static invalidStart(start: unknown): DateRangeError {
    return new DateRangeError('INVALID_START', 
      `Invalid start date: ${start}`,
      { start }
    );
  }

  static invalidEnd(end: unknown): DateRangeError {
    return new DateRangeError('INVALID_END', 
      `Invalid end date: ${end}`,
      { end }
    );
  }

  static startAfterEnd(start: Date, end: Date): DateRangeError {
    return new DateRangeError('START_AFTER_END', 
      `Start date (${start.toISOString()}) must be before end date (${end.toISOString()})`,
      { start, end }
    );
  }

  static sameDates(date: Date): DateRangeError {
    return new DateRangeError('SAME_DATES', 
      `Start and end dates cannot be the same: ${date.toISOString()}`,
      { date }
    );
  }

  static cannotMerge(): DateRangeError {
    return new DateRangeError('CANNOT_MERGE', 
      'Cannot merge non-overlapping and non-adjacent date ranges'
    );
  }

  static invalidDuration(reason: string): DateRangeError {
    return new DateRangeError('INVALID_DURATION', 
      `Invalid duration: ${reason}`,
      { reason }
    );
  }
}

// ==================== DateRange Class ====================

export class DateRange {
  private readonly _start: Date;
  private readonly _end: Date;

  private constructor(start: Date, end: Date) {
    this._start = new Date(start);
    this._end = new Date(end);
  }

  get start(): Date {
    return new Date(this._start);
  }

  get end(): Date {
    return new Date(this._end);
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء نطاق تاريخ (آمن)
   */
  static create(start: Date | string, end: Date | string): Result<DateRange, DateRangeError> {
    // تحويل وتحقق من تاريخ البداية
    let startDate: Date;
    if (start instanceof Date) {
      if (isNaN(start.getTime())) {
        return err(DateRangeError.invalidStart(start));
      }
      startDate = start;
    } else if (typeof start === 'string') {
      startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return err(DateRangeError.invalidStart(start));
      }
    } else {
      return err(DateRangeError.invalidStart(start));
    }

    // تحويل وتحقق من تاريخ النهاية
    let endDate: Date;
    if (end instanceof Date) {
      if (isNaN(end.getTime())) {
        return err(DateRangeError.invalidEnd(end));
      }
      endDate = end;
    } else if (typeof end === 'string') {
      endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        return err(DateRangeError.invalidEnd(end));
      }
    } else {
      return err(DateRangeError.invalidEnd(end));
    }

    // التحقق من أن البداية قبل النهاية
    if (startDate.getTime() === endDate.getTime()) {
      return err(DateRangeError.sameDates(startDate));
    }

    if (startDate > endDate) {
      return err(DateRangeError.startAfterEnd(startDate, endDate));
    }

    return ok(new DateRange(startDate, endDate));
  }

  /**
   * إنشاء نطاق تاريخ (يرمي خطأ)
   * @deprecated استخدم create بدلاً منه
   */
  static from(start: Date, end: Date): DateRange {
    const result = DateRange.create(start, end);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء من كائن
   */
  static fromProps(props: DateRangeProps): Result<DateRange, DateRangeError> {
    return DateRange.create(props.start, props.end);
  }

  /**
   * إنشاء من سلاسل نصية
   */
  static fromStrings(start: string, end: string): Result<DateRange, DateRangeError> {
    return DateRange.create(start, end);
  }

  /**
   * إنشاء نطاق بعدد أيام
   */
  static fromDays(startDate: Date | string, days: number): Result<DateRange, DateRangeError> {
    if (typeof days !== 'number' || isNaN(days) || days <= 0) {
      return err(DateRangeError.invalidDuration('Days must be a positive number'));
    }

    const startResult = DateRange.parseDate(startDate);
    if (startResult.isFailure) {
      return err(startResult.error);
    }

    const end = new Date(startResult.value);
    end.setDate(end.getDate() + days);

    return DateRange.create(startResult.value, end);
  }

  /**
   * تحليل تاريخ
   */
  private static parseDate(date: Date | string): Result<Date, DateRangeError> {
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        return err(DateRangeError.invalidStart(date));
      }
      return ok(date);
    }
    
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return err(DateRangeError.invalidStart(date));
    }
    
    return ok(parsed);
  }

  // ==================== Convenience Factory Methods ====================

  /**
   * إنشاء نطاق لأسبوع
   */
  static week(startFrom: Date = new Date()): Result<DateRange, DateRangeError> {
    const start = new Date(startFrom);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return DateRange.create(start, end);
  }

  /**
   * إنشاء نطاق لشهر
   */
  static month(startFrom: Date = new Date()): Result<DateRange, DateRangeError> {
    const start = new Date(startFrom);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return DateRange.create(start, end);
  }

  /**
   * نطاق اليوم
   */
  static today(): DateRange {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return new DateRange(start, end);
  }

  /**
   * نطاق الغد
   */
  static tomorrow(): DateRange {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    
    return new DateRange(start, end);
  }

  /**
   * نطاق هذا الأسبوع
   */
  static thisWeek(): DateRange {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return new DateRange(start, end);
  }

  /**
   * نطاق هذا الشهر
   */
  static thisMonth(): DateRange {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return new DateRange(start, end);
  }

  // ==================== Duration ====================

  /**
   * عدد الأيام
   */
  get days(): number {
    const diff = this._end.getTime() - this._start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * عدد الليالي (للإقامات)
   */
  get nights(): number {
    return this.days;
  }

  /**
   * عدد الساعات
   */
  get hours(): number {
    const diff = this._end.getTime() - this._start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60));
  }

  /**
   * عدد الدقائق
   */
  get minutes(): number {
    const diff = this._end.getTime() - this._start.getTime();
    return Math.ceil(diff / (1000 * 60));
  }

  /**
   * عدد الأسابيع
   */
  get weeks(): number {
    return Math.floor(this.days / 7);
  }

  /**
   * الأيام المتبقية
   */
  get remainingDays(): number {
    const now = new Date();
    if (now >= this._end) return 0;
    if (now < this._start) return this.days;
    
    const diff = this._end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ==================== Checks ====================

  /**
   * هل التاريخ ضمن النطاق
   */
  contains(date: Date): boolean {
    return date >= this._start && date <= this._end;
  }

  /**
   * هل يتعارض مع نطاق آخر
   */
  overlaps(other: DateRange): boolean {
    return this._start < other._end && this._end > other._start;
  }

  /**
   * هل النطاق متجاور مع نطاق آخر
   */
  isAdjacentTo(other: DateRange): boolean {
    return this._end.getTime() === other._start.getTime() ||
           this._start.getTime() === other._end.getTime();
  }

  /**
   * هل يمكن دمجه مع نطاق آخر
   */
  canMergeWith(other: DateRange): boolean {
    return this.overlaps(other) || this.isAdjacentTo(other);
  }

  /**
   * هل النطاق في الماضي
   */
  isPast(): boolean {
    return this._end < new Date();
  }

  /**
   * هل النطاق في المستقبل
   */
  isFuture(): boolean {
    return this._start > new Date();
  }

  /**
   * هل النطاق جارٍ حالياً
   */
  isOngoing(): boolean {
    const now = new Date();
    return this._start <= now && this._end >= now;
  }

  /**
   * هل النطاق يبدأ اليوم
   */
  startsToday(): boolean {
    const today = new Date();
    return this.isSameDay(this._start, today);
  }

  /**
   * هل النطاق ينتهي اليوم
   */
  endsToday(): boolean {
    const today = new Date();
    return this.isSameDay(this._end, today);
  }

  /**
   * هل النطاق خلال عطلة نهاية الأسبوع
   */
  isWeekend(): boolean {
    const startDay = this._start.getDay();
    const endDay = this._end.getDay();
    return startDay === 5 || startDay === 6 || endDay === 5 || endDay === 6;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // ==================== Operations ====================

  /**
   * دمج نطاقين متجاورين أو متداخلين
   */
  merge(other: DateRange): Result<DateRange, DateRangeError> {
    if (!this.canMergeWith(other)) {
      return err(DateRangeError.cannotMerge());
    }

    const start = this._start < other._start ? this._start : other._start;
    const end = this._end > other._end ? this._end : other._end;

    return ok(new DateRange(start, end));
  }

  /**
   * تقاطع نطاقين
   */
  intersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) return null;

    const start = this._start > other._start ? this._start : other._start;
    const end = this._end < other._end ? this._end : other._end;

    return new DateRange(start, end);
  }

  /**
   * توسيع النطاق
   */
  extend(days: number): Result<DateRange, DateRangeError> {
    if (typeof days !== 'number' || isNaN(days)) {
      return err(DateRangeError.invalidDuration('Days must be a valid number'));
    }

    const newEnd = new Date(this._end);
    newEnd.setDate(newEnd.getDate() + days);
    
    return DateRange.create(this._start, newEnd);
  }

  /**
   * تقليص النطاق من النهاية
   */
  shrink(days: number): Result<DateRange, DateRangeError> {
    if (typeof days !== 'number' || isNaN(days) || days < 0) {
      return err(DateRangeError.invalidDuration('Days must be a non-negative number'));
    }

    const newEnd = new Date(this._end);
    newEnd.setDate(newEnd.getDate() - days);

    if (newEnd <= this._start) {
      return err(DateRangeError.startAfterEnd(this._start, newEnd));
    }

    return ok(new DateRange(this._start, newEnd));
  }

  /**
   * نقل النطاق
   */
  shift(days: number): DateRange {
    const newStart = new Date(this._start);
    const newEnd = new Date(this._end);
    
    newStart.setDate(newStart.getDate() + days);
    newEnd.setDate(newEnd.getDate() + days);
    
    return new DateRange(newStart, newEnd);
  }

  // ==================== Formatting ====================

  /**
   * تنسيق للعرض
   */
  format(locale: string = 'ar', includeYear: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: includeYear ? 'numeric' : undefined,
    };

    const formatter = new Intl.DateTimeFormat(locale, options);
    
    const startStr = formatter.format(this._start);
    const endStr = formatter.format(this._end);

    if (locale === 'ar') {
      return `من ${startStr} إلى ${endStr}`;
    }

    return `${startStr} - ${endStr}`;
  }

  /**
   * تنسيق مختصر
   */
  formatShort(locale: string = 'ar'): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
    };

    const formatter = new Intl.DateTimeFormat(locale, options);
    
    return `${formatter.format(this._start)} - ${formatter.format(this._end)}`;
  }

  /**
   * تنسيق للـ API
   */
  formatISO(): { start: string; end: string } {
    return {
      start: this._start.toISOString(),
      end: this._end.toISOString(),
    };
  }

  /**
   * تنسيق للاستعلام
   */
  formatQuery(): { start: string; end: string } {
    const toDateOnly = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    return {
      start: toDateOnly(this._start),
      end: toDateOnly(this._end),
    };
  }

  // ==================== Serialization ====================

  toJSON(): { start: string; end: string } {
    return {
      start: this._start.toISOString(),
      end: this._end.toISOString(),
    };
  }

  toString(): string {
    return `${this._start.toISOString()}/${this._end.toISOString()}`;
  }

  equals(other: DateRange): boolean {
    return this._start.getTime() === other._start.getTime() &&
           this._end.getTime() === other._end.getTime();
  }
}
