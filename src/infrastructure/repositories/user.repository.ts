/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * User Repository Implementation
 * 
 * تنفيذ مستودع المستخدمين باستخدام Prisma
 * 
 * @module infrastructure/repositories/user.repository
 */

import { db } from '@/lib/db';
import { SoftDeletableRepository, VersionedRepository } from './base.repository';
import type {
  IUserRepository,
  UserFilter,
  UserCreateData,
  UserUpdateData,
} from '@/core/interfaces/repositories/user.repository';
import type { User } from '@prisma/client';

// ==================== Types ====================

export interface UserFilter {
  status?: string;
  role?: string;
  country?: string;
  city?: string;
  isVerified?: boolean;
  isHost?: boolean;
}

export interface UserWithIncludes {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  nationality: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  role: string;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  membershipLevel: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalBookings: number;
  hostingSince: Date | null;
  responseRate: number | null;
  responseTime: number | null;
  totalListings: number;
  isSuperhost: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  preferredLanguage: string;
  preferredCurrency: string;
  notificationSettings: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
}

// ==================== User Repository ====================

export class UserRepository
  extends VersionedRepository<User, string>
  implements IUserRepository
{
  constructor() {
    super(db.user as Parameters<typeof VersionedRepository<User, string>['constructor']>[0], 'id');
  }

  // ==================== Specialized Queries ====================

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } as unknown as Record<string, unknown> });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.findOne({ where: { phone } as unknown as Record<string, unknown> });
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const result = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
        deletedAt: null,
      },
    });

    return result;
  }

  async findByRole(role: string, options?: { limit?: number; offset?: number }): Promise<User[]> {
    return this.findMany({
      where: { role } as unknown as Record<string, unknown>,
      limit: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: string, options?: { limit?: number; offset?: number }): Promise<User[]> {
    return this.findMany({
      where: { status } as unknown as Record<string, unknown>,
      limit: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMembershipLevel(level: string, options?: { limit?: number; offset?: number }): Promise<User[]> {
    return this.findMany({
      where: { membershipLevel: level } as unknown as Record<string, unknown>,
      limit: options?.limit,
      skip: options?.offset,
      orderBy: { totalSpent: 'desc' },
    });
  }

  async findSuperhosts(options?: { limit?: number; offset?: number }): Promise<User[]> {
    return this.findMany({
      where: { isSuperhost: true } as unknown as Record<string, unknown>,
      limit: options?.limit,
      skip: options?.offset,
      orderBy: { ratingAverage: 'desc' },
    });
  }

  async search(query: string, options?: { limit?: number; offset?: number }): Promise<User[]> {
    return this.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { displayName: { contains: query } },
          { email: { contains: query } },
        ],
      } as unknown as Record<string, unknown>,
      limit: options?.limit,
      skip: options?.offset,
    });
  }

  // ==================== Authentication ====================

  async updateLastLogin(id: string): Promise<User> {
    return this.update(id, { lastLoginAt: new Date() } as unknown as Record<string, unknown>);
  }

  async verifyEmail(id: string): Promise<User> {
    return this.update(id, { 
      emailVerifiedAt: new Date(),
      status: 'active',
    } as unknown as Record<string, unknown>);
  }

  async verifyPhone(id: string): Promise<User> {
    return this.update(id, { phoneVerifiedAt: new Date() } as unknown as Record<string, unknown>);
  }

  async setPassword(id: string, passwordHash: string): Promise<User> {
    return this.update(id, { passwordHash } as unknown as Record<string, unknown>);
  }

  // ==================== Membership & Loyalty ====================

  async updateMembershipLevel(id: string, level: string): Promise<User> {
    return this.update(id, { membershipLevel: level } as unknown as Record<string, unknown>);
  }

  async addLoyaltyPoints(id: string, points: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');

    return this.update(id, {
      loyaltyPoints: (user as unknown as { loyaltyPoints: number }).loyaltyPoints + points,
    } as unknown as Record<string, unknown>);
  }

  async updateStats(id: string, stats: Partial<{
    totalSpent: number;
    totalBookings: number;
    totalListings: number;
    ratingAverage: number;
    ratingCount: number;
  }>): Promise<User> {
    return this.update(id, stats as unknown as Record<string, unknown>);
  }

  // ==================== Host Features ====================

  async makeHost(id: string): Promise<User> {
    return this.update(id, {
      role: 'host',
      hostingSince: new Date(),
    } as unknown as Record<string, unknown>);
  }

  async updateHostStats(id: string, stats: Partial<{
    responseRate: number;
    responseTime: number;
    totalListings: number;
    isSuperhost: boolean;
  }>): Promise<User> {
    return this.update(id, stats as unknown as Record<string, unknown>);
  }

  async incrementListingCount(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');

    return this.update(id, {
      totalListings: (user as unknown as { totalListings: number }).totalListings + 1,
    } as unknown as Record<string, unknown>);
  }

  // ==================== Admin Operations ====================

  async suspend(id: string, reason?: string): Promise<User> {
    return this.update(id, {
      status: 'suspended',
      // Could add suspensionReason to schema
    } as unknown as Record<string, unknown>);
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { status: 'active' } as unknown as Record<string, unknown>);
  }

  async changeRole(id: string, role: string): Promise<User> {
    return this.update(id, { role } as unknown as Record<string, unknown>);
  }

  // ==================== Statistics ====================

  async countByRole(): Promise<Record<string, number>> {
    const users = await db.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: { role: true },
    });

    return users.reduce((acc, u) => {
      acc[u.role] = u._count.role;
      return acc;
    }, {} as Record<string, number>);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const users = await db.user.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true },
    });

    return users.reduce((acc, u) => {
      acc[u.status] = u._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  async countByMembershipLevel(): Promise<Record<string, number>> {
    const users = await db.user.groupBy({
      by: ['membershipLevel'],
      where: { deletedAt: null },
      _count: { membershipLevel: true },
    });

    return users.reduce((acc, u) => {
      acc[u.membershipLevel] = u._count.membershipLevel;
      return acc;
    }, {} as Record<string, number>);
  }

  // ==================== Recent Activity ====================

  async findRecentlyActive(limit: number = 10): Promise<User[]> {
    return this.findMany({
      where: { lastLoginAt: { not: null } } as unknown as Record<string, unknown>,
      limit,
      orderBy: { lastLoginAt: 'desc' },
    });
  }

  async findNewUsers(limit: number = 10): Promise<User[]> {
    return this.findMany({
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTopHosts(limit: number = 10): Promise<User[]> {
    return this.findMany({
      where: { 
        role: 'host',
        ratingAverage: { not: null },
      } as unknown as Record<string, unknown>,
      limit,
      orderBy: { ratingAverage: 'desc' },
    });
  }

  async findTopSpenders(limit: number = 10): Promise<User[]> {
    return this.findMany({
      where: { totalSpent: { gt: 0 } } as unknown as Record<string, unknown>,
      limit,
      orderBy: { totalSpent: 'desc' },
    });
  }

  // ==================== Stats ====================

  async getStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    hosts: number;
    companies: number;
    guests: number;
    byRole: Record<string, number>;
    newThisMonth: number;
    verified: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      active,
      pending,
      suspended,
      hosts,
      companies,
      guests,
      byRole,
      newThisMonth,
      verified,
    ] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.user.count({ where: { deletedAt: null, status: 'active' } }),
      db.user.count({ where: { deletedAt: null, status: 'pending' } }),
      db.user.count({ where: { deletedAt: null, status: 'suspended' } }),
      db.user.count({ where: { deletedAt: null, role: 'host' } }),
      db.user.count({ where: { deletedAt: null, role: 'company' } }),
      db.user.count({ where: { deletedAt: null, role: 'user' } }),
      this.countByRole(),
      db.user.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
      db.user.count({ where: { deletedAt: null, OR: [{ emailVerifiedAt: { not: null } }, { phoneVerifiedAt: { not: null } }] } }),
    ]);

    return {
      total,
      active,
      pending,
      suspended,
      hosts,
      companies,
      guests,
      byRole,
      newThisMonth,
      verified,
    };
  }

  // ==================== Count with Filter ====================

  async count(filter?: Partial<UserFilter>): Promise<number> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filter?.status) where.status = filter.status;
    if (filter?.role) where.role = filter.role;
    if (filter?.country) where.country = filter.country;
    if (filter?.city) where.city = filter.city;
    if (filter?.isVerified) {
      where.OR = [
        { emailVerifiedAt: { not: null } },
        { phoneVerifiedAt: { not: null } },
      ];
    }
    if (filter?.isHost) {
      where.role = { in: ['host', 'company'] };
    }

    return db.user.count({ where });
  }

  // ==================== Soft Delete ====================

  async softDelete(id: string, deletedBy: string): Promise<User> {
    return this.update(id, {
      deletedAt: new Date(),
      deletedBy,
      status: 'deleted',
    } as unknown as Record<string, unknown>);
  }

  // ==================== Find Many with Filter ====================

  async findMany(options?: {
    filter?: Partial<UserFilter>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<User[]> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (options?.filter?.status) where.status = options.filter.status;
    if (options?.filter?.role) where.role = options.filter.role;
    if (options?.filter?.country) where.country = options.filter.country;
    if (options?.filter?.city) where.city = options.filter.city;

    return db.user.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }
}

// ==================== Singleton Instance ====================

export const userRepository = new UserRepository();
