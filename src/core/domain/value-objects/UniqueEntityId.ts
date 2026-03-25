/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unique Entity ID - معرف فريد للكيان
 * 
 * @module core/domain/value-objects/UniqueEntityId
 */

import { randomUUID } from 'crypto';

export class UniqueEntityId {
  private readonly _value: string;

  constructor(id?: string) {
    this._value = id || randomUUID();
    this.validate();
  }

  get value(): string {
    return this._value;
  }

  private validate(): void {
    // التحقق من صحة الـ UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cuidRegex = /^c[a-z0-9]{24}$/i;
    const nanoidRegex = /^[a-z0-9_-]{21}$/i;
    
    if (!uuidRegex.test(this._value) && 
        !cuidRegex.test(this._value) && 
        !nanoidRegex.test(this._value) &&
        this._value.length < 10) {
      throw new Error(`Invalid unique entity id: ${this._value}`);
    }
  }

  equals(other?: UniqueEntityId): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }

  static generate(): UniqueEntityId {
    return new UniqueEntityId(randomUUID());
  }
}
