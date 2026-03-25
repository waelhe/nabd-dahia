/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Specifications Pattern - نمط المواصفات
 * 
 * نمط للاستعلامات المعقدة القابلة للإعادة والدمج
 * 
 * @module core/domain/specifications
 */

// ==================== Base Specification ====================

/**
 * واجهة المواصفة الأساسية
 */
export interface ISpecification<T> {
  /**
   * التحقق من استيفاء الكيان للمواصفة
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * تحويل المواصفة إلى استعلام Prisma
   */
  toPrismaWhere(): Record<string, unknown>;

  /**
   * دمج مواصفة أخرى بـ AND
   */
  and(other: ISpecification<T>): ISpecification<T>;

  /**
   * دمج مواصفة أخرى بـ OR
   */
  or(other: ISpecification<T>): ISpecification<T>;

  /**
   * عكس المواصفة (NOT)
   */
  not(): ISpecification<T>;
}

/**
 * المواصفة الأساسية
 */
export abstract class Specification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(entity: T): boolean;
  abstract toPrismaWhere(): Record<string, unknown>;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification<T>(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification<T>(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification<T>(this);
  }
}

// ==================== Composite Specifications ====================

/**
 * مواصفة AND
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity);
  }

  toPrismaWhere(): Record<string, unknown> {
    const leftWhere = this.left.toPrismaWhere();
    const rightWhere = this.right.toPrismaWhere();
    return { ...leftWhere, ...rightWhere };
  }
}

/**
 * مواصفة OR
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }

  toPrismaWhere(): Record<string, unknown> {
    return {
      OR: [this.left.toPrismaWhere(), this.right.toPrismaWhere()],
    };
  }
}

/**
 * مواصفة NOT
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: ISpecification<T>) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.spec.isSatisfiedBy(entity);
  }

  toPrismaWhere(): Record<string, unknown> {
    return {
      NOT: this.spec.toPrismaWhere(),
    };
  }
}

// ==================== Common Specifications ====================

/**
 * مواصفة القيمة المتساوية
 */
export class EqualsSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly value: T[K]
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return entity[this.field] === this.value;
  }

  toPrismaWhere(): Record<string, unknown> {
    return { [this.field as string]: this.value };
  }
}

/**
 * مواصفة القيمة في قائمة
 */
export class InSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly values: T[K][]
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.values.includes(entity[this.field]);
  }

  toPrismaWhere(): Record<string, unknown> {
    return { [this.field as string]: { in: this.values } };
  }
}

/**
 * مواصفة النطاق العددي
 */
export class RangeSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly min?: T[K] extends number ? number : never,
    private readonly max?: T[K] extends number ? number : never
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    const value = entity[this.field] as unknown as number;
    if (this.min !== undefined && value < this.min) return false;
    if (this.max !== undefined && value > this.max) return false;
    return true;
  }

  toPrismaWhere(): Record<string, unknown> {
    const range: Record<string, unknown> = {};
    if (this.min !== undefined) range.gte = this.min;
    if (this.max !== undefined) range.lte = this.max;
    return { [this.field as string]: range };
  }
}

/**
 * مواصفة نطاق التاريخ
 */
export class DateRangeSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly from?: Date,
    private readonly to?: Date
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    const value = entity[this.field] as unknown as Date;
    if (this.from && value < this.from) return false;
    if (this.to && value > this.to) return false;
    return true;
  }

  toPrismaWhere(): Record<string, unknown> {
    const range: Record<string, unknown> = {};
    if (this.from) range.gte = this.from;
    if (this.to) range.lte = this.to;
    return { [this.field as string]: range };
  }
}

/**
 * مواصفة النص المطابق
 */
export class TextMatchSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly query: string,
    private readonly mode: 'contains' | 'startsWith' | 'endsWith' = 'contains',
    private readonly caseSensitive: boolean = false
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    const value = String(entity[this.field] ?? '').toLowerCase();
    const query = this.query.toLowerCase();
    
    switch (this.mode) {
      case 'contains':
        return value.includes(query);
      case 'startsWith':
        return value.startsWith(query);
      case 'endsWith':
        return value.endsWith(query);
    }
  }

  toPrismaWhere(): Record<string, unknown> {
    return {
      [this.field as string]: {
        [this.mode]: this.query,
        mode: this.caseSensitive ? undefined : 'insensitive',
      },
    };
  }
}

/**
 * مواصفة القيمة الفارغة
 */
export class NullSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly isNull: boolean = true
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    const value = entity[this.field];
    return this.isNull ? value === null || value === undefined : value !== null && value !== undefined;
  }

  toPrismaWhere(): Record<string, unknown> {
    return { [this.field as string]: this.isNull ? null : { not: null } };
  }
}

/**
 * مواصفة القيمة المنطقية
 */
export class BooleanSpecification<T, K extends keyof T> extends Specification<T> {
  constructor(
    private readonly field: K,
    private readonly value: boolean
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return Boolean(entity[this.field]) === this.value;
  }

  toPrismaWhere(): Record<string, unknown> {
    return { [this.field as string]: this.value };
  }
}

// ==================== User Specifications ====================

/**
 * مواصفات المستخدم
 */
export class UserSpecifications {
  /**
   * المستخدم نشط
   */
  static isActive<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'active' as T['status']);
  }

  /**
   * المستخدم مضيف
   */
  static isHost<T extends { role: string }>(): Specification<T> {
    return new InSpecification<T, 'role'>('role', ['host', 'company'] as T['role'][]);
  }

  /**
   * المستخدم موثق
   */
  static isVerified<T extends { emailVerifiedAt: Date | null; phoneVerifiedAt: Date | null }>(): Specification<T> {
    return new OrSpecification<T>(
      new NullSpecification<T, 'emailVerifiedAt'>('emailVerifiedAt', false),
      new NullSpecification<T, 'phoneVerifiedAt'>('phoneVerifiedAt', false)
    );
  }

  /**
   * المستخدم Superhost
   */
  static isSuperhost<T extends { isSuperhost: boolean }>(): Specification<T> {
    return new BooleanSpecification<T, 'isSuperhost'>('isSuperhost', true);
  }

  /**
   * المستخدم مسجل حديثاً
   */
  static recentlyRegistered<T extends { createdAt: Date }>(days: number = 30): Specification<T> {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return new DateRangeSpecification<T, 'createdAt'>('createdAt', from);
  }
}

// ==================== Booking Specifications ====================

/**
 * مواصفات الحجز
 */
export class BookingSpecifications {
  /**
   * الحجز مؤكد
   */
  static isConfirmed<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'confirmed' as T['status']);
  }

  /**
   * الحجز معلق
   */
  static isPending<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'pending' as T['status']);
  }

  /**
   * الحجز ملغي
   */
  static isCancelled<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'cancelled' as T['status']);
  }

  /**
   * الحجز مكتمل
   */
  static isCompleted<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'completed' as T['status']);
  }

  /**
   * الحجز نشط (مؤكد أو قيد التنفيذ)
   */
  static isActive<T extends { status: string }>(): Specification<T> {
    return new InSpecification<T, 'status'>('status', ['confirmed', 'pending', 'in_progress'] as T['status'][]);
  }

  /**
   * حجز في نطاق تاريخ
   */
  static inDateRange<T extends { checkIn: Date; checkOut: Date }>(
    from: Date,
    to: Date
  ): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.checkIn < to && entity.checkOut > from;
      }
      toPrismaWhere(): Record<string, unknown> {
        return {
          OR: [
            { checkIn: { lt: to }, checkOut: { gt: from } },
          ],
        };
      }
    })();
  }

  /**
   * حجز الضيف
   */
  static forGuest<T extends { guestId: string }>(guestId: string): Specification<T> {
    return new EqualsSpecification<T, 'guestId'>('guestId', guestId as T['guestId']);
  }

  /**
   * حجز المضيف
   */
  static forHost<T extends { hostId: string }>(hostId: string): Specification<T> {
    return new EqualsSpecification<T, 'hostId'>('hostId', hostId as T['hostId']);
  }

  /**
   * حجز لم يتم الدفع
   */
  static unpaid<T extends { paymentStatus: string }>(): Specification<T> {
    return new InSpecification<T, 'paymentStatus'>('paymentStatus', ['pending', 'failed'] as T['paymentStatus'][]);
  }

  /**
   * حجز للإعلان
   */
  static forListing<T extends { listingId: string }>(listingId: string): Specification<T> {
    return new EqualsSpecification<T, 'listingId'>('listingId', listingId as T['listingId']);
  }

  /**
   * حجز قادم
   */
  static upcoming<T extends { checkIn: Date; status: string }>(): Specification<T> {
    return BookingSpecifications.isConfirmed<T>().and(
      new (class extends Specification<T> {
        isSatisfiedBy(entity: T): boolean {
          return entity.checkIn > new Date();
        }
        toPrismaWhere(): Record<string, unknown> {
          return { checkIn: { gt: new Date() } };
        }
      })()
    );
  }

  /**
   * حجز حالي (قيد الإقامة)
   */
  static current<T extends { checkIn: Date; checkOut: Date; status: string }>(): Specification<T> {
    const now = new Date();
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.checkIn <= now && entity.checkOut >= now;
      }
      toPrismaWhere(): Record<string, unknown> {
        return {
          checkIn: { lte: now },
          checkOut: { gte: now },
          status: { in: ['confirmed', 'in_progress'] },
        };
      }
    })();
  }
}

// ==================== Listing Specifications ====================

/**
 * مواصفات الإعلان
 */
export class ListingSpecifications {
  /**
   * الإعلان نشط
   */
  static isActive<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'active' as T['status']);
  }

  /**
   * الإعلان مميز
   */
  static isFeatured<T extends { featured: boolean; featuredUntil: Date | null }>(): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.featured && (entity.featuredUntil ? entity.featuredUntil > new Date() : true);
      }
      toPrismaWhere(): Record<string, unknown> {
        return {
          featured: true,
          OR: [
            { featuredUntil: null },
            { featuredUntil: { gt: new Date() } },
          ],
        };
      }
    })();
  }

  /**
   * الإعلان في مدينة
   */
  static inCity<T extends { city: string }>(city: string): Specification<T> {
    return new TextMatchSpecification<T, 'city'>('city', city);
  }

  /**
   * الإعلان في بلد
   */
  static inCountry<T extends { country: string }>(country: string): Specification<T> {
    return new EqualsSpecification<T, 'country'>('country', country as T['country']);
  }

  /**
   * الإعلان بنوع
   */
  static ofType<T extends { type: string }>(type: string): Specification<T> {
    return new EqualsSpecification<T, 'type'>('type', type as T['type']);
  }

  /**
   * الإعلان بفئة
   */
  static ofCategory<T extends { category: string }>(category: string): Specification<T> {
    return new EqualsSpecification<T, 'category'>('category', category as T['category']);
  }

  /**
   * الإعلان بسعر في نطاق
   */
  static inPriceRange<T extends { basePrice: number }>(
    min?: number,
    max?: number
  ): Specification<T> {
    return new RangeSpecification<T, 'basePrice'>('basePrice', min, max);
  }

  /**
   * الإعلان بعدد ضيوف
   */
  static accommodates<T extends { capacity: number }>(guests: number): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.capacity >= guests;
      }
      toPrismaWhere(): Record<string, unknown> {
        return { capacity: { gte: guests } };
      }
    })();
  }

  /**
   * الإعلان بعدد غرف نوم
   */
  static withBedrooms<T extends { bedrooms: number }>(bedrooms: number): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.bedrooms >= bedrooms;
      }
      toPrismaWhere(): Record<string, unknown> {
        return { bedrooms: { gte: bedrooms } };
      }
    })();
  }

  /**
   * الإعلان بتقييم
   */
  static withMinRating<T extends { ratingAverage: number | null }>(minRating: number): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.ratingAverage !== null && entity.ratingAverage >= minRating;
      }
      toPrismaWhere(): Record<string, unknown> {
        return { ratingAverage: { gte: minRating } };
      }
    })();
  }

  /**
   * الإعلان للمضيف
   */
  static forHost<T extends { hostId: string }>(hostId: string): Specification<T> {
    return new EqualsSpecification<T, 'hostId'>('hostId', hostId as T['hostId']);
  }

  /**
   * الإعلان للشركة
   */
  static forCompany<T extends { companyId: string | null }>(companyId: string): Specification<T> {
    return new EqualsSpecification<T, 'companyId'>('companyId', companyId as T['companyId']);
  }

  /**
   * الإعلان به مرافق
   */
  static withAmenities<T extends { amenities: unknown }>(amenityNames: string[]): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        // This would need to be implemented based on the actual amenities structure
        return true;
      }
      toPrismaWhere(): Record<string, unknown> {
        return {
          amenities: {
            some: { name: { in: amenityNames } },
          },
        };
      }
    })();
  }

  /**
   * نص البحث
   */
  static search<T extends { title: string; description: string | null; city: string }>(
    query: string
  ): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        const q = query.toLowerCase();
        return (
          entity.title.toLowerCase().includes(q) ||
          (entity.description?.toLowerCase().includes(q) ?? false) ||
          entity.city.toLowerCase().includes(q)
        );
      }
      toPrismaWhere(): Record<string, unknown> {
        return {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
        };
      }
    })();
  }
}

// ==================== Payment Specifications ====================

/**
 * مواصفات الدفع
 */
export class PaymentSpecifications {
  /**
   * الدفع مكتمل
   */
  static isCompleted<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'completed' as T['status']);
  }

  /**
   * الدفع معلق
   */
  static isPending<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'pending' as T['status']);
  }

  /**
   * الدفع فاشل
   */
  static isFailed<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'failed' as T['status']);
  }

  /**
   * الدفع مسترد
   */
  static isRefunded<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'refunded' as T['status']);
  }

  /**
   * دفع للمستخدم
   */
  static forUser<T extends { userId: string }>(userId: string): Specification<T> {
    return new EqualsSpecification<T, 'userId'>('userId', userId as T['userId']);
  }

  /**
   * دفع للحجز
   */
  static forBooking<T extends { bookingId: string }>(bookingId: string): Specification<T> {
    return new EqualsSpecification<T, 'bookingId'>('bookingId', bookingId as T['bookingId']);
  }

  /**
   * دفع بطريقة
   */
  static byMethod<T extends { method: string }>(method: string): Specification<T> {
    return new EqualsSpecification<T, 'method'>('method', method as T['method']);
  }

  /**
   * دفع في نطاق مبلغ
   */
  static inAmountRange<T extends { amount: number }>(
    min?: number,
    max?: number
  ): Specification<T> {
    return new RangeSpecification<T, 'amount'>('amount', min, max);
  }

  /**
   * دفع في نطاق تاريخ
   */
  static processedBetween<T extends { processedAt: Date | null }>(
    from: Date,
    to: Date
  ): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        if (!entity.processedAt) return false;
        return entity.processedAt >= from && entity.processedAt <= to;
      }
      toPrismaWhere(): Record<string, unknown> {
        return {
          processedAt: { gte: from, lte: to },
        };
      }
    })();
  }
}

// ==================== Review Specifications ====================

/**
 * مواصفات التقييم
 */
export class ReviewSpecifications {
  /**
   * التقييم نشط
   */
  static isActive<T extends { status: string }>(): Specification<T> {
    return new EqualsSpecification<T, 'status'>('status', 'active' as T['status']);
  }

  /**
   * التقييم بتقييم عام
   */
  static withMinRating<T extends { ratingOverall: number }>(minRating: number): Specification<T> {
    return new (class extends Specification<T> {
      isSatisfiedBy(entity: T): boolean {
        return entity.ratingOverall >= minRating;
      }
      toPrismaWhere(): Record<string, unknown> {
        return { ratingOverall: { gte: minRating } };
      }
    })();
  }

  /**
   * التقييم للإعلان
   */
  static forListing<T extends { listingId: string }>(listingId: string): Specification<T> {
    return new EqualsSpecification<T, 'listingId'>('listingId', listingId as T['listingId']);
  }

  /**
   * التقييم للمقيم
   */
  static byReviewer<T extends { reviewerId: string }>(reviewerId: string): Specification<T> {
    return new EqualsSpecification<T, 'reviewerId'>('reviewerId', reviewerId as T['reviewerId']);
  }

  /**
   * التقييم للمقيّم
   */
  static forReviewee<T extends { revieweeId: string }>(revieweeId: string): Specification<T> {
    return new EqualsSpecification<T, 'revieweeId'>('revieweeId', revieweeId as T['revieweeId']);
  }

  /**
   * التقييم له رد
   */
  static hasResponse<T extends { response: string | null }>(): Specification<T> {
    return new NullSpecification<T, 'response'>('response', false);
  }

  /**
   * التقييم مُبلغ عنه
   */
  static isReported<T extends { reportedAt: Date | null }>(): Specification<T> {
    return new NullSpecification<T, 'reportedAt'>('reportedAt', false);
  }
}

// ==================== Specification Builder ====================

/**
 * منشئ المواصفات
 */
export class SpecificationBuilder<T> {
  private specifications: Specification<T>[] = [];

  where(spec: Specification<T>): this {
    this.specifications.push(spec);
    return this;
  }

  equals<K extends keyof T>(field: K, value: T[K]): this {
    this.specifications.push(new EqualsSpecification(field, value));
    return this;
  }

  in<K extends keyof T>(field: K, values: T[K][]): this {
    this.specifications.push(new InSpecification(field, values));
    return this;
  }

  range<K extends keyof T>(field: K, min?: number, max?: number): this {
    this.specifications.push(new RangeSpecification(field, min, max));
    return this;
  }

  dateRange<K extends keyof T>(field: K, from?: Date, to?: Date): this {
    this.specifications.push(new DateRangeSpecification(field, from, to));
    return this;
  }

  text<K extends keyof T>(field: K, query: string, mode?: 'contains' | 'startsWith' | 'endsWith'): this {
    this.specifications.push(new TextMatchSpecification(field, query, mode));
    return this;
  }

  isNull<K extends keyof T>(field: K): this {
    this.specifications.push(new NullSpecification(field, true));
    return this;
  }

  isNotNull<K extends keyof T>(field: K): this {
    this.specifications.push(new NullSpecification(field, false));
    return this;
  }

  build(): Specification<T> | null {
    if (this.specifications.length === 0) return null;
    if (this.specifications.length === 1) return this.specifications[0];
    
    return this.specifications.reduce((acc, spec) => acc.and(spec));
  }

  toPrismaWhere(): Record<string, unknown> {
    const spec = this.build();
    return spec ? spec.toPrismaWhere() : {};
  }
}

// ==================== Helper Functions ====================

/**
 * إنشاء منشئ مواصفات
 */
export function createSpecification<T>(): SpecificationBuilder<T> {
  return new SpecificationBuilder<T>();
}

// ==================== Export All ====================

export const Specifications = {
  // Base
  Specification,
  EqualsSpecification,
  InSpecification,
  RangeSpecification,
  DateRangeSpecification,
  TextMatchSpecification,
  NullSpecification,
  BooleanSpecification,
  
  // Entity-specific
  User: UserSpecifications,
  Booking: BookingSpecifications,
  Listing: ListingSpecifications,
  Payment: PaymentSpecifications,
  Review: ReviewSpecifications,
  
  // Builder
  SpecificationBuilder,
  createSpecification,
};
