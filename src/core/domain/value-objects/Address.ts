/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Address Value Object - كائن قيمة العنوان
 * 
 * يمثل عنواناً جغرافياً كاملاً.
 * يدعم Result Pattern للإنشاء الآمن.
 * 
 * @module core/domain/value-objects/Address
 */

import type { Result } from '../../types/result';
import { ok, err, ValidationError } from '../../types/result';

// ==================== Types ====================

export interface AddressProps {
  country: string;
  region?: string;
  city: string;
  address: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  buildingNumber?: string;
  floor?: string;
  apartment?: string;
  instructions?: string;
}

// ==================== Address Error ====================

export class AddressError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AddressError';
  }

  static cityRequired(): AddressError {
    return new AddressError('CITY_REQUIRED', 'City is required');
  }

  static addressRequired(): AddressError {
    return new AddressError('ADDRESS_REQUIRED', 'Address is required');
  }

  static invalidLatitude(lat: number): AddressError {
    return new AddressError('INVALID_LATITUDE', `Latitude must be between -90 and 90, got ${lat}`, { lat });
  }

  static invalidLongitude(lng: number): AddressError {
    return new AddressError('INVALID_LONGITUDE', `Longitude must be between -180 and 180, got ${lng}`, { lng });
  }

  static invalidCoordinates(): AddressError {
    return new AddressError('INVALID_COORDINATES', 'Both latitude and longitude must be provided together');
  }
}

// ==================== Address Value Object ====================

export class Address {
  private readonly props: AddressProps;

  private constructor(props: AddressProps) {
    this.props = {
      ...props,
      country: props.country || 'Syria',
    };
  }

  get country(): string {
    return this.props.country;
  }

  get region(): string | undefined {
    return this.props.region;
  }

  get city(): string {
    return this.props.city;
  }

  get address(): string {
    return this.props.address;
  }

  get postalCode(): string | undefined {
    return this.props.postalCode;
  }

  get latitude(): number | undefined {
    return this.props.latitude;
  }

  get longitude(): number | undefined {
    return this.props.longitude;
  }

  get landmark(): string | undefined {
    return this.props.landmark;
  }

  get buildingNumber(): string | undefined {
    return this.props.buildingNumber;
  }

  get floor(): string | undefined {
    return this.props.floor;
  }

  get apartment(): string | undefined {
    return this.props.apartment;
  }

  get instructions(): string | undefined {
    return this.props.instructions;
  }

  /**
   * التحقق من صحة الإحداثيات
   */
  get hasCoordinates(): boolean {
    return this.props.latitude !== undefined && 
           this.props.longitude !== undefined;
  }

  /**
   * الحصول على الإحداثيات ككائن
   */
  get coordinates(): { lat: number; lng: number } | null {
    if (!this.hasCoordinates) return null;
    return {
      lat: this.props.latitude!,
      lng: this.props.longitude!,
    };
  }

  /**
   * التحقق من صحة العنوان (للاستخدام الداخلي)
   */
  private static validate(props: AddressProps): Result<void, AddressError> {
    if (!props.city || props.city.trim().length === 0) {
      return err(AddressError.cityRequired());
    }
    
    if (!props.address || props.address.trim().length === 0) {
      return err(AddressError.addressRequired());
    }
    
    // التحقق من الإحداثيات
    if (props.latitude !== undefined && props.longitude === undefined) {
      return err(AddressError.invalidCoordinates());
    }
    if (props.longitude !== undefined && props.latitude === undefined) {
      return err(AddressError.invalidCoordinates());
    }
    
    if (props.latitude !== undefined) {
      if (props.latitude < -90 || props.latitude > 90) {
        return err(AddressError.invalidLatitude(props.latitude));
      }
    }
    
    if (props.longitude !== undefined) {
      if (props.longitude < -180 || props.longitude > 180) {
        return err(AddressError.invalidLongitude(props.longitude));
      }
    }

    return ok(undefined);
  }

  /**
   * تنسيق العنوان للعرض
   */
  format(includeCountry: boolean = true): string {
    const parts: string[] = [];
    
    if (this.props.buildingNumber) {
      parts.push(this.props.buildingNumber);
    }
    
    parts.push(this.props.address);
    
    if (this.props.landmark) {
      parts.push(`(${this.props.landmark})`);
    }
    
    parts.push(this.props.city);
    
    if (this.props.region) {
      parts.push(this.props.region);
    }
    
    if (includeCountry) {
      parts.push(this.props.country);
    }
    
    if (this.props.postalCode) {
      parts.push(this.props.postalCode);
    }
    
    return parts.join(', ');
  }

  /**
   * تنسيق مختصر
   */
  formatShort(): string {
    return `${this.props.city}, ${this.props.country}`;
  }

  /**
   * تنسيق سطر واحد
   */
  formatOneLine(): string {
    return this.format();
  }

  /**
   * تنسيق متعدد الأسطر
   */
  formatMultiline(): string {
    const lines: string[] = [];
    
    if (this.props.buildingNumber || this.props.address) {
      lines.push([this.props.buildingNumber, this.props.address].filter(Boolean).join(' '));
    }
    
    if (this.props.landmark) {
      lines.push(this.props.landmark);
    }
    
    const cityLine = [this.props.city, this.props.region].filter(Boolean).join(', ');
    lines.push(cityLine);
    
    if (this.props.postalCode) {
      lines[lines.length - 1] += ` ${this.props.postalCode}`;
    }
    
    lines.push(this.props.country);
    
    return lines.join('\n');
  }

  /**
   * الحصول على رابط الخريطة
   */
  getMapUrl(provider: 'google' | 'apple' | 'osm' = 'google'): string {
    if (!this.hasCoordinates) {
      return '';
    }
    
    const { lat, lng } = this.coordinates!;
    
    switch (provider) {
      case 'google':
        return `https://www.google.com/maps?q=${lat},${lng}`;
      case 'apple':
        return `https://maps.apple.com/?q=${lat},${lng}`;
      case 'osm':
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
      default:
        return '';
    }
  }

  /**
   * حساب المسافة من عنوان آخر (بالكيلومتر)
   */
  distanceTo(other: Address): number | null {
    if (!this.hasCoordinates || !other.hasCoordinates) {
      return null;
    }
    
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.toRad(other.latitude! - this.latitude!);
    const dLng = this.toRad(other.longitude! - this.longitude!);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude!)) * 
      Math.cos(this.toRad(other.latitude!)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * تحديث الإحداثيات
   */
  withCoordinates(latitude: number, longitude: number): Result<Address, AddressError> {
    return Address.tryCreate({
      ...this.props,
      latitude,
      longitude,
    });
  }

  /**
   * إضافة تعليمات الوصول
   */
  withInstructions(instructions: string): Address {
    return new Address({
      ...this.props,
      instructions,
    });
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء آمن مع Result Pattern (alias for tryCreate)
   */
  static create(props: AddressProps): Result<Address, AddressError> {
    return Address.tryCreate(props);
  }

  /**
   * إنشاء آمن مع Result Pattern
   */
  static tryCreate(props: AddressProps): Result<Address, AddressError> {
    const validationResult = Address.validate(props);
    if (validationResult.isFailure) {
      return err(validationResult.error);
    }
    
    return ok(new Address(props));
  }

  /**
   * إنشاء من كائن (يرمي خطأ - للتوافق)
   */
  static from(props: AddressProps): Address {
    const result = Address.tryCreate(props);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء عنوان سوري
   */
  static syrian(props: Omit<AddressProps, 'country'>): Result<Address, AddressError> {
    return Address.tryCreate({
      ...props,
      country: 'Syria',
    });
  }

  /**
   * إنشاء من إحداثيات
   */
  static fromCoordinates(
    latitude: number,
    longitude: number,
    city: string,
    address: string,
    country: string = 'Syria'
  ): Result<Address, AddressError> {
    return Address.tryCreate({
      latitude,
      longitude,
      city,
      address,
      country,
    });
  }

  /**
   * التحقق من صحة العنوان بدون إنشاء
   */
  static isValid(props: AddressProps): boolean {
    return Address.tryCreate(props).isSuccess;
  }

  // ==================== Serialization ====================

  toJSON(): AddressProps {
    return { ...this.props };
  }

  toString(): string {
    return this.formatShort();
  }

  equals(other: Address): boolean {
    return (
      this.props.country === other.props.country &&
      this.props.city === other.props.city &&
      this.props.address === other.props.address &&
      this.props.latitude === other.props.latitude &&
      this.props.longitude === other.props.longitude
    );
  }
}
