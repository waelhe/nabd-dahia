/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Factories - المصانع
 * 
 * مسؤولة عن إنشاء الكيانات المعقدة
 * 
 * @module core/domain/factories
 */

import { UniqueEntityId } from '../value-objects/UniqueEntityId';
import { Money } from '../value-objects/Money';
import { 
  BookingAggregate, 
  BookingStatus, 
  PaymentStatus,
  BookingAggregateProps,
  BookingGuestData,
} from '../aggregates';
import {
  PaymentAggregate,
  PaymentType,
  PaymentStatusType,
  PaymentAggregateProps,
} from '../aggregates';
import {
  ListingAggregate,
  ListingType,
  ListingStatus,
  ListingAggregateProps,
  ListingImageData,
} from '../aggregates';
import { DomainError, DomainErrorCode } from '../errors';
import type { DomainEvent } from '../events/typed-events';

// ==================== Factory Interface ====================

/**
 * واجهة المصنع
 */
export interface IFactory<T, TCreateDTO> {
  /**
   * إنشاء كيان جديد
   */
  create(dto: TCreateDTO): T;

  /**
   * إعادة إنشاء من بيانات مخزنة
   */
  reconstitute(data: Record<string, unknown>): T;
}

// ==================== Booking Factory ====================

/**
 * بيانات إنشاء الحجز
 */
export interface CreateBookingDTO {
  listingId: string;
  guestId: string;
  hostId: string;
  companyId?: string;
  
  checkIn: Date;
  checkOut: Date;
  
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  discounts?: number;
  totalPrice: number;
  currency: string;
  
  guests?: BookingGuestData[];
}

/**
 * مصنع الحجوزات
 */
export class BookingFactory implements IFactory<BookingAggregate, CreateBookingDTO> {
  /**
   * إنشاء حجز جديد
   */
  create(dto: CreateBookingDTO): BookingAggregate {
    // التحقق من صحة البيانات
    this.validateCreateDTO(dto);

    // إنشاء المعرف الفريد
    const id = UniqueEntityId.generate();

    // إنشاء الخصائص
    const props: BookingAggregateProps = {
      listingId: new UniqueEntityId(dto.listingId),
      guestId: new UniqueEntityId(dto.guestId),
      hostId: new UniqueEntityId(dto.hostId),
      companyId: dto.companyId ? new UniqueEntityId(dto.companyId) : undefined,
      
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      
      adultsCount: dto.adultsCount ?? 1,
      childrenCount: dto.childrenCount,
      infantsCount: dto.infantsCount,
      
      basePrice: dto.basePrice,
      cleaningFee: dto.cleaningFee,
      serviceFee: dto.serviceFee ?? 0,
      taxes: dto.taxes,
      discounts: dto.discounts,
      totalPrice: dto.totalPrice,
      currency: dto.currency,
      
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      
      guests: dto.guests ?? [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // إنشاء التجميع
    const booking = new BookingAggregate(id, props);

    // التحقق من الصحة
    if (!booking.validate()) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        'Invalid booking data',
        { dto }
      );
    }

    return booking;
  }

  /**
   * إعادة إنشاء من بيانات مخزنة
   */
  reconstitute(data: Record<string, unknown>): BookingAggregate {
    const id = new UniqueEntityId(data.id as string);
    
    const props: BookingAggregateProps = {
      listingId: new UniqueEntityId(data.listingId as string),
      guestId: new UniqueEntityId(data.guestId as string),
      hostId: new UniqueEntityId(data.hostId as string),
      companyId: data.companyId ? new UniqueEntityId(data.companyId as string) : undefined,
      
      checkIn: data.checkIn as Date,
      checkOut: data.checkOut as Date,
      
      adultsCount: data.adultsCount as number,
      childrenCount: data.childrenCount as number | undefined,
      infantsCount: data.infantsCount as number | undefined,
      
      basePrice: data.basePrice as number,
      cleaningFee: data.cleaningFee as number | undefined,
      serviceFee: data.serviceFee as number,
      taxes: data.taxes as number | undefined,
      discounts: data.discounts as number | undefined,
      totalPrice: data.totalPrice as number,
      currency: data.currency as string,
      
      status: data.status as BookingStatus,
      paymentStatus: data.paymentStatus as PaymentStatus,
      
      confirmedAt: data.confirmedAt as Date | undefined,
      cancelledAt: data.cancelledAt as Date | undefined,
      cancelledBy: data.cancelledBy as string | undefined,
      cancellationReason: data.cancellationReason as string | undefined,
      completedAt: data.completedAt as Date | undefined,
      
      guests: (data.guests as BookingGuestData[]) ?? [],
      
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };

    return new BookingAggregate(id, props);
  }

  /**
   * التحقق من صحة بيانات الإنشاء
   */
  private validateCreateDTO(dto: CreateBookingDTO): void {
    const errors: string[] = [];

    if (!dto.listingId) errors.push('Listing ID is required');
    if (!dto.guestId) errors.push('Guest ID is required');
    if (!dto.hostId) errors.push('Host ID is required');
    
    if (!dto.checkIn) errors.push('Check-in date is required');
    if (!dto.checkOut) errors.push('Check-out date is required');
    
    if (dto.checkIn && dto.checkOut && dto.checkIn >= dto.checkOut) {
      errors.push('Check-out must be after check-in');
    }
    
    if (dto.totalPrice < 0) errors.push('Total price must be non-negative');
    if ((dto.adultsCount ?? 1) < 1) errors.push('At least 1 adult is required');

    if (errors.length > 0) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        `Invalid booking data: ${errors.join(', ')}`,
        { errors }
      );
    }
  }

  /**
   * إنشاء حجز سريع
   */
  createQuick(params: {
    listingId: string;
    guestId: string;
    hostId: string;
    checkIn: Date;
    checkOut: Date;
    price: number;
    currency?: string;
  }): BookingAggregate {
    return this.create({
      listingId: params.listingId,
      guestId: params.guestId,
      hostId: params.hostId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      basePrice: params.price,
      totalPrice: params.price,
      currency: params.currency ?? 'SYP',
    });
  }
}

// ==================== Payment Factory ====================

/**
 * بيانات إنشاء الدفع
 */
export interface CreatePaymentDTO {
  bookingId: string;
  userId: string;
  
  amount: number;
  currency: string;
  type: PaymentType;
  method: string;
}

/**
 * مصنع الدفعات
 */
export class PaymentFactory implements IFactory<PaymentAggregate, CreatePaymentDTO> {
  /**
   * إنشاء دفعة جديدة
   */
  create(dto: CreatePaymentDTO): PaymentAggregate {
    // التحقق من صحة البيانات
    this.validateCreateDTO(dto);

    // إنشاء المعرف الفريد
    const id = UniqueEntityId.generate();

    // إنشاء الخصائص
    const props: PaymentAggregateProps = {
      bookingId: new UniqueEntityId(dto.bookingId),
      userId: new UniqueEntityId(dto.userId),
      
      amount: dto.amount,
      currency: dto.currency,
      type: dto.type,
      method: dto.method,
      
      status: PaymentStatusType.PENDING,
      
      refunds: [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // إنشاء التجميع
    const payment = new PaymentAggregate(id, props);

    // التحقق من الصحة
    if (!payment.validate()) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        'Invalid payment data',
        { dto }
      );
    }

    return payment;
  }

  /**
   * إعادة إنشاء من بيانات مخزنة
   */
  reconstitute(data: Record<string, unknown>): PaymentAggregate {
    const id = new UniqueEntityId(data.id as string);
    
    const props: PaymentAggregateProps = {
      bookingId: new UniqueEntityId(data.bookingId as string),
      userId: new UniqueEntityId(data.userId as string),
      
      amount: data.amount as number,
      currency: data.currency as string,
      type: data.type as PaymentType,
      method: data.method as string,
      
      status: data.status as PaymentStatusType,
      transactionId: data.transactionId as string | undefined,
      gatewayResponse: data.gatewayResponse as Record<string, unknown> | undefined,
      
      processedAt: data.processedAt as Date | undefined,
      failedAt: data.failedAt as Date | undefined,
      refundedAt: data.refundedAt as Date | undefined,
      
      refunds: (data.refunds as Record<string, unknown>[]) ?? [],
      
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };

    return new PaymentAggregate(id, props);
  }

  /**
   * التحقق من صحة بيانات الإنشاء
   */
  private validateCreateDTO(dto: CreatePaymentDTO): void {
    const errors: string[] = [];

    if (!dto.bookingId) errors.push('Booking ID is required');
    if (!dto.userId) errors.push('User ID is required');
    if (dto.amount <= 0) errors.push('Amount must be positive');
    if (!dto.currency) errors.push('Currency is required');
    if (!dto.method) errors.push('Payment method is required');

    if (errors.length > 0) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        `Invalid payment data: ${errors.join(', ')}`,
        { errors }
      );
    }
  }

  /**
   * إنشاء دفعة حجز
   */
  createBookingPayment(params: {
    bookingId: string;
    userId: string;
    amount: number;
    currency?: string;
    method: string;
  }): PaymentAggregate {
    return this.create({
      bookingId: params.bookingId,
      userId: params.userId,
      amount: params.amount,
      currency: params.currency ?? 'SYP',
      type: PaymentType.BOOKING_PAYMENT,
      method: params.method,
    });
  }

  /**
   * إنشاء دفعة تأمين
   */
  createDeposit(params: {
    bookingId: string;
    userId: string;
    amount: number;
    currency?: string;
  }): PaymentAggregate {
    return this.create({
      bookingId: params.bookingId,
      userId: params.userId,
      amount: params.amount,
      currency: params.currency ?? 'SYP',
      type: PaymentType.DEPOSIT,
      method: 'escrow',
    });
  }
}

// ==================== Listing Factory ====================

/**
 * بيانات إنشاء الإعلان
 */
export interface CreateListingDTO {
  hostId: string;
  companyId?: string;
  
  title: string;
  description?: string;
  
  type?: ListingType;
  category?: string;
  
  country: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  basePrice: number;
  weekendPrice?: number;
  currency?: string;
  cleaningFee?: number;
  
  capacity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  
  minNights?: number;
  maxNights?: number;
  
  images?: ListingImageData[];
}

/**
 * مصنع الإعلانات
 */
export class ListingFactory implements IFactory<ListingAggregate, CreateListingDTO> {
  /**
   * إنشاء إعلان جديد
   */
  create(dto: CreateListingDTO): ListingAggregate {
    // التحقق من صحة البيانات
    this.validateCreateDTO(dto);

    // إنشاء المعرف الفريد
    const id = UniqueEntityId.generate();

    // إنشاء الـ slug
    const slug = this.generateSlug(dto.title);

    // إنشاء الخصائص
    const props: ListingAggregateProps = {
      hostId: new UniqueEntityId(dto.hostId),
      companyId: dto.companyId ? new UniqueEntityId(dto.companyId) : undefined,
      
      title: dto.title,
      slug,
      description: dto.description,
      
      type: dto.type ?? ListingType.APARTMENT,
      category: dto.category,
      
      country: dto.country,
      city: dto.city,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      
      basePrice: dto.basePrice,
      weekendPrice: dto.weekendPrice,
      currency: dto.currency ?? 'SYP',
      cleaningFee: dto.cleaningFee,
      
      capacity: dto.capacity ?? 1,
      bedrooms: dto.bedrooms,
      beds: dto.beds,
      bathrooms: dto.bathrooms,
      
      minNights: dto.minNights ?? 1,
      maxNights: dto.maxNights ?? 365,
      
      status: ListingStatus.DRAFT,
      featured: false,
      
      ratingCount: 0,
      bookingCount: 0,
      viewCount: 0,
      favoriteCount: 0,
      
      images: dto.images ?? [],
      amenities: [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // إنشاء التجميع
    const listing = new ListingAggregate(id, props);

    // التحقق من الصحة
    if (!listing.validate()) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        'Invalid listing data',
        { dto }
      );
    }

    return listing;
  }

  /**
   * إعادة إنشاء من بيانات مخزنة
   */
  reconstitute(data: Record<string, unknown>): ListingAggregate {
    const id = new UniqueEntityId(data.id as string);
    
    const props: ListingAggregateProps = {
      hostId: new UniqueEntityId(data.hostId as string),
      companyId: data.companyId ? new UniqueEntityId(data.companyId as string) : undefined,
      
      title: data.title as string,
      slug: data.slug as string,
      description: data.description as string | undefined,
      
      type: data.type as ListingType,
      category: data.category as string | undefined,
      
      country: data.country as string,
      city: data.city as string,
      address: data.address as string | undefined,
      latitude: data.latitude as number | undefined,
      longitude: data.longitude as number | undefined,
      
      basePrice: data.basePrice as number,
      weekendPrice: data.weekendPrice as number | undefined,
      currency: data.currency as string,
      cleaningFee: data.cleaningFee as number | undefined,
      
      capacity: data.capacity as number,
      bedrooms: data.bedrooms as number | undefined,
      beds: data.beds as number | undefined,
      bathrooms: data.bathrooms as number | undefined,
      
      minNights: data.minNights as number,
      maxNights: data.maxNights as number,
      
      status: data.status as ListingStatus,
      featured: data.featured as boolean,
      featuredUntil: data.featuredUntil as Date | undefined,
      
      ratingAverage: data.ratingAverage as number | undefined,
      ratingCount: data.ratingCount as number,
      bookingCount: data.bookingCount as number,
      viewCount: data.viewCount as number,
      favoriteCount: data.favoriteCount as number,
      
      images: (data.images as ListingImageData[]) ?? [],
      amenities: [],
      
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
      deletedAt: data.deletedAt as Date | undefined,
    };

    return new ListingAggregate(id, props);
  }

  /**
   * التحقق من صحة بيانات الإنشاء
   */
  private validateCreateDTO(dto: CreateListingDTO): void {
    const errors: string[] = [];

    if (!dto.hostId) errors.push('Host ID is required');
    if (!dto.title) errors.push('Title is required');
    if (!dto.country) errors.push('Country is required');
    if (!dto.city) errors.push('City is required');
    if (dto.basePrice < 0) errors.push('Base price must be non-negative');

    if (errors.length > 0) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        `Invalid listing data: ${errors.join(', ')}`,
        { errors }
      );
    }
  }

  /**
   * توليد الـ slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now().toString(36);
  }

  /**
   * إنشاء إعلان سريع
   */
  createQuick(params: {
    hostId: string;
    title: string;
    city: string;
    country: string;
    price: number;
    currency?: string;
  }): ListingAggregate {
    return this.create({
      hostId: params.hostId,
      title: params.title,
      city: params.city,
      country: params.country,
      basePrice: params.price,
      currency: params.currency ?? 'SYP',
    });
  }
}

// ==================== User Factory ====================

/**
 * بيانات إنشاء المستخدم
 */
export interface CreateUserDTO {
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  
  role?: string;
  country?: string;
  city?: string;
  
  preferredLanguage?: string;
  preferredCurrency?: string;
}

/**
 * مصنع المستخدمين
 */
export class UserFactory {
  /**
   * إنشاء مستخدم جديد
   */
  create(dto: CreateUserDTO): {
    id: UniqueEntityId;
    props: Record<string, unknown>;
  } {
    // التحقق من وجود البريد أو الهاتف
    if (!dto.email && !dto.phone) {
      throw new DomainError(
        DomainErrorCode.VALIDATION_ERROR,
        'Either email or phone is required',
        { dto }
      );
    }

    const id = UniqueEntityId.generate();

    return {
      id,
      props: {
        email: dto.email,
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName ?? `${dto.firstName} ${dto.lastName}`,
        
        status: 'pending',
        role: dto.role ?? 'user',
        
        country: dto.country,
        city: dto.city,
        
        membershipLevel: 'bronze',
        loyaltyPoints: 0,
        totalSpent: 0,
        totalBookings: 0,
        
        isSuperhost: false,
        totalListings: 0,
        ratingAverage: null,
        ratingCount: 0,
        
        preferredLanguage: dto.preferredLanguage ?? 'ar',
        preferredCurrency: dto.preferredCurrency ?? 'SYP',
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  /**
   * إنشاء مضيف
   */
  createHost(dto: CreateUserDTO): {
    id: UniqueEntityId;
    props: Record<string, unknown>;
  } {
    const user = this.create({ ...dto, role: 'host' });
    
    return {
      ...user,
      props: {
        ...user.props,
        role: 'host',
        hostingSince: new Date(),
      },
    };
  }

  /**
   * إنشاء شركة
   */
  createCompanyUser(dto: CreateUserDTO & { companyId: string }): {
    id: UniqueEntityId;
    props: Record<string, unknown>;
  } {
    const user = this.create({ ...dto, role: 'company' });
    
    return {
      ...user,
      props: {
        ...user.props,
        role: 'company',
        companyId: dto.companyId,
      },
    };
  }
}

// ==================== Export All ====================

export const Factories = {
  BookingFactory,
  PaymentFactory,
  ListingFactory,
  UserFactory,
};

// Singleton instances
export const bookingFactory = new BookingFactory();
export const paymentFactory = new PaymentFactory();
export const listingFactory = new ListingFactory();
export const userFactory = new UserFactory();
