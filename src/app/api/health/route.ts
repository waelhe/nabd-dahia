/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Health Check API
 * 
 * نقطة نهاية فحص صحة النظام
 * 
 * @route GET /api/health
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'error';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

async function checkDatabase(): Promise<{ status: 'ok' | 'error'; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return { status: 'ok', latency };
  } catch (error) {
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function checkMemory(): { status: 'ok' | 'warning' | 'error'; used: number; total: number; percentage: number } {
  const memUsage = process.memoryUsage();
  const used = memUsage.heapUsed;
  const total = memUsage.heapTotal;
  const percentage = (used / total) * 100;
  
  // Very lenient thresholds for development/sandbox environments
  // These environments often run with limited resources
  // Warning at 92%, Error at 98%
  let status: 'ok' | 'warning' | 'error' = 'ok';
  if (percentage > 98) {
    status = 'error';
  } else if (percentage > 92) {
    status = 'warning';
  }
  
  return {
    status,
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round(percentage * 100) / 100,
  };
}

export async function GET() {
  const startTime = Date.now();
  
  // Run checks
  const [dbCheck, memCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory()),
  ]);
  
  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (dbCheck.status === 'error') {
    status = 'unhealthy';
  } else if (memCheck.status === 'error') {
    // Only memory error affects status, not warning
    status = 'degraded';
  }
  
  const health: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    checks: {
      database: dbCheck,
      memory: memCheck,
    },
  };
  
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json(health, {
    status: status === 'unhealthy' ? 503 : 200,
    headers: {
      'X-Response-Time': `${responseTime}ms`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
