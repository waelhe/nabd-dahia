/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Companies API Endpoint
 * 
 * نقطة نهاية API للشركات
 * 
 * @route GET /api/companies - قائمة الشركات
 * @route POST /api/companies - إنشاء شركة جديدة
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  searchCompanies,
  getUserCompanies,
  createCompany,
} from '@/application/companies/use-cases';

// ==================== GET - List Companies ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    
    // Get user's companies
    const user = await getCurrentUser();
    if (searchParams.get('mine') === 'true' && user) {
      const result = await getUserCompanies(user.id, { page, limit });
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الشركات', 500);
      }
      
      return paginatedResponse(result.value.items, {
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
        hasMore: result.value.hasMore,
      });
    }
    
    // Search companies
    const filter = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || 'active',
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
    };
    
    const result = await searchCompanies(filter, { page, limit });
    
    if (result.isErr()) {
      return errorResponse('INTERNAL_ERROR', 'فشل في جلب الشركات', 500);
    }
    
    return paginatedResponse(result.value.items, {
      page: result.value.page,
      limit: result.value.limit,
      total: result.value.total,
      totalPages: result.value.totalPages,
      hasMore: result.value.hasMore,
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الشركات', 500);
  }
}

// ==================== POST - Create Company ====================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const body = await request.json();
    
    // Validation
    if (!body.name || !body.slug || !body.type) {
      return errorResponse('INVALID_INPUT', 'الاسم والرابط والنوع مطلوبون', 400);
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(body.slug)) {
      return errorResponse('INVALID_INPUT', 'الرابط يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط', 400);
    }
    
    const result = await createCompany({
      name: body.name,
      slug: body.slug,
      description: body.description,
      logo: body.logo,
      coverImage: body.coverImage,
      type: body.type,
      registrationNumber: body.registrationNumber,
      taxId: body.taxId,
      email: body.email,
      phone: body.phone,
      website: body.website,
      address: body.address,
      ownerId: user.id,
    });
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return createdResponse(result.value);
    
  } catch (error) {
    console.error('Error creating company:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إنشاء الشركة', 500);
  }
}
