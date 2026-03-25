/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Rating Value Object - كائن قيمة التقييم
 * 
 * يمثل تقييم من 1 إلى 5 نجوم.
 * يستخدم Result Pattern للمعالجة الآمنة.
 * 
 * @module core/domain/value-objects/Rating
 */

import { Result, ok, err } from '../../types/result';

// ==================== Types ====================

export interface RatingBreakdown {
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
}

export interface RatingProps {
  value: number;
  count: number;
  breakdown?: RatingBreakdown;
}

// ==================== Errors ====================

export class RatingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RatingError';
  }

  static outOfRange(value: number, min: number, max: number): RatingError {
    return new RatingError('OUT_OF_RANGE', 
      `Rating must be between ${min} and ${max}, got ${value}`,
      { value, min, max }
    );
  }

  static negativeCount(count: number): RatingError {
    return new RatingError('NEGATIVE_COUNT', 
      `Rating count cannot be negative: ${count}`,
      { count }
    );
  }

  static invalidValue(value: unknown): RatingError {
    return new RatingError('INVALID_VALUE', 
      `Invalid rating value: ${value}`,
      { value }
    );
  }

  static invalidBreakdown(reason: string): RatingError {
    return new RatingError('INVALID_BREAKDOWN', 
      `Invalid rating breakdown: ${reason}`,
      { reason }
    );
  }
}

// ==================== Rating Class ====================

export class Rating {
  private readonly _value: number;
  private readonly _count: number;
  private readonly _breakdown?: RatingBreakdown;

  static readonly MIN = 1;
  static readonly MAX = 5;

  private constructor(value: number, count: number = 1, breakdown?: RatingBreakdown) {
    this._value = this.round(value);
    this._count = count;
    this._breakdown = breakdown;
  }

  get value(): number {
    return this._value;
  }

  get count(): number {
    return this._count;
  }

  get breakdown(): RatingBreakdown | undefined {
    return this._breakdown;
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء تقييم (آمن)
   */
  static create(value: number, count: number = 1, breakdown?: RatingBreakdown): Result<Rating, RatingError> {
    // التحقق من القيمة
    if (typeof value !== 'number' || isNaN(value) || !Number.isFinite(value)) {
      return err(RatingError.invalidValue(value));
    }

    const roundedValue = Math.round(value * 2) / 2;

    if (roundedValue < Rating.MIN || roundedValue > Rating.MAX) {
      return err(RatingError.outOfRange(value, Rating.MIN, Rating.MAX));
    }

    // التحقق من العدد
    if (typeof count !== 'number' || isNaN(count) || count < 0) {
      return err(RatingError.negativeCount(count));
    }

    // التحقق من التفصيل
    if (breakdown) {
      const breakdownError = Rating.validateBreakdown(breakdown);
      if (breakdownError) {
        return err(breakdownError);
      }
    }

    return ok(new Rating(value, count, breakdown));
  }

  /**
   * إنشاء تقييم (يرمي خطأ)
   * @deprecated استخدم create بدلاً منه
   */
  static from(value: number, count: number = 1, breakdown?: RatingBreakdown): Rating {
    const result = Rating.create(value, count, breakdown);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * التحقق من صحة التفصيل
   */
  private static validateBreakdown(breakdown: RatingBreakdown): RatingError | null {
    const fields: (keyof RatingBreakdown)[] = ['cleanliness', 'communication', 'checkIn', 'accuracy', 'location', 'value'];
    
    for (const field of fields) {
      const val = breakdown[field];
      if (typeof val !== 'number' || isNaN(val)) {
        return RatingError.invalidBreakdown(`Field ${field} is not a valid number`);
      }
      if (val < Rating.MIN || val > Rating.MAX) {
        return RatingError.invalidBreakdown(`Field ${field} is out of range: ${val}`);
      }
    }
    
    return null;
  }

  /**
   * تقريب القيمة إلى نصف نجمة
   */
  private round(value: number): number {
    return Math.round(value * 2) / 2;
  }

  // ==================== Operations ====================

  /**
   * إضافة تقييم جديد وحساب المتوسط
   */
  addRating(newRating: number): Result<Rating, RatingError> {
    // التحقق من التقييم الجديد
    if (typeof newRating !== 'number' || isNaN(newRating)) {
      return err(RatingError.invalidValue(newRating));
    }
    
    if (newRating < Rating.MIN || newRating > Rating.MAX) {
      return err(RatingError.outOfRange(newRating, Rating.MIN, Rating.MAX));
    }

    const totalPoints = (this._value * this._count) + newRating;
    const newCount = this._count + 1;
    const newAverage = totalPoints / newCount;

    // تحديث الـ breakdown إذا وجد
    let newBreakdown: RatingBreakdown | undefined;
    if (this._breakdown) {
      newBreakdown = {
        cleanliness: this.calculateNewAverage(this._breakdown.cleanliness, newRating),
        communication: this.calculateNewAverage(this._breakdown.communication, newRating),
        checkIn: this.calculateNewAverage(this._breakdown.checkIn, newRating),
        accuracy: this.calculateNewAverage(this._breakdown.accuracy, newRating),
        location: this.calculateNewAverage(this._breakdown.location, newRating),
        value: this.calculateNewAverage(this._breakdown.value, newRating),
      };
    }

    return ok(new Rating(newAverage, newCount, newBreakdown || this._breakdown));
  }

  /**
   * حساب المتوسط الجديد
   */
  private calculateNewAverage(current: number, newValue: number): number {
    const total = (current * this._count) + newValue;
    return total / (this._count + 1);
  }

  /**
   * تحديث التفصيل
   */
  withBreakdown(breakdown: RatingBreakdown): Result<Rating, RatingError> {
    const breakdownError = Rating.validateBreakdown(breakdown);
    if (breakdownError) {
      return err(breakdownError);
    }
    return ok(new Rating(this._value, this._count, breakdown));
  }

  // ==================== Display Methods ====================

  /**
   * عدد النجوم الكاملة
   */
  get fullStars(): number {
    return Math.floor(this._value);
  }

  /**
   * هل يوجد نصف نجمة
   */
  get hasHalfStar(): boolean {
    return this._value % 1 !== 0;
  }

  /**
   * عدد النجوم الفارغة
   */
  get emptyStars(): number {
    return Rating.MAX - Math.ceil(this._value);
  }

  /**
   * الحصول على مستوى التقييم كنص
   */
  getLevel(): { ar: string; en: string; color: string } {
    if (this._value >= 4.5) {
      return { ar: 'ممتاز', en: 'Excellent', color: 'green' };
    } else if (this._value >= 4.0) {
      return { ar: 'جيد جداً', en: 'Very Good', color: 'green' };
    } else if (this._value >= 3.5) {
      return { ar: 'جيد', en: 'Good', color: 'yellow' };
    } else if (this._value >= 3.0) {
      return { ar: 'مقبول', en: 'Average', color: 'yellow' };
    } else if (this._value >= 2.0) {
      return { ar: 'ضعيف', en: 'Poor', color: 'orange' };
    } else {
      return { ar: 'سيء جداً', en: 'Terrible', color: 'red' };
    }
  }

  /**
   * تنسيق للعرض
   */
  format(showCount: boolean = true): string {
    const stars = '★'.repeat(this.fullStars) + 
                  (this.hasHalfStar ? '½' : '') +
                  '☆'.repeat(this.emptyStars);
    
    if (showCount && this._count > 0) {
      return `${this._value.toFixed(1)} ${stars} (${this._count})`;
    }
    
    return `${this._value.toFixed(1)} ${stars}`;
  }

  /**
   * تنسيق مختصر
   */
  formatShort(): string {
    return `${this._value.toFixed(1)} ★`;
  }

  /**
   * تنسيق مع النص
   */
  formatWithLevel(): string {
    const level = this.getLevel();
    return `${this._value.toFixed(1)} - ${level.ar}`;
  }

  /**
   * الحصول على مصفوفة النجوم للعرض
   */
  getStarsArray(): Array<'full' | 'half' | 'empty'> {
    const stars: Array<'full' | 'half' | 'empty'> = [];
    
    for (let i = 0; i < this.fullStars; i++) {
      stars.push('full');
    }
    
    if (this.hasHalfStar) {
      stars.push('half');
    }
    
    while (stars.length < Rating.MAX) {
      stars.push('empty');
    }
    
    return stars;
  }

  // ==================== Comparison ====================

  isBetterThan(other: Rating): boolean {
    return this._value > other._value;
  }

  isWorseThan(other: Rating): boolean {
    return this._value < other._value;
  }

  equals(other: Rating): boolean {
    return this._value === other._value && this._count === other._count;
  }

  // ==================== Convenience Factory Methods ====================

  /**
   * إنشاء تقييم من المتوسط والعدد
   */
  static fromAverage(average: number, count: number): Result<Rating, RatingError> {
    return Rating.create(average, count);
  }

  /**
   * إنشاء تقييم جديد (تقييم واحد)
   */
  static fromSingle(value: number): Result<Rating, RatingError> {
    return Rating.create(value, 1);
  }

  /**
   * إنشاء تقييم مع تفصيل
   */
  static withDetails(
    cleanliness: number,
    communication: number,
    checkIn: number,
    accuracy: number,
    location: number,
    value: number
  ): Result<Rating, RatingError> {
    const breakdown: RatingBreakdown = {
      cleanliness,
      communication,
      checkIn,
      accuracy,
      location,
      value,
    };

    const average = (cleanliness + communication + checkIn + accuracy + location + value) / 6;
    
    return Rating.create(average, 1, breakdown);
  }

  /**
   * تقييم فارغ
   */
  static empty(): Rating {
    return new Rating(0, 0);
  }

  /**
   * تقييم ممتاز
   */
  static excellent(): Rating {
    return new Rating(5, 1);
  }

  /**
   * تقييم افتراضي
   */
  static default(): Rating {
    return new Rating(4.0, 1);
  }

  // ==================== Serialization ====================

  toJSON(): RatingProps {
    return {
      value: this._value,
      count: this._count,
      breakdown: this._breakdown,
    };
  }

  toString(): string {
    return this.formatShort();
  }

  valueOf(): number {
    return this._value;
  }
}
