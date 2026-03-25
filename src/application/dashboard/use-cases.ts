/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Dashboard Use Cases
 * 
 * حالات استخدام لوحة التحكم
 * 
 * @module application/dashboard/use-cases
 */

import { ok, err, type Result } from '@/core/types/result';
import { db } from '@/lib/db';
import { UseCaseError, TimeRange, PREDEFINED_RANGES } from '../types';

// ==================== Types ====================

export interface DashboardStatsInput {
  userId: string;
  role: string;
  companyId?: string;
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
}

export interface DashboardStatsOutput {
  period: TimeRange;
  
  // Bookings
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
    revenueChange?: number; // Percentage change from previous period
  };
  
  // Listings
  listings: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
    views: number;
  };
  
  // Users
  users: {
    total: number;
    new: number;
    active: number;
  };
  
  // Reviews
  reviews: {
    total: number;
    averageRating: number;
    pending: number;
  };
  
  // Charts
  revenueChart: Array<{ date: string; amount: number }>;
  bookingsChart: Array<{ date: string; count: number }>;
  
  // Top items
  topListings: Array<{
    id: string;
    title: string;
    bookings: number;
    revenue: number;
  }>;
  
  topHosts: Array<{
    id: string;
    name: string;
    bookings: number;
    rating: number;
  }>;
}

export interface HostDashboardOutput {
  period: TimeRange;
  
  // Bookings
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    revenue: number;
    revenueChange?: number;
  };
  
  // Listings
  listings: {
    total: number;
    active: number;
    inactive: number;
    views: number;
    inquiries: number;
  };
  
  // Reviews
  reviews: {
    total: number;
    averageRating: number;
    pending: number;
    recent: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: Date;
      reviewer: string;
    }>;
  };
  
  // Calendar
  upcomingBookings: Array<{
    id: string;
    checkIn: Date;
    checkOut: Date;
    guestName: string;
    listingTitle: string;
    status: string;
  }>;
  
  // Charts
  revenueChart: Array<{ date: string; amount: number }>;
  occupancyRate: number;
}

export interface CompanyDashboardOutput {
  period: TimeRange;
  
  // Overview
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalListings: number;
    totalHosts: number;
    averageRating: number;
  };
  
  // By Category
  byCategory: Array<{
    category: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }>;
  
  // By Location
  byLocation: Array<{
    city: string;
    bookings: number;
    revenue: number;
  }>;
  
  // Performance
  topPerformers: {
    listings: Array<{ id: string; title: string; revenue: number }>;
    hosts: Array<{ id: string; name: string; revenue: number }>;
  };
  
  // Charts
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

// ==================== Use Cases ====================

/**
 * الحصول على إحصائيات لوحة التحكم
 */
export async function getDashboardStats(
  input: DashboardStatsInput,
): Promise<Result<DashboardStatsOutput, UseCaseError>> {
  try {
    const period = getPeriodRange(input.period);
    
    // Get bookings stats
    const bookings = await getBookingsStats(input, period);
    
    // Get listings stats
    const listings = await getListingsStats(input, period);
    
    // Get users stats
    const users = await getUsersStats(input, period);
    
    // Get reviews stats
    const reviews = await getReviewsStats(input, period);
    
    // Get charts data
    const revenueChart = await getRevenueChart(input, period);
    const bookingsChart = await getBookingsChart(input, period);
    
    // Get top items
    const topListings = await getTopListings(input, period);
    const topHosts = await getTopHosts(input, period);
    
    return ok({
      period,
      bookings,
      listings,
      users,
      reviews,
      revenueChart,
      bookingsChart,
      topListings,
      topHosts,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to get dashboard stats'));
  }
}

/**
 * الحصول على لوحة تحكم المضيف
 */
export async function getHostDashboard(
  hostId: string,
  period?: 'today' | 'week' | 'month' | 'year' | 'all',
): Promise<Result<HostDashboardOutput, UseCaseError>> {
  try {
    const range = getPeriodRange(period);
    
    // Bookings
    const bookingStats = await db.booking.aggregate({
      where: {
        hostId,
        createdAt: { gte: range.start, lte: range.end },
      },
      _count: true,
      _sum: { totalPrice: true },
    });
    
    const bookingsByStatus = await db.booking.groupBy({
      by: ['status'],
      where: {
        hostId,
        createdAt: { gte: range.start, lte: range.end },
      },
      _count: true,
    });
    
    // Listings
    const listingStats = await db.listing.aggregate({
      where: { hostId, deletedAt: null },
      _count: true,
      _sum: { viewCount: true },
    });
    
    const listingsByStatus = await db.listing.groupBy({
      by: ['status'],
      where: { hostId, deletedAt: null },
      _count: true,
    });
    
    // Reviews
    const reviewStats = await db.review.aggregate({
      where: {
        listing: { hostId },
        createdAt: { gte: range.start, lte: range.end },
      },
      _count: true,
      _avg: { ratingOverall: true },
    });
    
    // Upcoming bookings
    const upcomingBookings = await db.booking.findMany({
      where: {
        hostId,
        status: 'confirmed',
        checkIn: { gte: new Date() },
      },
      orderBy: { checkIn: 'asc' },
      take: 10,
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        guest: { select: { firstName: true, lastName: true } },
        listing: { select: { title: true } },
      },
    });
    
    // Revenue chart
    const revenueChart = await getHostRevenueChart(hostId, range);
    
    // Occupancy rate
    const occupancyRate = await calculateOccupancyRate(hostId, range);
    
    // Recent reviews
    const recentReviews = await db.review.findMany({
      where: {
        listing: { hostId },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        ratingOverall: true,
        comment: true,
        createdAt: true,
        reviewerId: true,
      },
    });
    
    // Get reviewer names
    const reviewerIds = [...new Set(recentReviews.map(r => r.reviewerId))];
    const reviewers = await db.user.findMany({
      where: { id: { in: reviewerIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const reviewerMap = new Map(reviewers.map(r => [r.id, r]));
    
    const statusMap = Object.fromEntries(
      bookingsByStatus.map((s) => [s.status, s._count]),
    );
    
    const listingStatusMap = Object.fromEntries(
      listingsByStatus.map((s) => [s.status, s._count]),
    );
    
    return ok({
      period: range,
      bookings: {
        total: bookingStats._count || 0,
        pending: statusMap['pending'] || 0,
        confirmed: statusMap['confirmed'] || 0,
        completed: statusMap['completed'] || 0,
        cancelled: statusMap['cancelled'] || 0,
        upcoming: upcomingBookings.length,
        revenue: bookingStats._sum.totalPrice || 0,
      },
      listings: {
        total: listingStats._count || 0,
        active: listingStatusMap['active'] || 0,
        inactive: (listingStatusMap['inactive'] || 0) + (listingStatusMap['draft'] || 0),
        views: listingStats._sum.viewCount || 0,
        inquiries: 0, // Placeholder
      },
      reviews: {
        total: reviewStats._count || 0,
        averageRating: reviewStats._avg.ratingOverall || 0,
        pending: 0,
        recent: recentReviews.map((r) => {
          const reviewer = reviewerMap.get(r.reviewerId);
          return {
            id: r.id,
            rating: r.ratingOverall,
            comment: r.comment || '',
            createdAt: r.createdAt,
            reviewer: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Unknown',
          };
        }),
      },
      upcomingBookings: upcomingBookings.map((b) => ({
        id: b.id,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        guestName: `${b.guest.firstName} ${b.guest.lastName}`,
        listingTitle: b.listing.title,
      })),
      revenueChart,
      occupancyRate,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to get host dashboard'));
  }
}

/**
 * الحصول على لوحة تحكم الشركة
 */
export async function getCompanyDashboard(
  companyId: string,
  period?: 'today' | 'week' | 'month' | 'year' | 'all',
): Promise<Result<CompanyDashboardOutput, UseCaseError>> {
  try {
    const range = getPeriodRange(period);
    
    // Overview
    const [totalRevenue, totalBookings, totalListings, totalHosts, avgRating] = await Promise.all([
      db.booking.aggregate({
        where: { companyId, createdAt: { gte: range.start, lte: range.end }, status: 'completed' },
        _sum: { totalPrice: true },
      }),
      db.booking.count({
        where: { companyId, createdAt: { gte: range.start, lte: range.end } },
      }),
      db.listing.count({ where: { companyId, deletedAt: null } }),
      db.user.count({
        where: {
          role: 'host',
          listings: { some: { companyId } },
        },
      }),
      db.review.aggregate({
        where: { listing: { companyId } },
        _avg: { ratingOverall: true },
      }),
    ]);
    
    // By category
    const byCategory = await db.booking.groupBy({
      by: ['listingId'],
      where: {
        companyId,
        createdAt: { gte: range.start, lte: range.end },
      },
      _count: true,
      _sum: { totalPrice: true },
    });
    
    // Get category for each listing
    const listingIds = byCategory.map((b) => b.listingId);
    const listingCategories = await db.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, category: true },
    });
    
    const categoryMap = new Map(listingCategories.map((l) => [l.id, l.category]));
    const categoryStats: Record<string, { bookings: number; revenue: number }> = {};
    
    for (const stat of byCategory) {
      const category = categoryMap.get(stat.listingId) || 'other';
      if (!categoryStats[category]) {
        categoryStats[category] = { bookings: 0, revenue: 0 };
      }
      categoryStats[category].bookings += stat._count;
      categoryStats[category].revenue += stat._sum.totalPrice || 0;
    }
    
    const totalCategoryBookings = Object.values(categoryStats).reduce((sum, s) => sum + s.bookings, 0);
    
    // By location
    const byLocation = await db.booking.groupBy({
      by: ['listingId'],
      where: {
        companyId,
        createdAt: { gte: range.start, lte: range.end },
      },
      _count: true,
      _sum: { totalPrice: true },
    });
    
    const locationListingIds = byLocation.map((b) => b.listingId);
    const locationData = await db.listing.findMany({
      where: { id: { in: locationListingIds } },
      select: { id: true, city: true },
    });
    
    const locationMap = new Map(locationData.map((l) => [l.id, l.city || 'Unknown']));
    const locationStats: Record<string, { bookings: number; revenue: number }> = {};
    
    for (const stat of byLocation) {
      const city = locationMap.get(stat.listingId) || 'Unknown';
      if (!locationStats[city]) {
        locationStats[city] = { bookings: 0, revenue: 0 };
      }
      locationStats[city].bookings += stat._count;
      locationStats[city].revenue += stat._sum.totalPrice || 0;
    }
    
    // Monthly trend
    const monthlyTrend = await getMonthlyTrend(companyId, range);
    
    return ok({
      period: range,
      overview: {
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        totalBookings,
        totalListings,
        totalHosts,
        averageRating: avgRating._avg.ratingOverall || 0,
      },
      byCategory: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        bookings: stats.bookings,
        revenue: stats.revenue,
        percentage: totalCategoryBookings > 0 
          ? Math.round((stats.bookings / totalCategoryBookings) * 100)
          : 0,
      })),
      byLocation: Object.entries(locationStats).map(([city, stats]) => ({
        city,
        bookings: stats.bookings,
        revenue: stats.revenue,
      })),
      topPerformers: {
        listings: [],
        hosts: [],
      },
      monthlyTrend,
    });
  } catch (error) {
    return err(UseCaseError.internal('Failed to get company dashboard'));
  }
}

// ==================== Helper Functions ====================

function getPeriodRange(period?: string): TimeRange {
  switch (period) {
    case 'today':
      return PREDEFINED_RANGES.today();
    case 'week':
      return PREDEFINED_RANGES.thisWeek();
    case 'month':
      return PREDEFINED_RANGES.thisMonth();
    case 'year':
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case 'all':
      return {
        start: new Date(2020, 0, 1),
        end: new Date(),
      };
    default:
      return PREDEFINED_RANGES.last30Days();
  }
}

async function getBookingsStats(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<DashboardStatsOutput['bookings']> {
  const where: Record<string, unknown> = {
    createdAt: { gte: period.start, lte: period.end },
    deletedAt: null,
  };
  
  // Role-based filtering
  if (input.role === 'host') {
    where.hostId = input.userId;
  } else if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  const [total, byStatus, revenue] = await Promise.all([
    db.booking.count({ where }),
    db.booking.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    db.booking.aggregate({
      where: { ...where, status: 'completed' },
      _sum: { totalPrice: true },
    }),
  ]);
  
  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
  
  return {
    total,
    pending: statusMap['pending'] || 0,
    confirmed: statusMap['confirmed'] || 0,
    completed: statusMap['completed'] || 0,
    cancelled: statusMap['cancelled'] || 0,
    revenue: revenue._sum.totalPrice || 0,
  };
}

async function getListingsStats(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<DashboardStatsOutput['listings']> {
  const where: Record<string, unknown> = { deletedAt: null };
  
  if (input.role === 'host') {
    where.hostId = input.userId;
  } else if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  const [total, byStatus, views] = await Promise.all([
    db.listing.count({ where }),
    db.listing.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    db.listing.aggregate({
      where,
      _sum: { viewCount: true },
    }),
  ]);
  
  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
  
  return {
    total,
    active: statusMap['active'] || 0,
    pending: statusMap['pending'] || 0,
    inactive: statusMap['inactive'] || 0,
    views: views._sum.viewCount || 0,
  };
}

async function getUsersStats(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<DashboardStatsOutput['users']> {
  // Only for admins
  if (input.role !== 'admin') {
    return { total: 0, new: 0, active: 0 };
  }
  
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
    total,
    new: newUsers,
    active: total, // Simplified
  };
}

async function getReviewsStats(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<DashboardStatsOutput['reviews']> {
  const where: Record<string, unknown> = {
    createdAt: { gte: period.start, lte: period.end },
  };
  
  if (input.role === 'host') {
    where.listing = { hostId: input.userId };
  } else if (input.role === 'company' && input.companyId) {
    where.listing = { companyId: input.companyId };
  }
  
  const [total, avgRating] = await Promise.all([
    db.review.count({ where }),
    db.review.aggregate({
      where,
      _avg: { ratingOverall: true },
    }),
  ]);
  
  return {
    total,
    averageRating: avgRating._avg?.ratingOverall || 0,
    pending: 0,
  };
}

async function getRevenueChart(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<Array<{ date: string; amount: number }>> {
  const where: Record<string, unknown> = {
    status: 'completed',
    createdAt: { gte: period.start, lte: period.end },
    deletedAt: null,
  };
  
  if (input.role === 'host') {
    where.hostId = input.userId;
  } else if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  // Simplified - in production, use proper date grouping
  const bookings = await db.booking.findMany({
    where,
    select: { createdAt: true, totalPrice: true },
    orderBy: { createdAt: 'asc' },
  });
  
  // Group by date
  const byDate: Record<string, number> = {};
  for (const booking of bookings) {
    const date = booking.createdAt.toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + (booking.totalPrice || 0);
  }
  
  return Object.entries(byDate).map(([date, amount]) => ({ date, amount }));
}

async function getBookingsChart(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<Array<{ date: string; count: number }>> {
  const where: Record<string, unknown> = {
    createdAt: { gte: period.start, lte: period.end },
    deletedAt: null,
  };
  
  if (input.role === 'host') {
    where.hostId = input.userId;
  } else if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  const bookings = await db.booking.findMany({
    where,
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  
  const byDate: Record<string, number> = {};
  for (const booking of bookings) {
    const date = booking.createdAt.toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  }
  
  return Object.entries(byDate).map(([date, count]) => ({ date, count }));
}

async function getTopListings(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<Array<{ id: string; title: string; bookings: number; revenue: number }>> {
  const where: Record<string, unknown> = {
    createdAt: { gte: period.start, lte: period.end },
    deletedAt: null,
  };
  
  if (input.role === 'host') {
    where.hostId = input.userId;
  } else if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  const topBookings = await db.booking.groupBy({
    by: ['listingId'],
    where,
    _count: true,
    _sum: { totalPrice: true },
    orderBy: { _count: { listingId: 'desc' } },
    take: 5,
  });
  
  const listingIds = topBookings.map((b) => b.listingId);
  const listings = await db.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, title: true },
  });
  
  const listingMap = new Map(listings.map((l) => [l.id, l.title]));
  
  return topBookings.map((b) => ({
    id: b.listingId,
    title: listingMap.get(b.listingId) || 'Unknown',
    bookings: b._count,
    revenue: b._sum.totalPrice || 0,
  }));
}

async function getTopHosts(
  input: DashboardStatsInput,
  period: TimeRange,
): Promise<Array<{ id: string; name: string; bookings: number; rating: number }>> {
  // Only for admins and companies
  if (input.role !== 'admin' && input.role !== 'company') {
    return [];
  }
  
  const where: Record<string, unknown> = {
    createdAt: { gte: period.start, lte: period.end },
    deletedAt: null,
  };
  
  if (input.role === 'company' && input.companyId) {
    where.companyId = input.companyId;
  }
  
  const topHosts = await db.booking.groupBy({
    by: ['hostId'],
    where,
    _count: true,
    orderBy: { _count: { hostId: 'desc' } },
    take: 5,
  });
  
  const hostIds = topHosts.map((h) => h.hostId);
  const hosts = await db.user.findMany({
    where: { id: { in: hostIds } },
    select: { id: true, firstName: true, lastName: true, ratingAverage: true },
  });
  
  const hostMap = new Map(hosts.map((h) => [h.id, h]));
  
  return topHosts.map((h) => {
    const host = hostMap.get(h.hostId);
    return {
      id: h.hostId,
      name: host ? `${host.firstName} ${host.lastName}` : 'Unknown',
      bookings: h._count,
      rating: host?.ratingAverage || 0,
    };
  });
}

async function getHostRevenueChart(
  hostId: string,
  period: TimeRange,
): Promise<Array<{ date: string; amount: number }>> {
  const bookings = await db.booking.findMany({
    where: {
      hostId,
      status: 'completed',
      createdAt: { gte: period.start, lte: period.end },
    },
    select: { createdAt: true, totalPrice: true },
    orderBy: { createdAt: 'asc' },
  });
  
  const byDate: Record<string, number> = {};
  for (const booking of bookings) {
    const date = booking.createdAt.toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + (booking.totalPrice || 0);
  }
  
  return Object.entries(byDate).map(([date, amount]) => ({ date, amount }));
}

async function calculateOccupancyRate(hostId: string, period: TimeRange): Promise<number> {
  // Simplified calculation
  const totalListings = await db.listing.count({
    where: { hostId, deletedAt: null },
  });
  
  if (totalListings === 0) return 0;
  
  const bookedNights = await db.booking.aggregate({
    where: {
      hostId,
      status: { in: ['confirmed', 'completed', 'in_progress'] },
      checkIn: { gte: period.start, lte: period.end },
    },
    _sum: { guests: true },
  });
  
  const daysInPeriod = Math.ceil(
    (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24),
  );
  
  const totalPossibleNights = totalListings * daysInPeriod;
  
  // Simplified - actual calculation would need nights count
  return Math.min(100, Math.round(((bookedNights._sum.guests || 0) / totalPossibleNights) * 100));
}

async function getMonthlyTrend(
  companyId: string,
  period: TimeRange,
): Promise<Array<{ month: string; revenue: number; bookings: number }>> {
  // Simplified - in production, use proper SQL grouping
  const bookings = await db.booking.findMany({
    where: {
      companyId,
      createdAt: { gte: period.start, lte: period.end },
    },
    select: { createdAt: true, totalPrice: true },
    orderBy: { createdAt: 'asc' },
  });
  
  const byMonth: Record<string, { revenue: number; bookings: number }> = {};
  
  for (const booking of bookings) {
    const month = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM
    if (!byMonth[month]) {
      byMonth[month] = { revenue: 0, bookings: 0 };
    }
    byMonth[month].revenue += booking.totalPrice || 0;
    byMonth[month].bookings++;
  }
  
  return Object.entries(byMonth).map(([month, stats]) => ({
    month,
    revenue: stats.revenue,
    bookings: stats.bookings,
  }));
}
