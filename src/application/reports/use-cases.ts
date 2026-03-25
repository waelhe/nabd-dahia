/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Reports Use Cases
 * 
 * حالات استخدام التقارير
 * 
 * @module application/reports/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { db } from '@/lib/db';
import { UseCaseError, TimeRange, PREDEFINED_RANGES } from '../types';

// ==================== Types ====================

export interface ReportInput {
  type: 'bookings' | 'revenue' | 'users' | 'listings' | 'reviews';
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  customPeriod?: TimeRange;
  format?: 'json' | 'csv' | 'pdf';
  filters?: Record<string, unknown>;
  
  // Context
  userId: string;
  role: string;
  companyId?: string;
}

export interface BookingsReportOutput {
  period: TimeRange;
  generatedAt: Date;
  
  summary: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    cancelledBookings: number;
    cancellationRate: number;
  };
  
  breakdown: {
    byStatus: Record<string, number>;
    byCategory: Array<{ category: string; count: number; revenue: number }>;
    byCity: Array<{ city: string; count: number; revenue: number }>;
    byPaymentMethod: Record<string, number>;
  };
  
  trends: {
    daily: Array<{ date: string; bookings: number; revenue: number }>;
    weekly: Array<{ week: string; bookings: number; revenue: number }>;
    monthly: Array<{ month: string; bookings: number; revenue: number }>;
  };
  
  topPerformers: {
    listings: Array<{ id: string; title: string; bookings: number; revenue: number }>;
    hosts: Array<{ id: string; name: string; bookings: number; revenue: number }>;
  };
  
  comparison?: {
    previousPeriod: {
      bookings: number;
      revenue: number;
    };
    change: {
      bookingsChange: number; // Percentage
      revenueChange: number;
    };
  };
}

export interface RevenueReportOutput {
  period: TimeRange;
  generatedAt: Date;
  
  summary: {
    grossRevenue: number;
    netRevenue: number;
    platformFees: number;
    processingFees: number;
    refunds: number;
    taxes: number;
  };
  
  breakdown: {
    byCategory: Array<{ category: string; gross: number; net: number }>;
    byCity: Array<{ city: string; gross: number; net: number }>;
    byPaymentMethod: Record<string, number>;
  };
  
  trends: {
    daily: Array<{ date: string; gross: number; net: number }>;
    monthly: Array<{ month: string; gross: number; net: number }>;
  };
  
  projections?: {
    nextMonth: number;
    nextQuarter: number;
  };
}

export interface UsersReportOutput {
  period: TimeRange;
  generatedAt: Date;
  
  summary: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    churnedUsers: number;
  };
  
  breakdown: {
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    byCountry: Array<{ country: string; count: number }>;
    byCity: Array<{ city: string; count: number }>;
    byAge: Array<{ range: string; count: number }>;
    byGender: Record<string, number>;
  };
  
  acquisition: {
    bySource: Record<string, number>;
    byDay: Array<{ date: string; signups: number }>;
  };
  
  engagement: {
    averageSessionsPerUser: number;
    averageTimeOnPlatform: number;
    retentionRate: number;
  };
}

export interface ListingsReportOutput {
  period: TimeRange;
  generatedAt: Date;
  
  summary: {
    totalListings: number;
    activeListings: number;
    newListings: number;
    expiredListings: number;
  };
  
  breakdown: {
    byCategory: Record<string, number>;
    byCity: Array<{ city: string; count: number }>;
    byStatus: Record<string, number>;
    byPriceRange: Array<{ range: string; count: number }>;
  };
  
  performance: {
    topViewed: Array<{ id: string; title: string; views: number }>;
    topBooked: Array<{ id: string; title: string; bookings: number }>;
    topRated: Array<{ id: string; title: string; rating: number }>;
    underperforming: Array<{ id: string; title: string; views: number; bookings: number }>;
  };
  
  occupancy: {
    averageOccupancyRate: number;
    byCategory: Array<{ category: string; rate: number }>;
    byCity: Array<{ city: string; rate: number }>;
  };
}

export interface ReviewsReportOutput {
  period: TimeRange;
  generatedAt: Date;
  
  summary: {
    totalReviews: number;
    averageRating: number;
    responseRate: number;
  };
  
  breakdown: {
    byRating: Record<number, number>;
    byCategory: Array<{ category: string; count: number; avgRating: number }>;
  };
  
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  
  keywords: Array<{ word: string; count: number }>;
  
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    listing: string;
    createdAt: Date;
  }>;
}

// ==================== Use Cases ====================

/**
 * توليد تقرير الحجوزات
 */
export async function generateBookingsReport(
  input: ReportInput,
): Promise<Result<BookingsReportOutput, UseCaseError>> {
  try {
    const period = getReportPeriod(input);
    
    // Build base where clause
    const where = buildWhereClause(input, period);
    
    // Get summary
    const summary = await getBookingsSummary(where);
    
    // Get breakdowns
    const breakdown = await getBookingsBreakdown(where, input);
    
    // Get trends
    const trends = await getBookingsTrends(where, period);
    
    // Get top performers
    const topPerformers = await getBookingsTopPerformers(where);
    
    // Get comparison
    const comparison = await getBookingsComparison(input, period);
    
    return ok({
      period,
      generatedAt: new Date(),
      summary,
      breakdown,
      trends,
      topPerformers,
      comparison,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to generate bookings report'));
  }
}

/**
 * توليد تقرير الإيرادات
 */
export async function generateRevenueReport(
  input: ReportInput,
): Promise<Result<RevenueReportOutput, UseCaseError>> {
  try {
    const period = getReportPeriod(input);
    const where = buildWhereClause(input, period);
    
    // Get summary
    const summary = await getRevenueSummary(where);
    
    // Get breakdowns
    const breakdown = await getRevenueBreakdown(where, input);
    
    // Get trends
    const trends = await getRevenueTrends(where, period);
    
    return ok({
      period,
      generatedAt: new Date(),
      summary,
      breakdown,
      trends,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to generate revenue report'));
  }
}

/**
 * توليد تقرير المستخدمين
 */
export async function generateUsersReport(
  input: ReportInput,
): Promise<Result<UsersReportOutput, UseCaseError>> {
  try {
    if (input.role !== 'admin') {
      return err(UseCaseError.unauthorized('Only admins can generate user reports'));
    }
    
    const period = getReportPeriod(input);
    
    // Get summary
    const summary = await getUsersSummary(period);
    
    // Get breakdowns
    const breakdown = await getUsersBreakdown(period);
    
    // Get acquisition
    const acquisition = await getUsersAcquisition(period);
    
    // Get engagement
    const engagement = await getUsersEngagement(period);
    
    return ok({
      period,
      generatedAt: new Date(),
      summary,
      breakdown,
      acquisition,
      engagement,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to generate users report'));
  }
}

/**
 * توليد تقرير الإعلانات
 */
export async function generateListingsReport(
  input: ReportInput,
): Promise<Result<ListingsReportOutput, UseCaseError>> {
  try {
    const period = getReportPeriod(input);
    
    const where: Record<string, unknown> = { deletedAt: null };
    if (input.role === 'host') {
      where.hostId = input.userId;
    } else if (input.role === 'company' && input.companyId) {
      where.companyId = input.companyId;
    }
    
    // Get summary
    const summary = await getListingsSummary(where, period);
    
    // Get breakdowns
    const breakdown = await getListingsBreakdown(where);
    
    // Get performance
    const performance = await getListingsPerformance(where);
    
    // Get occupancy
    const occupancy = await getListingsOccupancy(where);
    
    return ok({
      period,
      generatedAt: new Date(),
      summary,
      breakdown,
      performance,
      occupancy,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to generate listings report'));
  }
}

/**
 * توليد تقرير التقييمات
 */
export async function generateReviewsReport(
  input: ReportInput,
): Promise<Result<ReviewsReportOutput, UseCaseError>> {
  try {
    const period = getReportPeriod(input);
    
    const where: Record<string, unknown> = {
      createdAt: { gte: period.start, lte: period.end },
    };
    
    if (input.role === 'host') {
      where.listing = { hostId: input.userId };
    } else if (input.role === 'company' && input.companyId) {
      where.listing = { companyId: input.companyId };
    }
    
    // Get summary
    const summary = await getReviewsSummary(where);
    
    // Get breakdowns
    const breakdown = await getReviewsBreakdown(where);
    
    // Get sentiment
    const sentiment = await getReviewsSentiment(where);
    
    // Get keywords
    const keywords = await getReviewsKeywords(where);
    
    // Get recent reviews
    const recentReviews = await getRecentReviews(where);
    
    return ok({
      period,
      generatedAt: new Date(),
      summary,
      breakdown,
      sentiment,
      keywords,
      recentReviews,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to generate reviews report'));
  }
}

/**
 * تصدير التقرير
 */
export async function exportReport(
  report: unknown,
  format: 'json' | 'csv',
): Promise<Result<Blob, UseCaseError>> {
  try {
    if (format === 'json') {
      return ok(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    }
    
    // CSV export
    const csv = convertToCSV(report as Record<string, unknown>);
    return ok(new Blob([csv], { type: 'text/csv' }));
  } catch (error) {
    return err(UseCaseError.internal('Failed to export report'));
  }
}

// ==================== Helper Functions ====================

function getReportPeriod(input: ReportInput): TimeRange {
  if (input.customPeriod) {
    return input.customPeriod;
  }
  
  switch (input.period) {
    case 'today':
      return PREDEFINED_RANGES.today();
    case 'week':
      return PREDEFINED_RANGES.thisWeek();
    case 'month':
      return PREDEFINED_RANGES.thisMonth();
    case 'quarter':
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        start: new Date(now.getFullYear(), quarter * 3, 1),
        end: new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999),
      };
    case 'year':
      const year = new Date().getFullYear();
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    default:
      return PREDEFINED_RANGES.last30Days();
  }
}

function buildWhereClause(input: ReportInput, period: TimeRange): Record<string, unknown> {
  const where: Record<string, unknown> = {
    createdAt: { gte: period.start, lte: period.end },
    deletedAt: null,
  };
  
  if (input.role === 'host') {
    where.hostId = input.userId;
  } else if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  // Apply additional filters
  if (input.filters) {
    Object.assign(where, input.filters);
  }
  
  return where;
}

async function getBookingsSummary(where: Record<string, unknown>) {
  const [total, revenue, cancelled] = await Promise.all([
    db.booking.count({ where }),
    db.booking.aggregate({
      where: { ...where, status: 'completed' },
      _sum: { totalPrice: true },
    }),
    db.booking.count({ where: { ...where, status: 'cancelled' } }),
  ]);
  
  const totalRevenue = revenue._sum.totalPrice || 0;
  
  return {
    totalBookings: total,
    totalRevenue,
    averageBookingValue: total > 0 ? totalRevenue / total : 0,
    cancelledBookings: cancelled,
    cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
  };
}

async function getBookingsBreakdown(
  where: Record<string, unknown>,
  input: ReportInput,
) {
  const [byStatus, byCategory, byCity] = await Promise.all([
    db.booking.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    db.booking.groupBy({
      by: ['listingId'],
      where,
      _count: true,
      _sum: { totalPrice: true },
    }),
    db.booking.findMany({
      where,
      select: {
        totalPrice: true,
        listing: { select: { city: true } },
      },
    }),
  ]);
  
  // Get categories for listings
  const listingIds = byCategory.map((b) => b.listingId);
  const listings = await db.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, category: true },
  });
  const categoryMap = new Map(listings.map((l) => [l.id, l.category]));
  
  const categoryStats: Record<string, { count: number; revenue: number }> = {};
  for (const stat of byCategory) {
    const category = categoryMap.get(stat.listingId) || 'other';
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, revenue: 0 };
    }
    categoryStats[category].count += stat._count;
    categoryStats[category].revenue += stat._sum.totalPrice || 0;
  }
  
  // City stats
  const cityStats: Record<string, { count: number; revenue: number }> = {};
  for (const booking of byCity) {
    const city = booking.listing?.city || 'Unknown';
    if (!cityStats[city]) {
      cityStats[city] = { count: 0, revenue: 0 };
    }
    cityStats[city].count++;
    cityStats[city].revenue += booking.totalPrice || 0;
  }
  
  return {
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byCategory: Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      count: stats.count,
      revenue: stats.revenue,
    })),
    byCity: Object.entries(cityStats).map(([city, stats]) => ({
      city,
      count: stats.count,
      revenue: stats.revenue,
    })),
    byPaymentMethod: {}, // Placeholder
  };
}

async function getBookingsTrends(
  where: Record<string, unknown>,
  period: TimeRange,
) {
  const bookings = await db.booking.findMany({
    where,
    select: { createdAt: true, totalPrice: true },
    orderBy: { createdAt: 'asc' },
  });
  
  // Daily
  const daily: Record<string, { bookings: number; revenue: number }> = {};
  for (const b of bookings) {
    const date = b.createdAt.toISOString().split('T')[0];
    if (!daily[date]) {
      daily[date] = { bookings: 0, revenue: 0 };
    }
    daily[date].bookings++;
    daily[date].revenue += b.totalPrice || 0;
  }
  
  return {
    daily: Object.entries(daily).map(([date, stats]) => ({
      date,
      ...stats,
    })),
    weekly: [], // Placeholder
    monthly: [], // Placeholder
  };
}

async function getBookingsTopPerformers(where: Record<string, unknown>) {
  const topListings = await db.booking.groupBy({
    by: ['listingId'],
    where,
    _count: true,
    _sum: { totalPrice: true },
    orderBy: { _count: { listingId: 'desc' } },
    take: 10,
  });
  
  const listingIds = topListings.map((t) => t.listingId);
  const listings = await db.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, title: true },
  });
  const listingMap = new Map(listings.map((l) => [l.id, l.title]));
  
  return {
    listings: topListings.map((t) => ({
      id: t.listingId,
      title: listingMap.get(t.listingId) || 'Unknown',
      bookings: t._count,
      revenue: t._sum.totalPrice || 0,
    })),
    hosts: [], // Placeholder
  };
}

async function getBookingsComparison(
  input: ReportInput,
  currentPeriod: TimeRange,
) {
  // Calculate previous period
  const periodLength = currentPeriod.end.getTime() - currentPeriod.start.getTime();
  const previousPeriod: TimeRange = {
    start: new Date(currentPeriod.start.getTime() - periodLength),
    end: currentPeriod.start,
  };
  
  const previousWhere = buildWhereClause(input, previousPeriod);
  
  const [currentBookings, previousBookings] = await Promise.all([
    db.booking.count({ where: buildWhereClause(input, currentPeriod) }),
    db.booking.count({ where: previousWhere }),
  ]);
  
  const [currentRevenue, previousRevenue] = await Promise.all([
    db.booking.aggregate({
      where: { ...buildWhereClause(input, currentPeriod), status: 'completed' },
      _sum: { totalPrice: true },
    }),
    db.booking.aggregate({
      where: { ...previousWhere, status: 'completed' },
      _sum: { totalPrice: true },
    }),
  ]);
  
  const currentRev = currentRevenue._sum.totalPrice || 0;
  const previousRev = previousRevenue._sum.totalPrice || 0;
  
  return {
    previousPeriod: {
      bookings: previousBookings,
      revenue: previousRev,
    },
    change: {
      bookingsChange: previousBookings > 0
        ? ((currentBookings - previousBookings) / previousBookings) * 100
        : 0,
      revenueChange: previousRev > 0
        ? ((currentRev - previousRev) / previousRev) * 100
        : 0,
    },
  };
}

// Additional helper functions (simplified for brevity)

async function getRevenueSummary(where: Record<string, unknown>) {
  const result = await db.booking.aggregate({
    where: { ...where, status: 'completed' },
    _sum: { totalPrice: true, serviceFee: true, taxes: true },
  });
  
  return {
    grossRevenue: result._sum.totalPrice || 0,
    netRevenue: (result._sum.totalPrice || 0) - (result._sum.serviceFee || 0),
    platformFees: result._sum.serviceFee || 0,
    processingFees: 0,
    refunds: 0,
    taxes: result._sum.taxes || 0,
  };
}

async function getRevenueBreakdown(where: Record<string, unknown>, input: ReportInput) {
  return {
    byCategory: [],
    byCity: [],
    byPaymentMethod: {},
  };
}

async function getRevenueTrends(where: Record<string, unknown>, period: TimeRange) {
  return {
    daily: [],
    monthly: [],
  };
}

async function getUsersSummary(period: TimeRange) {
  const [total, newUsers] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({
      where: {
        createdAt: { gte: period.start, lte: period.end },
        deletedAt: null,
      },
    }),
  ]);
  
  return {
    totalUsers: total,
    newUsers,
    activeUsers: total,
    churnedUsers: 0,
  };
}

async function getUsersBreakdown(period: TimeRange) {
  const [byRole, byStatus] = await Promise.all([
    db.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: true,
    }),
    db.user.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    }),
  ]);
  
  return {
    byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count])),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byCountry: [],
    byCity: [],
    byAge: [],
    byGender: {},
  };
}

async function getUsersAcquisition(period: TimeRange) {
  const signups = await db.user.findMany({
    where: {
      createdAt: { gte: period.start, lte: period.end },
      deletedAt: null,
    },
    select: { createdAt: true },
  });
  
  const byDay: Record<string, number> = {};
  for (const signup of signups) {
    const date = signup.createdAt.toISOString().split('T')[0];
    byDay[date] = (byDay[date] || 0) + 1;
  }
  
  return {
    bySource: {},
    byDay: Object.entries(byDay).map(([date, signups]) => ({ date, signups })),
  };
}

async function getUsersEngagement(period: TimeRange) {
  return {
    averageSessionsPerUser: 0,
    averageTimeOnPlatform: 0,
    retentionRate: 0,
  };
}

async function getListingsSummary(where: Record<string, unknown>, period: TimeRange) {
  const [total, active, newInPeriod] = await Promise.all([
    db.listing.count({ where }),
    db.listing.count({ where: { ...where, status: 'active' } }),
    db.listing.count({
      where: {
        ...where,
        createdAt: { gte: period.start, lte: period.end },
      },
    }),
  ]);
  
  return {
    totalListings: total,
    activeListings: active,
    newListings: newInPeriod,
    expiredListings: 0,
  };
}

async function getListingsBreakdown(where: Record<string, unknown>) {
  const [byCategory, byStatus] = await Promise.all([
    db.listing.groupBy({
      by: ['category'],
      where,
      _count: true,
    }),
    db.listing.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);
  
  return {
    byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c._count])),
    byCity: [],
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byPriceRange: [],
  };
}

async function getListingsPerformance(where: Record<string, unknown>) {
  const topViewed = await db.listing.findMany({
    where,
    orderBy: { viewCount: 'desc' },
    take: 10,
    select: { id: true, title: true, viewCount: true },
  });
  
  return {
    topViewed: topViewed.map((l) => ({ id: l.id, title: l.title, views: l.viewCount || 0 })),
    topBooked: [],
    topRated: [],
    underperforming: [],
  };
}

async function getListingsOccupancy(where: Record<string, unknown>) {
  return {
    averageOccupancyRate: 0,
    byCategory: [],
    byCity: [],
  };
}

async function getReviewsSummary(where: Record<string, unknown>) {
  const [total, avgRating] = await Promise.all([
    db.review.count({ where }),
    db.review.aggregate({
      where,
      _avg: { rating: true },
    }),
  ]);
  
  return {
    totalReviews: total,
    averageRating: avgRating._avg.rating || 0,
    responseRate: 0,
  };
}

async function getReviewsBreakdown(where: Record<string, unknown>) {
  const byRating = await db.review.groupBy({
    by: ['rating'],
    where,
    _count: true,
  });
  
  return {
    byRating: Object.fromEntries(byRating.map((r) => [r.rating, r._count])),
    byCategory: [],
  };
}

async function getReviewsSentiment(where: Record<string, unknown>) {
  // Placeholder - would need sentiment analysis
  return {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
}

async function getReviewsKeywords(where: Record<string, unknown>) {
  return [];
}

async function getRecentReviews(where: Record<string, unknown>) {
  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      listing: { select: { title: true } },
    },
  });
  
  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment || '',
    listing: r.listing?.title || '',
    createdAt: r.createdAt,
  }));
}

function convertToCSV(data: Record<string, unknown>): string {
  // Simplified CSV conversion
  const lines: string[] = [];
  
  const flatten = (obj: Record<string, unknown>, prefix = ''): Array<[string, string]> => {
    const entries: Array<[string, string]> = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        entries.push(...flatten(value as Record<string, unknown>, newKey));
      } else if (Array.isArray(value)) {
        entries.push([newKey, JSON.stringify(value)]);
      } else {
        entries.push([newKey, String(value)]);
      }
    }
    
    return entries;
  };
  
  const entries = flatten(data);
  lines.push(entries.map((e) => e[0]).join(','));
  lines.push(entries.map((e) => `"${e[1]}"`).join(','));
  
  return lines.join('\n');
}
